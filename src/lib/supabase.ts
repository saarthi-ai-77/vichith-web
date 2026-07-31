import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { hashPasswordSecure } from './auth/password';

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

/**
 * @deprecated Unsalted SHA-256 (S-7). Use `hashPasswordSecure` / `verifyPassword`
 * from `@/lib/auth/password`.
 *
 * Kept for one reason only: `verifyPassword` must still recognise hashes already in
 * the database, and deleting this would not delete those rows. Nothing calls it to
 * CREATE a hash any more — the S-9 build guard would be the place to enforce that
 * if it ever creeps back.
 */
export function hashPasswordLegacySha256(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/*
 * `logActivity()` and `autoSeed()` lived here and are gone with the /work and
 * /admin subsystems they served. autoSeed in particular created a default admin
 * account whose password was a literal in this repository — deleting the feature
 * removes the account, the seeding, and the reason anyone would reintroduce it.
 *
 * Their tables (activity_logs, roles, tasks, task_comments, task_attachments,
 * attachments, sessions) are now unused by any code path. Dropping them is a
 * separate, deliberate SQL step — code first, data when you are sure.
 */
