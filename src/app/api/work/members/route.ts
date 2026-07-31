import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient, logActivity } from '@/lib/supabase';
import { hashPasswordSecure } from '@/lib/auth/password';

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
    
    // Fetch users and join with roles
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, display_name, role_id, email, avatar_url, department, notes, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, members: users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.permissions.includes('manage_members')) {
      return NextResponse.json({ error: 'Forbidden. Requires manage_members permission.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      username,
      password,
      display_name,
      role_id,
      email,
      avatar_url,
      department,
      notes,
      is_active,
    } = body;

    const supabase = getSupabaseClient();

    let result;
    if (id) {
      // 1. Update Existing User
      const updateData: any = {
        display_name,
        role_id,
        email,
        avatar_url,
        department,
        notes,
        is_active: is_active !== undefined ? is_active : true,
      };

      if (username) {
        updateData.username = username.toLowerCase().trim();
      }

      if (password && password.trim().length > 0) {
        updateData.password_hash = await hashPasswordSecure(password);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, username, display_name, role_id, email, avatar_url, department, notes, is_active')
        .single();

      if (error) throw error;
      result = data;

      await logActivity(
        user.id,
        'USER_UPDATED',
        `Updated member account: "${username}" (${display_name}).`
      );
    } else {
      // 2. Create New User
      if (!username || !password || !display_name) {
        return NextResponse.json({ error: 'Username, password, and display name are required.' }, { status: 400 });
      }

      // Check if username exists
      const cleanUsername = username.toLowerCase().trim();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }

      const passHash = await hashPasswordSecure(password);
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: cleanUsername,
            password_hash: passHash,
            display_name,
            role_id,
            email,
            avatar_url,
            department,
            notes,
            is_active: is_active !== undefined ? is_active : true,
          },
        ])
        .select('id, username, display_name, role_id, email, avatar_url, department, notes, is_active')
        .single();

      if (error) throw error;
      result = data;

      await logActivity(
        user.id,
        'USER_CREATED',
        `Created new member account: "${cleanUsername}" (${display_name}).`
      );
    }

    return NextResponse.json({ success: true, member: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
