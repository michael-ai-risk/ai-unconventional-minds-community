import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";
import { sendSignInCode } from "./email-delivery";

const emailOTPPlugin = emailOTP({
  otpLength: 6,
  expiresIn: 300,
  allowedAttempts: 3,
  storeOTP: "hashed",
  rateLimit: { window: 60, max: 3 },
  async sendVerificationOTP({ email, otp }) {
    await sendSignInCode(env, email, otp);
  },
});

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
  // Better Auth endpoints are protected; community post/comment routes remain unthrottled.
  rateLimit: { enabled: true, storage: "database" },
  trustedOrigins: [env.SITE_ORIGIN],
  advanced: { database: { validateSchema: false } },
  plugins: [emailOTPPlugin, tanstackStartCookies()],
});
