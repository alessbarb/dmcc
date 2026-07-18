import { create } from "zustand";
import { createId } from "@shared/ids.js";
import { resolveActiveCanvasId } from "../utils/canvasSelection.js";
import { markCampaignGuidedTourPending } from "../../dm/onboarding/campaignGuidedTourStorage.js";
import { createCampaignTemplateActions, idleCampaignTemplateImportState } from "./campaignTemplateStoreActions.js";
import { createCanvasActions } from "./campaignStoreCanvasActions.js";
import { createPlayerPortalActions } from "./campaignStorePlayerPortalActions.js";
import { createSessionActions } from "./campaignStoreSessionActions.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import type { FactSource } from "@core/domain/fact/types.js";
import type { CampaignNotebook, CampaignNotebookItem } from "@core/domain/notebook/types.js";
import type { StoryThread, StoryStep } from "@core/domain/story/types.js";

import {
  API_CLIENT_TAB_ID,
  campaignApi,
  readApiError,
} from "../api.js";
import type { playerPortalApi } from "../api.js";
import type { ImportStage } from "@shared/templateImportTypes.js";

type ActiveCampaignRole = "dm" | "player";

export interface CampaignTemplateImportState {
  status: "idle" | "running" | "failed";
  templateId: string | null;
  operationId: string | null;
  campaignId: string | null;
  completedSteps: number;
  totalSteps: number;
  percent: number;
  stage: ImportStage | null;
  error: string | null;
}

export type CanvasNodeDraft = Pick<CanvasNode, "kind" | "x" | "y"> &
  Partial<Omit<CanvasNode, "id" | "campaignId" | "canvasId" | "kind" | "x" | "y" | "createdAt" | "updatedAt">>;
export type CanvasNodeUpdate = Partial<Omit<CanvasNode, "id" | "campaignId" | "canvasId">>;
export type CanvasEdgeDraft = Pick<CanvasEdge, "sourceNodeId" | "targetNodeId"> &
  Partial<Omit<CanvasEdge, "id" | "campaignId" | "canvasId" | "sourceNodeId" | "targetNodeId" | "createdAt" | "updatedAt">>;
export type CanvasEdgeUpdate = Partial<Omit<CanvasEdge, "id" | "campaignId" | "canvasId">>;

