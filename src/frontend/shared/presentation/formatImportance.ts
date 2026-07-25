import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

export function formatImportance(importance: string | undefined | null, locale?: SupportedLocale): string {
  if (!importance) return "";
  const key = importance.trim().toLowerCase();
  const translationKey = `importance.${key}`;
  const translated = t(translationKey, {}, locale);
  if (translated !== translationKey) {
    return translated;
  }
  return importance.replace(/\b\w/g, c => c.toUpperCase());
}
