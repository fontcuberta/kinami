"use client";

import { useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "@/components/ui/icons";
import { applyTheme, readDocumentTheme, type Theme } from "@/lib/theme";
import { useI18n } from "@/i18n/client";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const serverTheme = (): Theme | null => null;

export function ThemeToggle() {
  const { t } = useI18n();
  const theme = useSyncExternalStore(subscribe, readDocumentTheme, serverTheme);
  const mounted = theme !== null;

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  const label = mounted
    ? theme === "dark"
      ? t("theme.toLight")
      : t("theme.toDark")
    : t("theme.toggle");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={mounted ? theme === "dark" : undefined}
      title={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text"
    >
      {mounted && theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
