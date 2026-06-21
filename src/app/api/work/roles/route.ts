import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient, logActivity } from '@/lib/supabase';

// Helper to authenticate request and get user permissions
async function getAuthUser() {
  const token = cookies().get('vichith_session')?.value;
  if (!token) return null;

  const supabase = getSupabaseClient();
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: user } = await supabase
    .from('users')
    .select('id, role_id')
    .eq('id', session.user_id)
    .single();

  if (!user) return null;

  if (user.role_id) {
    const { data: role } = await supabase
      .from('roles')
      .select('name, permissions')
      .eq('id', user.role_id)
      .single();
    return { id: user.id, permissions: role?.permissions || [] };
  }

  return { id: user.id, permissions: [] };
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, roles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.permissions.includes('manage_roles')) {
      return NextResponse.json({ error: 'Forbidden. Requires manage_roles permission.' }, { status: 403 });
    }

    const { id, name, permissions } = await req.json();

    if (!name || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Role name and permissions array are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    let result;
    if (id) {
      // Update role
      const { data, error } = await supabase
        .from('roles')
        .update({ name, permissions })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      result = data;
      await logActivity(user.id, 'ROLE_UPDATED', `Updated role "${name}" with permissions: [${permissions.join(', ')}]`);
    } else {
      // Create role
      const { data, error } = await supabase
        .from('roles')
        .insert([{ name, permissions }])
        .select()
        .single();
      if (error) throw error;
      result = data;
      await logActivity(user.id, 'ROLE_CREATED', `Created new role "${name}" with permissions: [${permissions.join(', ')}]`);
    }

    return NextResponse.json({ success: true, role: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
