import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function formatEntityStatus(status: string | undefined | null, locale?: SupportedLocale): string {
  if (!status) return "";
  const key = status.trim().toLowerCase();

  const genericKey = `status.${key}`;
  const genericTranslated = t(genericKey, {}, locale);
  if (genericTranslated !== genericKey) {
    return genericTranslated;
  }

  // Falls back to the broader entity-status vocabulary already localized
  // for kanban boards (hidden, revealed, blocked, dm_only, etc.).
  const boardKey = `boards.statuses.${toCamelCase(key)}`;
  const boardTranslated = t(boardKey, {}, locale);
  if (boardTranslated !== boardKey) {
    return boardTranslated;
  }

  return status.replace(/\b\w/g, c => c.toUpperCase());
}
