# Architecture

## Source findings

The Lovable source is a React 19 / TypeScript TanStack Start application with SSR/server entry code, Vite, Tailwind CSS v4, Supabase JS client files, and Drizzle/PostgreSQL migration files. Drizzle schema is empty. The original Vite configuration depended on `@lovable.dev/vite-tanstack-config`, which bundled build behavior and a Cloudflare Nitro target; this wrapper is platform-specific and must be replaced before independent startup can be claimed.

## MVP target

Keep the existing TanStack Start app and its visual tokens. Remove runtime dependence on Lovable preview services. Implement informational pages and editorial topic starters first. Do not present browser storage as a database. Public discussion reads and member posting are deferred until a backend with authenticated identity, row-level authorization, moderation, abuse controls, and durable storage is connected.

## Cloudflare decision

No deployment configuration has been applied. Verify current TanStack Start and Cloudflare Workers compatibility against official documentation before selecting Workers or Pages. The current SSR server entry means static Pages output must not be assumed. Prefer the simplest free Workers deployment with durable storage only after the backend design and permissions are tested. See `CLOUDFLARE_DEPLOYMENT.md`.
