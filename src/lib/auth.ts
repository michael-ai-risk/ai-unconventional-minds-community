import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

const emailOTPPlugin = emailOTP({
  otpLength: 6,
  expiresIn: 300,
  allowedAttempts: 3,
  storeOTP: "hashed",
  rateLimit: { window: 60, max: 3 },
  async sendVerificationOTP({ email, otp, type }) {
    const apiKey = env.RESEND_API_KEY?.trim();
    const from = env.EMAIL_FROM?.trim();
    if (!apiKey || !from) throw new Error("Email sign-in is not configured.");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: type === "sign-in" ? "Your sign-in code" : "Your verification code",
        text: [
          "AI非正常人类情报站 · AI Unconventional Minds Station",
          "",
          "Your one-time sign-in code / 登录验证码 / 認証コード / 로그인 코드 / รหัสเข้าสู่ระบบ:",
          otp,
          "",
          "This code expires in 5 minutes and can only be used once.",
          "验证码 5 分钟后过期且只能使用一次。",
          "",
          "If you did not request this code, you can ignore this email.",
        ].join("\n"),
      }),
    });

    if (!response.ok) throw new Error("Verification email could not be delivered.");
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
