import { create } from "zustand";
import { createId } from "../../shared/ids.js";

export interface Campaign {
  campaignId: string;
  title: string;
  summary?: string;
  status?: string;
  system?: string;
  archived?: boolean;
  currentLocationId?: string;
  currentQuestId?: string;
}

export interface Entity {
  entityId: string;
  campaignId: string;
  entityType: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  status: string;
  importance: string;
  visibility: any;
  metadata: any;
  tagIds: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Relation {
  relationId: string;
  campaignId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  status: string;
  description?: string;
  visibility: any;
  archived: boolean;
}

export interface Fact {
  factId: string;
  campaignId: string;
  statement: string;
  kind: string;
  confidence: string;
  visibility: any;
  relatedEntityIds: string[];
  source: any;
  archived: boolean;
}

export interface Session {
  sessionId: string;
  campaignId: string;
  title: string;
  status: string;
  number?: number;
  summary?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface PlayerProfile {
  playerId: string;
  campaignId: string;
  name: string;
  displayName?: string;
  email?: string | null;
  archived: boolean;
  createdAt: string;
  imageUrl?: string;
}

export interface CampaignStateStore {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  campaignState: {
    campaign: Campaign | null;
    entities: Entity[];
    relations: Relation[];
    facts: Fact[];
    sessions: Session[];
    players: PlayerProfile[];
  } | null;
  
  vaults: any[];
  activeVaultId: string;
  
  dashboard: any | null;
  whatNow: any | null;
  graph: { nodes: any[]; edges: any[] } | null;
  timeline: { events: any[] } | null;
  visibility: any | null;
  lanStatus: { lanModeEnabled: boolean; accessCode: string | null; localIp: string; port: number; joinUrl: string } | null;
  
  loading: boolean;
  error: string | null;

  isEntityModalOpen: boolean;
  setIsEntityModalOpen: (open: boolean) => void;
  isRelationModalOpen: boolean;
  setIsRelationModalOpen: (open: boolean) => void;

  fetchVaults: () => Promise<void>;
  createVault: (name: string) => Promise<void>;
  setActiveVaultId: (vaultId: string) => void;
  
  fetchCampaigns: () => Promise<void>;
  selectCampaign: (campaignId: string) => Promise<void>;
  createCampaign: (title: string, system: string) => Promise<void>;

  createEntity: (payload: {
    entityType: string;
    title: string;
    subtitle?: string;
    summary?: string;
    content?: string;
    status?: string;
    importance?: string;
    visibility?: any;
    metadata?: any;
    tagIds?: string[];
    createdInSessionId?: string;
    entityId?: string;
  }) => Promise<void>;
  
  createRelation: (payload: {
    sourceEntityId: string;
    targetEntityId: string;
    relationType: string;
    force?: boolean;
  }) => Promise<void>;
  
  createFact: (payload: {
    statement: string;
    kind: string;
    confidence: string;
    relatedEntityIds: string[];
    source: any;
  }) => Promise<void>;
  
  updateEntity: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  archiveEntity: (entityId: string) => Promise<void>;
  archiveRelation: (relationId: string) => Promise<void>;

  createPlayer: (name: string, displayName?: string, email?: string, imageUrl?: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<PlayerProfile>) => Promise<void>;
  archivePlayer: (playerId: string) => Promise<void>;

  startSession: (title: string) => Promise<void>;
  revealClue: (sessionId: string, clueEntityId: string, audience: any, note?: string) => Promise<void>;
  closeSession: (sessionId: string, summary: string) => Promise<void>;
  recordSessionEvent: (sessionId: string, eventData: {
    type: string;
    title: string;
    description?: string;
    relatedEntityIds?: string[];
    relatedFactIds?: string[];
    relatedRelationIds?: string[];
  }) => Promise<void>;
  updateCampaignSettings: (settings: any) => Promise<void>;
  toggleLanMode: (enabled: boolean) => Promise<any>;

  exportJson: () => Promise<{ path: string }>;
  exportMarkdown: () => Promise<{ path: string }>;
  createBackup: () => Promise<{ path: string }>;
  restoreBackup: (backupId: string) => Promise<void>;

