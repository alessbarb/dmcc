import React, { createContext, useState } from "react";
import type { SupportedLocale, TranslationKey } from "@shared/i18n/index.js";
import { createTranslator, detectBrowserLocale } from "@shared/i18n/index.js";
import { readStoredLocale, writeStoredLocale } from "./localeStorage.js";

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);


export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    return detectBrowserLocale(readStoredLocale());
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    writeStoredLocale(newLocale);
  };

  const translator = createTranslator(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translator.t }}>
      {children}
    </I18nContext.Provider>
  );
}
