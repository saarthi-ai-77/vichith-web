import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient, logActivity } from '@/lib/supabase';

export async function POST() {
  try {
    const sessionCookie = cookies().get('vichith_session');
    const token = sessionCookie?.value;

    if (token) {
      const supabase = getSupabaseClient();

      // Find user before deleting session
      const { data: session } = await supabase
        .from('sessions')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

      if (session) {
        // Log logout event
        await logActivity(session.user_id, 'LOGOUT', 'User logged out and closed session.');
      }

      // Delete session
      await supabase.from('sessions').delete().eq('token', token);
    }

    // Clear session cookie
    cookies().delete('vichith_session');

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
