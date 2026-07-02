import type { CampaignId } from "@shared/ids.js";
import type { CampaignSettings } from "./types.js";

export interface Campaign {
  campaignId: CampaignId;
  title: string;
  summary?: string;
  system?: string;
  status?: string;
  coverUrl?: string;
  currentLocationId?: string;
  currentQuestId?: string;
  createdAt?: string;
  updatedAt?: string;
  settings?: CampaignSettings;
  metadata?: Record<string, unknown>;
  archived: boolean;
}

export function createCampaign(input: {
  campaignId: CampaignId;
  title: string;
  summary?: string;
  system?: string;
  status?: string;
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
    system: input.system || "generic_fantasy_d20",
    status: input.status || "active",
    coverUrl: input.coverUrl,
    settings: input.settings || { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 10 },
    metadata: input.metadata ?? {},
    archived: false,
  };
}
