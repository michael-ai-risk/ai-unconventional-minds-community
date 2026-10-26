# Architecture

## Application

- React 19 + TypeScript + TanStack Start with server rendering.
- Vite builds both client and Worker server bundles using `@cloudflare/vite-plugin`.
- Cloudflare Workers hosts the app and API; Cloudflare D1 stores accounts and community content.
- Better Auth handles email/password registration, login, sessions, password hashing, and database-backed auth rate limiting. Passwords are never implemented or stored by application code.
- `wrangler.jsonc` binds D1 as `DB`. `BETTER_AUTH_SECRET` is a Cloudflare Worker secret; `SITE_ORIGIN` must match the exact active origin.

## Migration boundary

The initial text baseline is preserved at `cf4b02de575c29d8c71aed627b9026c57770c50f`. The Lovable Drizzle schema was empty, while its SQL migrations describe Supabase/PostgreSQL tables and RLS. Those files remain in `drizzle/migrations/` as audit history; they are not compatible D1 migrations and are never applied by Wrangler. The D1 schema is defined separately in `migrations/`.

No `.env` values were migrated. The historical Lovable/Supabase integrations remain available in Git history, not the runtime.

## D1 data and access

`migrations/0001_community.sql` creates Better Auth core tables and community members/profiles, roles, categories, posts, comments, events, articles, event interests, reports, and application rate-limit state. `0002` adds Better Auth's optional database rate-limit table; `0003` prevents duplicate per-member event interest.

Public handlers return only published events/articles and visible posts/comments. Profile email is never joined into public responses. Profiles may hide their nickname. All create/update/delete operations require a Better Auth session, same-origin request, input size/length validation, per-user limits, and server-side ownership or staff role checks. Staff roles have no public claim endpoint; an administrator is assigned through a trusted D1 operation. Content management requires `admin`; report review and hiding content requires `moderator` or `admin`.

The `admin` route provides report review and event/article create/edit forms. It is inaccessible to ordinary members. The application ships no fake member profiles or discussion content. The one seed event is a real user-approved placeholder and explicitly leaves date and venue unconfirmed.

## Cloudflare configuration and free-tier constraints

Worker builds use `npm run build`, then Wrangler deploys the SSR Worker. A D1 database must exist and its Cloudflare-generated ID must replace the placeholder in `wrangler.jsonc` before deployment. The local smoke setup uses `dist/server/wrangler.json`, because Wrangler resolves local D1 state relative to that generated config; run `npm run build` before `npm run d1:migrate:preview`.

No paid service, add-on, image hosting, or external database is configured. Cloudflare D1 Free has daily read/write and storage limits; requests can fail if usage exceeds the included limits. Confirm current limits and account conditions in Cloudflare's [D1 FAQ](https://developers.cloudflare.com/d1/reference/faq/) and [pricing page](https://developers.cloudflare.com/d1/platform/pricing/) before a public preview. Better Auth and other dependencies are open-source npm packages; there are no new paid dependencies.

## Known limits

- Cloudflare API/dashboard authentication is not available in this execution, so the failed Build #1 log, account build settings, D1 creation, secrets, preview deployment, and test URL are not yet verified.
- Actual browser checks are blocked by the current browser URL security policy for local test origins. Shell-level Worker/API checks pass, but they do not replace real mobile/desktop browser QA.
- The original collage/favicon bytes could not be safely downloaded from the Lovable connector. The repository includes explicitly labeled, community-made vector replacements.
- Email verification and outbound email delivery are not configured. Signup accepts an email address but does not prove mailbox ownership; this is a preview limitation to address before wider release.
