import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if creator profile exists
      const { data: creator } = await supabase
        .from('creators')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (creator) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Redirect to login if anything fails
  return NextResponse.redirect(new URL('/login', request.url));
}
