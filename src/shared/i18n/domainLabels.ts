import type { SupportedLocale } from "./types.js";
import { createTranslator } from "./translate.js";

export function formatEntityType(entityType: string, locale: SupportedLocale = "es"): string {
  const tr = createTranslator(locale);
  const key = `domain.entityTypes.${entityType}`;
  const label = tr.t(key);
  if (label !== key) return label;
  return entityType;
}

export function formatVisibility(kind: string, locale: SupportedLocale = "es"): string {
  const tr = createTranslator(locale);
  const key = `domain.visibility.${kind}`;
  const label = tr.t(key);
  if (label !== key) return label;
  return kind;
}

export function formatRelationType(relationType: string, _locale: SupportedLocale = "es"): string {
  if (relationType.startsWith("custom:")) {
    return relationType.slice(7).replace(/_/g, " ");
  }
  return relationType.replace(/_/g, " ");
}
