/** Traduce errores de Supabase Auth a mensajes claros en español. */
export function loginAuthErrorMessage(message?: string, redirectTo?: string): string {
  const detail = message?.trim().toLowerCase() ?? "";

  if (!detail) {
    return "No hemos podido enviar el enlace. Comprueba el email e inténtalo de nuevo.";
  }

  if (
    detail.includes("rate limit") ||
    detail.includes("too many requests") ||
    detail.includes("over_email_send_rate_limit")
  ) {
    return "Has pedido demasiados enlaces seguidos. Supabase limita los envíos por hora: espera unos 60 minutos y vuelve a intentarlo.";
  }

  if (detail.includes("redirect") && detail.includes("not allowed")) {
    const urlHint = redirectTo ? ` Añade exactamente: ${redirectTo}` : "";
    return `La URL de retorno no está permitida en Supabase.${urlHint} Ve a Authentication → URL Configuration → Redirect URLs.`;
  }

  if (detail.includes("invalid api key") || detail.includes("invalid jwt")) {
    return "Las credenciales de Supabase no son válidas. Revisa NEXT_PUBLIC_SUPABASE_URL y la clave publishable.";
  }

  if (detail.includes("signup disabled") || detail.includes("signups not allowed")) {
    return "El registro por email está desactivado en Supabase. Actívalo en Authentication → Providers → Email.";
  }

  if (detail.includes("invalid email")) {
    return "Ese correo no parece válido. Revísalo e inténtalo de nuevo.";
  }

  return `No hemos podido enviar el enlace. ${message?.trim()}`;
}
