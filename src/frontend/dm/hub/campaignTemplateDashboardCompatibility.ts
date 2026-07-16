import type { CampaignTemplateSummary } from "../../shared/stores/campaignStore.js";

type DashboardPayload = Record<string, unknown>;

function isTemplateList(value: unknown): value is CampaignTemplateSummary[] {
  return Array.isArray(value);
}

/**
 * Reads the canonical dashboard field and contains the old response aliases
 * in one boundary while older backend responses are still in circulation.
 */
export function readCampaignTemplatesFromDashboard(
  data: DashboardPayload,
  fallback: CampaignTemplateSummary[]
): CampaignTemplateSummary[] {
  if (isTemplateList(data.campaignTemplates)) return data.campaignTemplates;
  if (isTemplateList(data.premadeTemplates)) return data.premadeTemplates;
  if (isTemplateList(data.premades)) return data.premades;
  return fallback;
}
