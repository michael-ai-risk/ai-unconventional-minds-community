export type EmailEnvironment = {
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
};

export function emailDeliveryConfigured(config: EmailEnvironment): boolean {
  if (config.GMAIL_USER || config.GMAIL_APP_PASSWORD) {
    return (
      /^[^\s@]+@(gmail\.com|googlemail\.com)$/i.test(config.GMAIL_USER?.trim() ?? "") &&
      /^[a-zA-Z0-9]{16}$/.test(config.GMAIL_APP_PASSWORD?.replace(/\s/g, "") ?? "")
    );
  }
  return !!config.RESEND_API_KEY?.trim() && !!config.EMAIL_FROM?.trim();
}
