# Source migration audit

## Source and revision

- Lovable project: `822c1301-29f1-4528-a3f1-4155303a27e0`
- Source revision read: `d4b987900137d69166c532bda01e21117810af0f`
- Repository: `michael-ai-risk/ai-unconventional-minds-community`
- The repository was empty at the start. The only `main` commit initializes that empty repository; application work is on `feat/community-migration-and-mvp`.

## Retrieved

The Lovable file API exposed 84 source and configuration files, including the React/TypeScript app, generated TanStack route tree, Tailwind design tokens, translation dictionary, fonts configuration, package manifest and Bun lockfile, Vite config, Supabase integration, Drizzle migration records, and Supabase config. Every text file was transferred except the actual `.env`, which was intentionally excluded. A placeholder-only `.env.example` is supplied.

The project is TanStack Start with React 19, server-side entry code, Drizzle/PostgreSQL configuration, and Supabase client integrations. It is not a pure static Vite app. The Drizzle schema is intentionally empty; the migration SQL files are retained for review. No database schema should be inferred from the empty generated schema.

## Not yet retrieved

Lovable lists two binary assets: `src/assets/hero-collage.jpg` and `public/favicon.ico`. Its read-file interface returns binary data as corrupted text rather than a usable download; both files are therefore absent from the Git migration at this point. The protected Lovable preview redirects to sign-in in the current browser. The site build must not be reported as visually equivalent or complete until the original assets are recovered and verified.

## Credentials

The source `.env` was not copied. Do not assume any Lovable or Supabase service credentials are portable. Values required for any future deployment must be created in that environment and configured outside GitHub. The public repository contains placeholders only.

## Next audit actions

1. Recover the two listed binary assets through an official Lovable export or a signed-in project session.
2. Review dependency portability and replace the Lovable Vite wrapper before installing.
3. Remove or isolate Lovable preview authentication/error-reporting glue and confirm the route tree builds independently.
4. Run a local build and compare the home page with the Lovable reference after assets are available.
