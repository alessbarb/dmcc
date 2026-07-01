import { create } from "zustand";
import { createId } from "@shared/ids.js";
import { resolveActiveCanvasId } from "../utils/canvasSelection.js";
import { markCampaignGuidedTourPending } from "../../dm/onboarding/campaignGuidedTourStorage.js";
import { apiFetch, readApiError } from "../api/apiClient.js";

function getPremadeLocale(): string {
  try {
    const saved = localStorage.getItem("dmcc_language");
    if (saved) return saved.toLowerCase().split(/[._-]/)[0] || "en";
    return (navigator.language || "en").toLowerCase().split(/[._-]/)[0] || "en";
  } catch {}
  return "en";
}

function withPremadeLocale(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}locale=${encodeURIComponent(getPremadeLocale())}`;
}

type ActiveCampaignRole = "dm" | "player";

function getActiveSessionRole(): ActiveCampaignRole {
  return "dm";
}

const campaignScopedReset = () => ({
  campaignState: null,
  canvasesById: {},
  activeCanvasId: null,
  dashboard: null,
  whatNow: null,
  graph: null,
  timeline: null,
  visibility: null,
  lanStatus: null,
  dmPlayerPortalSummary: null,
});

const playerScopedReset = () => ({
  playerPortalState: null,
});

function buildCanvasesById(campaignState: any): Record<string, any> {
  const canvasesById: Record<string, any> = {};
  if (campaignState?.canvases) {
    campaignState.canvases.forEach((canvas: any) => {
      const canvasId = typeof canvas?.id === "string" ? canvas.id : typeof canvas?.canvasId === "string" ? canvas.canvasId : null;
      if (canvasId) canvasesById[canvasId] = canvas;
    });
  }
  return canvasesById;
}

export interface PremadeCampaignTemplateSummary {
  templateId: string;
  version: string;
  title: string;
  subtitle: string;
  description: string;
  locale: string;
  defaultLocale?: string;
  availableLocales?: string[];
  system: string;
  difficulty: "starter" | "medium" | "advanced";
  recommendedFor: string;
  tags: string[];
  pitch?: string;
  learningGoals?: string[];
  includedMaterial?: string[];
  quickStart?: { title: string; steps: string[] };
  highlightEntityIds?: string[];
  featuredFactIds?: string[];
  featuredRelationIds?: string[];
  file?: string;
  stats: {
    entities: number;
    relations: number;
    facts: number;
    preparedSessions: number;
  };
}

export interface PremadeCampaignTemplate extends PremadeCampaignTemplateSummary {
  schemaVersion?: number;
  summary: string;
  entities: Array<{
    entityId: string;
    entityType: string;
    title: string;
    subtitle?: string;
    summary?: string;
    content?: string;
    status?: string;
    importance?: string;
    visibility?: any;
    metadata?: Record<string, unknown>;
  }>;
  relations: Array<{
    relationId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationType: string;
    description?: string;
    visibility?: any;
  }>;
  facts: Array<{
    factId: string;
    statement: string;
    kind: string;
    confidence: string;
    visibility?: any;
    relatedEntityIds?: string[];
  }>;
  sessions: Array<{
    sessionId: string;
    title: string;
    scheduledAt?: string;
    prep?: any;
  }>;
  canvases: Array<{
    canvasId: string;
    title: string;
    kind: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
  }>;
}

export interface Campaign {
  campaignId: string;
  title: string;
  summary?: string;
  status?: string;
  system?: string;
  archived?: boolean;
  currentLocationId?: string;
  currentQuestId?: string;
  metadata?: Record<string, unknown>;
  stats?: any;
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
  createdInSessionId?: string;
  firstSeenSessionId?: string;
  lastSeenSessionId?: string;
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
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  prep?: {
    state?: "draft" | "ready";
    summary?: string;
    openingPrompt?: string;
    goals?: string[];
    sceneIds?: string[];
    involvedEntityIds?: string[];
    availableClueIds?: string[];
    secretsAtRiskIds?: string[];
    expectedConsequenceIds?: string[];
    checklist?: Array<{ id: string; label: string; done?: boolean; priority?: "low" | "medium" | "high" }>;
    notes?: string;
  };
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
  premadeTemplates: PremadeCampaignTemplateSummary[];
  premadeTemplatesLocale: string | null;
  activePremadeTemplate: PremadeCampaignTemplate | null;
  activePremadeTemplateKey: string | null;
  activeCampaignId: string | null;
  activeCampaignLoadId: string | null;
  activeCampaignRole: ActiveCampaignRole;
  campaignState: {
    campaign: Campaign | null;
    entities: Entity[];
    relations: Relation[];
    facts: Fact[];
    sessions: Session[];
    sessionEvents?: any[];
    players: PlayerProfile[];
    canvases: any[];
  } | null;
  
  canvasesById: Record<string, any>;
  activeCanvasId: string | null;
  activeCanvasIdByCampaignId: Record<string, string | null>;
  
  vaults: any[];
  activeVaultId: string;
  
  dashboard: any | null;
  whatNow: any | null;
  graph: { nodes: any[]; edges: any[] } | null;
  timeline: { events: any[] } | null;
  visibility: any | null;
  lanStatus: { lanModeEnabled: boolean; accessCode: string | null; localIp: string; port: number; joinUrl: string } | null;

  playerPortalState: any | null;
  dmPlayerPortalSummary: any | null;

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
  fetchPremadeCampaigns: () => Promise<void>;
  fetchPremadeCampaignTemplate: (templateId: string) => Promise<PremadeCampaignTemplate | null>;
  importPremadeCampaign: (templateId: string, options?: { title?: string; summary?: string; importMode?: "full" | "structure" | "sessions"; locale?: string }) => Promise<string | undefined>;
  updateCampaign: (campaignId: string, updates: { title?: string; summary?: string; system?: string; status?: string; metadata?: Record<string, unknown> }) => Promise<Campaign | undefined>;
  selectCampaign: (campaignId: string) => Promise<void>;
  enterDmCampaign: (campaignId: string) => void;
  enterPlayerCampaign: (campaignId: string) => void;
  leavePlayerPortal: () => void;
  reloadCampaign: () => Promise<void>;
  reloadCampaignIfActive: (campaignId: string) => Promise<void>;
  clearCampaign: () => void;
  createCampaign: (title: string, system: string) => Promise<string | undefined>;
  deleteCampaign: (campaignId: string, confirmTitle: string) => Promise<void>;

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
  }) => Promise<Entity | any>;
  
  createRelation: (payload: {
    relationId?: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationType: string;
    description?: string;
    visibility?: any;
    force?: boolean;
  }) => Promise<string | undefined>;
  
  createFact: (payload: {
    statement: string;
    kind: string;
    confidence: string;
    relatedEntityIds: string[];
    source: any;
  }) => Promise<string | undefined>;

  updateFact: (factId: string, updates: {
    statement?: string;
    kind?: string;
    confidence?: string;
    visibility?: any;
  }) => Promise<void>;

  updateEntity: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  archiveEntity: (entityId: string) => Promise<void>;
  archiveRelation: (relationId: string) => Promise<void>;
  updateRelation: (relationId: string, updates: { description?: string; visibility?: any }) => Promise<void>;

  createPlayer: (name: string, displayName?: string, email?: string, imageUrl?: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<PlayerProfile>) => Promise<void>;
  archivePlayer: (playerId: string) => Promise<void>;

  createPreparedSession: (title: string, prep?: Session["prep"], scheduledAt?: string) => Promise<string | undefined>;
  updateSessionPrep: (sessionId: string, updates: { title?: string; scheduledAt?: string; prep: Session["prep"] }) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  activateSession: (sessionId: string) => Promise<void>;
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
  exportMarkdown: () => Promise<{
    campaignId: string;
    format: "markdown";
    exportId: string;
    path: string;
    primaryFile: string;
    downloadUrl: string;
    fileCount: number;
  }>;
  createBackup: () => Promise<{ path: string }>;
  restoreBackup: (backupId: string) => Promise<void>;

  createTag: (name: string, color?: string) => Promise<{ tagId: string; name: string; color?: string }>;

  loadPlayerPortalState: (campaignIdOverride?: string) => Promise<void>;
  updatePlayerPortalStatus: (payload: any) => Promise<void>;
  upsertPlayerPortalResource: (payload: any) => Promise<void>;
  createPlayerPortalNote: (payload: any) => Promise<void>;
  updatePlayerPortalNote: (noteId: string, payload: any) => Promise<void>;
  createPlayerPortalObjective: (payload: any) => Promise<void>;
  updatePlayerPortalObjective: (objectiveId: string, payload: any) => Promise<void>;
  createPlayerCharacterProposal: (payload: any) => Promise<void>;
  loadDmPlayerPortalSummary: () => Promise<void>;
  resolvePlayerCharacterProposal: (proposalId: string, payload: any) => Promise<void>;
  linkPlayerCharacter: (playerId: string, characterEntityId: string, ownership?: string, syncMode?: string) => Promise<void>;
  unlinkPlayerCharacter: (playerId: string) => Promise<void>;

  createCanvas: (title: string, kind: string, description?: string) => Promise<void>;
  setActiveCanvasId: (canvasId: string | null) => void;
  placeNodeOnCanvas: (canvasId: string, node: any) => Promise<void>;
  updateCanvasNode: (canvasId: string, nodeId: string, updates: any) => Promise<void>;
  updateCanvasNodesLayout: (canvasId: string, nodeUpdates: Array<{ nodeId: string; x: number; y: number; width?: number; height?: number; parentId?: string | null; groupId?: string | null }>) => Promise<void>;
  removeNodeFromCanvas: (canvasId: string, nodeId: string) => Promise<void>;
  addEdgeToCanvas: (canvasId: string, edge: any) => Promise<void>;
  updateCanvasEdge: (canvasId: string, edgeId: string, updates: any) => Promise<void>;
  removeEdgeFromCanvas: (canvasId: string, edgeId: string) => Promise<void>;
  convertNoteToEntity: (canvasId: string, nodeId: string, payload: any) => Promise<void>;
  saveViewport: (canvasId: string, viewport: { x: number; y: number; zoom: number }) => Promise<void>;
}

const fetchWithVault = (url: string, init?: RequestInit): Promise<Response> => {
  const vaultId: string = useCampaignStore.getState().activeVaultId || "default";
  return apiFetch(url, { vaultId, init });
};

const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("dmcc_campaign_sync") : null;

const broadcastMutation = (campaignId: string) => {
  if (syncChannel) {
    const vaultId = useCampaignStore.getState().activeVaultId || "default";
    syncChannel.postMessage({ type: "MUTATION", vaultId, campaignId });
  }
};

export const useCampaignStore = create<CampaignStateStore>((set, get) => ({
  campaigns: [],
  premadeTemplates: [],
  premadeTemplatesLocale: null,
  activePremadeTemplate: null,
  activePremadeTemplateKey: null,
  activeCampaignId: null,
  activeCampaignLoadId: null,
  activeCampaignRole: "dm",
  campaignState: null,
  canvasesById: {},
  activeCanvasId: null,
  activeCanvasIdByCampaignId: {},
  vaults: [],
  activeVaultId: "default",
  dashboard: null,
  whatNow: null,
  graph: null,
  timeline: null,
  visibility: null,
  lanStatus: null,
  playerPortalState: null,
  dmPlayerPortalSummary: null,
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
      set({
        activeVaultId: vaultInfo.vaultId,
        campaigns: [],
        activeCampaignId: null,
        activeCampaignLoadId: null,
        activeCampaignRole: "dm",
        activeCanvasIdByCampaignId: {},
        ...campaignScopedReset(),
        ...playerScopedReset(),
        loading: false,
        error: null,
      });
      await get().fetchCampaigns();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setActiveVaultId: (vaultId: string) => {
    set({
      activeVaultId: vaultId,
      campaigns: [],
      activeCampaignId: null,
      activeCampaignLoadId: null,
      activeCampaignRole: "dm",
      activeCanvasIdByCampaignId: {},
      ...campaignScopedReset(),
      ...playerScopedReset(),
      loading: false,
      error: null,
    });
    void get().fetchCampaigns();
  },

  fetchCampaigns: async () => {
    const vaultId = get().activeVaultId || "default";
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault("/api/campaigns");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Failed to fetch campaigns (${res.status})`;
        throw new Error(message);
      }
      const campaigns = await res.json();
      if ((get().activeVaultId || "default") !== vaultId) return;
      set({ campaigns, loading: false });
    } catch (err: any) {
      if ((get().activeVaultId || "default") === vaultId) {
        set({ error: err.message, loading: false });
      }
    }
  },

  fetchPremadeCampaigns: async () => {
    const locale = getPremadeLocale();
    try {
      const res = await fetchWithVault(withPremadeLocale("/api/premade-campaigns"));
      if (!res.ok) {
        const message = await readApiError(res, "Failed to fetch premade campaigns");
        throw new Error(message);
      }
      const data = await res.json();
      set({ premadeTemplates: Array.isArray(data.templates) ? data.templates : [], premadeTemplatesLocale: locale });
    } catch (err: any) {
      set({ premadeTemplates: [], premadeTemplatesLocale: locale, error: err.message });
    }
  },

  fetchPremadeCampaignTemplate: async (templateId) => {
    const locale = getPremadeLocale();
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(withPremadeLocale(`/api/premade-campaigns/${encodeURIComponent(templateId)}`));
      if (!res.ok) {
        const message = await readApiError(res, "Failed to fetch premade campaign");
        throw new Error(message);
      }
      const template = await res.json() as PremadeCampaignTemplate;
      set({ activePremadeTemplate: template, activePremadeTemplateKey: `${templateId}:${locale}`, loading: false });
      return template;
    } catch (err: any) {
      set({ activePremadeTemplate: null, activePremadeTemplateKey: null, error: err.message, loading: false });
      return null;
    }
  },

  importPremadeCampaign: async (templateId, options) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/premade-campaigns/${encodeURIComponent(templateId)}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(options ?? {}), locale: options?.locale ?? getPremadeLocale() }),
      });
      if (!res.ok) {
        const message = await readApiError(res, "Failed to import premade campaign");
        throw new Error(message);
      }
      const data = await res.json();
      await get().fetchCampaigns();
      markCampaignGuidedTourPending(data.campaignId);
      await get().selectCampaign(data.campaignId);
      return data.campaignId as string;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  enterDmCampaign: (campaignId: string) => {
    set({
      activeCampaignId: campaignId,
      activeCampaignRole: "dm",
      activeCampaignLoadId: null,
      ...campaignScopedReset(),
      ...playerScopedReset(),
      loading: false,
      error: null,
    });
  },

  enterPlayerCampaign: (campaignId: string) => {
    set({
      activeCampaignId: campaignId,
      activeCampaignRole: "player",
      activeCampaignLoadId: null,
      ...campaignScopedReset(),
      ...playerScopedReset(),
      loading: false,
      error: null,
    });
  },

  leavePlayerPortal: () => {
    set({
      activeCampaignId: null,
      activeCampaignLoadId: null,
      activeCampaignRole: "dm",
      ...campaignScopedReset(),
      ...playerScopedReset(),
      loading: false,
      error: null,
    });
  },

  selectCampaign: async (campaignId: string) => {
    const loadId = createId("load");
    const role = getActiveSessionRole();

    set({
      loading: true,
      error: null,
      activeCampaignId: campaignId,
      activeCampaignRole: role,
      activeCampaignLoadId: loadId,
      ...campaignScopedReset(),
      ...(role === "dm" ? playerScopedReset() : {}),
    });

    try {
      const resDetails = await fetchWithVault(`/api/campaigns/${campaignId}`);
      if (!resDetails.ok) throw new Error("Failed to load campaign state");
      const campaignState = await resDetails.json();

      let dashboard = null;
      let whatNow = null;
      let graph = null;
      let timeline = null;
      let visibility = null;
      let lanStatus = null;

      if (role === "dm") {
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
        const resGraph = await fetchWithVault(`/api/campaigns/${campaignId}/graph`);
        graph = resGraph.ok ? await resGraph.json() : null;
      }

      if (campaignState && !campaignState.players) {
        campaignState.players = [];
      }
      if (role === "dm") {
        const resPlayers = await fetchWithVault(`/api/campaigns/${campaignId}/players`);
        if (resPlayers.ok) {
          campaignState.players = await resPlayers.json();
        }
      }

      if (get().activeCampaignId !== campaignId || get().activeCampaignLoadId !== loadId) {
        return;
      }

      const canvasesById = buildCanvasesById(campaignState);
      const preferredCanvasId = get().activeCanvasIdByCampaignId[campaignId] ?? null;
      const nextActiveCanvasId = resolveActiveCanvasId(canvasesById, preferredCanvasId);

      set({
        campaignState,
        canvasesById,
        activeCanvasId: nextActiveCanvasId,
        activeCanvasIdByCampaignId: {
          ...get().activeCanvasIdByCampaignId,
          [campaignId]: nextActiveCanvasId,
        },
        dashboard,
        whatNow,
        graph,
        timeline,
        visibility,
        lanStatus,
        loading: false,
      });
    } catch (err: any) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: err.message, loading: false });
      }
    }
  },

  reloadCampaign: async () => {
    const campaignId = get().activeCampaignId;
    if (!campaignId) return;
    await get().reloadCampaignIfActive(campaignId);
  },

  reloadCampaignIfActive: async (campaignId: string) => {
    if (get().activeCampaignId !== campaignId) return;

    const loadId = createId("reload");
    const role = get().activeCampaignRole || getActiveSessionRole();
    set({ activeCampaignLoadId: loadId, error: null });

    try {
      const resDetails = await fetchWithVault(`/api/campaigns/${campaignId}`);
      if (!resDetails.ok) throw new Error("Failed to load campaign state");
      const campaignState = await resDetails.json();

      let dashboard = null;
      let whatNow = null;
      let graph = null;
      let timeline = null;
      let visibility = null;
      let lanStatus = null;

      if (role === "dm") {
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
        const resGraph = await fetchWithVault(`/api/campaigns/${campaignId}/graph`);
        graph = resGraph.ok ? await resGraph.json() : null;
      }

      if (campaignState && !campaignState.players) {
        campaignState.players = [];
      }
      if (role === "dm") {
        const resPlayers = await fetchWithVault(`/api/campaigns/${campaignId}/players`);
        if (resPlayers.ok) {
          campaignState.players = await resPlayers.json();
        }
      }

      if (get().activeCampaignId !== campaignId || get().activeCampaignLoadId !== loadId) {
        return;
      }

      const canvasesById = buildCanvasesById(campaignState);
      const preferredCanvasId = get().activeCanvasIdByCampaignId[campaignId] ?? get().activeCanvasId;
      const nextActiveCanvasId = resolveActiveCanvasId(canvasesById, preferredCanvasId);

      set({
        campaignState,
        canvasesById,
        activeCanvasId: nextActiveCanvasId,
        activeCanvasIdByCampaignId: {
          ...get().activeCanvasIdByCampaignId,
          [campaignId]: nextActiveCanvasId,
        },
        dashboard,
        whatNow,
        graph,
        timeline,
        visibility,
        lanStatus,
        loading: false,
      });
    } catch (err: any) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: err.message, loading: false });
      }
      console.error("Silent reload failed", err);
    }
  },

  clearCampaign: () => {
    set({
      activeCampaignId: null,
      activeCampaignLoadId: null,
      activeCampaignRole: "dm",
      ...campaignScopedReset(),
      ...playerScopedReset(),
      loading: false,
      error: null,
    });
  },

  deleteCampaign: async (campaignId: string, confirmTitle: string) => {
    const res = await fetchWithVault(`/api/campaigns/${campaignId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmTitle }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any).error || `Failed to delete campaign (${res.status})`);
    }
    const { [campaignId]: _deletedCanvasId, ...remainingCanvasSelections } = get().activeCanvasIdByCampaignId;
    set({ activeCanvasIdByCampaignId: remainingCanvasSelections });
    if (get().activeCampaignId === campaignId) {
      get().clearCampaign();
    }
    await get().fetchCampaigns();
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
      markCampaignGuidedTourPending(campaignId);
      await get().selectCampaign(campaignId);
      return campaignId;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateCampaign: async (campaignId, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const message = await readApiError(res, "Failed to update campaign");
        throw new Error(message);
      }
      const data = await res.json();
      await get().fetchCampaigns();
      if (get().activeCampaignId === campaignId) {
        await get().reloadCampaign();
      }
      set({ loading: false });
      return data.campaign as Campaign;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      await get().reloadCampaignIfActive(activeCampaignId);
      return { ...data, entityId };
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
      const relationId = payload.relationId || `rel_${createId("rel").split("_")[1]}`;
      const { force, ...rest } = payload;
      const url = `/api/campaigns/${activeCampaignId}/relations${force ? "?force=true" : ""}`;
      const res = await fetchWithVault(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", relationId, ...rest })
      });
      if (res.status === 409) {
        const message = "Duplicate relation: this exact connection already exists.";
        set({ error: message, loading: false });
        throw new Error(message);
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to create relation");
      }
      await get().reloadCampaignIfActive(activeCampaignId);
      return relationId;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createFact: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    const factId = `fact_${createId("fact").split("_")[1]}`;
    try {
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
      await get().reloadCampaignIfActive(activeCampaignId);
      return factId;
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateFact: async (factId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/facts/${factId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update fact");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to update entity");
      }
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateRelation: async (relationId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/relations/${relationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update relation");
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPreparedSession: async (title, prep, scheduledAt) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const sessionId = `sess_${createId("sess").split("_")[1]}`;
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/prepared`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "usr_dm",
          sessionId,
          title,
          scheduledAt,
          prep: prep ?? { state: "draft" }
        })
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to prepare session"));
      await get().reloadCampaignIfActive(activeCampaignId);
      return sessionId;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateSessionPrep: async (sessionId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/prep`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", ...updates })
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to update session preparation"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cancelSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" })
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to cancel session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  archiveSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" })
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to archive session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  activateSession: async (sessionId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/sessions/${sessionId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" })
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to activate session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      if (!res.ok) throw new Error(await readApiError(res, "Failed to start session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      if (!res.ok) throw new Error(await readApiError(res, "Failed to reveal clue"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      if (!res.ok) throw new Error(await readApiError(res, "Failed to close session"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      if (!res.ok) throw new Error(await readApiError(res, "Failed to record session event"));
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      await get().reloadCampaignIfActive(activeCampaignId);
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
      const res = await fetchWithVault(`/api/campaigns/${campaignId}/player-portal/state`);
      if (!res.ok) throw new Error(await readApiError(res, "Failed to load player portal state"));
      const playerPortalState = await res.json();
      if (get().activeCampaignId !== campaignId || get().activeCampaignLoadId !== loadId || get().activeCampaignRole !== "player") {
        return;
      }
      set({ playerPortalState });
    } catch (err: any) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: err.message });
      }
    }
  },

  updatePlayerPortalStatus: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update player portal status");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  upsertPlayerPortalResource: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const resourceId = typeof payload?.resourceId === "string" ? payload.resourceId : null;
      const res = await fetchWithVault(
        resourceId
          ? `/api/campaigns/${activeCampaignId}/player-portal/resources/${resourceId}`
          : `/api/campaigns/${activeCampaignId}/player-portal/resources`,
        {
          method: resourceId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await readApiError(res, "Failed to upsert player portal resource"));
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createPlayerPortalNote: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create player portal note");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updatePlayerPortalNote: async (noteId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update player portal note");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createPlayerPortalObjective: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/objectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create player portal objective");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updatePlayerPortalObjective: async (objectiveId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/objectives/${objectiveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update player portal objective");
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createPlayerCharacterProposal: async (payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to create player character proposal"));
      await get().loadPlayerPortalState(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  loadDmPlayerPortalSummary: async () => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/dm-summary`);
      if (!res.ok) throw new Error("Failed to load DM player portal summary");
      const dmPlayerPortalSummary = await res.json();
      if (get().activeCampaignId === activeCampaignId) {
        set({ dmPlayerPortalSummary });
      }
    } catch (err: any) {
      if (get().activeCampaignId === activeCampaignId) {
        set({ error: err.message });
      }
    }
  },

  resolvePlayerCharacterProposal: async (proposalId, payload) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/proposals/${proposalId}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to resolve player character proposal"));
      await Promise.all([get().loadDmPlayerPortalSummary(), get().reloadCampaignIfActive(activeCampaignId)]);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  linkPlayerCharacter: async (playerId, characterEntityId, ownership = "campaign_premade", syncMode = "live_player_editable") => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(
        `/api/campaigns/${activeCampaignId}/player-portal/links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, characterEntityId, ownership, syncMode }),
        }
      );
      if (!res.ok) throw new Error(await readApiError(res, "Failed to link character"));
      await get().loadDmPlayerPortalSummary();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unlinkPlayerCharacter: async (playerId) => {
    const activeCampaignId = get().activeCampaignId ?? get().playerPortalState?.campaign?.campaignId ?? sessionStorage.getItem("dmcc_activeCampaignId");
    if (!activeCampaignId) return;
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/player-portal/links/${playerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readApiError(res, "Failed to unlink character"));
      await Promise.all([get().loadDmPlayerPortalSummary(), get().reloadCampaignIfActive(activeCampaignId)]);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createCanvas: async (title, kind, description) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const canvasId = createId("cvs");
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", canvasId, title, kind, description }),
      });
      if (!res.ok) throw new Error("Failed to create canvas");
      set({
        activeCanvasId: canvasId,
        activeCanvasIdByCampaignId: {
          ...get().activeCanvasIdByCampaignId,
          [activeCampaignId]: canvasId,
        },
      });
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setActiveCanvasId: (canvasId) => {
    const campaignId = get().activeCampaignId;
    set({
      activeCanvasId: canvasId,
      ...(campaignId
        ? {
            activeCanvasIdByCampaignId: {
              ...get().activeCanvasIdByCampaignId,
              [campaignId]: canvasId,
            },
          }
        : {}),
    });
  },

  placeNodeOnCanvas: async (canvasId, node) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const nodeId = node.id || createId("cvn");
    const nodeObj = {
      id: nodeId,
      campaignId: activeCampaignId,
      canvasId,
      kind: node.kind,
      entityId: node.entityId,
      factId: node.factId,
      text: node.text,
      title: node.title,
      color: node.color,
      groupId: node.groupId,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      collapsed: false,
      zIndex: node.zIndex || 1,
      status: "draft",
      visibility: "dm",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const canvas = canvasesById[canvasId];
    if (canvas) {
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: {
            ...canvas,
            nodes: [...canvas.nodes, nodeObj],
          },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", node: nodeObj }),
      });
      if (!res.ok) throw new Error("Failed to place node");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  updateCanvasNode: async (canvasId, nodeId, updates) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const canvas = canvasesById[canvasId];
    if (canvas) {
      const nodes = canvas.nodes.map((n: any) =>
        n.id === nodeId ? { ...n, ...updates } : n
      );
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, nodes },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", updates }),
      });
      if (!res.ok) throw new Error("Failed to update node");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  updateCanvasNodesLayout: async (canvasId, nodeUpdates) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;

    const canvas = canvasesById[canvasId];
    if (canvas) {
      const nodes = canvas.nodes.map((n: any) => {
        const update = nodeUpdates.find((up) => up.nodeId === n.id);
        if (update) {
          return {
            ...n,
            x: update.x,
            y: update.y,
            ...(update.width !== undefined && { width: update.width }),
            ...(update.height !== undefined && { height: update.height }),
            ...(update.parentId !== undefined && { parentId: update.parentId ?? undefined }),
            ...(update.groupId !== undefined && { groupId: update.groupId ?? undefined }),
          };
        }
        return n;
      });
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, nodes },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/layout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", nodeUpdates }),
      });
      if (!res.ok) throw new Error("Failed to update layout");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  removeNodeFromCanvas: async (canvasId, nodeId) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const canvas = canvasesById[canvasId];
    if (canvas) {
      const nodes = canvas.nodes.filter((n: any) => n.id !== nodeId);
      const edges = canvas.edges.filter((e: any) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, nodes, edges },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/nodes/${nodeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" }),
      });
      if (!res.ok) throw new Error("Failed to remove node");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  addEdgeToCanvas: async (canvasId, edge) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const edgeId = edge.id || createId("cve");
    const edgeObj = {
      id: edgeId,
      campaignId: activeCampaignId,
      canvasId,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      relationshipId: edge.relationshipId,
      label: edge.label,
      status: edge.status,
      visibility: edge.visibility || "dm",
      style: edge.style || "solid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const canvas = canvasesById[canvasId];
    if (canvas) {
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: {
            ...canvas,
            edges: [...canvas.edges, edgeObj],
          },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", edge: edgeObj }),
      });
      if (!res.ok) throw new Error("Failed to add edge");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  updateCanvasEdge: async (canvasId, edgeId, updates) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const canvas = canvasesById[canvasId];
    if (canvas) {
      const edges = canvas.edges.map((e: any) =>
        e.id === edgeId ? { ...e, ...updates } : e
      );
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, edges },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/edges/${edgeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", updates }),
      });
      if (!res.ok) throw new Error("Failed to update edge");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  removeEdgeFromCanvas: async (canvasId, edgeId) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;
    set({ error: null });

    const canvas = canvasesById[canvasId];
    if (canvas) {
      const edges = canvas.edges.filter((e: any) => e.id !== edgeId);
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, edges },
        },
      });
    }

    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/edges/${edgeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm" }),
      });
      if (!res.ok) throw new Error("Failed to remove edge");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message });
      await get().reloadCampaignIfActive(activeCampaignId);
    }
  },

  convertNoteToEntity: async (canvasId, nodeId, payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}/nodes/${nodeId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", ...payload }),
      });
      if (!res.ok) throw new Error("Failed to convert note to entity");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  saveViewport: async (canvasId, viewport) => {
    const { activeCampaignId, canvasesById } = get();
    if (!activeCampaignId) return;

    const canvas = canvasesById[canvasId];
    if (canvas) {
      set({
        canvasesById: {
          ...canvasesById,
          [canvasId]: { ...canvas, viewport },
        },
      });
    }

    try {
      await fetchWithVault(`/api/campaigns/${activeCampaignId}/canvases/${canvasId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "usr_dm", viewport }),
      });
    } catch (err: any) {
      console.error("Failed to save viewport", err);
    }
  },
}));

if (typeof window !== "undefined" && syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === "MUTATION") {
      const store = useCampaignStore.getState();
      const activeId = store.activeCampaignId;
      const activeVaultId = store.activeVaultId || "default";
      const messageVaultId = event.data.vaultId || "default";
      if (event.data.campaignId === activeId && messageVaultId === activeVaultId) {
        void store.reloadCampaign();
      }
    }
  };
}
