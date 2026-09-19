"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE } from "./config";
import { messages as allMessages, type Messages } from "./messages";
import { createTranslator } from "./translate";
import type { Locale } from "./config";

type I18nContextValue = ReturnType<typeof createTranslator>;

const I18nContext = createContext<I18nContextValue>(
  createTranslator(allMessages[DEFAULT_LOCALE], DEFAULT_LOCALE)
);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={createTranslator(messages, locale)}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
