import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

export function formatEntityStatus(status: string | undefined | null, locale?: SupportedLocale): string {
  if (!status) return "";
  const key = status.trim().toLowerCase();
  const translationKey = `status.${key}`;
  const translated = t(translationKey, {}, locale);
  if (translated !== translationKey) {
    return translated;
  }
  return status.replace(/\b\w/g, c => c.toUpperCase());
}
