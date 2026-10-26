# Architecture

## Source findings

The imported project is React 19 / TypeScript on TanStack Start, with SSR and server entry code, Vite, Tailwind CSS v4, Supabase auth/client helpers, and Drizzle/PostgreSQL migration files. It is not a static-only Vite app. The generated Drizzle schema is intentionally empty; three SQL migration files are retained from Lovable for review, but they do not define a usable community schema. The original `.env` was excluded.

The raw source baseline is preserved as the first feature-branch migration commit (`cf4b02de575c29d8c71aed627b9026c57770c50f`). The current app removes Lovable preview authentication and Supabase server-role glue from the runtime. Those integrations depended on external credentials and would not provide a secure discussion service after migration. The current MVP does not use a database, account system, or fake browser persistence.

## Hosting choice

Keep TanStack Start SSR and use Cloudflare Workers with the official `@cloudflare/vite-plugin`; remove the Lovable Vite wrapper and Nitro adapter. Cloudflare's current TanStack Start guide documents the Cloudflare Vite plugin, the TanStack Start Vite plugin, React plugin, and a Wrangler entry using `@tanstack/react-start/server-entry`. That matches this project's real framework structure. See [Cloudflare's TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) and [TanStack Start hosting guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).

The project includes a preview-oriented `wrangler.jsonc`; this alone does not create or deploy a Cloudflare project. No production domain, secret, database binding, or deployment has been configured.

## Data service decision

Informational pages and editorial prompts can run without a database. Persistent discussions, user accounts, posting, comments, reports, and moderation are deferred. Before enabling them, design authorization and moderation first. A later Cloudflare Workers + D1 design is a reasonable no-extra-vendor option, but requires authenticated identity, server-side ownership checks, rate limits, spam controls, report handling, and explicit D1 bindings/migrations. D1 remains available on Workers Free for prototyping, with daily query limits; queries fail after a free daily limit is reached. See [D1 pricing/limits](https://developers.cloudflare.com/d1/platform/pricing/).

## Runtime boundaries

- The first event date and location are not set and must stay marked unconfirmed.
- `AI Topics` contains bilingual community-editorial prompts, not live news or user submissions.
- The discussion page truthfully states that persistent storage and posting are unavailable.
- The Tally survey is an external optional link; responses are not synced into this app.
- Environment variables are currently unnecessary; `.env.example` contains comments only.
