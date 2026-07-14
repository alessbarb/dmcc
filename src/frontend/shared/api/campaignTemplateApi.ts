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

export const listPremades = (locale = getPremadeLocale()) => apiFetch(withPremadeLocale("/api/campaign-templates", locale));
export const getPremade = (templateId: string, locale = getPremadeLocale()) => apiFetch(withPremadeLocale(`/api/campaign-templates/${encodeURIComponent(templateId)}`, locale));
export const importPremade = (
  templateId: string,
  options?: { locale?: string; [key: string]: unknown },
  headers?: Record<string, string>
) => apiFetch(`/api/campaign-templates/${encodeURIComponent(templateId)}/import`, {
  init: {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify({ ...(options ?? {}), locale: options?.locale ?? getPremadeLocale() }),
  },
});
