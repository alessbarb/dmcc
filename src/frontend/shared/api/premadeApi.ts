import { apiFetch } from "./apiClient.js";
import { detectBrowserLocale } from "@shared/i18n/index.js";
import { readStoredLocale } from "../i18n/localeStorage.js";

export function getPremadeLocale(): string {
  return detectBrowserLocale(readStoredLocale());
}

function withPremadeLocale(path: string, locale = getPremadeLocale()): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}locale=${encodeURIComponent(locale)}`;
}

export const listPremades = (locale = getPremadeLocale()) => apiFetch(withPremadeLocale("/api/premade-campaigns", locale));
export const getPremade = (templateId: string, locale = getPremadeLocale()) => apiFetch(withPremadeLocale(`/api/premade-campaigns/${encodeURIComponent(templateId)}`, locale));
export const importPremade = (templateId: string, options?: { locale?: string; [key: string]: unknown }) => apiFetch(`/api/premade-campaigns/${encodeURIComponent(templateId)}/import`, {
  init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(options ?? {}), locale: options?.locale ?? getPremadeLocale() }) },
});
export const applyPremade = importPremade;
