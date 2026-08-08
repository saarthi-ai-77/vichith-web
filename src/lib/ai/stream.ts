/**
 * src/lib/ai/stream.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Turning an upstream token stream into one the desktop can consume — and
 * settling the bill when it ends, however it ends.
 *
 * WHY THIS IS NOT A PASS-THROUGH
 * ------------------------------
 * We cannot simply hand Sarvam's SSE body to the desktop. Three things have to
 * happen at the boundary:
 *
 *   1. The provider is never exposed. Sarvam's frame shape is Sarvam's business;
 *      the desktop speaks Vichith's contract, so a provider swap is a change here
 *      and nowhere else.
 *   2. Tool calls arrive in FRAGMENTS. An OpenAI-shaped stream sends a function
 *      name in one delta and its arguments across many more, so a consumer that
 *      treats each frame as a message gets a broken tool call. They are
 *      reassembled here and emitted once, whole.
 *   3. THE BILL MUST BE SETTLED. `/api/ai` charges after `dispatch` returns; a
 *      stream has no such moment. Settlement therefore happens on stream close —
 *      and the close that matters most is the ugly one.
 *
 * THE UGLY CLOSE IS THE WHOLE PROBLEM
 * -----------------------------------
 * A stream can end because the model finished, because the user hit Stop, because
 * the network dropped, or because the process died. Only the first is tidy. If
 * settlement lived in the "finished" branch, every other ending would bill
 * nothing — and "cancel just before the end" would become a free tier.
 *
 * So settlement runs in a `finally`, exactly once, guarded by a flag. Whatever
 * happened, the work that reached the provider is charged for. Under-charging on
 * a crash is a rounding error; not charging on cancellation is an exploit.
 */

import type { AIRequest } from './provider';

/** What the desktop receives. One JSON object per SSE `data:` line. */
export type StreamEvent =
    /** A fragment of the assistant's prose, as it is generated. */
    | { type: 'token'; text: string }
    /** A complete tool call, reassembled from its fragments. */
    | { type: 'tool_call'; id: string; name: string; arguments: string }
    /** The run finished normally. Carries what a non-streamed response would
     *  have carried, so the caller's completion path is identical either way. */
    | { type: 'done'; content: string; finishReason: string | null; usage: unknown }
    /** Something failed. The desktop shows this instead of a silent stall. */
    | { type: 'error'; code: string; message: string };

/**
 * Make an accumulated argument string something the provider will accept back.
 *
 * THE BUG THIS EXISTS FOR. Tool-call arguments were concatenated across frames on
 * the assumption that every provider sends DELTAS. Some send the arguments
 * cumulatively — the whole object again in each frame — so concatenation produced
 * `{"a":1}{"a":1}{"a":1}`. That is not valid JSON, and the damage did not show up
 * on the turn that produced it: it went into the transcript, and the NEXT request
 * re-sent it and was rejected with
 *
 *   body.messages.4.assistant.tool_calls.0.function.arguments :
 *   'arguments' must be a valid JSON-encoded string
 *
 * So the run died on turn two with a 400 while turn one looked perfect. A
 * transcript is re-sent on every subsequent turn, which means anything malformed
 * that reaches it poisons the whole run, not one message.
 *
 * The repair, in order: take it as-is if it parses; otherwise take the first
 * complete JSON value in it, which is exactly the right answer for a cumulative
 * provider; otherwise give up and send `{}` rather than something the provider
 * will reject. An empty argument object may make the model retry the call — a
 * malformed one kills the conversation.
 */
export function normalizeToolArguments(raw: string): string {
    const text = raw.trim();
    if (!text) return '{}';

    try {
        JSON.parse(text);
        return text;
    } catch { /* fall through to recovery */ }

    // Walk to the end of the first balanced JSON object, ignoring braces that
    // appear inside string literals (a prompt argument containing "{" is normal).
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) {
                const candidate = text.slice(0, i + 1);
                try {
                    JSON.parse(candidate);
                    return candidate;
                } catch { break; }
            }
        }
    }

    console.warn('[ai] tool arguments could not be repaired; sending {} instead:', text.slice(0, 200));
    return '{}';
}

/** A tool call being assembled across frames, keyed by its index in the delta. */
interface PartialToolCall {
    id: string;
    name: string;
    arguments: string;
}

/**
 * Read an upstream SSE body and emit Vichith stream events.
 *
 * `onSettle` is called EXACTLY ONCE when the stream ends for any reason, with
 * whether it completed cleanly. That is where the caller charges for the work.
 */
