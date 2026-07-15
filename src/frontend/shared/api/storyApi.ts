import { apiFetch } from "./apiClient.js";

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const loadStoryPlan = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/story`);
export const createStoryThread = (campaignId: string, payload: { title: string; summary?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads`, { init: jsonInit("POST", payload) });
export const updateStoryThread = (campaignId: string, threadId: string, payload: { title?: string; summary?: string | null }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}`, { init: jsonInit("PATCH", payload) });
export const activateStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/activate`, { init: { method: "POST" } });
export const resolveStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/resolve`, { init: { method: "POST" } });
export const discardStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/discard`, { init: { method: "POST" } });
export const deleteStoryThread = (campaignId: string, threadId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}`, { init: { method: "DELETE" } });
export const reorderStoryThreads = (campaignId: string, payload: { orderedThreadIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/reorder`, { init: jsonInit("PATCH", payload) });

export const createStoryStep = (campaignId: string, threadId: string, payload: {
  title: string;
  intent?: string | null;
  expectedOutcome?: string | null;
  sceneEntityId?: string | null;
  plannedSessionId?: string | null;
  plannedSessionOrder?: number | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/steps`, { init: jsonInit("POST", payload) });
export const updateStoryStep = (campaignId: string, stepId: string, payload: {
  title?: string;
  intent?: string | null;
  expectedOutcome?: string | null;
  sceneEntityId?: string | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}`, { init: jsonInit("PATCH", payload) });
export const scheduleStoryStep = (campaignId: string, stepId: string, payload: { plannedSessionId: string; plannedSessionOrder: number }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/schedule`, { init: jsonInit("POST", payload) });
export const deferStoryStep = (campaignId: string, stepId: string, payload: { plannedSessionId: string; plannedSessionOrder: number }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/defer`, { init: jsonInit("POST", payload) });
export const unscheduleStoryStep = (campaignId: string, stepId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/unschedule`, { init: { method: "POST" } });
export const activateStoryStep = (campaignId: string, stepId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/activate`, { init: { method: "POST" } });
export const reconcileStoryStep = (campaignId: string, stepId: string, payload: {
  resolvedSessionId: string;
  status: "resolved" | "discarded";
  resolutionKind: "as_planned" | "changed" | "discarded";
  actualOutcome?: string | null;
}) => apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/reconcile`, { init: jsonInit("POST", payload) });
export const reorderStorySteps = (campaignId: string, threadId: string, payload: { orderedStepIds: string[] }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/steps/reorder`, { init: jsonInit("PATCH", payload) });
export const linkEntityToStoryThread = (campaignId: string, threadId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/link`, { init: jsonInit("POST", payload) });
export const unlinkEntityFromStoryThread = (campaignId: string, threadId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/threads/${threadId}/unlink`, { init: jsonInit("POST", payload) });
export const linkEntityToStoryStep = (campaignId: string, stepId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/link`, { init: jsonInit("POST", payload) });
export const unlinkEntityFromStoryStep = (campaignId: string, stepId: string, payload: { entityId: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/story/steps/${stepId}/unlink`, { init: jsonInit("POST", payload) });
