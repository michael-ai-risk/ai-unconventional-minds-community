# Acceptance report

Status: **migration MVP implemented; visual comparison and preview deployment remain pending**.

## Verified

- Target repository is public and writable; product branch exists at `feat/community-migration-and-mvp`.
- Source text baseline is committed. Original `.env` was excluded.
- Homepage positioning and survey label follow the user's confirmed community direction.
- Genially showcase content was removed from the active homepage and language dictionary.
- Desktop navigation and mobile menu link to actual TanStack routes for Home, Events, AI Topics, Discussions, Chiang Mai, and About.
- Bilingual editorial prompts and informational pages were added. The discussion page says posting and comments are unavailable; it does not fabricate users or claim persistence.
- Cloudflare SSR configuration is based on the current official TanStack Start / Cloudflare Workers guide.
- Dependency audit and `npm install` completed. `npm run build` passes, including the Cloudflare client and SSR bundles and TypeScript check.
- `npm test` passes: 12 tests across 2 files. Coverage includes route matching, mobile navigation open/navigate/close, language switching, and the Tally URL.
- A local SSR smoke check returned HTTP 200 for `/`, `/events`, `/ai-topics`, `/ai-topics/first-steps`, `/discussions`, `/chiang-mai`, `/about`, `/community-rules`, and `/privacy`.
- Targeted ESLint over changed routes, components, content, and configs reports no errors (Wrangler JSONC is not covered by the configured ESLint rules).
- A scan of `src/` and `public/` found no Genially references. No `.env` file or credential value was copied; `.env.example` contains variable guidance only.

## Pending verification and known gaps

- Binary assets: the original collage and favicon are still missing from the Lovable export path.
- Full repository `npm run lint` still reports legacy formatting violations outside the targeted changed-file lint check.
- Visual comparison with the Lovable homepage cannot pass while the original image is unavailable.
- Browser-based visual/responsive checks at 375px and desktop width were not completed: the available cloud browser could not reach the local development server in this isolated workspace. Automated navigation tests and SSR route checks passed, but they do not replace browser verification.
- The Tally URL and navigation interactions are asserted by tests, but were not clicked in a real browser.
- Durable discussions, account roles, posting, comments, reports, and moderation are intentionally not implemented in this first website migration. They need a real backend and security tests before being enabled.
- Cloudflare preview not deployed; no Cloudflare project or binding created.
- Draft PR will carry these limitations for review; it is not ready to merge until original assets are recovered and browser-level visual checks are completed.

## Release boundaries

No merge to `main`, production deployment, or paid service was performed.

## Phase 2 execution update — 2026-10-26

This section records the Phase 2 changes and tests. The Phase 1 limitations above remain as historical results and have not been removed. Browser and Cloudflare checks below are not replaced by unit-test counts.

### IMPLEMENTED

- Cloudflare D1 migrations `0001_community.sql` through `0003_event_interest_unique.sql`; old PostgreSQL migrations remain audit-only.
- Better Auth email/password registration and sessions, minimum 12-character password, database-backed auth rate limit, default member role/profile creation, and no public admin-claim endpoint.
- API for public posts/comments/events/articles/categories, authenticated post/comment create/edit/delete, per-user write limits, same-origin write checks, input-size and field-length caps, report creation, staff report review/hide, admin event/article creation/editing, and self-profile read/update.
- Public post responses do not include email fields; tests queried these public objects and verified no `email` key was returned.
- Discussion UI now has account entry, category/search, persisted feed, create post, comment, author post edit/delete, and signed-in report controls. `/admin` has report, event, and bilingual article management UI. Events and published topics load from D1 through list/detail pages.
- Original Lovable binary assets were requested using the official file reader, but the connector coerced binary into corrupted text. No corrupt bytes were saved. Authored SVG collage/favicon replacements are explicitly labeled as community-made and not original assets.
- Cloudflare build configuration and required values are documented. No Cloudflare account setting or remote database was changed.

### TESTED

- `npm run build` passes: Vite client and Worker SSR bundles plus `tsc --noEmit`. Vite emits one sourcemap warning from its CSS post-processing plugin; it does not fail the build.
- `npm run d1:migrate:preview` applies all three D1 migrations to the generated Worker preview database.
- Local Worker/API smoke test against real Wrangler + D1 passed: category/event feed; two registrations; session restoration; self-profile response hides email; ordinary member denied the staff queue; A posts; anonymous fresh request reads it; B comments and edits B's own comment; report submission; admin report queue and resolution; admin creates a TBA event and bilingual article and they read back from fresh requests; admin hides reported post; anonymous access then returns 404; B cannot edit A's post; anonymous post write returns 401.
- The reproducible local-only integration smoke script is `scripts/local-community-smoke.py`; its last run printed `SMOKE_OK` with the checks above.
- `npm test`: 12 tests pass across 2 files.
- Final `npm run lint`: exit 0 with 7 existing React Fast Refresh warnings in shadcn/UI and i18n exports. Targeted ESLint on all changed TypeScript sources passes with no errors or warnings.
- Command-level local HTTP smoke checked homepage and API. This is Worker runtime testing, not browser visual acceptance.
- `npm test` and scoped ESLint results are recorded below after final run.

### BLOCKED

