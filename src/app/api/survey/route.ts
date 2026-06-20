import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, source } = body;

    if (!role || !source) {
      return NextResponse.json({ error: 'Role and source are required.' }, { status: 400 });
    }

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
