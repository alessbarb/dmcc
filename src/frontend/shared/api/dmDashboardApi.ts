import { apiFetch } from "./apiClient.js";
export const getCommandCenter = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/command-center`);
export const getDmDashboard = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/dashboard`);
export const getWhatNow = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/what-now`);