export function toVichithStream(
    upstream: ReadableStream<Uint8Array>,
    _request: AIRequest,
    onSettle: (outcome: { completed: boolean; content: string; usage: unknown }) => void | Promise<void>,
): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let settled = false;
    let content = '';
    let usage: unknown = null;
    let finishReason: string | null = null;
    const toolCalls = new Map<number, PartialToolCall>();

    const send = (controller: ReadableStreamDefaultController<Uint8Array>, event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    };

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            const reader = upstream.getReader();
            // SSE frames arrive split across arbitrary chunk boundaries, so a
            // partial line at the end of one chunk must survive into the next.
            let buffer = '';

            try {
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    // The last element is whatever came before the next newline —
                    // possibly half a frame. Keep it.
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;

                        const data = trimmed.slice(5).trim();
                        // The provider's end-of-stream sentinel. Our own `done`
                        // event is emitted below, from state we actually have.
                        if (data === '[DONE]') continue;

                        let frame: {
                            choices?: Array<{
                                delta?: {
                                    content?: string | null;
                                    tool_calls?: Array<{
                                        index?: number;
                                        id?: string;
                                        function?: { name?: string; arguments?: string };
                                    }>;
                                };
                                finish_reason?: string | null;
                            }>;
                            usage?: unknown;
                        };
                        try {
                            frame = JSON.parse(data);
                        } catch {
                            // A malformed frame is not worth killing a live run
                            // over. Skip it; the stream continues.
                            continue;
                        }

                        if (frame.usage) usage = frame.usage;
                        const choice = frame.choices?.[0];
                        if (!choice) continue;
                        if (choice.finish_reason) finishReason = choice.finish_reason;

                        const text = choice.delta?.content;
                        if (typeof text === 'string' && text.length > 0) {
                            content += text;
                            send(controller, { type: 'token', text });
                        }

                        // Tool calls stream as fragments: the name usually arrives
                        // once, the arguments across many frames. Accumulate by
                        // index and emit only when the stream ends — a half-built
                        // argument string is not a tool call, and forwarding one
                        // would hand the desktop unparseable JSON.
                        for (const fragment of choice.delta?.tool_calls ?? []) {
                            const idx = fragment.index ?? 0;
                            const existing = toolCalls.get(idx) ?? { id: '', name: '', arguments: '' };
                            if (fragment.id) existing.id = fragment.id;
                            if (fragment.function?.name) existing.name = fragment.function.name;
                            if (fragment.function?.arguments) existing.arguments += fragment.function.arguments;
                            toolCalls.set(idx, existing);
                        }
                    }
                }

                const corrupted: string[] = [];
                for (const call of Array.from(toolCalls.values())) {
                    if (!call.name) continue;
                    // An empty argument list is `{}`, never an empty string — the
                    // desktop parses this, and `JSON.parse('')` throws. Repaired
                    // when the provider sent cumulative frames rather than deltas.
                    const args = normalizeToolArguments(call.arguments);

                    // A call whose arguments could NOT be recovered is not emitted
                    // with `{}`.
                    //
                    // That substitution looked safe and was actively misleading: a
                    // truncated `submit_editorial_brief` arrived as an empty object
                    // and failed with `Missing required argument "understanding"`,
                    // which sends whoever reads it hunting for a schema bug that
                    // does not exist. The call never really happened, so say so.
                    if (args === '{}' && call.arguments.trim().length > 2) {
                        corrupted.push(call.name);
                        continue;
                    }

                    send(controller, {
                        type: 'tool_call',
                        id: call.id || `call_${call.name}`,
                        name: call.name,
                        arguments: args,
                    });
                }

                if (corrupted.length) {
                    // Appended to the content rather than raised as an error: the
                    // turn is still usable, and a model TOLD its arguments arrived
                    // truncated will send them again. Failing the run would throw
                    // away everything else the turn accomplished.
                    content +=
                        `\n\n[runtime] The arguments for ${corrupted.join(', ')} arrived incomplete and were discarded. ` +
                        `Nothing ran for that call — send it again.`;
                }

                send(controller, { type: 'done', content, finishReason, usage });
            } catch (err) {
                console.error('[ai] stream failed mid-flight:', err);
                send(controller, {
                    type: 'error',
                    code: 'PROVIDER_ERROR',
                    message: 'The AI service stopped responding part-way through. Anything already done is saved.',
                });
            } finally {
                // THE ONE PLACE THE BILL IS SETTLED. Runs whether the stream
                // finished, failed, or was abandoned — see the module note.
                if (!settled) {
                    settled = true;
                    try {
                        await onSettle({ completed: finishReason !== null, content, usage });
                    } catch (err) {
                        console.error('[ai] settlement failed after stream close:', err);
                    }
                }
                try { reader.releaseLock(); } catch { /* already released */ }
                try { controller.close(); } catch { /* already closed */ }
            }
        },

        /**
         * The client went away — closed the app, hit Stop, lost the network.
         *
         * Settlement still runs. Without this, cancelling a stream just before it
         * finished would be free, which is the one hole in a "charge on close"
         * design that someone would eventually find.
         */
        async cancel() {
            if (!settled) {
                settled = true;
                try {
                    await onSettle({ completed: false, content, usage });
                } catch (err) {
                    console.error('[ai] settlement failed after client cancel:', err);
                }
            }
        },
    });
}
