# Cloudflare deployment

## Target

Use a Cloudflare Worker for a private-by-default development preview, because this repository uses TanStack Start SSR and server entry code. Cloudflare's official guide currently supports TanStack Start on Workers with `@cloudflare/vite-plugin`; it specifically says to remove a competing adapter such as Nitro before adding the Cloudflare plugin. The repo uses that setup and `@tanstack/react-start/server-entry` in `wrangler.jsonc`.

Official setup reference: [TanStack Start on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/), last checked 2026-10-26.

## Current recorded configuration

- Worker name in repository config: `ai-unconventional-minds-community-preview`
- GitHub repository: `michael-ai-risk/ai-unconventional-minds-community`
- Preview branch: `feat/community-migration-and-mvp`
- Build: `npm run build` (`vite build` then TypeScript check)
- Wrangler entry: `@tanstack/react-start/server-entry`
- Compatibility flag: `nodejs_compat`
- Environment variable names: none for the informational MVP
- D1 database or other service binding: none
- Cloudflare project / deployed Worker: not created
- Preview URL / deployment result: not available; no deployment was made

Once local build and browser checks pass, create a separate preview Worker through Cloudflare Workers Builds or Wrangler using the feature branch. This action is within the user's requested preview scope. Do not connect a production domain or merge to `main`.

## Free-tier notes

Cloudflare's D1 documentation says Workers Free includes D1 for prototyping, and daily read/write limits apply; reads or writes fail after those limits are reached. Do not enable D1 until account and post permissions are designed and tested. No paid service or add-on is needed for the current informational site.
