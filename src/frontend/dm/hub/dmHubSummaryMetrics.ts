import type { DmHubCampaign } from "./dmHubTypes.js";

export function computeActiveVsPaused(campaigns: DmHubCampaign[]): { active: number; paused: number } {
  let active = 0;
  let paused = 0;
  for (const campaign of campaigns) {
    if (campaign.status === "active" || campaign.stats.activeSession) active += 1;
    else paused += 1;
  }
  return { active, paused };
}

export function computeAverageSessionsPerCampaign(campaigns: DmHubCampaign[]): number {
  if (campaigns.length === 0) return 0;
  const total = campaigns.reduce((sum, campaign) => sum + campaign.stats.sessionsCount, 0);
  return Math.round((total / campaigns.length) * 10) / 10;
}
