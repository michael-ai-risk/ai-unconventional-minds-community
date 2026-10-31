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
- Discussions: public browsing, email-code authenticated posting and replies, categories/search, account-based owner edit/delete, anonymous reports, and staff handling of reported content. New posts and replies publish immediately.
- Chiang Mai: lived experiences, language, places, events, habits/costs, friendships, and AI in local life; no invented live facts.
- About: community purpose, welcome, and participation principles.
- Privacy and community rules have focused pages.

## Email-code participation

Browsing is public. Posting and replying require a one-time code sent to the visitor's email. The first successful verification automatically creates a sign-in account; password registration and social sign-in are disabled for community participation. A nickname remains optional, and the email address is never displayed publicly. Resend sends the OTP email from a verified sender address configured in the selected Worker environment.

Posts and replies publish immediately. The authenticated account ID owns each contribution; the same verified email login is required to edit or delete it. The site does not generate private edit keys, run Turnstile, or apply post/reply/report rate limits. Authentication endpoints retain narrow abuse limits. Previously pending content is changed to hidden during migration rather than automatically published.

## Staff access

`/admin` is an unlinked staff-only sign-in and management area. Better Auth email/password sign-in remains restricted to existing staff; public email/password signup endpoints return `410`. A one-time `/api/admin/bootstrap` endpoint can create the first admin only when `ADMIN_BOOTSTRAP_SECRET` is set, no admin role exists, and the bootstrap lock has not been claimed. Remove that secret immediately after setup. Staff roles are checked server-side for every management endpoint. Staff can process user reports and hide content after publication; admins also manage events and editorial articles. There is no pre-publication review queue.

## Privacy and external survey

Posts, comments, optional nicknames, author account IDs, timestamps, and publication status are stored in D1. Better Auth stores verified email and session information; the email is not public. Resend sends verification email; Resend, Cloudflare, and hosting providers may process authentication and request data under their service terms. Public content may be read and shared. Visitors may report content without signing in or submit a deletion request through the Privacy page.

The Tally survey is optional: https://tally.so/r/PRdaO5. Tally is an independent service; its responses are not represented as being stored on this site and are not linked to a member account.