- Wrangler `whoami` reports no Cloudflare authentication. Cloudflare Dashboard in the available browser is at sign-in. Therefore Build `#1f3c5a03` full logs, existing Build branch/command settings, remote D1 state, `npm run build` Cloudflare setting, secrets, preview deployment, runtime URL, and runtime browser logs remain inaccessible. The Deploying failure is not diagnosed; the given main branch / no build command are known configuration issues only.
- The cloud browser URL security policy refused local `http://127.0.0.1` page access. No mobile (375px/Android) or desktop (1440px) browser visual checks, screenshots, mobile menu checks, or browser-based Tally click were performed.
- Lovable official binary file reads for `src/assets/hero-collage.jpg` and `public/favicon.ico` returned lossy text; original image bytes are unavailable. SVG replacements are not visually equivalent proof.

### NOT_IMPLEMENTED / PREVIEW LIMITS

- Email verification / delivery is not configured. Signup cannot confirm mailbox ownership; limit exposure to a private preview until verification and abuse recovery are added.
- There is no avatar upload; profile API accepts only HTTPS avatar URLs.
- No second-account Cloudflare-hosted browser session, remote moderation test, remote SQL migration, actual Cloudflare preview URL, or browser screenshot exists yet.
- Formal website release, domain binding, main merge, and public launch remain not performed.

### Historical test failures preserved

- Initial `wrangler d1 migrations apply community --local` failed because the configured D1 database name is `ai-unconventional-minds-community`; the corrected command succeeded.
- First TypeScript build attempt failed on missing Worker `Env` bindings and an implicit event parameter; type declarations/annotations were corrected and subsequent builds passed.
- Initial `vite dev` and `wrangler dev` attempts failed with `uv_interface_addresses returned Unknown system error 1` in this network-isolated environment. A local loopback-only Node preload was used to expose loopback interface metadata for Wrangler; no application/network security control was disabled. The local API smoke suite then passed.
- First Better Auth registration attempts exposed missing `rateLimit` storage schema (first missing table, then missing generated `id`); migration `0002` was corrected before end-to-end smoke tests. No failed entries above have been removed.
- The first full `npm run lint` attempt after adding the new routes failed with 2 Prettier errors in `src/lib/i18n.tsx` and 7 Fast Refresh warnings. The file was formatted; the final full lint run exits 0 with the same 7 warnings. The earlier failure is retained here.

## Anonymous participation product change — 2026-10-26

This update supersedes the previous registration-based product behavior. The historical phase results above are retained as historical evidence and are not claims about the current product.

### IMPLEMENTED

- Removed the visitor join page and account prompts. Visitors can browse public discussions without a session; signup POST routes now return `410`.
- Better Auth is retained for staff. Staff email sign-in is checked against the server-side `roles` table before Better Auth handles credentials. Non-staff sign-in is rejected; admin APIs still verify the session and role independently.
- Added D1 migration `0004_guest_posting.sql`: optional public author labels, SHA-256 edit-key hashes, anonymous report fingerprints, a non-login guest foreign-key identity, and a one-time admin-bootstrap lock.
- Anonymous post/comment creation validates same-origin writes, streams a bounded request body, applies per-source/action limits, verifies Turnstile server-side, and inserts new content as `pending`. Report submission is anonymous and rate-limited. Content owners may edit/delete only with the unguessable key returned once at creation; staff moderation remains role-gated.
- Added one-time staff bootstrap using a secret request header. Remove `ADMIN_BOOTSTRAP_SECRET` immediately after setup. The discussion UI now puts a separate Turnstile control next to the post and comment forms and warns when browser storage cannot keep a private edit key.
- Updated the privacy page, product spec, architecture, deployment instructions, and README for no-account participation, moderation, request metadata, content deletion requests, and independent Tally handling.
- Fixed local Wrangler D1 persistence configuration so the preview Worker and local migration command use the same persistence directory.

### TESTED

- `npm run build`: passed, including TypeScript. Vite reports the existing CSS post-processing sourcemap warning.
- `npm test`: 12 tests passed across 2 files.
- `npm run lint`: exit 0, with 7 existing Fast Refresh warnings and no errors.
- `git diff --check`: passed.
- Local Wrangler + isolated D1: public categories, events, and discussion feed returned `200`; public signup returned `410`; non-staff sign-in returned `401`; first staff bootstrap returned `201`, repeat bootstrap `409`, staff sign-in `200`, and anonymous moderation access `401`; an invalid Turnstile token returned `403`. The Worker and migration state now share the same explicit persistence directory.

### BLOCKED

- The local Worker runtime could not resolve `challenges.cloudflare.com` (`Temporary failure in name resolution`). Therefore a valid Turnstile response could not be verified through the real endpoint in this sandbox. Anonymous post/comment `201` creation, fresh-read persistence, pending moderation, owner-key authorization, and the end-to-end admin moderation flow are not claimed as tested in this run. Do not disable Turnstile to work around this local network restriction.
- No Cloudflare preview credentials, remote D1 database ID, or deployed preview URL were available. Cloudflare-hosted Turnstile and browser verification remain outstanding.
- No connected browser could reach the local Worker in this environment, so mobile and desktop screenshots, menu navigation, Tally click-through, and mobile posting usability were not browser-verified.

### NOT_IMPLEMENTED / LIMITS

- Visitor account registration, login, email collection, and member profiles are intentionally not part of this product.
- Staff account setup still depends on the one-time bootstrap secret and Better Auth password login. Email delivery, recovery, and second-factor configuration are not set up; restrict any preview to intended reviewers and remove the bootstrap secret after setup.
- The D1 `database_id` in `wrangler.jsonc` remains the zero UUID placeholder. Replace it only with a real ID from the user's Cloudflare account before a remote migration/deploy. No remote D1 migration was run.
