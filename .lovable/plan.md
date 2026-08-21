# Session recording + admin dashboard

Adds silent observational logging of every Trailhead run, plus a private dashboard where you can read back sessions.

Trailhead currently has no backend at all (no database, no accounts), so the first step is turning on Lovable Cloud — that gives the database, logins, and server-side code this needs.

## What gets built

**Silent session recording.** Every visitor gets a stable anonymous client ID stored in their browser, and each run through the flow creates a session row. From then on, every interaction — button taps, text entered, screen state changes, AI classification results, rating and weight submissions, and the dealbreaker/gut-check answer — is appended to that session. Logging is fire-and-forget: if it fails, the participant never sees an error and the flow never blocks.

**Admin dashboard** at `/admin-dashboard`, titled "Test Sessions", behind login. Lists the 500 most recent sessions with search, an expandable transcript per session, and CSV export.

**Accounts.** Public `/auth` page with sign-in, sign-up, and forgot-password; public `/reset-password` page to set a new password. The first person to sign up can claim admin (one time only — once an admin exists, nobody else can claim it). Everything under the dashboard is gated by login plus an admin role check on the server, so a signed-in non-admin still gets nothing.

## Data model

`sessions` — one row per run:
`id`, `client_id`, `access_token`, `started_at`, `updated_at`, `completed`, `abandoned_at`, `app_version`, `user_agent`, `reflection`, plus JSON columns `selections`, `transcript`, `events`, `decision_text`, `classification`, `category_edits`, `ratings`, `weights`, `gut_check`, `durations`.

Access: service_role only. RLS on, with a deny-all policy for anon/authenticated — browsers can never read or write the table directly; all access goes through server code.

`app_role` enum (`admin`, `user`) and `user_roles` table (user_id + role, unique together), RLS on, users can read their own roles, service_role full access. A `has_role(_user_id, _role)` security-definer function backs every admin check.

## Technical notes

- `src/lib/sessions.functions.ts`: `startSession`, `logEvent`, `finalizeSession`, `listSessions`. The first three are unauthenticated but require the row's `access_token` to match — a session can only be written by the browser that created it. `listSessions` uses `requireSupabaseAuth` + `has_role(userId, 'admin')`, throwing Forbidden otherwise. The admin client is imported inside each handler, never at module scope.
- `logEvent` appends a timestamped entry to `transcript`/`events` and shallow-merges the supplied patch into only the JSON columns it names.
- `src/lib/admin.functions.ts`: `claimFirstAdmin()` — grants admin to the caller only when no admin row exists.
- `src/lib/session-logger.ts`: `trailhead_client_id` UUID in localStorage; session id + access token in sessionStorage; `logButton` / `logText` / `logState` / `logAI` helpers, all non-blocking and error-swallowing.
- Routes: public `/auth` and `/reset-password`; integration-managed `_authenticated` gate; `/_authenticated/admin-dashboard`. Existing `src/routes/index.tsx` stays the public home, so no route conflict.
- Instrumentation is added to Input, Confirm, Rating, Weighting, Dealbreaker, and Report screens; `extractConcerns` results are logged via `logAI`. No changes to scoring or flow behaviour.
- All new user-facing copy goes into `src/i18n/en.json` (dashboard/admin copy stays English-only).
- Frontend changes only reach the public URL after publishing.

## Forget me

A persistent footer on every screen (added to the shared shell, alongside the existing header) reads: "Trailhead keeps a private record of this session to help improve the app. Forget me" — with "Forget me" as an inline link.

Tapping it calls a new unauthenticated `forgetMe(clientId)` server function that deletes every `sessions` row for that client ID via the admin client (imported inside the handler). The client ID from localStorage is the only credential — same trust model as the access token on the other write functions. It always reports success whether or not rows matched, so nothing leaks about whether that ID had recorded sessions.

The browser then clears `trailhead_client_id` from localStorage and the session id/access token from sessionStorage, and mints a fresh client ID immediately, so the app keeps working — the participant simply continues under a new, unlinked anonymous identity. A brief toast confirms it; no reload. All copy goes into `src/i18n/en.json`.

## Rate limiting

`startSession`, `logEvent`, and `finalizeSession` each cap a client ID at 60 calls per rolling 5-minute window. The count is derived from the existing `sessions` table: rows created and timestamped entries already appended to `events` for that client ID inside the window are summed before the write happens. No new table unless that read turns out to be awkward in practice, in which case a small dedicated counter table is added instead.

Over the cap, the function throws a rate-limit error. The client logger already swallows errors silently, so a real participant never sees anything; a script hammering the endpoint just stops being recorded.

## Shared-secret admin claim

`claimFirstAdmin(secret)` requires a passcode in addition to the no-admin-exists check. The real value lives as a Lovable Cloud secret, `ADMIN_CLAIM_SECRET` — I'll open a secure form for you to set it, since you need to know the value to type it in. It is never hardcoded and never sent to the browser; only the typed attempt travels to the server.

Admin is granted only when no admin row exists **and** the secret matches exactly. Any failure throws the same Forbidden error, with no distinction between "wrong secret" and "already claimed". Once an admin exists the path is permanently inert.

The claim UI is not on the public `/auth` page. It lives on a small authenticated page (`/_authenticated/claim-admin`), reachable only when signed in, that renders the passcode field only while the caller has no admin role; otherwise it just says the claim window is closed.

## After you have your account

Sign up once, claim admin with the passcode, then tell me and I'll close sign-up so the dashboard can't be claimed or crowded by a stranger.

