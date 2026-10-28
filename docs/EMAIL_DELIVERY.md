# Email-code delivery

Community authentication still uses Better Auth email OTP. Browsing is public;
posting and replying require a verified-email session. No migration is needed.

For a Preview without a custom sending domain, configure **both** `GMAIL_USER`
and `GMAIL_APP_PASSWORD` using Cloudflare Worker Secrets on `community-pr2-preview`.
`GMAIL_USER` must be the Gmail account that created the Google app password.
Never use the account's normal password. App-password display spaces are removed
before SMTP authentication. Gmail sends over verified TLS to `smtp.gmail.com:465`.
The authenticated Gmail account is also the From address; `EMAIL_FROM` cannot
override it. Gmail's account limits and delivery restrictions still apply.

If either Gmail setting exists, the Gmail configuration must be complete. There
is no silent fallback after Gmail rejects a message. If neither Gmail setting is
set, the existing Resend channel uses `RESEND_API_KEY` and a verified `EMAIL_FROM`.
`BETTER_AUTH_SECRET`, HTTPS `SITE_ORIGIN`, and D1 `DB` remain required.

Deploy only with `wrangler.community-preview.jsonc`; preserve Dashboard variables
using `--keep-vars`. Do not use the default production deployment command.
Never store real keys, app passwords, OTPs, or session cookies in Git or logs.

The session endpoint's `emailOtpConfigured` reports syntactic configuration only,
not Gmail authentication, mail delivery, or end-to-end acceptance. Before claiming
readiness, use an authorized test mailbox to receive a real code, establish a
session, publish a clearly labeled test contribution, comment/reply, and sign out.
Also verify incorrect/reused codes, authentication rate limits, and staff access
boundaries. Automated transport tests cannot substitute for those checks.
