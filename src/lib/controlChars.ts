/**
 * Control-character detection, without a regex.
 *
 * Written as an explicit code-point scan rather than a character-class regex
 * because escaping control characters through build tooling and editors is
 * error-prone — a mangled class silently matches nothing, which is the worst
 * outcome for a validation check.
 *
 * Tab (9), newline (10) and carriage return (13) are permitted: they appear
 * legitimately in multi-line submissions such as bug reports.
 */
export function hasControlChars(value: string): boolean {
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        if (code === 9 || code === 10 || code === 13) continue;
        if (code < 32 || code === 127) return true;
    }
    return false;
}
