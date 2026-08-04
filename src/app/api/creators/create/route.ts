import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, display_name } = await request.json();

    if (!username || !display_name) {
      return NextResponse.json({ success: false, error: 'Username and display name are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = display_name.trim();

    // Check username format
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json({ success: false, error: 'Username must be between 3 and 30 characters' }, { status: 400 });
    }

    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(cleanUsername)) {
      return NextResponse.json({ success: false, error: 'Only letters, numbers, and underscores are allowed' }, { status: 400 });
    }

    // Verify username is not already taken
    const { data: existing } = await supabase
      .from('creators')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 400 });
    }

    // Check if creator already has a profile (to prevent duplicate profile setup)
    const { data: existingProfile } = await supabase
      .from('creators')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ success: false, error: 'Profile already exists' }, { status: 400 });
    }

    // Insert new profile
    const { error: insertError } = await supabase
      .from('creators')
      .insert({
        id: session.user.id,
        username: cleanUsername,
        display_name: cleanDisplayName,
        avatar_url: null,
        bio: '',
        location: '',
        website: '',
      });

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'An error occurred' }, { status: 500 });
  }
}
