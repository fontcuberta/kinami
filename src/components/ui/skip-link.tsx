"use client";

import { useI18n } from "@/i18n/client";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main-content" className="skip-link">
      {t("skip")}
    </a>
  );
}
