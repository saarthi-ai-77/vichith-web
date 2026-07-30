# Deployment & Secrets

**Status: Canonical.** How the AI Runtime gets its provider keys, and why it is done this way.

---

## 1. Where the keys go

**Vercel → the `vichith-web` project → Settings → Environment Variables.**

Nowhere else. Not in the desktop app, not in the repo, not in a config file that ships.

| Variable | Purpose | Scope |
|---|---|---|
| `GEMINI_API_KEY` | Reasoning, planning, multimodal | Production + Preview |
| `SARVAM_API_KEY` | Speech, translation, Indic | Production + Preview |
| `JWT_SECRET` | Signs desktop session tokens | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access | Production + Preview |
| `ADMIN_PASSCODE` | `/admin` console | Production |

For local development, copy `.env.example` → `.env.local`. That file is gitignored and
must stay that way.

### The one naming rule that matters

**Never prefix a provider key with `NEXT_PUBLIC_`.** Next.js inlines every
`NEXT_PUBLIC_*` variable into the browser bundle at build time. A key named
`NEXT_PUBLIC_GEMINI_API_KEY` would be readable by anyone who opens devtools on the
site — and would keep working after you rotated it everywhere you *thought* it was.

`GEMINI_API_KEY` and `SARVAM_API_KEY` are read only by `requireEnv()` inside the
adapters, which run server-side. They are never sent to a client.

### Verify `JWT_SECRET` is actually set

This one is easy to miss and consequential. It used to fall back to a literal
committed in this repository; that fallback is removed, so a deployment missing it
now fails closed instead of accepting forged tokens. Confirm it is present in
Production before launch.

---

## 2. How a user's request reaches a provider

```
Desktop
  │  Authorization: Bearer <user session token>
  │  POST /api/ai  { capability, payload, mediaApproved }
  ▼
vichith-web  (Vercel)
  │  1. verify the session          → 401 if invalid
  │  2. load entitlements           → 403 if the plan does not allow it
  │  3. media-upload gate           → 403 if the route sends media unapproved
  │  4. route capability → provider
  │  5. attach OUR provider key     ← the key only exists at this step
  ▼
Gemini / Sarvam
  │
  ◄── response → validated → metered → returned WITHOUT provider identity
```

The properties this buys, and the reason the desktop is not allowed to call a
provider directly:

- **The key never leaves our infrastructure.** A desktop binary can be unpacked; a
  server environment variable cannot.
- **Every request is attributable.** Usage is recorded against the *verified* user id,
  never a value the client supplied, so a modified desktop build cannot spoof metering.
- **Keys rotate without shipping an app update.** Change the Vercel variable, redeploy.
- **A provider can be swapped without a desktop release**, because the desktop only
  ever named a capability.

---

## 3. Before real users: per-user rate limiting is required

⚠ **This is not built yet, and it is the one gap that matters for launch.**

`/api/ai` currently checks *entitlements* (is this user on a plan that may use AI) but
does **not** limit request rate or volume per user. With our own provider keys behind
the endpoint, a single account — scripted, buggy, or hostile — can consume the entire
Sarvam credit balance or run up the Gemini bill.

That was a reasonable deferral while nothing was live. The moment real users arrive it
stops being reasonable, because the cost lands on us rather than on them.

**Minimum before opening to users:**

1. **Per-user request rate limit** (e.g. N requests/minute, M/day by plan).
2. **A hard monthly ceiling per plan**, enforced server-side from the usage table that
   `/api/ai` already writes.
3. **A cost alarm** on the Sarvam and Gemini dashboards — the backstop for anything
   the application-level limits miss.

The other deferred scaling machinery (queue, health-based routing, cost-based routing,
deduplication) genuinely can wait. This one cannot.

---

## 4. Rotation

If a key is ever exposed:

1. Revoke it in the provider console **first** — before updating anything here.
2. Issue a new key, set it in Vercel, redeploy.
3. No desktop release is needed. That is the point of the architecture.
