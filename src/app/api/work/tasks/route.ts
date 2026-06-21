import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient, logActivity } from '@/lib/supabase';

// Helper to authenticate request and get user info
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
    .select('id, username, display_name, role_id')
    .eq('id', session.user_id)
    .single();

  if (!user) return null;

  let roleName = 'Member';
  let permissions: string[] = [];

  if (user.role_id) {
    const { data: role } = await supabase
      .from('roles')
      .select('name, permissions')
      .eq('id', user.role_id)
      .single();
    if (role) {
      roleName = role.name;
      permissions = role.permissions || [];
    }
  }

  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role_name: roleName,
    permissions,
  };
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch tasks depending on permissions
    let tasksQuery = supabase.from('tasks').select('*');

    const hasManageTasks = user.permissions.includes('manage_tasks') || user.permissions.includes('admin_access');
    if (!hasManageTasks) {
      // Standard member: only see assigned tasks
      tasksQuery = tasksQuery.eq('assigned_to', user.id);
    }

    const { data: tasks, error: tasksError } = await tasksQuery.order('created_at', { ascending: false });
    if (tasksError) throw tasksError;

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ success: true, tasks: [] });
    }

    // 2. Fetch all comments for these tasks
    const taskIds = tasks.map(t => t.id);
    const { data: comments, error: commentsError } = await supabase
      .from('task_comments')
      .select('id, task_id, user_id, content, created_at, users(display_name, username)')
      .in('task_id', taskIds)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // 3. Fetch all attachments for these tasks
    const { data: attachments, error: attachmentsError } = await supabase
      .from('task_attachments')
      .select('*')
      .in('task_id', taskIds);

    if (attachmentsError) throw attachmentsError;

    // 4. Assemble the nested structures
    const assembledTasks = tasks.map(task => {
      const taskComments = (comments || [])
        .filter(c => c.task_id === task.id)
        .map(c => ({
          id: c.id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          display_name: (c.users as any)?.display_name || 'Unknown User',
          username: (c.users as any)?.username || 'unknown',
        }));

      const taskAttachments = (attachments || []).filter(a => a.task_id === task.id);

      return {
        ...task,
        comments: taskComments,
        attachments: taskAttachments,
      };
    });

    return NextResponse.json({ success: true, tasks: assembledTasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const supabase = getSupabaseClient();
    const hasManageTasks = user.permissions.includes('manage_tasks') || user.permissions.includes('admin_access');

    // Action 1: CREATE TASK
    if (action === 'CREATE') {
      if (!hasManageTasks) {
        return NextResponse.json({ error: 'Forbidden. Requires manage_tasks permission.' }, { status: 403 });
      }

      const { title, description, priority, status, category, assigned_to, due_date } = body;
      if (!title || !priority || !status) {
        return NextResponse.json({ error: 'Title, priority, and status are required.' }, { status: 400 });
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            priority,
            status,
            category,
            assigned_to: assigned_to || null,
            due_date: due_date || null,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, 'TASK_CREATED', `Created task "${title}" (Priority: ${priority}, Status: ${status}).`);

      return NextResponse.json({ success: true, task });
    }

    // Action 2: UPDATE TASK STATUS
    if (action === 'UPDATE_STATUS') {
      const { taskId, status } = body;
      if (!taskId || !status) {
        return NextResponse.json({ error: 'Task ID and status are required.' }, { status: 400 });
      }

      // Check task permissions: either has manage_tasks or is the assignee
      const { data: task } = await supabase.from('tasks').select('title, assigned_to').eq('id', taskId).single();
      if (!task) {
        return NextResponse.json({ error: 'Task not found.' }, { status: 444 });
      }

      if (!hasManageTasks && task.assigned_to !== user.id) {
        return NextResponse.json({ error: 'Forbidden. You are not assigned to this task.' }, { status: 403 });
      }

      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      await logActivity(user.id, 'TASK_STATUS_UPDATED', `Updated status of task "${task.title}" to "${status}".`);

      return NextResponse.json({ success: true });
    }

    // Action 3: ADD COMMENT
    if (action === 'ADD_COMMENT') {
      const { taskId, content } = body;
      if (!taskId || !content || content.trim().length === 0) {
        return NextResponse.json({ error: 'Task ID and comment content are required.' }, { status: 400 });
      }

      // Permissions check
      const { data: task } = await supabase.from('tasks').select('title, assigned_to').eq('id', taskId).single();
      if (!task) {
        return NextResponse.json({ error: 'Task not found.' }, { status: 444 });
      }

      if (!hasManageTasks && task.assigned_to !== user.id) {
        return NextResponse.json({ error: 'Forbidden. You cannot comment on this task.' }, { status: 403 });
      }

      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert([
          {
            task_id: taskId,
            user_id: user.id,
            content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, 'TASK_COMMENT_ADDED', `Added comment to task "${task.title}": "${content.slice(0, 30)}...".`);

      return NextResponse.json({
        success: true,
        comment: {
          ...comment,
          display_name: user.display_name,
          username: user.username,
        },
      });
    }

    // Action 4: ADD ATTACHMENT
    if (action === 'ADD_ATTACHMENT') {
      const { taskId, name, url } = body;
      if (!taskId || !name || !url) {
        return NextResponse.json({ error: 'Task ID, attachment name, and URL are required.' }, { status: 400 });
      }

      const { data: task } = await supabase.from('tasks').select('title, assigned_to').eq('id', taskId).single();
      if (!task) {
        return NextResponse.json({ error: 'Task not found.' }, { status: 444 });
      }

      if (!hasManageTasks && task.assigned_to !== user.id) {
        return NextResponse.json({ error: 'Forbidden. You cannot attach files to this task.' }, { status: 403 });
      }

      const { data: attachment, error } = await supabase
        .from('task_attachments')
        .insert([
          {
            task_id: taskId,
            name,
            url,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, 'TASK_ATTACHMENT_ADDED', `Added attachment "${name}" to task "${task.title}".`);

      return NextResponse.json({ success: true, attachment });
    }

    // Action 5: ASSIGN TASK
    if (action === 'ASSIGN') {
      if (!hasManageTasks) {
        return NextResponse.json({ error: 'Forbidden. Requires manage_tasks permission.' }, { status: 403 });
      }

      const { taskId, assigned_to } = body;
      if (!taskId) {
        return NextResponse.json({ error: 'Task ID is required.' }, { status: 400 });
      }

      const { data: task } = await supabase.from('tasks').select('title').eq('id', taskId).single();
      if (!task) throw new Error('Task not found');

      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: assigned_to || null })
        .eq('id', taskId);

      if (error) throw error;

      let assigneeName = 'Unassigned';
      if (assigned_to) {
        const { data: assignee } = await supabase.from('users').select('display_name').eq('id', assigned_to).single();
        if (assignee) assigneeName = assignee.display_name;
      }

      await logActivity(user.id, 'TASK_ASSIGNED', `Assigned task "${task.title}" to ${assigneeName}.`);

      return NextResponse.json({ success: true });
    }

    // Action 6: UPDATE FULL TASK details (Admin only)
    if (action === 'UPDATE_DETAILS') {
      if (!hasManageTasks) {
        return NextResponse.json({ error: 'Forbidden. Requires manage_tasks permission.' }, { status: 403 });
      }

      const { taskId, title, description, priority, status, category, assigned_to, due_date } = body;
      if (!taskId || !title || !priority || !status) {
        return NextResponse.json({ error: 'Task ID, title, priority, and status are required.' }, { status: 400 });
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          priority,
          status,
          category,
          assigned_to: assigned_to || null,
          due_date: due_date || null,
        })
        .eq('id', taskId);

      if (error) throw error;

      await logActivity(user.id, 'TASK_UPDATED', `Updated task details for "${title}".`);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid task action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
