import { getSupabaseClient } from '../supabase';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  email: string;
  email_verified: boolean;
  display_name: string;
  password_hash?: string;
  created_at: string;
}

export interface ProfileRecord {
  user_id: string;
  roles: string[];
  avatar_url: string | null;
  created_at?: string;
}

export interface EntitlementsRecord {
  user_id: string;
  plan: string;
  credits_balance: number;
  autonomy_runs_remaining: number;
  renews_at: string | null;
  updated_at?: string;
}

export interface UsageEventRecord {
  id: string;
  user_id: string;
  type: string;
  runtime: string;
  provider?: string | null;
  model?: string | null;
  units?: number;
  credits_cost?: number;
  project_id?: string | null;
  meta?: any;
  ts: number; // UNIX MILLISECONDS
  created_at?: string;
}

export interface AuthCodeRecord {
  code: string;
  code_challenge: string;
  user_id: string;
  expires_at: number; // UNIX SECONDS
  used: boolean;
  created_at?: string;
}

export interface RefreshTokenRecord {
  token: string;
  user_id: string;
  expires_at: number; // UNIX SECONDS
  revoked: boolean;
  created_at?: string;
}

// ----------------------------------------------------
// Fallback Local Storage (For Dev/Test fallback only)
// ----------------------------------------------------
const DATA_DIR = path.join(process.cwd(), '.dev_db');
const DEV_DB_FILE = path.join(DATA_DIR, 'dev_store.json');

interface DevStore {
  users: Record<string, UserRecord>;
  profiles: Record<string, ProfileRecord>;
  entitlements: Record<string, EntitlementsRecord>;
  usage_events: UsageEventRecord[];
  auth_codes: Record<string, AuthCodeRecord>;
  refresh_tokens: Record<string, RefreshTokenRecord>;
}

function loadDevStore(): DevStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DEV_DB_FILE)) {
      const content = fs.readFileSync(DEV_DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading dev store:', err);
  }
  return {
    users: {},
    profiles: {},
    entitlements: {},
    usage_events: [],
    auth_codes: {},
    refresh_tokens: {},
  };
}

function saveDevStore(store: DevStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DEV_DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving dev store:', err);
  }
}

function isSupabaseAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Must test the SAME key `getSupabaseClient()` requires. It previously accepted
  // the anon key here and then handed off to a factory that no longer does, so a
  // service-role-less deployment would answer "yes, Supabase is available" and
  // then throw on every call instead of using the dev store — a worse failure than
  // either branch alone.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && !url.includes('your-project-id'));
}

// ----------------------------------------------------
// User Operations
// ----------------------------------------------------
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Supabase findUserByEmail error:', error);
    }
    if (data) return data as UserRecord;
  }

  // Fallback dev store
  const store = loadDevStore();
  const found = Object.values(store.users).find((u) => u.email.toLowerCase() === cleanEmail);
  return found || null;
}

export async function findUserById(userId: string): Promise<UserRecord | null> {
  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('Supabase findUserById error:', error);
    }
    if (data) return data as UserRecord;
  }

  const store = loadDevStore();
  return store.users[userId] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  displayName?: string
): Promise<UserRecord> {
  const cleanEmail = email.trim().toLowerCase();
  const userId = crypto.randomUUID();
  const name = displayName || cleanEmail.split('@')[0];
  const createdAt = new Date().toISOString();

  const newUser: UserRecord & { username?: string } = {
    id: userId,
    email: cleanEmail,
    username: cleanEmail,
    email_verified: true,
    display_name: name,
    password_hash: passwordHash,
    created_at: createdAt,
  };

  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    let { data, error } = await supabase.from('users').insert([newUser]).select().single();
    
    // Fallback if schema cache is missing email_verified or requires username variation
    if (error && (error.message.includes('email_verified') || error.message.includes('username'))) {
      const fallbackUser = {
        id: userId,
        email: cleanEmail,
        username: cleanEmail,
        display_name: name,
        password_hash: passwordHash,
      };
      const retryResult = await supabase.from('users').insert([fallbackUser]).select().single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Supabase createUser error:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    // Also initialize profile and entitlements
    await ensureUserEntitlementsAndProfile(data.id);
    return data as UserRecord;
  }

  // Dev store fallback
  const store = loadDevStore();
  store.users[userId] = newUser;
  saveDevStore(store);

  await ensureUserEntitlementsAndProfile(userId);
  return newUser;
}

/**
 * Replace a user's stored password hash.
 *
 * Used only to upgrade a legacy SHA-256 hash to scrypt after a successful sign-in
 * (S-7). Best-effort by design: if the write fails, the user is already
 * authenticated and must not be turned away over a background improvement — they
 * simply get upgraded on their next login instead.
 */
export async function updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
  try {
    if (isSupabaseAvailable()) {
      const supabase = getSupabaseClient();
      await supabase.from('users').update({ password_hash: passwordHash }).eq('id', userId);
      return;
    }
    const store = loadDevStore();
    if (store.users[userId]) {
      store.users[userId].password_hash = passwordHash;
      saveDevStore(store);
    }
  } catch (err) {
    console.error('Password hash upgrade failed (login still succeeded):', err);
  }
}

