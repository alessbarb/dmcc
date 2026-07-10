import { apiFetch } from "./apiClient.js";

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export const listCampaigns = () => apiFetch("/api/campaigns");
export const getCampaign = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}`);
export const loadCampaignState = getCampaign;
export const createCampaign = (payload: unknown) => apiFetch("/api/campaigns", { init: jsonInit("POST", payload) });
export const updateCampaign = (campaignId: string, updates: unknown) => apiFetch(`/api/campaigns/${campaignId}`, { init: jsonInit("PATCH", updates) });
export const deleteCampaign = (campaignId: string, confirmTitle: string) => apiFetch(`/api/campaigns/${campaignId}`, { init: jsonInit("DELETE", { confirmTitle }) });
export const sendCampaignCommand = (campaignId: string, path: string, init?: RequestInit) => apiFetch(`/api/campaigns/${campaignId}${path}`, { init });

export const getCampaignGraph = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/graph`);
export const getCampaignTimeline = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/timeline`);
export const getCampaignVisibility = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/visibility`);
export const getCampaignLanStatus = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/network-status`);
export const listPlayers = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/players`);
export const createPlayer = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/players`, { init: jsonInit("POST", payload) });
export const updatePlayer = (campaignId: string, playerId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/players/${playerId}`, { init: jsonInit("PATCH", payload) });
export const deletePlayer = (campaignId: string, playerId: string) => apiFetch(`/api/campaigns/${campaignId}/players/${playerId}`, { init: { method: "DELETE" } });

export const createEntity = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/entities`, { init: jsonInit("POST", payload) });
export const updateEntity = (campaignId: string, entityId: string, updates: unknown) => apiFetch(`/api/campaigns/${campaignId}/entities/${entityId}`, { init: jsonInit("PATCH", updates) });
export const deleteEntity = (campaignId: string, entityId: string) => apiFetch(`/api/campaigns/${campaignId}/entities/${entityId}`, { init: { method: "DELETE" } });

export const createRelation = (campaignId: string, payload: unknown, force?: boolean) => apiFetch(`/api/campaigns/${campaignId}/relations${force ? "?force=true" : ""}`, { init: jsonInit("POST", payload) });
export const updateRelation = (campaignId: string, relationId: string, updates: unknown) => apiFetch(`/api/campaigns/${campaignId}/relations/${relationId}`, { init: jsonInit("PUT", updates) });
export const deleteRelation = (campaignId: string, relationId: string) => apiFetch(`/api/campaigns/${campaignId}/relations/${relationId}`, { init: { method: "DELETE" } });

export const createFact = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/facts`, { init: jsonInit("POST", payload) });
export const updateFact = (campaignId: string, factId: string, updates: unknown) => apiFetch(`/api/campaigns/${campaignId}/facts/${factId}`, { init: jsonInit("PUT", updates) });

export const createPreparedSession = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions/prepared`, { init: jsonInit("POST", payload) });
export const updateSessionPrep = (campaignId: string, sessionId: string, prep: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/prep`, { init: jsonInit("PATCH", prep) });
export const cancelSession = (campaignId: string, sessionId: string) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/cancel`, { init: jsonInit("POST", {}) });
export const archiveSession = (campaignId: string, sessionId: string) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/archive`, { init: jsonInit("POST", {}) });
export const activateSession = (campaignId: string, sessionId: string) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/activate`, { init: jsonInit("POST", {}) });
export const createSession = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions`, { init: jsonInit("POST", payload) });
export const revealSessionClue = (campaignId: string, sessionId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/reveal-clue`, { init: jsonInit("POST", payload) });
export const closeSession = (campaignId: string, sessionId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/close`, { init: jsonInit("POST", payload) });
export const createSessionEvent = (campaignId: string, sessionId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/sessions/${sessionId}/events`, { init: jsonInit("POST", payload) });

export const exportCampaignJson = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/export/json`, { init: { method: "POST" } });
export const exportCampaignMarkdown = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/export/markdown`, { init: { method: "POST" } });
export const createBackup = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/backups`, { init: { method: "POST" } });
export const restoreBackup = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/restore`, { init: jsonInit("POST", payload) });
export const updateCampaignSettings = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/settings`, { init: jsonInit("PUT", payload) });
export const toggleCampaignLan = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/network/toggle`, { init: jsonInit("POST", payload) });
export const createTag = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/tags`, { init: jsonInit("POST", payload) });
