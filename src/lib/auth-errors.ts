import { getTranslator } from "@/i18n/server";
import { interpolate } from "@/i18n/translate";

export async function loginAuthErrorMessage(message?: string, redirectTo?: string): Promise<string> {
  const { t } = await getTranslator();
  const detail = message?.trim().toLowerCase() ?? "";

  if (!detail) return t("authErrors.generic");

  if (
    detail.includes("rate limit") ||
    detail.includes("too many requests") ||
    detail.includes("over_email_send_rate_limit")
  ) {
    return t("authErrors.rateLimit");
  }

  if (detail.includes("redirect") && detail.includes("not allowed")) {
    const hint = redirectTo ? ` ${redirectTo}` : "";
    return t("authErrors.redirect", { hint });
  }

  if (detail.includes("invalid api key") || detail.includes("invalid jwt")) {
    return t("authErrors.apiKey");
  }

  if (detail.includes("signup disabled") || detail.includes("signups not allowed")) {
    return t("authErrors.signup");
  }

  if (detail.includes("invalid email")) {
    return t("authErrors.invalidEmail");
  }

  if (
    detail.includes("sending magic link") ||
    detail.includes("sending confirmation email") ||
    detail.includes("error sending")
  ) {
    return t("authErrors.smtp");
  }

  return interpolate(t("authErrors.prefix"), { detail: message?.trim() ?? "" });
}
