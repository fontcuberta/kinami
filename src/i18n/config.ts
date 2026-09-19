export const LOCALES = ["es", "en", "ca"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "kinami-locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
  ca: "Català",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  const value = header?.toLowerCase() ?? "";
  if (value.includes("ca")) return "ca";
  if (value.includes("en")) return "en";
  return "es";
}
