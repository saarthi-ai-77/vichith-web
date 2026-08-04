import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { slugify } from '@/lib/slugify';

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, cover_url, tags, visibility } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    // Verify ownership and get current state
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('title, slug, creator_id')
      .eq('id', id)
      .eq('creator_id', session.user.id)
      .maybeSingle();

    if (fetchError || !currentProject) {
      return NextResponse.json({ success: false, error: 'Project not found or access denied' }, { status: 404 });
    }

    const updates: Record<string, any> = {};

    if (description !== undefined) updates.description = description?.trim() || null;
    if (cover_url !== undefined) updates.cover_url = cover_url?.trim() || null;
    if (tags !== undefined) updates.tags = tags || [];
    if (visibility !== undefined) {
      updates.visibility = visibility;
      if (visibility === 'public') {
        updates.published_at = new Date().toISOString();
      } else {
        updates.published_at = null;
      }
    }

    if (title !== undefined && title.trim()) {
      const cleanTitle = title.trim();
      if (cleanTitle !== currentProject.title) {
        updates.title = cleanTitle;
        const baseSlug = slugify(cleanTitle);

        if (!baseSlug) {
          return NextResponse.json({ success: false, error: 'Project title must contain alphanumeric characters' }, { status: 400 });
        }

        // De-duplicate slug (excluding current project)
        let finalSlug = baseSlug;
        let counter = 1;

        while (true) {
          const { data: existingProject } = await supabase
            .from('projects')
            .select('id')
            .eq('creator_id', session.user.id)
            .eq('slug', finalSlug)
            .neq('id', id)
            .maybeSingle();

          if (!existingProject) {
            break;
          }

          counter++;
          finalSlug = `${baseSlug}-${counter}`;
        }

        updates.slug = finalSlug;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('creator_id', session.user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'An error occurred' }, { status: 500 });
  }
}
