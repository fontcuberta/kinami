import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, localeFromAcceptLanguage, LOCALE_COOKIE } from "./config";
import { messages } from "./messages";
import { createTranslator } from "./translate";

export async function getLocale() {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerList = await headers();
  return localeFromAcceptLanguage(headerList.get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function getMessages() {
  const locale = await getLocale();
  return messages[locale];
}

export async function getTranslator() {
  const locale = await getLocale();
  return createTranslator(messages[locale], locale);
}
