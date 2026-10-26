# Architecture

## Application

- React 19 + TypeScript + TanStack Start with server rendering.
- Vite builds the client and Worker server bundles using `@cloudflare/vite-plugin`.
- Cloudflare Workers hosts the app and API; D1 stores community content.
- Better Auth handles staff sign-in and Google OAuth for community contributors. Reading remains public; creating posts/replies requires a Google-linked session. Email/password sign-in remains restricted to existing staff.
- `wrangler.jsonc` binds D1 as `DB`. `BETTER_AUTH_SECRET` signs sessions; `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` configure Google OAuth; `ADMIN_BOOTSTRAP_SECRET` is temporary and should be removed after first-admin creation; `SITE_ORIGIN` must match the exact deployed origin.

## Migration boundary

The initial text baseline is preserved at `cf4b02de575c29d8c71aed627b9026c57770c50f`. The Lovable Drizzle schema was empty, while its SQL migrations describe Supabase/PostgreSQL tables and RLS. Those files remain in `drizzle/migrations/` as audit history; they are not compatible D1 migrations and are never applied by Wrangler. The D1 schema is defined separately in the root `migrations/` directory.

No `.env` values were migrated. The historical Lovable/Supabase integrations remain available in Git history, not the runtime.

## D1 data and access

`0001` creates Better Auth-compatible tables, roles, legacy profiles, categories, posts, comments, events, articles, event interests, reports, and legacy rate-limit state. `0002` adds Better Auth's database-backed staff-session rate-limit table; `0003` adds the legacy per-user event-interest uniqueness rule. `0004_guest_posting.sql` records the previous anonymous posting design and admin-bootstrap lock. `0005_google_posting.sql` hides historical pending content during the move to direct publication.

Public APIs return only published events/articles and visible posts/comments. Creating posts and replies requires a signed-in session linked to Google; the server checks the Better Auth session and the Google provider account. New posts and replies are immediately visible. Requests remain same-origin checked, body-size capped, and field validated. The community API does not use Turnstile or application rate limits, by user direction.

Posts/comments store the authenticated user ID and an optional public nickname. No private edit key is generated or shown; owners edit/delete by signing in with the same Google-linked account. Migration `0005_google_posting.sql` moves any existing pending posts/comments to hidden so removing the pre-publication queue does not publish old content automatically.

Reports accept anonymous requests and enter the staff queue. Staff can hide reported posts/comments after publication and resolve reports; there is no pending approval queue. Admin role is required for event/article editing. Staff sessions are Better Auth sessions and are checked server-side on every management request. Email/password sign-in is restricted server-side to existing staff role rows; public email/password signup is disabled.

The legacy service user row `community-guest` remains only for historical anonymous reports and foreign-key compatibility. It is not used for new posts/replies or returned as a visitor identity. New community content is linked to a Google-authenticated user ID; the public name is an optional nickname or a generic member label.

## Staff bootstrap

Set a long random `ADMIN_BOOTSTRAP_SECRET` as a Worker secret only during initial staff setup. Submit the intended staff email, password, and name to `POST /api/admin/bootstrap` over HTTPS with `X-Admin-Bootstrap-Key`. The endpoint refuses a second admin, atomically claims the bootstrap lock, creates the staff credential through Better Auth, and assigns the admin role. Remove `ADMIN_BOOTSTRAP_SECRET` after the first successful setup. Do not expose the secret in frontend variables, repository files, logs, or browser URLs. Staff email/password are used only for the admin identity, not community participation.

## Cloudflare configuration and free-tier constraints

Worker builds use `npm run build`, then Wrangler deploys the SSR Worker. A D1 database must exist and its Cloudflare-generated ID must replace the placeholder in the selected Wrangler config before deployment. Configure `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and (temporarily for first-admin setup) `ADMIN_BOOTSTRAP_SECRET` as Worker secrets. For local Worker development, put secrets in ignored `.dev.vars`.

No paid service or dependency was added. D1 has free-plan quotas whose current limits and account eligibility must be checked in Cloudflare before deployment. Google OAuth requires a configured Google Cloud OAuth client and a matching Worker callback URI. The community API does not apply request rate limits, by user direction.

## Known limits

- The Google OAuth client ID and secret are not available in this workspace; real Google sign-in cannot be enabled or accepted until they are configured in Cloudflare and the matching redirect URI is registered in Google Cloud.
- The Google-login redesign is implemented in the Draft branch but is not deployed until the OAuth client is configured in Cloudflare.
- Browser visual checks at mobile and desktop widths must be completed on a deployed preview; local build/API checks do not replace them.
- Original collage/favicon bytes could not be safely downloaded from the Lovable connector. The repository has clearly identified, locally authored SVG replacements.