function getActiveSessionRole(): ActiveCampaignRole {
  return "dm";
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const campaignScopedReset = () => ({
  campaignState: null,
  canvasesById: {},
  activeCanvasId: null,
  timeline: null,
  visibility: null,
  dmPlayerPortalSummary: null,
});

const playerScopedReset = () => ({
  playerPortalState: null,
});

function buildCanvasesById(campaignState: { canvases?: unknown } | null | undefined): Record<string, Canvas> {
  const raw = campaignState?.canvases;
  if (!raw) return {};
  // API returns canvases as a plain object {canvasId: canvas} (serialized from Map)
  // but local/previous paths may send an array
  const items: unknown[] = Array.isArray(raw) ? raw : Object.values(isRecord(raw) ? raw : {});
  const canvasesById: Record<string, Canvas> = {};
  for (const item of items) {
    if (!isRecord(item)) continue;
    const canvasId = typeof item.canvasId === "string" ? item.canvasId : typeof item.id === "string" ? item.id : null;
    // Trusted API boundary: the server only ever serializes valid Canvas records here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    if (canvasId) canvasesById[canvasId] = item as Canvas;
  }
  return canvasesById;
}

function toArray(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return isRecord(raw) ? Object.values(raw) : [];
}

function normalizeCampaignState(raw: unknown): StoreCampaignState | null {
  if (!isRecord(raw)) return null;
  const normalized = {
    ...raw,
    entities: toArray(raw.entities),
    relations: toArray(raw.relations),
    facts: toArray(raw.facts),
    sessions: toArray(raw.sessions),
    canvases: toArray(raw.canvases),
    players: Array.isArray(raw.players) ? raw.players : Object.values(isRecord(raw.players) ? raw.players : {}),
    tags: toArray(raw.tags),
    attachments: toArray(raw.attachments),
    sessionEvents: toArray(raw.sessionEvents),
    notebooks: toArray(raw.notebooks),
    notebookItems: toArray(raw.notebookItems),
    storyThreads: toArray(raw.storyThreads),
    storySteps: toArray(raw.storySteps),
  };
  // Trusted API boundary: the server serializes a well-formed CampaignProjection here.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return normalized as unknown as StoreCampaignState;
}

export interface CampaignTemplateSummary {
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

export interface CampaignTemplate extends CampaignTemplateSummary {
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
    visibility?: VisibilityRule;
    metadata?: Record<string, unknown>;
  }>;
  relations: Array<{
    relationId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationType: string;
    description?: string;
    visibility?: VisibilityRule;
  }>;
  facts: Array<{
    factId: string;
    statement: string;
    kind: string;
    confidence: string;
    visibility?: VisibilityRule;
    relatedEntityIds?: string[];
  }>;
  sessions: Array<{
    sessionId: string;
    title: string;
    scheduledAt?: string;
    prep?: Session["prep"];
  }>;
  canvases: Array<{
    canvasId: string;
    title: string;
    kind: string;
    description?: string;
    nodes?: unknown[];
    edges?: unknown[];
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
  stats?: {
    entities: number;
    relations: number;
    facts: number;
    preparedSessions: number;
  } | null;
  loadWarning?: "snapshot_unreadable";
  createdAt?: string;
  updatedAt?: string;
  coverUrl?: string;
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
  visibility: VisibilityRule;
  metadata: Record<string, unknown>;
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
  visibility: VisibilityRule;
  archived: boolean;
  createdAt?: string;
}

export interface Fact {
  factId: string;
  campaignId: string;
  statement: string;
  kind: string;
  confidence: string;
  visibility: VisibilityRule;
  relatedEntityIds: string[];
  source: FactSource;
  archived: boolean;
  createdAt?: string;
}

export interface SessionPlanGoal {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface SessionPlanChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  priority: "low" | "medium" | "high";
  order: number;
}

export type SessionFlowItem =
  | { id: string; kind: "scene"; sceneEntityId: string; order: number; titleOverride?: string; notes?: string }
  | { id: string; kind: "decision_point"; title: string; prompt?: string; order: number; notes?: string };

export type SessionPlanContentRole =
  | "available_clue"
  | "secret_at_risk"
  | "expected_consequence"
  | "involved_entity"
  | "front_in_play"
  | "clock_in_play";

export interface SessionPlanContentLink {
  id: string;
  entityId: string;
  role: SessionPlanContentRole;
  anchorFlowItemId?: string;
  order: number;
  notes?: string;
}

export interface SessionPlanTransition {
  id: string;
  sourceItemId: string;
  targetItemId: string;
  kind: "next" | "alternative" | "conditional";
  label?: string;
  condition?: string;
  order: number;
}

export type SessionPlanBinding =
  | { id: string; kind: "story_step"; storyStepId: string; anchorFlowItemId?: string; order: number }
  | { id: string; kind: "objective"; objectiveId: string; goalId: string; anchorFlowItemId?: string; order: number };

export interface SessionPlan {
  version: 2;
  revision: number;
  state: "draft" | "ready";
  summary?: string;
  openingPrompt?: string;
  goals: SessionPlanGoal[];
  checklist: SessionPlanChecklistItem[];
  flowItems: SessionFlowItem[];
  contentLinks: SessionPlanContentLink[];
  transitions: SessionPlanTransition[];
  bindings: SessionPlanBinding[];
  privateNotes?: string;
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
  plan?: SessionPlan;
  activatedPlanRevision?: number;
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
  avatarUrl?: string;
}

export interface CampaignStateStore {
  campaigns: Campaign[];
  campaignTemplates: CampaignTemplateSummary[];
  campaignTemplatesLocale: string | null;
  activeCampaignTemplate: CampaignTemplate | null;
  activeCampaignTemplateKey: string | null;
  activeCampaignId: string | null;
  activeCampaignLoadId: string | null;
  activeCampaignRole: ActiveCampaignRole;
  campaignState: {
    campaign: Campaign | null;
    entities: Entity[];
    relations: Relation[];
    facts: Fact[];
    sessions: Session[];
    sessionEvents?: unknown[];
    players: PlayerProfile[];
    canvases: Canvas[];
    notebooks: CampaignNotebook[];
    notebookItems: CampaignNotebookItem[];
    storyThreads: StoryThread[];
    storySteps: StoryStep[];
  } | null;

  canvasesById: Record<string, Canvas>;
  activeCanvasId: string | null;
  activeCanvasIdByCampaignId: Record<string, string | null>;


  timeline: { events: unknown[] } | null;
  visibility: unknown;

  playerPortalState: unknown;
  dmPlayerPortalSummary: playerPortalApi.DmPlayerPortalSummary | null;

  loading: boolean;
  error: string | null;

  campaignTemplateImportState: CampaignTemplateImportState;
  clearCampaignTemplateImportState: () => void;

  isEntityModalOpen: boolean;
  setIsEntityModalOpen: (open: boolean) => void;
  isRelationModalOpen: boolean;
  setIsRelationModalOpen: (open: boolean) => void;

  fetchCampaigns: () => Promise<void>;
  fetchCampaignTemplates: () => Promise<void>;
  fetchCampaignTemplate: (templateId: string) => Promise<CampaignTemplate | null>;
  importCampaignTemplate: (templateId: string, options?: { title?: string; summary?: string; importMode?: "full" | "structure" | "sessions"; locale?: string }) => Promise<string | undefined>;
  updateCampaign: (campaignId: string, updates: { title?: string; summary?: string; system?: string; status?: string; coverUrl?: string; metadata?: Record<string, unknown> }) => Promise<Campaign | undefined>;
  selectCampaign: (campaignId: string) => Promise<void>;
  enterDmCampaign: (campaignId: string) => void;
  enterPlayerCampaign: (campaignId: string) => void;
  leavePlayerPortal: () => void;
  reloadCampaign: () => Promise<void>;
  reloadCampaignIfActive: (campaignId: string) => Promise<void>;
  clearCampaign: () => void;
  createCampaign: (title: string, system: string, coverUrl?: string) => Promise<string | undefined>;
  deleteCampaign: (campaignId: string, confirmTitle: string) => Promise<void>;

  createEntity: (payload: {
    entityType: string;
    title: string;
    subtitle?: string;
    summary?: string;
    content?: string;
    status?: string;
    importance?: string;
    visibility?: VisibilityRule;
    metadata?: Record<string, unknown>;
    tagIds?: string[];
    createdInSessionId?: string;
    entityId?: string;
  }) => Promise<{ entityId: string } | undefined>;

  createRelation: (payload: {
    relationId?: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationType: string;
    description?: string;
    visibility?: VisibilityRule;
    force?: boolean;
  }) => Promise<string | undefined>;

  createFact: (payload: {
    statement: string;
    kind: string;
    confidence: string;
    visibility?: VisibilityRule;
    relatedEntityIds: string[];
    source: FactSource;
  }) => Promise<string | undefined>;

  updateFact: (factId: string, updates: {
    statement?: string;
    kind?: string;
    confidence?: string;
    visibility?: VisibilityRule;
  }) => Promise<void>;

  updateEntity: (entityId: string, updates: Partial<Entity>) => Promise<void>;
  archiveEntity: (entityId: string) => Promise<void>;
  archiveRelation: (relationId: string) => Promise<void>;
  updateRelation: (relationId: string, updates: { description?: string; visibility?: VisibilityRule }) => Promise<void>;

  createPlayer: (name: string, displayName?: string, email?: string, imageUrl?: string, avatarUrl?: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<PlayerProfile>) => Promise<void>;
  archivePlayer: (playerId: string) => Promise<void>;

  createPreparedSession: (title: string, prep?: Session["prep"], scheduledAt?: string) => Promise<string | undefined>;
  updateSessionPrep: (sessionId: string, updates: { title?: string; scheduledAt?: string; prep: Session["prep"] }) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  activateSession: (sessionId: string) => Promise<void>;
  startSession: (title: string) => Promise<void>;
  revealClue: (sessionId: string, clueEntityId: string, audience: VisibilityRule, note?: string) => Promise<void>;
  closeSession: (sessionId: string, summary: string) => Promise<void>;
  recordSessionEvent: (sessionId: string, eventData: {
    type: string;
    title: string;
    description?: string;
    relatedEntityIds?: string[];
    relatedFactIds?: string[];
    relatedRelationIds?: string[];
  }) => Promise<void>;
  updateCampaignSettings: (settings: Record<string, unknown>) => Promise<void>;

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
  updatePlayerPortalStatus: (payload: Record<string, unknown>) => Promise<void>;
  upsertPlayerPortalResource: (payload: Record<string, unknown>) => Promise<void>;
  createPlayerPortalNote: (payload: Record<string, unknown>) => Promise<void>;
  updatePlayerPortalNote: (noteId: string, payload: Record<string, unknown>) => Promise<void>;
  createPlayerPortalObjective: (payload: Record<string, unknown>) => Promise<void>;
  updatePlayerPortalObjective: (objectiveId: string, payload: Record<string, unknown>) => Promise<void>;
  createPlayerCharacterProposal: (payload: Record<string, unknown>) => Promise<void>;
  loadDmPlayerPortalSummary: () => Promise<void>;
  resolvePlayerCharacterProposal: (proposalId: string, payload: Record<string, unknown>) => Promise<void>;
  linkPlayerCharacter: (playerId: string, characterEntityId: string, ownership?: string, syncMode?: string) => Promise<void>;
  unlinkPlayerCharacter: (playerId: string) => Promise<void>;

  createCanvas: (title: string, kind: string, description?: string) => Promise<void>;
  setActiveCanvasId: (canvasId: string | null) => void;
  placeNodeOnCanvas: (canvasId: string, node: CanvasNodeDraft) => Promise<void>;
  updateCanvasNode: (canvasId: string, nodeId: string, updates: CanvasNodeUpdate) => Promise<void>;
  updateCanvasNodesLayout: (canvasId: string, nodeUpdates: Array<{ nodeId: string; x: number; y: number; width?: number; height?: number; parentId?: string | null; groupId?: string | null }>) => Promise<void>;
  removeNodeFromCanvas: (canvasId: string, nodeId: string) => Promise<void>;
  addEdgeToCanvas: (canvasId: string, edge: CanvasEdgeDraft) => Promise<void>;
  updateCanvasEdge: (canvasId: string, edgeId: string, updates: CanvasEdgeUpdate) => Promise<void>;
  removeEdgeFromCanvas: (canvasId: string, edgeId: string) => Promise<void>;
  convertNoteToEntity: (canvasId: string, nodeId: string, payload: Record<string, unknown>) => Promise<void>;
  saveViewport: (canvasId: string, viewport: { x: number; y: number; zoom: number }) => Promise<void>;
}

export type StoreCampaignState = NonNullable<CampaignStateStore["campaignState"]>;

const tabId = API_CLIENT_TAB_ID;

const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("dmcc_campaign_sync") : null;


export const useCampaignStore = create<CampaignStateStore>((set, get) => ({
  campaigns: [],
  campaignTemplates: [],
  campaignTemplatesLocale: null,
  activeCampaignTemplate: null,
  activeCampaignTemplateKey: null,
  activeCampaignId: null,
  activeCampaignLoadId: null,
  activeCampaignRole: "dm",
  campaignState: null,
  canvasesById: {},
  activeCanvasId: null,
  activeCanvasIdByCampaignId: {},

  timeline: null,
  visibility: null,
  playerPortalState: null,
  dmPlayerPortalSummary: null,
  loading: false,
  error: null,

  campaignTemplateImportState: idleCampaignTemplateImportState(),
  ...createCampaignTemplateActions(set, get),

  isEntityModalOpen: false,
  setIsEntityModalOpen: (open) => set({ isEntityModalOpen: open }),
  isRelationModalOpen: false,
  setIsRelationModalOpen: (open) => set({ isRelationModalOpen: open }),

  fetchCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.listCampaigns();
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? `Failed to fetch campaigns (${res.status})`;
        throw new Error(message);
      }
      const campaigns = await res.json();
      set({ campaigns, loading: false });
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
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
      const resDetails = await campaignApi.getCampaign(campaignId);
      if (!resDetails.ok) throw new Error("Failed to load campaign state");
      const rawCampaignState = await resDetails.json();
      const campaignState = normalizeCampaignState(rawCampaignState);

      let timeline: { events: unknown[] } | null = null;
      let visibility: unknown = null;

      if (role === "dm") {
        const [resTimeline, resVisibility] = await Promise.all([
          campaignApi.getCampaignTimeline(campaignId),
          campaignApi.getCampaignVisibility(campaignId),
        ]);

        timeline = resTimeline.ok ? await resTimeline.json() : null;
        visibility = resVisibility.ok ? await resVisibility.json() : null;
      }

      if (campaignState) {
        if (!campaignState.players) {
          campaignState.players = [];
        }
        if (role === "dm") {
          const resPlayers = await campaignApi.listPlayers(campaignId);
          if (resPlayers.ok) {
            campaignState.players = await resPlayers.json();
          }
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
        timeline,
        visibility,
        loading: false,
      });
    } catch (err) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: errorMessage(err), loading: false });
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
      const resDetails = await campaignApi.getCampaign(campaignId);
      if (!resDetails.ok) throw new Error("Failed to load campaign state");
      const campaignState = normalizeCampaignState(await resDetails.json());

      let timeline: { events: unknown[] } | null = null;
      let visibility: unknown = null;

      if (role === "dm") {
        const [resTimeline, resVisibility] = await Promise.all([
          campaignApi.getCampaignTimeline(campaignId),
          campaignApi.getCampaignVisibility(campaignId),
        ]);

        timeline = resTimeline.ok ? await resTimeline.json() : null;
        visibility = resVisibility.ok ? await resVisibility.json() : null;
      }

      if (campaignState) {
        if (!campaignState.players) {
          campaignState.players = [];
        }
        if (role === "dm") {
          const resPlayers = await campaignApi.listPlayers(campaignId);
          if (resPlayers.ok) {
            campaignState.players = await resPlayers.json();
          }
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
        timeline,
        visibility,
        loading: false,
      });
    } catch (err) {
      if (get().activeCampaignId === campaignId && get().activeCampaignLoadId === loadId) {
        set({ error: errorMessage(err), loading: false });
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
    const res = await campaignApi.deleteCampaign(campaignId, confirmTitle);
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => ({}));
      const message = isRecord(body) && typeof body.error === "string" ? body.error : `Failed to delete campaign (${res.status})`;
      throw new Error(message);
    }
    const { [campaignId]: _deletedCanvasId, ...remainingCanvasSelections } = get().activeCanvasIdByCampaignId;
    set({ activeCanvasIdByCampaignId: remainingCanvasSelections });
    if (get().activeCampaignId === campaignId) {
      get().clearCampaign();
    }
    await get().fetchCampaigns();
  },

  createCampaign: async (title: string, system: string, coverUrl?: string) => {
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.createCampaign({ title, system, coverUrl });
      if (!res.ok) throw new Error("Failed to create campaign");
      const data = await res.json();
      const campaignId = typeof data?.campaignId === "string" ? data.campaignId : null;
      if (!campaignId) throw new Error("Campaign creation response did not include campaignId");
      await get().fetchCampaigns();
      markCampaignGuidedTourPending(campaignId);
      set({ loading: false });
      return campaignId;
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  updateCampaign: async (campaignId, updates) => {
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updateCampaign(campaignId, updates);
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
      // Trusted API boundary: the server response shape is not runtime-validated here.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return data.campaign as Campaign;
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  createEntity: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const entityId = payload.entityId || `ent_${createId("ent").split("_")[1]}`;
      const res = await campaignApi.createEntity(activeCampaignId, { entityId, ...payload });
      if (!res.ok) throw new Error("Failed to create entity");
      const data = await res.json();
      await get().reloadCampaignIfActive(activeCampaignId);
      return { ...data, entityId };
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  createRelation: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const relationId = payload.relationId || `rel_${createId("rel").split("_")[1]}`;
      const { force, ...rest } = payload;
      const res = await campaignApi.createRelation(activeCampaignId, { relationId, ...rest }, force);
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
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  createFact: async (payload) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    const factId = `fact_${createId("fact").split("_")[1]}`;
    try {
      const res = await campaignApi.createFact(activeCampaignId, { factId, ...payload });
      if (!res.ok) throw new Error("Failed to record fact");
      await get().reloadCampaignIfActive(activeCampaignId);
      return factId;
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  updateFact: async (factId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updateFact(activeCampaignId, factId, updates);
      if (!res.ok) throw new Error("Failed to update fact");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  updateEntity: async (entityId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updateEntity(activeCampaignId, entityId, updates);
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const message = isRecord(data) && typeof data.error === "string" ? data.error : "Failed to update entity";
        throw new Error(message);
      }
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  archiveEntity: async (entityId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.deleteEntity(activeCampaignId, entityId);
      if (!res.ok) throw new Error("Failed to archive entity");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  archiveRelation: async (relationId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.deleteRelation(activeCampaignId, relationId);
      if (!res.ok) throw new Error("Failed to archive relation");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  updateRelation: async (relationId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updateRelation(activeCampaignId, relationId, updates);
      if (!res.ok) throw new Error("Failed to update relation");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  createPlayer: async (name, displayName, email, imageUrl, avatarUrl) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const playerId = `ply_${createId("ply").split("_")[1]}`;
      const res = await campaignApi.createPlayer(activeCampaignId, { playerId, name, displayName: displayName ?? name, email: email ?? null, imageUrl: imageUrl ?? "", avatarUrl });
      if (!res.ok) throw new Error("Failed to create player");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  updatePlayer: async (playerId, updates) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updatePlayer(activeCampaignId, playerId, updates);
      if (!res.ok) throw new Error("Failed to update player");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  archivePlayer: async (playerId) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.deletePlayer(activeCampaignId, playerId);
      if (!res.ok) throw new Error("Failed to archive player");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  ...createSessionActions(set, get),

  exportJson: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await campaignApi.exportCampaignJson(activeCampaignId);
    if (!res.ok) throw new Error("Failed to export JSON");
    return res.json();
  },

  exportMarkdown: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await campaignApi.exportCampaignMarkdown(activeCampaignId);
    if (!res.ok) throw new Error("Failed to export Markdown");
    return res.json();
  },

  createBackup: async () => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await campaignApi.createBackup(activeCampaignId);
    if (!res.ok) throw new Error("Failed to create backup");
    return res.json();
  },

  restoreBackup: async (backupId: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.restoreBackup(activeCampaignId, { backupId });
      if (!res.ok) throw new Error("Failed to restore backup");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  updateCampaignSettings: async (settings) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) return;
    set({ loading: true, error: null });
    try {
      const res = await campaignApi.updateCampaignSettings(activeCampaignId, settings);
      if (!res.ok) throw new Error("Failed to update settings");
      await get().reloadCampaignIfActive(activeCampaignId);
    } catch (err) {
      set({ error: errorMessage(err), loading: false });
    }
  },

  createTag: async (name: string, color?: string) => {
    const { activeCampaignId } = get();
    if (!activeCampaignId) throw new Error("No active campaign");
    const res = await campaignApi.createTag(activeCampaignId, { name, color });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  },

  ...createPlayerPortalActions(set, get),

  ...createCanvasActions(set, get),
}));

if (typeof window !== "undefined" && syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === "MUTATION" && event.data.tabId !== tabId) {
      const store = useCampaignStore.getState();
      const activeId = store.activeCampaignId;
      if (event.data.campaignId === activeId) {
        void store.reloadCampaign();
      }
    }
  };
}
