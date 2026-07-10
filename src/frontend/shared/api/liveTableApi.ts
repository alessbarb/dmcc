import { apiFetch } from "./apiClient.js";
const jsonInit = (method: string, body?: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
export const createLiveTable = (campaignId: string, payload?: unknown) => apiFetch(`/api/campaigns/${campaignId}/live-table`, { init: jsonInit("POST", payload ?? {}) });
export const getCurrentLiveTable = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/live-table/current`);
export const closeLiveTable = (campaignId: string, tableId: string) => apiFetch(`/api/campaigns/${campaignId}/live-table/${tableId}/close`, { init: { method: "POST" } });
export const joinLiveTable = (campaignId: string, tableId: string, payload?: unknown) => apiFetch(`/api/campaigns/${campaignId}/live-table/${tableId}/join`, { init: jsonInit("POST", payload ?? {}) });
export const openCampaignEventStream = (campaignId: string) => new EventSource(`/api/campaigns/${campaignId}/events`);
