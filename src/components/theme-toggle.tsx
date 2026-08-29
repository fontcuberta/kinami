"use client";

import { useState, useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "@/components/ui/icons";
import { applyTheme, readDocumentTheme, type Theme } from "@/lib/theme";

function subscribeNever() {
  return () => {};
}

/**
 * Interruptor de tema claro/oscuro. El script inline en layout.tsx fija
 * data-theme antes de pintar; aquí sincronizamos el icono y gestionamos el clic.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" ? readDocumentTheme() : "light"
  );
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const label = mounted
    ? `Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`
    : "Cambiar tema";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={mounted ? theme === "dark" : undefined}
      title={label}
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text"
    >
      {mounted && theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}
