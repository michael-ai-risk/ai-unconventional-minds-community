# AI非正常人类情报站社区网站

在清迈，一起聊AI、分享真实经历、认识有趣的人。

**AI Unconventional Minds Station** — Meet in Chiang Mai to talk AI, share real experiences, and meet curious people.

This repository contains the source migration and community website MVP. It is free and open to people curious about AI; no technical background or commercial goal is required.

## Local development

Use Node.js 22+ and npm. After reviewing dependencies, create an ignored `.dev.vars` with a local random `BETTER_AUTH_SECRET`, then run:

```sh
npm install
printf 'BETTER_AUTH_SECRET=%s\n' "$(openssl rand -hex 32)" > .dev.vars
npm run build
npm run d1:migrate:preview
npm run preview
```

The app uses React, TypeScript, TanStack Start, Cloudflare Workers, D1, and Better Auth. For local network-isolated agent environments where Wrangler cannot enumerate interfaces, use the documented `NODE_OPTIONS` fallback in the acceptance report; never put a production secret in `.dev.vars` or Git. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md), and [docs/SOURCE_MIGRATION_AUDIT.md](docs/SOURCE_MIGRATION_AUDIT.md).

## Status

The first event is **AI非正常人类情报站｜第一期免费AI聚会**. Its date and venue are not confirmed. The discussion MVP provides persistent registration, posts, comments, reports, and moderator/admin APIs on D1. Browser-based UI acceptance and Cloudflare preview deployment remain blocked and must be completed before release.

The event interest survey is hosted by Tally: https://tally.so/r/PRdaO5
