import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEmail, bodyTooLarge } from '@/lib/validate';

// Initialize Supabase Client (Environment variables must be set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Service role only. The anon key is NOT a fallback for a server route: after
// 004_rls_lockdown.sql it can read nothing, and before it, it could read
// everything. See src/lib/supabase.ts for the full reasoning.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: Request) {
  try {
    // SECURITY S-5: this endpoint is unauthenticated, so bound the body before
    // parsing it. `email.includes('@')` accepted a megabyte-long string with an @
    // in it and wrote it straight to Postgres.
    if (bodyTooLarge(req, 4_000)) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
    }

    const body = await req.json().catch(() => null);
    const parsed = requireEmail(body?.email);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const email = parsed.value;

    if (!supabaseUrl || !supabaseKey) {
      // Provide a helpful fallback for UI demo purposes if env vars are missing
      console.warn('Supabase credentials missing. Simulating success.');
      return NextResponse.json({ success: true, message: 'Simulated waitlist join' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Could not join the waitlist right now.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Added to waitlist' });
  } catch (err: any) {
    console.error('waitlist error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
