import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config — public client configuration for the desktop app.
 *
 * S-4 STEP 2. The desktop needs the Supabase project URL and anon key to talk to
 * Supabase Auth directly. The obvious approach is to bake them into the build as
 * `VITE_*` variables; serving them instead is better for three reasons:
 *
 *  1. **No desktop release to change them.** Rotating the anon key or moving to a
 *     different Supabase project becomes a deployment, not a shipped binary. A
 *     desktop build is the slowest thing in this system to change.
 *  2. **It removes a silent-failure mode.** Missing `VITE_*` variables produce a
 *     build where sign-in is simply unavailable, with no signal until a user hits
 *     it — which is exactly how sign-in broke once already. A missing value here is
 *     a 503 the client can report.
 *  3. **It cannot leak more than it already does.** These are the values every
 *     browser client would receive anyway.
 *
 * SAFE TO SERVE PUBLICLY. The anon key is designed to be published — it carries no
 * privileges beyond what Row Level Security grants an anonymous caller. The service
 * role key is NOT here and must never be.
 */
export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!url || !anonKey) {
        // Fail loudly rather than returning a half-configured object the client
        // would treat as usable.
        console.error('[config] Supabase public configuration is missing');
        return NextResponse.json(
            { error: 'not_configured', message: 'Sign-in is temporarily unavailable.' },
            { status: 503 }
        );
    }

    return NextResponse.json(
        {
            supabaseUrl: url,
            supabaseAnonKey: anonKey,
            // Lets the desktop discover whether the Supabase sign-in path is live
            // without shipping a new build when it is turned on.
            authMode: 'supabase',
        },
        {
            // Short cache: config changes should propagate within a minute, but a
            // launch storm should not be one DB-free request per user per action.
            headers: { 'Cache-Control': 'public, max-age=60' },
        }
    );
}
