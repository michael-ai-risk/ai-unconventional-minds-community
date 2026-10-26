import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

export const auth = betterAuth({
  appName: "AI Unconventional Minds Station",
  database: env.DB,
  baseURL: env.SITE_ORIGIN,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 10,
  },
  trustedOrigins: [env.SITE_ORIGIN],
  advanced: { database: { validateSchema: false } },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await env.DB.batch([
            env.DB.prepare("INSERT OR IGNORE INTO roles(user_id,role) VALUES(?, 'member')").bind(
              user.id,
            ),
            env.DB.prepare("INSERT OR IGNORE INTO profiles(user_id,display_name) VALUES(?,?)").bind(
              user.id,
              user.name,
            ),
          ]);
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
});
