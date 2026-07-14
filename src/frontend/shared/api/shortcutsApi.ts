import { apiFetch } from "./apiClient.js";

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export const listShortcuts = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/shortcuts`);
export const createShortcut = (campaignId: string, payload: { targetType: string; targetId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/shortcuts`, { init: jsonInit("POST", payload) });
export const reorderShortcuts = (campaignId: string, shortcutIds: string[]) =>
  apiFetch(`/api/campaigns/${campaignId}/shortcuts/reorder`, { init: jsonInit("PATCH", { shortcutIds }) });
export const deleteShortcut = (campaignId: string, shortcutId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/shortcuts/${shortcutId}`, { init: { method: "DELETE" } });
