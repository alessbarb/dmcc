import type { Campaign, CampaignSettings, CampaignStatus, CampaignSystem } from "./types.js";
import type { CampaignId } from "@shared/ids.js";

export function createCampaign(input: {
  campaignId: CampaignId;
  title: string;
  summary?: string;
  system?: CampaignSystem;
  status?: CampaignStatus;
  coverUrl?: string;
  settings?: CampaignSettings;
  metadata?: Record<string, unknown>;
}): Campaign {
  if (input.title.trim().length === 0) {
    throw new Error("Campaign title is required");
  }
  return {
    campaignId: input.campaignId,
    title: input.title,
    summary: input.summary,
    system: input.system ?? "custom",
    status: input.status ?? "active",
    coverUrl: input.coverUrl,
    settings: input.settings || { activeQuestsLimit: 10 },
    metadata: input.metadata ?? {},
  };
}
