import { useContext } from "react";
import { I18nContext } from "./I18nContext.js";
import type { I18nContextType } from "./I18nContext.js";

export function useTranslation(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
