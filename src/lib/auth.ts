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
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  rateLimit: { enabled: false },
  trustedOrigins: [env.SITE_ORIGIN],
  advanced: { database: { validateSchema: false } },
  plugins: [tanstackStartCookies()],
});
