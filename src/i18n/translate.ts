import type { Locale } from "./config";
import type { Messages } from "./messages";

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function createTranslator(dict: Messages, locale: Locale) {
  return {
    locale,
    dict,
    t(path: string, vars?: Record<string, string | number>) {
      const value = path.split(".").reduce<unknown>((acc, key) => {
        if (!acc || typeof acc !== "object") return undefined;
        return (acc as Record<string, unknown>)[key];
      }, dict);
      if (typeof value !== "string") return path;
      return interpolate(value, vars);
    },
  };
}
