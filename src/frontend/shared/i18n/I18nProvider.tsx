import React, { createContext, useState } from "react";
import type { SupportedLocale, TranslationKey } from "@shared/i18n/index.js";
import { createTranslator, detectBrowserLocale } from "@shared/i18n/index.js";

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "dmcc_networkguage";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return detectBrowserLocale(saved);
    } catch {}
    return "en";
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
  };

  const translator = createTranslator(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translator.t }}>
      {children}
    </I18nContext.Provider>
  );
}
