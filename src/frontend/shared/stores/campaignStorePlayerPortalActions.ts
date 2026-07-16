import { createId } from "@shared/ids.js";
import { playerPortalApi, readApiError } from "../api.js";
import type { CampaignStateStore } from "./campaignStore.js";

type StoreSet = (
  partial: Partial<CampaignStateStore> | ((state: CampaignStateStore) => Partial<CampaignStateStore>)
) => void;

type PlayerPortalActions = Pick<
  CampaignStateStore,
  | "loadPlayerPortalState"
  | "updatePlayerPortalStatus"
  | "upsertPlayerPortalResource"
  | "createPlayerPortalNote"
  | "updatePlayerPortalNote"
  | "createPlayerPortalObjective"
  | "updatePlayerPortalObjective"
  | "createPlayerCharacterProposal"
  | "loadDmPlayerPortalSummary"
  | "resolvePlayerCharacterProposal"
  | "linkPlayerCharacter"
  | "unlinkPlayerCharacter"
>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function playerPortalCampaignId(playerPortalState: unknown): string | undefined {
  if (!isRecord(playerPortalState)) return undefined;
  const campaign = playerPortalState.campaign;
  return isRecord(campaign) && typeof campaign.campaignId === "string" ? campaign.campaignId : undefined;
}

export function createPlayerPortalActions(set: StoreSet, get: () => CampaignStateStore): PlayerPortalActions {
  return {
  loadPlayerPortalState: async (campaignIdOverride) => {
    const campaignId = campaignIdOverride ?? get().activeCampaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!campaignId) return;

    const isAlreadyActivePlayerCampaign = get().activeCampaignId === campaignId && get().activeCampaignRole === "player";
    if (!isAlreadyActivePlayerCampaign) {
      get().enterPlayerCampaign(campaignId);
    }

    const loadId = createId("portal_load");
    set({
      activeCampaignId: campaignId,
      activeCampaignRole: "player",
      activeCampaignLoadId: loadId,
      error: null,
    });

    try {
      const res = await playerPortalApi.getPlayerPortalState(campaignId);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to load player portal state"));
      const playerPortalState = await res.json();
      if (get().activeCampaignId !== campaignId || get().activeCampaignLoadId !== loadId || get().activeCampaignRole !== "player") {
        return;
      }
      set({ playerPortalState });
    } catch (err) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: errorMessage(err) });
      }
    }
  },

  updatePlayerPortalStatus: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.updatePlayerPortalStatus(activeCampaignId, payload);
      if (!res.ok) throw new Error("Failed to update player portal status");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  upsertPlayerPortalResource: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const resourceId = typeof payload?.resourceId === "string" ? payload.resourceId : null;
      const res = resourceId
        ? await playerPortalApi.updatePlayerPortalResource(activeCampaignId, resourceId, payload)
        : await playerPortalApi.createPlayerPortalResource(activeCampaignId, payload);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to upsert player portal resource"));
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  createPlayerPortalNote: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.createPlayerPortalNote(activeCampaignId, payload);
      if (!res.ok) throw new Error("Failed to create player portal note");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  updatePlayerPortalNote: async (noteId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.updatePlayerPortalNote(activeCampaignId, noteId, payload);
      if (!res.ok) throw new Error("Failed to update player portal note");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  createPlayerPortalObjective: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.createPlayerPortalObjective(activeCampaignId, payload);
      if (!res.ok) throw new Error("Failed to create player portal objective");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  updatePlayerPortalObjective: async (objectiveId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.updatePlayerPortalObjective(activeCampaignId, objectiveId, payload);
      if (!res.ok) throw new Error("Failed to update player portal objective");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  createPlayerCharacterProposal: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.createPlayerPortalProposal(activeCampaignId, payload);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to create player character proposal"));
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  loadDmPlayerPortalSummary: async () => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.getPlayerPortalDmSummary(activeCampaignId);
      if (!res.ok) throw new Error("Failed to load DM player portal summary");
      // No backend Zod schema validates this endpoint's response; this is the one place
      // that receives it, so the cast to the frontend contract lives here.
      const dmPlayerPortalSummary = await res.json() as playerPortalApi.DmPlayerPortalSummary;
      if (get().activeCampaignId === activeCampaignId) {
        set({ dmPlayerPortalSummary });
      }
    } catch (err) {
      if (get().activeCampaignId === activeCampaignId) {
        set({ error: errorMessage(err) });
      }
    }
  },

  resolvePlayerCharacterProposal: async (proposalId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.resolvePlayerPortalProposal(activeCampaignId, proposalId, payload);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to resolve player character proposal"));
      await Promise.all([get().loadDmPlayerPortalSummary(), get().reloadCampaignIfActive(activeCampaignId)]);
    } catch (err) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  linkPlayerCharacter: async (playerId, characterEntityId, ownership = "campaign_premade", syncMode = "live_player_editable") => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.linkPlayerCharacter(activeCampaignId, { playerId, characterEntityId, ownership, syncMode });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to link character"));
      await get().loadDmPlayerPortalSummary();
    } catch (err) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },

  unlinkPlayerCharacter: async (playerId) => {
    const activeCampaignId = get().activeCampaignId ?? playerPortalCampaignId(get().playerPortalState) ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await playerPortalApi.unlinkPlayerCharacter(activeCampaignId, playerId);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to unlink character"));
      await Promise.all([get().loadDmPlayerPortalSummary(), get().reloadCampaignIfActive(activeCampaignId)]);
    } catch (err) {
      set({ error: errorMessage(err) });
      throw err;
    }
  },
  };
}