// ----------------------------------------------------
// Profiles & Entitlements Operations
// ----------------------------------------------------
export async function ensureUserEntitlementsAndProfile(
  userId: string
): Promise<{ profile: ProfileRecord; entitlements: EntitlementsRecord }> {
  const defaultProfile: ProfileRecord = {
    user_id: userId,
    roles: ['user'],
    avatar_url: null,
  };

  const defaultEntitlements: EntitlementsRecord = {
    user_id: userId,
    plan: 'free',
    credits_balance: 0,
    autonomy_runs_remaining: 10,
    renews_at: null,
  };

  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();

    // Check profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!profile) {
      const { data: newProf } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();
      profile = newProf || defaultProfile;
    }

    // Check entitlements
    let { data: entitlements } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!entitlements) {
      const { data: newEnt } = await supabase
        .from('entitlements')
        .insert([defaultEntitlements])
        .select()
        .single();
      entitlements = newEnt || defaultEntitlements;
    }

    return { profile: profile as ProfileRecord, entitlements: entitlements as EntitlementsRecord };
  }

  // Dev store fallback
  const store = loadDevStore();
  if (!store.profiles[userId]) {
    store.profiles[userId] = defaultProfile;
  }
  if (!store.entitlements[userId]) {
    store.entitlements[userId] = defaultEntitlements;
  }
  saveDevStore(store);

  return {
    profile: store.profiles[userId],
    entitlements: store.entitlements[userId],
  };
}

export async function getUserProfileAndEntitlements(userId: string): Promise<{
  profile: ProfileRecord;
  entitlements: EntitlementsRecord;
}> {
  return await ensureUserEntitlementsAndProfile(userId);
}

// ----------------------------------------------------
// Auth Codes Operations (Single-use ≤60s)
// ----------------------------------------------------
export async function createAuthCode(
  code: string,
  codeChallenge: string,
  userId: string,
  expiresAtInSeconds: number
): Promise<AuthCodeRecord> {
  const record: AuthCodeRecord = {
    code,
    code_challenge: codeChallenge,
    user_id: userId,
    expires_at: expiresAtInSeconds,
    used: false,
  };

  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('auth_codes').insert([record]);
    if (error) {
      console.error('Supabase createAuthCode error:', error);
    }
    return record;
  }

  const store = loadDevStore();
  store.auth_codes[code] = record;
  saveDevStore(store);
  return record;
}

export async function getAndConsumeAuthCode(code: string): Promise<AuthCodeRecord | null> {
  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { data: record, error } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error || !record) return null;

    // Immediately mark as used if not already used
    if (record.used) return null;

    await supabase.from('auth_codes').update({ used: true }).eq('code', code);
    return record as AuthCodeRecord;
  }

  const store = loadDevStore();
  const record = store.auth_codes[code];
  if (!record || record.used) return null;

  record.used = true;
  saveDevStore(store);
  return record;
}

// ----------------------------------------------------
// Refresh Tokens Operations (Rotation enabled)
// ----------------------------------------------------
export async function createRefreshToken(
  token: string,
  userId: string,
  expiresAtInSeconds: number
): Promise<RefreshTokenRecord> {
  const record: RefreshTokenRecord = {
    token,
    user_id: userId,
    expires_at: expiresAtInSeconds,
    revoked: false,
  };

  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('refresh_tokens').insert([record]);
    if (error) {
      console.error('Supabase createRefreshToken error:', error);
    }
    return record;
  }

  const store = loadDevStore();
  store.refresh_tokens[token] = record;
  saveDevStore(store);
  return record;
}

export async function rotateRefreshToken(
  oldToken: string,
  newToken: string,
  newExpiresAtInSeconds: number
): Promise<RefreshTokenRecord | null> {
  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { data: record, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', oldToken)
      .maybeSingle();

    if (error || !record || record.revoked) return null;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (record.expires_at < nowInSeconds) {
      return null; // Expired
    }

    // Revoke old token
    await supabase.from('refresh_tokens').update({ revoked: true }).eq('token', oldToken);

    // Insert new token
    return await createRefreshToken(newToken, record.user_id, newExpiresAtInSeconds);
  }

  const store = loadDevStore();
  const record = store.refresh_tokens[oldToken];
  if (!record || record.revoked) return null;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (record.expires_at < nowInSeconds) return null;

  record.revoked = true;
  saveDevStore(store);

  return await createRefreshToken(newToken, record.user_id, newExpiresAtInSeconds);
}

// ----------------------------------------------------
// Usage Events Operations
// ----------------------------------------------------
export async function saveUsageEvents(
  userId: string,
  events: UsageEventRecord[]
): Promise<number> {
  const recordsToInsert = events.map((e) => ({
    id: e.id || `evt_${crypto.randomUUID()}`,
    user_id: userId,
    type: e.type,
    runtime: e.runtime || 'cloud',
    provider: e.provider || null,
    model: e.model || null,
    units: e.units || 1,
    credits_cost: e.credits_cost || 0,
    project_id: e.project_id || null,
    meta: e.meta || null,
    ts: e.ts || Date.now(), // UNIX MILLISECONDS
  }));

  if (isSupabaseAvailable()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('usage_events')
      .upsert(recordsToInsert, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase saveUsageEvents error:', error);
      throw new Error(`Failed to save usage events: ${error.message}`);
    }
    return data?.length || recordsToInsert.length;
  }

  const store = loadDevStore();
  store.usage_events.push(...recordsToInsert);
  saveDevStore(store);
  return recordsToInsert.length;
}
