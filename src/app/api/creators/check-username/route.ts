import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, error: 'Username is required' }, { status: 400 });
  }

  // Local validation of username format
  if (username.length < 3 || username.length > 30) {
    return NextResponse.json({ available: false, error: 'Username must be between 3 and 30 characters' }, { status: 400 });
  }

  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(username)) {
    return NextResponse.json({ available: false, error: 'Only letters, numbers, and underscores are allowed' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('creators')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ available: false, error: 'Database check failed' }, { status: 500 });
  }

  return NextResponse.json({ available: !data });
}
