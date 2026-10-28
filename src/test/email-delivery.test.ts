import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailDeliveryConfigured } from "@/lib/email-config";

const smtp = vi.hoisted(() => ({ sendMail: vi.fn(), close: vi.fn(), create: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: smtp.create } }));
import { sendSignInCode } from "@/lib/email-delivery";

const gmail = { GMAIL_USER: "test@gmail.com", GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop" };

describe("email delivery boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    smtp.create.mockReturnValue({ sendMail: smtp.sendMail, close: smtp.close });
    smtp.sendMail.mockResolvedValue({ accepted: ["recipient@example.com"], rejected: [] });
  });

  it("fails closed for partial Gmail configuration instead of silently using Resend", () => {
    expect(
      emailDeliveryConfigured({
        ...gmail,
        GMAIL_APP_PASSWORD: "",
        RESEND_API_KEY: "test",
        EMAIL_FROM: "test@example.com",
      }),
    ).toBe(false);
    expect(emailDeliveryConfigured(gmail)).toBe(true);
    expect(emailDeliveryConfigured({ ...gmail, GMAIL_USER: "test@example.com" })).toBe(false);
  });

  it("uses the authenticated sender, TLS, and normalized Google app password", async () => {
    await sendSignInCode(
      { ...gmail, EMAIL_FROM: "other@example.com" },
      "recipient@example.com",
      "123456",
    );
    expect(smtp.create).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "test@gmail.com", pass: "abcdefghijklmnop" },
        tls: { servername: "smtp.gmail.com", rejectUnauthorized: true },
        debug: false,
        logger: false,
      }),
    );
    expect(smtp.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: "AI Community", address: "test@gmail.com" },
        to: "recipient@example.com",
      }),
    );
    expect(smtp.close).toHaveBeenCalledOnce();
  });

  it("redacts provider errors and closes the transport on delivery failure", async () => {
    smtp.sendMail.mockRejectedValue(new Error("sensitive SMTP response"));
    await expect(sendSignInCode(gmail, "recipient@example.com", "123456")).rejects.toThrow(
      "Verification email could not be delivered.",
    );
    expect(smtp.close).toHaveBeenCalledOnce();
  });

  it("does not claim delivery when SMTP rejects the recipient", async () => {
    smtp.sendMail.mockResolvedValue({ accepted: [], rejected: ["recipient@example.com"] });
    await expect(sendSignInCode(gmail, "recipient@example.com", "123456")).rejects.toThrow(
      "Verification email could not be delivered.",
    );
  });
});
