"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/ui/icons";

const STORAGE_KEY = "kinami-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage puede no estar disponible (modo privado); no es crítico.
  }
}

/**
 * Interruptor de tema claro/oscuro. Lee la preferencia guardada o, si no
 * hay ninguna, la del sistema, y la deja fijada en <html data-theme>. El
 * script inline en layout.tsx ya aplica la preferencia guardada antes de
 * pintar, así que aquí solo sincronizamos el icono y gestionamos el clic.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();
    const current =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}` : "Cambiar tema"}
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
