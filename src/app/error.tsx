"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { whatsappSupportUrl } from "@/lib/support";
import { useI18n } from "@/i18n/client";

export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const supportMessage = t("errors.whatsappBody", {
    detail: error.message || t("errors.unexpected"),
  });

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <main
        id="main-content"
        className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="font-display text-2xl font-semibold text-text">{t("errors.title")}</h1>
        <p role="alert" className="mt-2 text-text-secondary">
          {error.message || t("errors.body")}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={retry}>{t("errors.retry")}</Button>
          <Button
            variant="secondary"
            onClick={() =>
              window.open(whatsappSupportUrl(supportMessage), "_blank", "noopener,noreferrer")
            }
          >
            {t("errors.whatsapp")}
          </Button>
        </div>
      </main>
    </div>
  );
}
