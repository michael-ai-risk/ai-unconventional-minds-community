# Community product specification

## Positioning

**AI非正常人类情报站** — 在清迈，一起聊AI、分享真实经历、认识有趣的人。

**AI Unconventional Minds Station** — Meet in Chiang Mai to talk AI, share real experiences, and meet curious people.

A free, open, relaxed space for beginners, students, professionals, technologists, digital nomads, founders, travelers, and anyone curious about AI or making friends. No coding background, business resources, forced introductions, or specific goal is required.

## Content principles

- Discuss AI developments, real use, failures, and changes to work and daily life.
- Welcome disagreement, questions, learning, and informal connections.
- Business and entrepreneurship are optional topics among many.
- Do not invent member posts, comments, activity dates, venues, housing costs, or current policy.
- Clearly label editorial topics and use references for time-sensitive claims.
- Do not force group membership, self-introductions, resource exchange, or commercial cooperation.

## Navigation and pages

- Home: community introduction, four poster themes, event status, editorial AI prompts, recent discussions entry, voluntary survey.
- Events: first event “AI非正常人类情报站｜第一期免费AI聚会”; free; date and venue TBA; D1-backed list/detail, staff create/edit, and recap fields. The Tally survey is optional and is not event registration.
- AI Topics: bilingual editorial discussion starters and staff-managed articles. News must have real sources; the site does not fabricate live news.
- Discussions: public browsing and anonymous posting, comments/replies, categories/search, owner edit/delete keys, anonymous reports, and staff review. New visitor posts and comments are pending until approved.
- Chiang Mai: lived experiences, language, places, events, habits/costs, friendships, and AI in local life; no invented live facts.
- About: community purpose, welcome, and participation principles.
- Privacy and community rules have focused pages.

## No member registration

Community visitors do not create accounts, provide email/password/real name, or use third-party sign-in. Nicknames are optional. Post/comment writes require a valid Cloudflare Turnstile challenge and are rate-limited by a keyed digest of the source address. New contributions are saved in D1 as pending and remain private until staff approval.

The server creates an unpredictable 256-bit edit key for each contribution and stores only its SHA-256 hash. The raw key is shown to the author once and saved in that browser for convenience. The API checks the key on edit/delete. Losing it requires a deletion request from the Privacy page, reviewed by staff. The key is a bearer credential; anyone who obtains it can manage that contribution.

## Staff access

`/admin` is an unlinked staff-only sign-in and moderation area. Better Auth remains for staff sessions; public signup endpoints return `410`. A one-time `/api/admin/bootstrap` endpoint can create the first admin only when `ADMIN_BOOTSTRAP_SECRET` is set, no admin role exists, and the bootstrap lock has not been claimed. Remove that secret immediately after setup. Staff roles are checked server-side for every management endpoint. Moderators review content/reports; admins also manage events and editorial articles.

## Privacy and external survey

Posts, comments, optional nicknames, timestamps, moderation status, keyed source digests for rate limiting/report deduplication, and edit-key hashes are stored in D1. The site does not save visitor emails or passwords. Cloudflare Turnstile verifies anti-spam challenges; Cloudflare may process request metadata according to its service terms. Public content may be read and shared. Content can be managed with its private key, reported in place, or submitted for deletion through the Privacy page.

The Tally survey is optional: https://tally.so/r/PRdaO5. Tally is an independent service; its responses are not represented as being stored on this site and are not linked to a member account.
