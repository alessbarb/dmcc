import React, { useState } from "react";
import type { SupportedLocale } from "@shared/i18n/index.js";
import { createTranslator, detectBrowserLocale } from "@shared/i18n/index.js";
import { readStoredLocale, writeStoredLocale } from "./localeStorage.js";
import { I18nContext } from "./I18nContext.js";

export type { I18nContextType } from "./I18nContext.js";

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
