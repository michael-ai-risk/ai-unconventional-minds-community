import type { D1Database } from "@cloudflare/workers-types";

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      BETTER_AUTH_SECRET: string;
      SITE_ORIGIN: string;
      TURNSTILE_SECRET_KEY: string;
      ADMIN_BOOTSTRAP_SECRET: string;
    }
  }
}
