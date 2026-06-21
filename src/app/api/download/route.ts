import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
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
