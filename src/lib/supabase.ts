import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/**
 * The service role key, and ONLY the service role key.
 *
 * This used to read `SERVICE_ROLE || ANON`, which looks like a sensible fallback
 * and is not one. Every route here is server-side and needs privileged access; the
 * anon role is not a reduced-capability substitute for that, it is a different
 * thing entirely. The fallback meant a missing environment variable silently
 * downgraded the whole backend to the public key instead of failing — and it only
 * appeared to work because RLS was granting anon full access (S-9), which is the
 * bug it was quietly depending on.
 *
 * After 004_rls_lockdown.sql the anon role can read nothing, so the fallback would
 * turn one missing variable into a site-wide outage with no clue as to why. Failing
 * closed here names the cause in the first log line instead.
 *
 * It is also the deployment gate for that migration: ship this, and if the site
 * still works, the service role key is set and the SQL is safe to run.
 */
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.');
  }
  if (!supabaseKey) {
    // Named precisely: "Supabase key missing" sent the last person looking at the
    // anon key, which is present and useless here.
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server routes require the service role; ' +
      'the anon key is not a fallback for it.'
    );
  }
  return createClient(supabaseUrl, supabaseKey);
}

// SHA-256 password hash helper
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Log activity utility
export async function logActivity(userId: string | null, action: string, details: string) {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Auto-seed database: creates default roles, admin user, and initial AI Research task
export async function autoSeed() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing. Auto-seed bypassed.');
      return;
    }

    const supabase = getSupabaseClient();

    // 1. Seed Roles
    const defaultRoles = [
      {
        name: 'Admin',
        permissions: [
          'admin_access',
          'view_assigned_work',
          'create_reports',
          'submit_research',
          'view_team',
          'manage_tasks',
          'manage_members',
          'manage_roles',
        ],
      },
      {
        name: 'Researcher',
        permissions: ['view_assigned_work', 'submit_research', 'view_team'],
      },
      {
        name: 'Engineer',
        permissions: ['view_assigned_work', 'view_team'],
      },
    ];

    for (const r of defaultRoles) {
      const { data: existingRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', r.name)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from('roles').insert([r]);
        console.log(`Seeded default role: ${r.name}`);
      }
    }

    // Get Admin role id
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'Admin')
      .single();

    if (!adminRole) {
      console.error('Admin role not found after seeding.');
      return;
    }

    // 2. Seed Admin User
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .maybeSingle();

    if (!existingAdmin) {
      const hashedAdminPassword = hashPassword('vichith@2026!');
      await supabase.from('users').insert([
        {
          username: 'admin',
          password_hash: hashedAdminPassword,
          display_name: 'System Administrator',
          role_id: adminRole.id,
          department: 'Management',
          is_active: true,
        },
      ]);
      console.log('Seeded default admin user');
    }

    // Get Admin user id
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    // 3. Seed First AI Research Task
    const { data: existingTasks } = await supabase.from('tasks').select('id');
    if (!existingTasks || existingTasks.length === 0) {
      const description = `Research state-of-the-art technologies for Object Detection and Segmentation.

### Object Detection Technologies
- YOLO (v8 / v10)
- Grounding DINO
- RT-DETR
- SAM Integration

### Segmentation Technologies
- SAM (Segment Anything Model)
- SAM2
- FastSAM
- MobileSAM
- Grounded-SAM

### Objective
For a future Vichith feature, users should be able to upload an image, select objects detected by AI, individually segment them, and convert them to editable assets (e.g. Person, Laptop, Car, Bottle, Phone, Chair) as separate layers.
These layers can then power motion graphics, product videos, marketing videos, SaaS explainers, creative editing, and AI-assisted compositions.

### Research Deliverables
1. **Architecture Comparison**: Compare YOLO, Grounding DINO, SAM, SAM2, FastSAM, and MobileSAM.
2. **Performance metrics**: Measure speed, accuracy, memory usage, and hardware requirements.
3. **Integration Strategy**: Explain how Vichith should integrate it.
4. **Recommendation**: Provide the best architecture for Vichith.`;

      await supabase.from('tasks').insert([
        {
          title: 'Object Detection & Segmentation Research',
          description,
          priority: 'High',
          status: 'Pending',
          category: 'AI Research',
          created_by: adminUser?.id || null,
        },
      ]);
      console.log('Seeded initial AI Research task');
    }
  } catch (err) {
    console.error('Failed to run database auto-seed:', err);
  }
}
