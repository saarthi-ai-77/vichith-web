import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  // Check if session exists first
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.signOut();
  }

  // Clear cookie and redirect to login
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  
  // Explicitly clear Supabase session cookies if they persist
  response.cookies.set('sb-access-token', '', { maxAge: -1 });
  response.cookies.set('sb-refresh-token', '', { maxAge: -1 });
  
  return response;
}
