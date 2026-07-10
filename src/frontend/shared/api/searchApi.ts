import { apiFetch } from "./apiClient.js";
export const searchCampaign = (campaignId: string, query: string) => apiFetch(`/api/campaigns/${campaignId}/search?q=${encodeURIComponent(query)}`);
export const searchPlayerCampaign = (campaignId: string, query: string) => apiFetch(`/api/player/campaigns/${campaignId}/search?q=${encodeURIComponent(query)}`);
