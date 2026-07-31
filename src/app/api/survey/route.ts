import { NextResponse } from 'next/server';
import { requireText, bodyTooLarge, LIMITS } from '@/lib/validate';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Service role only. The anon key is NOT a fallback for a server route: after
// 004_rls_lockdown.sql it can read nothing, and before it, it could read
// everything. See src/lib/supabase.ts for the full reasoning.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: Request) {
  try {
    // SECURITY S-5: unauthenticated endpoint — bound the body, then every field.
    if (bodyTooLarge(req, 4_000)) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
    }
    const body = await req.json().catch(() => null);

    const roleField = requireText(body?.role, 'role', LIMITS.shortText);
    if (!roleField.ok) return NextResponse.json({ error: roleField.error }, { status: 400 });
    const sourceField = requireText(body?.source, 'source', LIMITS.shortText);
    if (!sourceField.ok) return NextResponse.json({ error: sourceField.error }, { status: 400 });
    const role = roleField.value;
    const source = sourceField.value;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing. Simulating survey submission:', body);
      return NextResponse.json({ success: true, message: 'Simulated survey submission successful.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('surveys')
      .insert([
        {
          role,
          source,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: true, simulated: true, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Survey saved successfully.' });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ success: true, simulated: true, message: 'Graceful fallback on error' });
  }
}
