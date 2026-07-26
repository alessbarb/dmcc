import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

export function formatRelativeTime(dateInput: string | Date | undefined | null, locale?: SupportedLocale): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Handle future dates or extremely close past dates
  if (diffSec < 60) {
    return t("time.secondsAgo", {}, locale);
  }
  if (diffMin < 60) {
    return t("time.minutesAgo", { count: diffMin }, locale);
  }
  if (diffHour < 24) {
    return diffHour === 1 ? t("time.hourAgo", {}, locale) : t("time.hoursAgo", { count: diffHour }, locale);
  }
  if (diffDay < 7) {
    return diffDay === 1 ? t("time.dayAgo", {}, locale) : t("time.daysAgo", { count: diffDay }, locale);
  }

  const diffWeek = Math.floor(diffDay / 7);
  return diffWeek === 1 ? t("time.weekAgo", {}, locale) : t("time.weeksAgo", { count: diffWeek }, locale);
}
