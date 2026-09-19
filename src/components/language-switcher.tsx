"use client";

import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/set-locale";
import { useI18n } from "@/i18n/client";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={locale}
        onChange={async (e) => {
          await setLocale(e.target.value as Locale);
          router.refresh();
        }}
        className="min-h-9 rounded-lg border border-border-subtle bg-surface px-2 text-sm font-medium text-text"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
