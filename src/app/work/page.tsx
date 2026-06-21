'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface Member {
  id: string;
  username: string;
  display_name: string;
  role_id: string;
  email?: string;
  avatar_url?: string;
  department?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

interface Attachment {
  id: string;
  task_id: string;
  name: string;
  url: string;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name: string;
  username: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Blocked' | 'Review' | 'Completed' | 'Archived';
  category: string;
  assigned_to?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  created_at: string;
  comments: Comment[];
  attachments: Attachment[];
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: string;
  created_at: string;
  display_name: string;
  username: string;
}

export default function WorkOS() {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'dashboard' | 'tasks' | 'members' | 'roles' | 'logs'>('my-tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Forms
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Task['priority'],
    status: 'Pending' as Task['status'],
    category: '',
    assigned_to: '',
    due_date: '',
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    username: '',
    password: '',
    display_name: '',
    role_id: '',
    email: '',
    department: '',
    notes: '',
    is_active: true,
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: [] as string[],
  });

  // Comments & Attachments
  const [commentInput, setCommentInput] = useState('');
  const [attachmentForm, setAttachmentForm] = useState({ name: '', url: '' });
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/work/auth');
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        // Default admin views to Dashboard
        const isAdm = data.user.permissions.includes('admin_access') || data.user.permissions.includes('manage_tasks');
        setActiveTab(isAdm ? 'dashboard' : 'my-tasks');
        fetchInitialData(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/work/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        const isAdm = data.user.permissions.includes('admin_access') || data.user.permissions.includes('manage_tasks');
        setActiveTab(isAdm ? 'dashboard' : 'my-tasks');
        fetchInitialData(data.user);
      } else {
        setAuthError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/work/logout', { method: 'POST' });
      setUser(null);
      setTasks([]);
      setMembers([]);
      setRoles([]);
      setLogs([]);
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInitialData = async (currUser = user) => {
    if (!currUser) return;
    setLoading(true);
    try {
      // 1. Fetch tasks (always required)
      const tasksRes = await fetch('/api/work/tasks');
      const tasksData = await tasksRes.json();
      if (tasksRes.ok && tasksData.success) {
        setTasks(tasksData.tasks);
        // Refresh selected task if open
        if (selectedTask) {
          const updated = tasksData.tasks.find((t: Task) => t.id === selectedTask.id);
          if (updated) setSelectedTask(updated);
        }
      }

      // 2. Fetch admin datasets if authorized
      const hasAdminRights = currUser.permissions.includes('admin_access') || 
                            currUser.permissions.includes('manage_members') || 
                            currUser.permissions.includes('manage_roles') ||
                            currUser.permissions.includes('manage_tasks');

      if (hasAdminRights) {
        // Fetch roles
        const rolesRes = await fetch('/api/work/roles');
        const rolesData = await rolesRes.json();
        if (rolesRes.ok && rolesData.success) {
          setRoles(rolesData.roles);
        }

        // Fetch members
        const membersRes = await fetch('/api/work/members');
        const membersData = await membersRes.json();
        if (membersRes.ok && membersData.success) {
          setMembers(membersData.members);
        }

        // Fetch logs
        const logsRes = await fetch('/api/work/logs');
        const logsData = await logsRes.json();
        if (logsRes.ok && logsData.success) {
          setLogs(logsData.logs);
        }
      }
    } catch (err) {
      console.error('Failed to sync workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Task Handlers
  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      category: '',
      assigned_to: '',
      due_date: '',
    });
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category || '',
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? task.due_date.substring(0, 16) : '',
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        action: editingTask ? 'UPDATE_DETAILS' : 'CREATE',
        taskId: editingTask?.id,
        ...taskForm,
      };

      const res = await fetch('/api/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowTaskModal(false);
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save task.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const res = await fetch('/api/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          taskId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to archive this task?')) return;
    try {
      const res = await fetch('/api/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ARCHIVE',
          taskId,
        }),
      });

      if (res.ok) {
        setSelectedTask(null);
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to archive task.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentInput.trim()) return;
    try {
      const res = await fetch('/api/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_COMMENT',
          taskId: selectedTask.id,
          content: commentInput.trim(),
        }),
      });

      if (res.ok) {
        setCommentInput('');
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to post comment.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !attachmentForm.name || !attachmentForm.url) return;
    try {
      const res = await fetch('/api/work/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_ATTACHMENT',
          taskId: selectedTask.id,
          name: attachmentForm.name,
          url: attachmentForm.url,
        }),
      });

      if (res.ok) {
        setAttachmentForm({ name: '', url: '' });
        setShowAttachmentForm(false);
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add attachment.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Member Handlers
  const openCreateMember = () => {
    setEditingMember(null);
    setMemberForm({
      username: '',
      password: '',
      display_name: '',
      role_id: roles[0]?.id || '',
      email: '',
      department: '',
      notes: '',
      is_active: true,
    });
    setShowMemberModal(true);
  };

  const openEditMember = (m: Member) => {
    setEditingMember(m);
    setMemberForm({
      username: m.username,
      password: '', // blank by default (only sets if changed)
      display_name: m.display_name,
      role_id: m.role_id || '',
      email: m.email || '',
      department: m.department || '',
      notes: m.notes || '',
      is_active: m.is_active,
    });
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingMember?.id,
        ...memberForm,
      };

      const res = await fetch('/api/work/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowMemberModal(false);
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save member.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Role Handlers
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
    setShowRoleModal(true);
  };

  const openEditRole = (r: Role) => {
    setEditingRole(r);
    setRoleForm({ name: r.name, permissions: r.permissions });
    setShowRoleModal(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingRole?.id,
        ...roleForm,
      };

      const res = await fetch('/api/work/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowRoleModal(false);
        fetchInitialData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save role.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermissionCheckbox = (perm: string, checked: boolean) => {
    setRoleForm(prev => {
      let updated = [...prev.permissions];
      if (checked) {
        if (!updated.includes(perm)) updated.push(perm);
      } else {
        updated = updated.filter(p => p !== perm);
      }
      return { ...prev, permissions: updated };
    });
  };

  // Helpers
  const getAssigneeName = (userId?: string | null) => {
    if (!userId) return 'Unassigned';
    const found = members.find(m => m.id === userId);
    return found ? found.display_name : 'Team Member';
  };

  const getRoleLabel = (roleId?: string) => {
    if (!roleId) return 'Member';
    const found = roles.find(r => r.id === roleId);
    return found ? found.name : 'Member';
  };

  // Available permissions descriptions mapping
  const availablePermissions = [
    { key: 'admin_access', name: 'Admin Access', desc: 'Global bypass & administrative operations' },
    { key: 'manage_tasks', name: 'Manage Tasks', desc: 'Create, edit, assign, and delete tasks' },
    { key: 'manage_members', name: 'Manage Members', desc: 'Create and update team member accounts' },
    { key: 'manage_roles', name: 'Manage Roles', desc: 'Manage dynamic roles and custom scopes' },
    { key: 'view_assigned_work', name: 'View Assigned Work', desc: 'Access assigned tasks on dashboard' },
    { key: 'view_team', name: 'View Team', desc: 'View directories of team members' },
    { key: 'submit_research', name: 'Submit Research', desc: 'Upload documents, notes, and research deliverables' },
    { key: 'create_reports', name: 'Create Reports', desc: 'Trigger developer audit logs' },
  ];

  // Auth checking indicator
  if (authLoading) {
    return (
      <div className="work-loading-screen">
        <div className="spinner"></div>
        <p>Loading Vichith Operations System...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="admin-login-container">
        <div className="login-glow"></div>
        <div className="login-card" style={{ maxWidth: '440px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>Vichith Workspace</h2>
          <p className="login-sub" style={{ marginBottom: '1.75rem' }}>Authenticate to access tasks, research projects, and administrative panels.</p>
          
          <form onSubmit={handleLogin}>
            {authError && <div className="login-error" style={{ marginBottom: '1.25rem' }}>{authError}</div>}
            
            <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>Username</label>
              <input
                type="text"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="form-control"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
              Unlock Operations Suite
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Roles checking
  const isAdmin = user.permissions.includes('admin_access') || user.permissions.includes('manage_tasks') || user.permissions.includes('manage_members');

  // Stats calculation
  const openTasksCount = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Archived').length;
  const blockedTasksCount = tasks.filter(t => t.status === 'Blocked').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const totalTasksCount = tasks.length;

  return (
    <div className="work-dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <div className="work-sidebar">
        <div className="sidebar-brand">
          <span className="dot" style={{ background: 'var(--cyan)' }}></span>
          vi<span>chith_os</span>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="avatar">{user.display_name.charAt(0)}</div>
          <div className="info">
            <div className="name">{user.display_name}</div>
            <div className="role">@{user.username} · <span className="role-tag">{user.role_name}</span></div>
          </div>
        </div>

        {/* Tab Menus */}
        <div className="sidebar-menu">
          <div className="menu-section">Member Workspace</div>
          <button 
            className={`menu-item ${activeTab === 'my-tasks' ? 'active' : ''}`}
            onClick={() => { setActiveTab('my-tasks'); setSelectedTask(null); }}
          >
            📋 My Assigned Tasks ({tasks.filter(t => t.assigned_to === user.id && t.status !== 'Completed' && t.status !== 'Archived').length})
          </button>

          {isAdmin && (
            <>
              <div className="menu-section">Administrative Ops</div>
              <button 
                className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setSelectedTask(null); }}
              >
                📊 Dashboard Stats
              </button>
              <button 
                className={`menu-item ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => { setActiveTab('tasks'); setSelectedTask(null); }}
              >
                📝 Task Manager ({tasks.filter(t => t.status !== 'Archived').length})
              </button>
              <button 
                className={`menu-item ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => { setActiveTab('members'); setSelectedTask(null); }}
              >
                👥 Team Directory ({members.length})
              </button>
              <button 
                className={`menu-item ${activeTab === 'roles' ? 'active' : ''}`}
                onClick={() => { setActiveTab('roles'); setSelectedTask(null); }}
              >
                🛡️ Permissions & Roles
              </button>
              <button 
                className={`menu-item ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => { setActiveTab('logs'); setSelectedTask(null); }}
              >
                📜 Audit Logs
              </button>
            </>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout Session
        </button>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="work-main">
        {loading && <div className="sync-banner">Syncing database operations...</div>}

        {/* TAB 1: MY ASSIGNED TASKS */}
        {activeTab === 'my-tasks' && (
          <div className="tab-layout-split">
            {/* Left list */}
            <div className="split-list">
              <h2>My Assigned Tasks</h2>
              <p className="sub">Focus on your deliverables, log findings, and update your task states.</p>

              <div className="task-cards-list">
                {tasks.filter(t => t.assigned_to === user.id && t.status !== 'Archived').length === 0 ? (
                  <div className="empty-state">No active tasks assigned to you.</div>
                ) : (
                  tasks
                    .filter(t => t.assigned_to === user.id && t.status !== 'Archived')
                    .map(task => (
                      <div 
                        key={task.id} 
                        className={`work-task-card ${selectedTask?.id === task.id ? 'active' : ''}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="card-header">
                          <span className={`badge-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                          <span className="card-category">{task.category || 'General'}</span>
                        </div>
                        <h3>{task.title}</h3>
                        <div className="card-footer">
                          <span className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                          {task.due_date && (
                            <span className="due-date">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Right details view */}
            <div className="split-details">
              {selectedTask ? (
                <div className="task-full-details">
                  <div className="detail-header">
                    <div>
                      <span className="detail-category">{selectedTask.category || 'General'}</span>
                      <h2>{selectedTask.title}</h2>
                    </div>
                    <div className="detail-meta">
                      <span className={`badge-priority ${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span>
                    </div>
                  </div>

                  <div className="detail-grid-meta">
                    <div>
                      <strong>Created At:</strong> {new Date(selectedTask.created_at).toLocaleString()}
                    </div>
                    {selectedTask.due_date && (
                      <div>
                        <strong>Due Date:</strong> {new Date(selectedTask.due_date).toLocaleString()}
                      </div>
                    )}
                    <div className="status-selector-row">
                      <strong>Task Status:</strong>
                      <select 
                        value={selectedTask.status} 
                        onChange={(e) => handleStatusChange(selectedTask.id, e.target.value as Task['status'])}
                        className="status-dropdown"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Task Description & Guidelines</h4>
                    <p className="detail-desc-block">{selectedTask.description || 'No description provided.'}</p>
                  </div>

                  <hr className="detail-divider" />

                  {/* Attachments list */}
                  <div className="detail-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4>Research Documents & Deliverables</h4>
                      <button 
                        onClick={() => setShowAttachmentForm(!showAttachmentForm)} 
                        className="btn-ghost" 
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        {showAttachmentForm ? 'Cancel' : '+ Add Document/Link'}
                      </button>
                    </div>

                    {showAttachmentForm && (
                      <form onSubmit={handleAddAttachment} className="inline-form" style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface2)' }}>
                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                          <input 
                            type="text" 
                            placeholder="Link Title (e.g. YOLO vs SAM Comparison)" 
                            value={attachmentForm.name}
                            onChange={(e) => setAttachmentForm(prev => ({ ...prev, name: e.target.value }))}
                            className="form-control"
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                          <input 
                            type="url" 
                            placeholder="Resource URL (e.g. Google Docs / Drive / PDF URL)" 
                            value={attachmentForm.url}
                            onChange={(e) => setAttachmentForm(prev => ({ ...prev, url: e.target.value }))}
                            className="form-control"
                            required
                          />
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Upload Attachment Link</button>
                      </form>
                    )}

                    {selectedTask.attachments && selectedTask.attachments.length > 0 ? (
                      <div className="attachments-list-links">
                        {selectedTask.attachments.map(att => (
                          <div key={att.id} className="attachment-item-link">
                            <span className="icon">📎</span>
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="name-link">{att.name}</a>
                            <span className="date">{new Date(att.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-attachments" style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>No resource URLs uploaded yet.</p>
                    )}
                  </div>

                  <hr className="detail-divider" />

                  {/* Discussions Feed */}
                  <div className="detail-section">
                    <h4>Task Discussions & Updates</h4>
                    
                    <form onSubmit={handleAddComment} className="comment-post-form" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
                      <textarea 
                        placeholder="Log research state, add clarifications, or write code findings..." 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="form-control comment-box"
                        rows={3}
                        required
                      />
                      <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Post Log Entry</button>
                    </form>

                    <div className="discussions-feed-list">
                      {selectedTask.comments && selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map(c => (
                          <div key={c.id} className="discussion-item">
                            <div className="disc-header">
                              <span className="author">{c.display_name} <span className="username">@{c.username}</span></span>
                              <span className="time">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <div className="disc-body">{c.content}</div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-state-text" style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>No discussion entries posted yet. Start the conversation!</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="detail-placeholder">
                  <div className="placeholder-icon">📋</div>
                  <h3>Select a Task</h3>
                  <p>Choose an assigned task from the left sidebar to view deliverables, update progress, and log your findings.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN STATS OVERVIEW */}
        {activeTab === 'dashboard' && isAdmin && (
          <div className="dashboard-view-layout">
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
              <span className="dashboard-kicker">Operational Status</span>
              <h2>Vichith OS Control Room</h2>
              <p className="dashboard-sub">High-level diagnostics of active sprints, research backlogs, and engineering staff.</p>
            </div>

            <div className="analytics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="analytics-card">
                <div className="card-icon">👥</div>
                <div className="card-data">
                  <h3>{members.length}</h3>
                  <span className="card-label">Active Members</span>
                </div>
                <p className="card-desc">Users registered to participate in private sprints.</p>
              </div>

              <div className="analytics-card">
                <div className="card-icon">📋</div>
                <div className="card-data">
                  <h3>{openTasksCount}</h3>
                  <span className="card-label">Active Sprints / Tasks</span>
                </div>
                <p className="card-desc">Tasks currently in Pending, In Progress, Blocked, or Review.</p>
              </div>

              <div className="analytics-card">
                <div className="card-icon">⚠️</div>
                <div className="card-data">
                  <h3>{blockedTasksCount}</h3>
                  <span className="card-label">Blocked Deliverables</span>
                </div>
                <p className="card-desc">Tasks flagged as Blocked requiring manager resolution.</p>
              </div>

              <div className="analytics-card">
                <div className="card-icon">✅</div>
                <div className="card-data">
                  <h3>{completedTasksCount}</h3>
                  <span className="card-label">Completed Tasks</span>
                </div>
                <p className="card-desc">Sprints successfully resolved and closed.</p>
              </div>
            </div>

            <div className="dashboard-split-panels" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="guide-box-panel" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Operational Directives</h3>
                <ul style={{ color: 'var(--text-2)', paddingLeft: '1.25rem', lineHeight: '1.8', fontSize: '0.9rem' }}>
                  <li>Dynamic roles enable modular access restrictions for different tasks.</li>
                  <li>Assign custom security profiles inside the <strong>🛡️ Permissions</strong> tab.</li>
                  <li>Audit detailed system-wide modifications in the <strong>📜 Audit Logs</strong> ledger.</li>
                  <li>Register new engineering and research accounts under the <strong>👥 Team Directory</strong> panel.</li>
                </ul>
              </div>

              <div className="recent-activity-panel" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Recent Log Entries</h3>
                <div className="inline-logs" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {logs.slice(0, 5).map(log => (
                    <div key={log.id} style={{ fontSize: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', marginBottom: '0.25rem' }}>
                        <strong>{log.display_name}</strong>
                        <span>{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--text-2)' }}>{log.details}</div>
                    </div>
                  ))}
                  {logs.length === 0 && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No logged entries found.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TASK MANAGER (Admin Only) */}
        {activeTab === 'tasks' && isAdmin && (
          <div className="task-manager-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2>Task Board & Allocations</h2>
                <p className="sub">Distribute workflows, schedule priorities, and review research updates.</p>
              </div>
              <button onClick={openCreateTask} className="btn-primary">
                + Create Operations Task
              </button>
            </div>

            <div className="table-responsive-container">
              <table className="work-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.filter(t => t.status !== 'Archived').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center" style={{ padding: '3rem', color: 'var(--text-3)' }}>No active tasks available on the board.</td>
                    </tr>
                  ) : (
                    tasks
                      .filter(t => t.status !== 'Archived')
                      .map(task => (
                        <tr key={task.id}>
                          <td>
                            <strong>{task.title}</strong>
                            <div className="desc-snippet" style={{ fontSize: '0.75rem', color: 'var(--text-3)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.description}</div>
                          </td>
                          <td><span className="tag-cat">{task.category || 'General'}</span></td>
                          <td><span className={`badge-priority ${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                          <td>
                            <select 
                              value={task.assigned_to || ''} 
                              onChange={(e) => {
                                fetch('/api/work/tasks', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'ASSIGN', taskId: task.id, assigned_to: e.target.value || null }),
                                }).then(() => fetchInitialData());
                              }}
                              className="assign-select"
                            >
                              <option value="">Unassigned</option>
                              {members.map(m => (
                                <option key={m.id} value={m.id}>{m.display_name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span className={`badge-status ${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                          </td>
                          <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => { setSelectedTask(task); setActiveTab('my-tasks'); }} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</button>
                              <button onClick={() => openEditTask(task)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                              <button onClick={() => handleArchiveTask(task.id)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#ff5f57' }}>Archive</button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM DIRECTORY (Admin Only) */}
        {activeTab === 'members' && isAdmin && (
          <div className="members-manager-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2>Team Directory</h2>
                <p className="sub">Register organization members, audit status access, and assign operational profiles.</p>
              </div>
              <button onClick={openCreateMember} className="btn-primary">
                + Register New Member
              </button>
            </div>

            <div className="table-responsive-container">
              <table className="work-table">
                <thead>
                  <tr>
                    <th>Display Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.display_name}</strong></td>
                      <td>@{m.username}</td>
                      <td><span className="role-tag">{getRoleLabel(m.role_id)}</span></td>
                      <td>{m.department || 'N/A'}</td>
                      <td>{m.email || 'N/A'}</td>
                      <td>
                        <span className={`status-dot ${m.is_active ? 'active' : 'inactive'}`}></span>
                        {m.is_active ? 'Active' : 'Deactivated'}
                      </td>
                      <td>
                        <button onClick={() => openEditMember(m)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit / Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PERMISSIONS & ROLES (Admin Only) */}
        {activeTab === 'roles' && isAdmin && (
          <div className="roles-manager-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2>Dynamic Security Roles</h2>
                <p className="sub">Provision dynamic roles with specific feature permission matrices.</p>
              </div>
              <button onClick={openCreateRole} className="btn-primary">
                + Create Dynamic Role
              </button>
            </div>

            <div className="table-responsive-container">
              <table className="work-table">
                <thead>
                  <tr>
                    <th>Role Title</th>
                    <th>Assigned Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {r.permissions.map((perm, idx) => (
                            <span key={idx} className="badge-perm" style={{ background: 'var(--surface2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>{perm}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => openEditRole(r)} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit Role</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS (Admin Only) */}
        {activeTab === 'logs' && isAdmin && (
          <div className="logs-view">
            <div style={{ marginBottom: '2rem' }}>
              <h2>Security Audit Trail</h2>
              <p className="sub">Immutable ledger of state alterations, logins, and creations.</p>
            </div>

            <div className="table-responsive-container">
              <table className="work-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <strong>{log.display_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>@{log.username}</div>
                      </td>
                      <td><span className="log-action-tag" style={{ background: '#00d4c820', color: 'var(--cyan)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #00d4c830' }}>{log.action}</span></td>
                      <td style={{ color: 'var(--text-2)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TASK FORM MODAL */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <button onClick={() => setShowTaskModal(false)} className="modal-close-btn">&times;</button>
            <h3>{editingTask ? 'Edit Task Details' : 'Create Operations Task'}</h3>
            
            <form onSubmit={handleTaskSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category</label>
                <input
                  type="text"
                  placeholder="e.g. AI Research, Frontend, QA"
                  value={taskForm.category}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="form-control"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="form-control"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="form-control"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.display_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Description & Deliverables Guidelines</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control"
                  rows={6}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {editingTask ? 'Save Task Alterations' : 'Dispatch Task to Board'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER FORM MODAL */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <button onClick={() => setShowMemberModal(false)} className="modal-close-btn">&times;</button>
            <h3>{editingMember ? 'Manage Team Member' : 'Register New Member'}</h3>
            
            <form onSubmit={handleMemberSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={memberForm.display_name}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, display_name: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="e.g. jdoe"
                  value={memberForm.username}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, username: e.target.value }))}
                  className="form-control"
                  required
                  disabled={!!editingMember}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">{editingMember ? 'Reset Password (optional)' : 'Password'}</label>
                <input
                  type="password"
                  placeholder={editingMember ? 'Leave empty to keep unchanged' : 'Enter account password'}
                  value={memberForm.password}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, password: e.target.value }))}
                  className="form-control"
                  required={!editingMember}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Operational Role</label>
                  <select
                    value={memberForm.role_id}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, role_id: e.target.value }))}
                    className="form-control"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Research"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, department: e.target.value }))}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="jdoe@vichith.ai"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Internal Notes / Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. Senior researcher, hardware lead"
                  value={memberForm.notes}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={memberForm.is_active}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '0.875rem', userSelect: 'none', cursor: 'pointer' }}>Active Team Status</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {editingMember ? 'Save Account Profiles' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ROLE FORM MODAL */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <button onClick={() => setShowRoleModal(false)} className="modal-close-btn">&times;</button>
            <h3>{editingRole ? 'Update Dynamic Role' : 'Create Dynamic Role'}</h3>
            
            <form onSubmit={handleRoleSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI Engineer"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Assign Granular Permissions</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {availablePermissions.map(perm => (
                    <div key={perm.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id={`perm-${perm.key}`}
                        checked={roleForm.permissions.includes(perm.key)}
                        onChange={(e) => handlePermissionCheckbox(perm.key, e.target.checked)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <label htmlFor={`perm-${perm.key}`} style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{perm.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{perm.desc}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                {editingRole ? 'Save Dynamic Role' : 'Instantiate Dynamic Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
