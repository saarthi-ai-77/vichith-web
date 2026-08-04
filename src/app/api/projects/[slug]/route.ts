import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim().toLowerCase();
  const slug = params.slug?.trim().toLowerCase();

  if (!username || !slug) {
    return NextResponse.json({ success: false, error: 'Username and slug are required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  try {
    // 1. Fetch Creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (creatorError || !creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // 2. Fetch Project scoped to creator
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('slug', slug)
      .maybeSingle();

    if (projectError || !project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // 3. Security check: Only return private projects if viewer is the creator
    const { data: { session } } = await supabase.auth.getSession();
    const isCreator = session?.user && session.user.id === project.creator_id;

    if (project.visibility === 'private' && !isCreator) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // 4. Fetch commits (last 10 ordered by created_at desc)
    const { data: commits, error: commitsError } = await supabase
      .from('commits')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (commitsError) {
      return NextResponse.json({ success: false, error: commitsError.message }, { status: 500 });
    }

    return NextResponse.json({
      project,
      creator,
      commits: commits || []
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'An error occurred' }, { status: 500 });
  }
}
