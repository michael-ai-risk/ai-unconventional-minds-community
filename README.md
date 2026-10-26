# AI非正常人类情报站社区网站

在清迈，一起聊AI、分享真实经历、认识有趣的人。

**AI Unconventional Minds Station** — Meet in Chiang Mai to talk AI, share real experiences, and meet curious people.

This repository contains the source migration and community website MVP. It is free and open to people curious about AI; no technical background or commercial goal is required.

## Local development

Use Node.js 22+ and npm. Create an ignored `.dev.vars` with local-only values for `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SITE_ORIGIN`. Add `ADMIN_BOOTSTRAP_SECRET` only when testing the first staff setup. Do not put production values in this file.

```sh
npm install
npm run build
npm run d1:migrate:preview
npm run preview
```

Google OAuth needs an OAuth client in Google Cloud Console and the callback `http://localhost:8787/api/auth/callback/google` registered for local development. The community UI reports when OAuth has not been configured.

The app uses React, TypeScript, TanStack Start, Cloudflare Workers, D1, and Better Auth. Reading is public; posting and replying require Google OAuth and publish immediately. Account ownership controls edits and deletion; there are no private edit keys or pre-publication approval queue. The local preview pins Wrangler persistence to the same D1 state directory used by `d1:migrate:preview`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md), and [docs/SOURCE_MIGRATION_AUDIT.md](docs/SOURCE_MIGRATION_AUDIT.md).

## Status

The first event is **AI非正常人类情报站｜第一期免费AI聚会**. Its date and venue are not confirmed. The discussion MVP stores posts, comments, and reports in D1. Google OAuth credentials must be configured in the selected Cloudflare Worker before contributors can sign in.

The event interest survey is hosted by Tally: https://tally.so/r/PRdaO5
