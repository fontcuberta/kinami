// Número de soporte de Kinami (WhatsApp). Si algún día cambia, solo hay
// que tocarlo aquí.
const SUPPORT_WHATSAPP_NUMBER = "34609469731";

export function whatsappSupportUrl(message?: string): string {
  const base = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
