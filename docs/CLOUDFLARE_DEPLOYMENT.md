# Cloudflare deployment

## Intended preview

- Repository: `michael-ai-risk/ai-unconventional-minds-community`
- Branch: `feat/community-migration-and-mvp`
- Worker config name: `community-pr2-preview`
- Preview URL: `https://community-pr2-preview.xiening668.workers.dev`
- Framework: TanStack Start SSR + Cloudflare Vite plugin
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (or repository script `npm run deploy`, which builds first)
- D1 binding: `DB` → `ai-unconventional-minds-community-preview` (`2a4ef7bf-09d2-4d91-997e-abfb3e86cb60`)
- Worker secrets: `BETTER_AUTH_SECRET`, `RESEND_API_KEY`; set `ADMIN_BOOTSTRAP_SECRET` only for initial staff setup, then remove it
- Worker variable: `EMAIL_FROM` using a sender address verified with Resend
- Plain-text variable name: `SITE_ORIGIN` (exact preview origin)

Cloudflare's official setup guide for TanStack Start documents the Cloudflare Vite plugin and Worker server entry used here: [TanStack Start on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/). Workers Builds separates the build command from the deploy command and supports non-production branch previews: [Build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## First deployment failure (history retained)

User-provided record: Cloudflare Build `#1f3c5a03` connected to the GitHub repository but built `main`; its build command was `None`, deploy command `npx wrangler deploy`; setup, clone, and install passed; the Deploying stage failed. The complete log and actual failure line were not accessible in this execution because Wrangler has no Cloudflare API session and the Cloudflare dashboard browser session was not authenticated. Therefore the failure cause is **not established**. The incorrect branch and missing build step are configuration defects to correct, but are not presented as the proven deploy error.

## Preview deployment checklist

1. Set the Cloudflare Worker Builds build command to `npm run build` and deploy command to `npx wrangler deploy`.
2. Set non-production preview branch to `feat/community-migration-and-mvp`; do not merge `main` to trigger a test.
3. Use the dedicated Preview D1 binding in `wrangler.community-preview.jsonc`; apply `migrations/` only to that preview database.
4. Add Preview Worker secrets `BETTER_AUTH_SECRET` and `RESEND_API_KEY`; never commit them to Git. Set Preview Worker variable `EMAIL_FROM` to an address verified in the Resend account. Production values are separate and are not part of this setup.
5. Set `SITE_ORIGIN` to the exact HTTPS preview origin. Better Auth uses it as its trusted origin and base URL.
6. For first staff setup only, configure a random `ADMIN_BOOTSTRAP_SECRET`, call the one-time bootstrap endpoint over HTTPS, then remove that secret. The admin credential is not a visitor account.
7. Trigger the feature-branch build, read the full build/deploy log, and capture the exact test URL.
8. Open the URL in a real browser and verify email delivery, OTP sign-in, authenticated posting/replies, account ownership checks, report/hide handling, and mobile/desktop layout. Posts and replies publish immediately; there is no pre-publication review. Do not bind a production domain or announce a launch.

Do not apply the historical PostgreSQL files under `drizzle/migrations/` to D1. They belong to the original Supabase backend. Apply only the root `migrations/` directory.

## Historical setup record (before the current preview Worker)

- Cloudflare project / Worker discovered: `BLOCKED`; dashboard session was not authenticated in this execution.
- Build #1 full logs read: `BLOCKED`; exact deployment failure remains unknown.
- Build command changed in Cloudflare dashboard: `BLOCKED`.
- D1 created remotely / remote migrations applied: `BLOCKED`.
- Worker secret configured / preview origin configured: `BLOCKED`.
- Branch preview URL / runtime browser verification: `NOT AVAILABLE` (no deployment).
- Local build and local D1 Worker checks: see `docs/ACCEPTANCE_REPORT.md`.
- Paid plans, production domain, main merge, or formal announcement: none performed.

## Previous Google sign-in setup (historical, superseded)

- The prior iteration proposed Google OAuth. The current feature branch disables social sign-in and uses email OTP through Resend.
- Do not follow the historical callback-registration instructions above; they do not apply to the current branch.
- OTP uses Better Auth's existing `verification` and `rateLimit` tables from D1 migrations `0001` and `0002`; it does not add a database migration.

## Costs and limits

No paid Cloudflare feature or paid dependency is used. D1 Free includes daily read/write and storage limits; queries can fail after the account reaches its included allowance. Check Cloudflare's [D1 FAQ](https://developers.cloudflare.com/d1/reference/faq/) and [pricing/limits](https://developers.cloudflare.com/d1/platform/pricing/) before deploying. This preview is not expected to require a paid plan, but quotas and account settings must be checked at deployment time.
