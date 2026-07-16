import { apiFetch } from "./apiClient.js";
import { detectBrowserLocale } from "@shared/i18n/index.js";
import { readStoredLocale } from "../i18n/localeStorage.js";

export function getCampaignTemplateLocale(): string {
  return detectBrowserLocale(readStoredLocale());
}

function withCampaignTemplateLocale(path: string, locale = getCampaignTemplateLocale()): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}locale=${encodeURIComponent(locale)}`;
}

export const listCampaignTemplates = (locale = getCampaignTemplateLocale()) => apiFetch(withCampaignTemplateLocale("/api/campaign-templates", locale));
export const getCampaignTemplate = (templateId: string, locale = getCampaignTemplateLocale()) => apiFetch(withCampaignTemplateLocale(`/api/campaign-templates/${encodeURIComponent(templateId)}`, locale));
export const importCampaignTemplate = (
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
    body: JSON.stringify({ ...(options ?? {}), locale: options?.locale ?? getCampaignTemplateLocale() }),
  },
});