  createTag: (name: string, color?: string) => Promise<{ tagId: string; name: string; color?: string }>;
}

const fetchWithVault = (url: string, init?: RequestInit) => {
  const vaultId = useCampaignStore.getState().activeVaultId || "default";
  const headers = new Headers(init?.headers);
  headers.set("x-vault-id", vaultId);
  
  // Player portal headers if present
  const playerRole = sessionStorage.getItem("dmcc_role");
  const playerId = sessionStorage.getItem("dmcc_playerId");
  const accessCode = sessionStorage.getItem("dmcc_accessCode");
  const dmToken = sessionStorage.getItem("dmcc_dmSessionToken");
  const playerToken = sessionStorage.getItem("dmcc_playerToken");

  if (playerRole) {
    headers.set("x-role", playerRole);
  }
  if (playerId) {
    headers.set("x-player-id", playerId);
  }
  if (accessCode) {
    headers.set("x-access-code", accessCode);
  }
  if (dmToken) {
    headers.set("x-dm-token", dmToken);
  }
  if (playerToken) {
    headers.set("x-player-token", playerToken);
  }

  return fetch(url, {
    ...init,
    headers
  });
};

export const useCampaignStore = create<CampaignStateStore>((set, get) => ({
  campaigns: [],
  activeCampaignId: null,
  campaignState: null,
  vaults: [],
  activeVaultId: "default",
  dashboard: null,
  whatNow: null,
  graph: null,
  timeline: null,
  visibility: null,
  lanStatus: null,
  loading: false,
  error: null,

  isEntityModalOpen: false,
  setIsEntityModalOpen: (open) => set({ isEntityModalOpen: open }),
  isRelationModalOpen: false,
  setIsRelationModalOpen: (open) => set({ isRelationModalOpen: open }),

  fetchVaults: async () => {
    try {
      const res = await fetchWithVault("/api/vaults");
      if (res.ok) {
        const vaults = await res.json();
        set({ vaults });
      }
    } catch (e) {
      console.error(e);
    }
  },

  createVault: async (name: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error("Failed to create vault");
      const vaultInfo = await res.json();
      await get().fetchVaults();
      set({ activeVaultId: vaultInfo.vaultId, loading: false });
      await get().fetchCampaigns();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setActiveVaultId: (vaultId: string) => {
    set({ activeVaultId: vaultId });
    get().fetchCampaigns();
  },

  fetchCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault("/api/campaigns");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Failed to fetch campaigns (${res.status})`;
        throw new Error(message);
      }
      const campaigns = await res.json();
      set({ campaigns, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  selectCampaign: async (campaignId: string) => {
    set({ loading: true, error: null, activeCampaignId: campaignId });
    try {
      // 1. Fetch details (snapshot)
      const resDetails = await fetchWithVault(`/api/campaigns/${campaignId}`);
      if (!resDetails.ok) throw new Error("Failed to load campaign state");
      const campaignState = await resDetails.json();
      
      const role = sessionStorage.getItem("dmcc_role") || "dm";
      
      let dashboard = null;
      let whatNow = null;
      let graph = null;
      let timeline = null;
      let visibility = null;
      let lanStatus = null;

      if (role === "dm") {
        // 2. Fetch projections (only for DM)
        const [resDashboard, resWhatNow, resGraph, resTimeline, resVisibility, resLanStatus] = await Promise.all([
          fetchWithVault(`/api/campaigns/${campaignId}/dashboard`),
          fetchWithVault(`/api/campaigns/${campaignId}/what-now`),
          fetchWithVault(`/api/campaigns/${campaignId}/graph`),
          fetchWithVault(`/api/campaigns/${campaignId}/timeline`),
          fetchWithVault(`/api/campaigns/${campaignId}/visibility`),
          fetchWithVault(`/api/campaigns/${campaignId}/lan-status`),
        ]);

        dashboard = resDashboard.ok ? await resDashboard.json() : null;
        whatNow = resWhatNow.ok ? await resWhatNow.json() : null;
        graph = resGraph.ok ? await resGraph.json() : null;
        timeline = resTimeline.ok ? await resTimeline.json() : null;
        visibility = resVisibility.ok ? await resVisibility.json() : null;
        lanStatus = resLanStatus.ok ? await resLanStatus.json() : null;
      } else {
        // For players, we can fetch filtered graph
        const resGraph = await fetchWithVault(`/api/campaigns/${campaignId}/graph`);
        graph = resGraph.ok ? await resGraph.json() : null;
      }
      
      // Ensure players array exists in campaignState
      if (campaignState && !campaignState.players) {
        campaignState.players = [];
      }
      if (role === "dm") {
        const resPlayers = await fetchWithVault(`/api/campaigns/${campaignId}/players`);
        if (resPlayers.ok) {
          campaignState.players = await resPlayers.json();
        }
      }

      set({
        campaignState,
        dashboard,
        whatNow,
        graph,
        timeline,
        visibility,
        lanStatus,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createCampaign: async (title: string, system: string) => {
    set({ loading: true, error: null });
    try {
      const campaignId = `cmp_${createId("cmp").split("_")[1]}`;
      const res = await fetchWithVault("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, actorId: "usr_dm", title, system })
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      await get().fetchCampaigns();
      await get().selectCampaign(campaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createEntity: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const entityId = payload.entityId || `ent_${createId("ent").split("_")[1]}`;
      const role = sessionStorage.getItem("dmcc_role") || "dm";
      const actorId = role === "player" ? (sessionStorage.getItem("dmcc_playerId") || "usr_player") : "usr_dm";
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId,
          entityId,
          ...payload
        })
      });
      if (!res.ok) throw new Error("Failed to create entity");
      const data = await res.json();
      await get().selectCampaign(activeCampaignId);
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createRelation: async (payload: any) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const relationId = `rel_${createId("rel").split("_")[1]}`;
      const { force, ...rest } = payload;
      const url = `/api/campaigns/${activeCampaignId}/relations${force ? "?force=true" : ""}`;
      const res = await fetchWithVault(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", relationId, ...rest })
      });
      if (res.status === 409) {
        set({ error: `Duplicate relation: this exact connection already exists.`, loading: false });
        return;
      }
      if (!res.ok) throw new Error("Failed to create relation");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createFact: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const factId = `fact_${createId("fact").split("_")[1]}`;
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/facts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          factId,
          ...payload
        })
      });
      if (!res.ok) throw new Error("Failed to record fact");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateEntity: async (entityId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const role = sessionStorage.getItem("dmcc_role") || "dm";
      const actorId = role === "player" ? (sessionStorage.getItem("dmcc_playerId") || "usr_player") : "usr_dm";
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/entities/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update entity");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  archiveEntity: async (entityId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/entities/${entityId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" }),
      });
      if (!res.ok) throw new Error("Failed to archive entity");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  archiveRelation: async (relationId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/relations/${relationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" }),
      });
      if (!res.ok) throw new Error("Failed to archive relation");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPlayer: async (name, displayName, email, imageUrl) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const playerId = `ply_${createId("ply").split("_")[1]}`;
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          playerId,
          name,
          displayName: displayName ?? name,
          email: email ?? null,
          imageUrl: imageUrl ?? ""
        }),
      });
      if (!res.ok) throw new Error("Failed to create player");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updatePlayer: async (playerId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update player");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  archivePlayer: async (playerId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/players/${playerId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" }),
      });
      if (!res.ok) throw new Error("Failed to archive player");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  startSession: async (title: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const sessionId = `sess_${createId("sess").split("_")[1]}`;
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          sessionId,
          title
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start session");
      }
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  revealClue: async (sessionId, clueEntityId, audience, note) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/reveal-clue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          clueEntityId,
          audience,
          note
        })
      });
      if (!res.ok) throw new Error("Failed to reveal clue");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  closeSession: async (sessionId, summary) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          summary
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to close session");
      }
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  recordSessionEvent: async (sessionId, eventData) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          ...eventData
        })
      });
      if (!res.ok) throw new Error("Failed to record session event");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  exportJson: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/export/json`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to export JSON");
    return res.json();
  },

  exportMarkdown: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/export/markdown`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to export Markdown");
    return res.json();
  },

  createBackup: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/backups`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create backup");
    return res.json();
  },

  restoreBackup: async (backupId: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId })
      });
      if (!res.ok) throw new Error("Failed to restore backup");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateCampaignSettings: async (settings) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to update settings");
      await get().selectCampaign(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  toggleLanMode: async (enabled) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/lan/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error("Failed to toggle LAN mode");
      const data = await res.json();
      await get().selectCampaign(activeCampaignId);
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createTag: async (name: string, color?: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  },
}));
