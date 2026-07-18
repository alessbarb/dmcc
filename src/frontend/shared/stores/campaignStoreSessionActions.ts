import { createId } from "@shared/ids.js";
import { campaignApi, readApiError } from "../api.js";
import type { CampaignStateStore } from "./campaignStore.js";

type StoreSet = (
  partial: Partial<CampaignStateStore> | ((state: CampaignStateStore) => Partial<CampaignStateStore>)
) => void;

type SessionActions = Pick<
  CampaignStateStore,
  | "createPreparedSession"
  | "reviseSessionPlan"
  | "cancelSession"
  | "archiveSession"
  | "activateSession"
  | "startSession"
  | "revealClue"
  | "closeSession"
  | "recordSessionEvent"
>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createSessionActions(set: StoreSet, get: () => CampaignStateStore): SessionActions {
  return {
  createPreparedSession: async (title, prep, scheduledAt) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const sessionId = `sess_${createId("sess").split("_")[1]}`;
      const res = await campaignApi.createPreparedSession(activeCampaignId, { sessionId, title, scheduledAt, prep: prep ?? { state: "draft" } });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to prepare session"));
      await get().reloadCampaignIfActive(activeCampaignId);
      return sessionId;
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  reviseSessionPlan: async (sessionId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.reviseSessionPlan(activeCampaignId, sessionId, updates);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to revise session plan"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  cancelSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.cancelSession(activeCampaignId, sessionId);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to cancel session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  archiveSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.archiveSession(activeCampaignId, sessionId);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to archive session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  activateSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.activateSession(activeCampaignId, sessionId);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to activate session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  startSession: async (title: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const sessionId = `sess_${createId("sess").split("_")[1]}`;
      const res = await campaignApi.createSession(activeCampaignId, { sessionId, title });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to start session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  revealClue: async (sessionId, clueEntityId, audience, note) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.revealSessionClue(activeCampaignId, sessionId, { clueEntityId, audience, note });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to reveal clue"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  closeSession: async (sessionId, summary) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.closeSession(activeCampaignId, sessionId, { summary });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to close session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  recordSessionEvent: async (sessionId, eventData) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.createSessionEvent(activeCampaignId, sessionId, { ...eventData });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to record session event"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },
  };
}
