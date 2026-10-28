import nodemailer from "nodemailer";
import { emailDeliveryConfigured, type EmailEnvironment } from "./email-config";

export async function sendSignInCode(
  config: EmailEnvironment,
  email: string,
  otp: string,
): Promise<void> {
  if (!emailDeliveryConfigured(config)) throw new Error("Email sign-in is not configured.");
  const subject = "Your sign-in code · AI Community";
  const text = [
    "AI非正常人类情报站 · AI Unconventional Minds Station",
    "Your one-time sign-in code / 登录验证码 / 認証コード / 로그인 코드 / รหัสเข้าสู่ระบบ:",
    otp,
    "This code expires in 5 minutes and can only be used once.",
    "验证码 5 分钟后过期且只能使用一次。",
    "If you did not request this code, you can ignore this email.",
  ].join("\n\n");

  if (config.GMAIL_USER) {
    const user = config.GMAIL_USER.trim();
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: config.GMAIL_APP_PASSWORD!.replace(/\s/g, "") },
      tls: { servername: "smtp.gmail.com", rejectUnauthorized: true },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      logger: false,
      debug: false,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    try {
      const result = await transport.sendMail({
        from: { name: "AI Community", address: user },
        to: email,
        subject,
        text,
      });
      if (!result.accepted?.length || result.rejected?.length) throw new Error("Rejected");
    } catch {
      // Do not expose SMTP responses, recipients, or credentials in auth errors/logs.
      throw new Error("Verification email could not be delivered.");
    } finally {
      transport.close();
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.RESEND_API_KEY!.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.EMAIL_FROM!.trim(), to: [email], subject, text }),
  });
  if (!response.ok) throw new Error("Verification email could not be delivered.");
}
