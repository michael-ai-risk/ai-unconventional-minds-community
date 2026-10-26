# Architecture

## Application

- React 19 + TypeScript + TanStack Start with server rendering.
- Vite builds the client and Worker server bundles using `@cloudflare/vite-plugin`.
- Cloudflare Workers hosts the app and API; D1 stores community content.
- Better Auth remains only for staff sign-in and the one-time first-admin bootstrap. Public signup routes are blocked. No visitor account/session is required for community reads or writes.
- `wrangler.jsonc` binds D1 as `DB`. `BETTER_AUTH_SECRET` signs staff sessions; `TURNSTILE_SECRET_KEY` verifies challenges; `ADMIN_BOOTSTRAP_SECRET` is temporary and should be removed after first-admin creation; `SITE_ORIGIN` must match the exact deployed origin.

## Migration boundary

The initial text baseline is preserved at `cf4b02de575c29d8c71aed627b9026c57770c50f`. The Lovable Drizzle schema was empty, while its SQL migrations describe Supabase/PostgreSQL tables and RLS. Those files remain in `drizzle/migrations/` as audit history; they are not compatible D1 migrations and are never applied by Wrangler. The D1 schema is defined separately in the root `migrations/` directory.

No `.env` values were migrated. The historical Lovable/Supabase integrations remain available in Git history, not the runtime.

## D1 data and access

`0001` creates Better Auth-compatible staff tables, roles, legacy profiles, categories, posts, comments, events, articles, event interests, reports, and application rate-limit state. `0002` adds Better Auth's database-backed staff-session rate-limit table; `0003` adds the legacy per-user event-interest uniqueness rule. `0004_guest_posting.sql` adds public author labels, per-post/comment edit-key hashes, report fingerprints, and a one-time admin-bootstrap lock. Existing account rows remain for migration history; no visitor signup is enabled.

Public APIs return only published events/articles and visible posts/comments. Post/comment creation does not require a session. The server verifies Turnstile with Cloudflare Siteverify, checks same-origin requests, streams and caps request bodies, enforces field lengths, and rate-limits by action using an HMAC digest of the Cloudflare source address (raw IP is not stored). The default ceilings are 12 posts/minute, 60 comments/minute, 20 reports/minute, and 30 post edits/minute per source/action; these are intentionally higher than one-person limits to reduce shared-network false positives. They still share a source bucket and need operational tuning before a public launch.

New visitor posts/comments use `status='pending'`. The edit key is 256 random bits, returned once to the author; only its SHA-256 digest is stored in D1. The frontend saves the key in that browser's localStorage for convenience and offers a copy control. It is never returned by read APIs. Management routes require the key or a verified staff session; a random visitor cannot edit another contribution. Losing a key requires a deletion request in the Privacy page, which goes to the staff report queue.

Reports accept anonymous requests, use a keyed report fingerprint to deduplicate from the same source, and enter the staff queue. Moderators/admins can approve, hide, or delete posts/comments and process reports. Admin role is required for event/article editing. Staff sessions are Better Auth sessions and are checked server-side on every management request. Email/password sign-in is restricted server-side to existing staff role rows; all public signup is disabled.

The service user row `community-guest` is a foreign-key compatibility sentinel with an invalid placeholder email, no password, and no session. It is not a visitor/member account, and is never returned as a visitor identity. Visitors' names are stored only when voluntarily submitted; otherwise the public label is `Guest` / `访客`.

## Staff bootstrap

Set a long random `ADMIN_BOOTSTRAP_SECRET` as a Worker secret only during initial staff setup. Submit the intended staff email, password, and name to `POST /api/admin/bootstrap` over HTTPS with `X-Admin-Bootstrap-Key`. The endpoint refuses a second admin, atomically claims the bootstrap lock, creates the staff credential through Better Auth, and assigns the admin role. Remove `ADMIN_BOOTSTRAP_SECRET` after the first successful setup. Do not expose the secret in frontend variables, repository files, logs, or browser URLs. Staff email/password are used only for the admin identity, not community participation.

## Cloudflare configuration and free-tier constraints

Worker builds use `npm run build`, then Wrangler deploys the SSR Worker. A D1 database must exist and its Cloudflare-generated ID must replace the placeholder in `wrangler.jsonc` before deployment. `VITE_TURNSTILE_SITE_KEY` is public build-time config; `TURNSTILE_SECRET_KEY`, `BETTER_AUTH_SECRET`, and the temporary bootstrap secret are Worker secrets. For local Worker development, put secrets in ignored `.dev.vars` and the public site key in an ignored `.env.local`.

No paid service or dependency was added. D1 and Turnstile have free plans/quotas whose current limits and account eligibility must be checked in Cloudflare before deployment. If Turnstile is not configured, anonymous post/comment writes fail closed. The app does not claim production anti-abuse readiness based on local tests alone.

## Known limits

- The Cloudflare account's real D1 ID, Turnstile keys, `SITE_ORIGIN`, and preview URL are not available in this workspace; the checked-in all-zero D1 ID remains a deployment blocker and must not be treated as a real resource.
- Actual Cloudflare deployment and live runtime verification remain pending.
- Browser visual checks at mobile and desktop widths must be completed on a deployed preview; local build/API checks do not replace them.
- Original collage/favicon bytes could not be safely downloaded from the Lovable connector. The repository has clearly identified, locally authored SVG replacements.
