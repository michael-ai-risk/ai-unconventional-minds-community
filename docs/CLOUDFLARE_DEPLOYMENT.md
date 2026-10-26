# Cloudflare deployment

## Intended preview

- Repository: `michael-ai-risk/ai-unconventional-minds-community`
- Branch: `feat/community-migration-and-mvp`
- Worker config name: `ai-unconventional-minds-community-preview`
- Framework: TanStack Start SSR + Cloudflare Vite plugin
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (or repository script `npm run deploy`, which builds first)
- D1 binding: `DB`
- Secret name: `BETTER_AUTH_SECRET`
- Plain-text variable name: `SITE_ORIGIN` (exact preview origin)

Cloudflare's official setup guide for TanStack Start documents the Cloudflare Vite plugin and Worker server entry used here: [TanStack Start on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/). Workers Builds separates the build command from the deploy command and supports non-production branch previews: [Build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## First deployment failure (history retained)

User-provided record: Cloudflare Build `#1f3c5a03` connected to the GitHub repository but built `main`; its build command was `None`, deploy command `npx wrangler deploy`; setup, clone, and install passed; the Deploying stage failed. The complete log and actual failure line were not accessible in this execution because Wrangler has no Cloudflare API session and the Cloudflare dashboard browser session was not authenticated. Therefore the failure cause is **not established**. The incorrect branch and missing build step are configuration defects to correct, but are not presented as the proven deploy error.

## Preview deployment checklist

1. Set the Cloudflare Worker Builds build command to `npm run build` and deploy command to `npx wrangler deploy`.
2. Set non-production preview branch to `feat/community-migration-and-mvp`; do not merge `main` to trigger a test.
3. Create/reuse one D1 database for this preview, apply `migrations/` to the preview database, and replace the placeholder `database_id` in `wrangler.jsonc` with Cloudflare's real generated ID.
4. Add Worker secret `BETTER_AUTH_SECRET` with a newly generated random value; do not paste it into Git or a plain `vars` field.
5. Set `SITE_ORIGIN` to the exact preview origin. Better Auth uses it as `baseURL` and its trusted origin.
6. Trigger the feature-branch build, read the full build/deploy log, and capture the exact test URL.
7. Open the URL in a real browser, verify runtime logs, account creation, posts, comments, ownership checks, and mobile/desktop layout. Do not bind a production domain or announce a launch.

Do not apply the historical PostgreSQL files under `drizzle/migrations/` to D1. They belong to the original Supabase backend. Apply only the root `migrations/` directory.

## Current execution record

- Cloudflare project / Worker discovered: `BLOCKED`; dashboard session was not authenticated in this execution.
- Build #1 full logs read: `BLOCKED`; exact deployment failure remains unknown.
- Build command changed in Cloudflare dashboard: `BLOCKED`.
- D1 created remotely / remote migrations applied: `BLOCKED`.
- Worker secret configured / preview origin configured: `BLOCKED`.
- Branch preview URL / runtime browser verification: `NOT AVAILABLE` (no deployment).
- Local build and local D1 Worker checks: see `docs/ACCEPTANCE_REPORT.md`.
- Paid plans, production domain, main merge, or formal announcement: none performed.

## Costs and limits

No paid Cloudflare feature or paid dependency is used. D1 Free includes daily read/write and storage limits; queries can fail after the account reaches its included allowance. Check Cloudflare's [D1 FAQ](https://developers.cloudflare.com/d1/reference/faq/) and [pricing/limits](https://developers.cloudflare.com/d1/platform/pricing/) before deploying. This preview is not expected to require a paid plan, but quotas and account settings must be checked at deployment time.
