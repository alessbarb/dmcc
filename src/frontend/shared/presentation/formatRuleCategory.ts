import { t } from "../../../shared/i18n/translate.js";
import type { SupportedLocale } from "../../../shared/i18n/localeTypes.js";
import { RULE_CATEGORY_IDS } from "@shared/rules/categories.js";

const CATEGORY_KEY_BY_VALUE = new Map<string, string>(
  Object.entries(RULE_CATEGORY_IDS).map(([key, value]) => [value, key]),
);

export function formatRuleCategory(category: string, locale?: SupportedLocale): string {
  const key = CATEGORY_KEY_BY_VALUE.get(category);
  if (!key) return category;
  const translationKey = `rules.categories.${key}`;
  const translated = t(translationKey, {}, locale);
  return translated === translationKey ? category : translated;
}
