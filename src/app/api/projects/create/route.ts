import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { slugify } from '@/lib/slugify';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, cover_url, tags, visibility } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Project title is required' }, { status: 400 });
    }

    const baseSlug = slugify(title);
    if (!baseSlug) {
      return NextResponse.json({ success: false, error: 'Project title must contain alphanumeric characters' }, { status: 400 });
    }

    // De-duplicate slug for this specific creator
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id')
        .eq('creator_id', session.user.id)
        .eq('slug', finalSlug)
        .maybeSingle();

      if (checkError) {
        return NextResponse.json({ success: false, error: checkError.message }, { status: 500 });
      }

      if (!existingProject) {
        break;
      }

      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    // Insert into database
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        creator_id: session.user.id,
        title: title.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        cover_url: cover_url?.trim() || null,
        tags: tags || [],
        visibility: visibility || 'private',
        published_at: visibility === 'public' ? new Date().toISOString() : null,
      })
      .select('id, slug, title')
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'An error occurred' }, { status: 500 });
  }
}
