# AI非正常人类情报站社区网站

在清迈，一起聊AI、分享真实经历、认识有趣的人。

**AI Unconventional Minds Station** — Meet in Chiang Mai to talk AI, share real experiences, and meet curious people.

This repository contains the source migration and community website MVP. It is free and open to people curious about AI; no technical background or commercial goal is required.

## Local development

Use Node.js 22+ and npm. Create an ignored `.dev.vars` with local-only values for `BETTER_AUTH_SECRET`, `SITE_ORIGIN`, `TURNSTILE_SECRET_KEY`, and (only when testing the first staff setup) `ADMIN_BOOTSTRAP_SECRET`. Do not put production values in this file. Then run:

Create an ignored `.env.local` with the matching public `VITE_TURNSTILE_SITE_KEY`. Cloudflare's public test site key/secret pair is suitable only for local testing; a real preview needs a matching Turnstile widget configuration.

```sh
npm install
npm run build
npm run d1:migrate:preview
npm run preview
```

For an isolated local D1 integration run, add `ADMIN_BOOTSTRAP_SECRET` to `.dev.vars` and run `scripts/local-community-smoke.sh`. It creates a temporary D1 store and never touches a remote database. The smoke run uses Cloudflare's official Turnstile test token; it will stop at the real Siteverify call if the local runtime cannot reach Cloudflare.

The app uses React, TypeScript, TanStack Start, Cloudflare Workers, D1, and Better Auth for staff only. Public visitors do not register or log in. Posts and comments require Turnstile, enter moderation as pending, and receive a private edit key shown once; only its hash is stored in D1. The local preview pins Wrangler persistence to the same D1 state directory used by `d1:migrate:preview`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md), and [docs/SOURCE_MIGRATION_AUDIT.md](docs/SOURCE_MIGRATION_AUDIT.md).

## Status

The first event is **AI非正常人类情报站｜第一期免费AI聚会**. Its date and venue are not confirmed. The discussion MVP stores posts, comments, reports, and moderation state in D1. Cloudflare preview deployment and browser-based UI acceptance remain outstanding; see the acceptance report for the latest verified state.

The event interest survey is hosted by Tally: https://tally.so/r/PRdaO5
