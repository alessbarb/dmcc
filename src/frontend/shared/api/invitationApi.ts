import { apiFetch } from "./apiClient.js";
const jsonInit = (method: string, body?: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
export const createInvitation = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/invitations`, { init: jsonInit("POST", payload) });
export const listInvitations = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/invitations`);
export const revokeInvitation = (campaignId: string, invitationId: string) => apiFetch(`/api/campaigns/${campaignId}/invitations/${invitationId}/revoke`, { init: { method: "POST" } });
export const getInvitationByToken = (token: string) => apiFetch(`/api/invitations/${encodeURIComponent(token)}`);
export const acceptInvitation = (token: string, payload?: unknown) => apiFetch(`/api/invitations/${encodeURIComponent(token)}/accept`, { init: jsonInit("POST", payload ?? {}) });
