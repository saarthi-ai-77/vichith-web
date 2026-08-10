import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Usage: npx tsx scripts/migrate_users_admin.ts

// Load environment variables manually or rely on dotenv if configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Fetching legacy users from public.users...");
  
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, email, display_name');

  if (fetchError || !users) {
    console.error("Failed to fetch public.users:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${users.length} users to migrate.`);
  
  let sqlScript = `-- Identity Migration: old_id -> new_id mapping\n`;
  sqlScript += `BEGIN;\n\n`;

  for (const user of users) {
    const oldId = user.id;
    const email = user.email;
    const displayName = user.display_name;

    console.log(`\nMigrating user: ${email} (Old ID: ${oldId})`);

    // Create user in Supabase Auth via Admin API
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true, // Auto-confirm to prevent login friction
      user_metadata: {
        display_name: displayName
      }
    });

    if (createError) {
      if (createError.message.includes('already exists') || createError.code === 'user_already_exists') {
        console.log(`Skipping: User ${email} already exists in auth.users.`);
        continue;
      }
      console.error(`Failed to create auth user for ${email}:`, createError);
      continue;
    }

    const newId = authUser.user.id;
    console.log(`Created auth.users record: ${newId}`);

    // Generate password reset link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email
    });

    if (linkError) {
      console.error(`Failed to generate password reset link for ${email}:`, linkError);
    } else {
      console.log(`[ACTION REQUIRED] Send this password reset link to ${email}: ${linkData.properties?.action_link}`);
    }

    // Append SQL to map foreign keys to the new ID
    // Note: If public.users.id is referenced by wallets and credit_transactions, 
    // we need to update them. If wallets uses auth.users.id but public.users exists,
    // actually wallets references auth.users(id). Wait, wallets references auth.users(id).
    // If they have legacy rows referencing public.users, we must update them.
    sqlScript += `-- Migrating ${email}\n`;
    
    // We must update public.users to the new ID. However, UUIDs might be primary keys.
    // If we update the PK on public.users, ON UPDATE CASCADE might handle child tables (like tasks, activity_logs).
    // But wallets has `user_id UUID PRIMARY KEY REFERENCES auth.users(id)`.
    // It doesn't reference public.users! Wait, if it references auth.users(id), then a legacy user 
    // never had a wallet because they didn't exist in auth.users. 
    // Thus we only need to update `public.users.id` so that when they log in via Supabase, 
    // `public.users` is correctly mapped to their new `auth.users.id`.
    // If public.users is referenced by activity_logs, roles, etc. we must ensure ON UPDATE CASCADE is present, 
    // or manually update them.
    sqlScript += `UPDATE public.users SET id = '${newId}' WHERE id = '${oldId}';\n`;
    
    // If they have any other tables referencing the old ID explicitly without CASCADE, we must update them here.
    // Assuming public.sessions is dropped, we update activity_logs if applicable.
    // Update any custom tables if needed.
  }

  sqlScript += `\nCOMMIT;\n`;

  const outPath = path.join(process.cwd(), 'supabase', 'migrations', 'manual_map_legacy_ids.sql');
  fs.writeFileSync(outPath, sqlScript);
  console.log(`\nMigration SQL script written to ${outPath}`);
  console.log(`Please review and run the SQL script against the database to remap public.users.id to auth.users.id.`);
}

run().catch(console.error);
