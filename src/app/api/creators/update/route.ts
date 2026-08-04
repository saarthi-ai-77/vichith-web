import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { display_name, bio, location, website, avatar_url } = body;

    // Validate input fields if present
    const updates: Record<string, any> = {};
    if (display_name !== undefined) {
      if (!display_name.trim()) {
        return NextResponse.json({ success: false, error: 'Display name cannot be empty' }, { status: 400 });
      }
      updates.display_name = display_name.trim();
    }
    if (bio !== undefined) updates.bio = bio.trim();
    if (location !== undefined) updates.location = location.trim();
    if (website !== undefined) updates.website = website.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', session.user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'An error occurred' }, { status: 500 });
  }
}
