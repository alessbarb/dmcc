import { createContext } from "react";
import type { SupportedLocale, TranslationKey } from "@shared/i18n/index.js";

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);
