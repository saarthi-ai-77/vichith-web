import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, rateLimitedResponse, BUCKETS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Service role only. The anon key is NOT a fallback for a server route: after
// 004_rls_lockdown.sql it can read nothing, and before it, it could read
// everything. See src/lib/supabase.ts for the full reasoning.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: Request) {
  try {
    // SECURITY S-5 (remainder): unauthenticated endpoint, so bound how MANY
    // requests arrive as well as how big each one is. Fails open — see rateLimit.ts.
    const limit = await checkRateLimit(req, BUCKETS.download);
    if (!limit.allowed) {
      const r = rateLimitedResponse(limit);
      return NextResponse.json(r.body, r.init);
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing. Simulating download log.');
      return NextResponse.json({ success: true, message: 'Simulated download logging successful.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('downloads')
      .insert([
        {
          platform: 'windows',
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase logging download error:', error);
      return NextResponse.json({ success: true, simulated: true, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Download logged successfully.' });
  } catch (err: any) {
    console.error('API Download logging error:', err);
    return NextResponse.json({ success: true, simulated: true, message: 'Graceful fallback on download logging error' });
  }
}
