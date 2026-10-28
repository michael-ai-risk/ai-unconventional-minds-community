import type { D1Database } from "@cloudflare/workers-types";

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      BETTER_AUTH_SECRET: string;
      SITE_ORIGIN: string;
      ADMIN_BOOTSTRAP_SECRET: string;
      GMAIL_USER?: string;
      GMAIL_APP_PASSWORD?: string;
      RESEND_API_KEY?: string;
      EMAIL_FROM?: string;
    }
  }
}
