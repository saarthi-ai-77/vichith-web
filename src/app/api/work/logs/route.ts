import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

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
    
    // Verify admin access
    const isAuthorized = user && (
      user.permissions.includes('admin_access') ||
      user.permissions.includes('manage_members') ||
      user.permissions.includes('manage_tasks') ||
      user.permissions.includes('manage_roles')
    );

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden. Requires admin-level authorization.' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('id, user_id, action, details, created_at, users(display_name, username)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const formattedLogs = (logs || []).map(log => ({
      id: log.id,
      user_id: log.user_id,
      action: log.action,
      details: log.details,
      created_at: log.created_at,
      display_name: (log.users as any)?.display_name || 'System / Auto',
      username: (log.users as any)?.username || 'system',
    }));

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
