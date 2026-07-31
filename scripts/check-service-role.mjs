#!/usr/bin/env node
/**
 * Regression guard for S-9.
 *
 * The defect was not a typo — it was a pattern that reads as prudent:
 *
 *     const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
 *                      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 *
 * It looks like a graceful fallback. It is actually a silent downgrade of every
 * server route to the public key, and it appeared to work only because RLS was
 * granting the anon role full access. It was copied into five route files, which
 * is exactly how a pattern that reads as prudent spreads.
 *
 * This is a grep, not a unit test, and deliberately so: the thing to prevent is
 * the SHAPE of the code returning, in a file that does not exist yet. A test can
 * only assert about modules it imports.
 *
 * The one legitimate use of the anon key is /api/config, which serves it to the
 * desktop on purpose. That file is allow-listed by name so the exception stays
 * visible instead of being carved out by a looser pattern.
 *
 * Run: node scripts/check-service-role.mjs   (exit 1 on violation)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');

/** Files permitted to mention the anon key, with the reason they are permitted. */
const ALLOWED = new Map([
    ['src/app/api/config/route.ts', 'serves the anon key to the desktop by design'],
    // sign-in and sign-up ARE anon-key operations. Using the service role would
    // bypass the rate limiting and lockout GoTrue applies to auth attempts, which
    // is the opposite of a security improvement.
    ['src/lib/auth/supabaseIdentity.ts', 'GoTrue sign-in/sign-up must use the anon key'],
]);

const ANON = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (entry === '__tests__') continue;
            out.push(...walk(full));
        }
        // Tests may set or clear the anon key to exercise the module that legitimately
        // uses it. They do not ship, so a mention there cannot become the production
        // fallback this guard exists to prevent. Narrowed rather than allow-listed
        // per file, so adding a test never requires editing the guard.
        else if (/\.(ts|tsx|js|mjs)$/.test(entry) && !/\.test\.(ts|tsx|js|mjs)$/.test(entry)) {
            out.push(full);
        }
    }
    return out;
}

const violations = [];
for (const file of walk(SRC)) {
    const rel = relative(ROOT, file).split(sep).join('/');
    if (ALLOWED.has(rel)) continue;

    const text = readFileSync(file, 'utf8');
    text.split('\n').forEach((line, i) => {
        if (line.includes(ANON)) violations.push({ rel, line: i + 1, text: line.trim() });
    });
}

if (violations.length > 0) {
    console.error('\nS-9 regression: the anon key is referenced in server code.\n');
    for (const v of violations) console.error(`  ${v.rel}:${v.line}\n    ${v.text}\n`);
    console.error('Server routes must use SUPABASE_SERVICE_ROLE_KEY and fail closed without it.');
    console.error('The anon role can read nothing after 004_rls_lockdown.sql, so a fallback to it');
    console.error('is not degraded service — it is an outage with a misleading cause.\n');
    process.exit(1);
}

console.log(`S-9 guard: clean (${ALLOWED.size} documented exceptions).`);
