import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getSupabaseClient, logActivity, autoSeed } from '@/lib/supabase';
import { hashPasswordSecure, verifyPassword } from '@/lib/auth/password';

// Helper to get user profile and permissions by session token
async function getUserByToken(token: string) {
  const supabase = getSupabaseClient();

  // 1. Fetch active session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (sessionError || !session) return null;

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await supabase.from('sessions').delete().eq('token', token);
    return null;
  }

  // 2. Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username, display_name, role_id, email, avatar_url, department, notes, is_active')
    .eq('id', session.user_id)
    .single();

  if (userError || !user || !user.is_active) return null;

  // 3. Fetch role and permissions
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
    ...user,
    role_name: roleName,
    permissions,
  };
}

export async function GET() {
  try {
    const sessionCookie = cookies().get('vichith_session');
    const token = sessionCookie?.value;

    if (!token) {
      return NextResponse.json({ error: 'No active session found.' }, { status: 401 });
    }

    // Auto-seed in the background to ensure baseline tables are initialized
    await autoSeed();

    const user = await getUserByToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Session has expired or is invalid.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Ensure default schema setup and seeding is run
    await autoSeed();

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. Fetch by username, then verify the password in code.
    //
    // This used to match `.eq('password_hash', sha256(password))` — a lookup that
    // only works because an unsalted hash is deterministic. That property is
    // exactly what makes the hashing weak (S-7), so a salted hash cannot be
    // compared in SQL at all: every hash of the same password is different by
    // design. Fetching the row and verifying is the only shape that works, and it
    // is also the shape that lets a legacy hash be upgraded on the way through.
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, is_active, role_id, password_hash')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const { ok, needsUpgrade } = await verifyPassword(password, user.password_hash);
    if (!ok) {
      // Same message and same status as an unknown username, so the response does
      // not distinguish "no such user" from "wrong password".
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    if (needsUpgrade) {
      await supabase
        .from('users')
        .update({ password_hash: await hashPasswordSecure(password) })
        .eq('id', user.id);
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Your account has been deactivated.' }, { status: 403 });
    }

    // 2. Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const { error: sessionError } = await supabase.from('sessions').insert([
      {
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (sessionError) {
      return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 });
    }

    // 3. Log login activity
    await logActivity(user.id, 'LOGIN', `User logged in from browser session.`);

    // 4. Fetch role permissions
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

    // 5. Set HttpOnly Cookie
    cookies().set('vichith_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const userProfile = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role_name: roleName,
      permissions,
    };

    return NextResponse.json({ success: true, user: userProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
