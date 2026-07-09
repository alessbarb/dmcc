import type { Canvas } from "@core/domain/canvas/types.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { Entity, Fact, Relation, Session } from "../../shared/stores/campaignStore.js";

export interface MobileCampaignContext {
  activeSessionId?: string;
  activeCanvasId?: string;
}

export interface MobileEntitySummary {
  id: string;
  title: string;
  subtitle?: string;
  entityType?: string;
  status?: string;
  importance?: string;
  visibility?: VisibilityRule | unknown;
}

export interface MobileFactSummary {
  id: string;
  statement: string;
  kind: string;
  confidence?: string;
  visibility?: VisibilityRule | unknown;
}

export interface MobileRelationSummary {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  targetTitle: string;
  relationType: string;
  direction: "incoming" | "outgoing";
  visibility?: VisibilityRule | unknown;
  status?: string;
}

export interface MobileSessionSummary {
  id: string;
  title: string;
  status?: string;
  summary?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface MobileSessionEventSummary {
  id: string;
  title: string;
  createdAt?: string;
  content?: string;
}

export interface MobileRevelationSummary {
  id: string;
  title: string;
  kind: "entity" | "fact" | "relation";
  visibility?: VisibilityRule | unknown;
}

export interface MobileCampaignNowViewModel {
  campaignTitle: string;
  activeSession?: MobileSessionSummary;
  currentScene?: MobileEntitySummary;
  nearbyEntities: MobileEntitySummary[];
  availableClues: MobileEntitySummary[];
  preparedSecrets: MobileEntitySummary[];
  activeThreats: MobileEntitySummary[];
  activeClocks: MobileEntitySummary[];
  recentNotes: MobileSessionEventSummary[];
  pendingRevelations: MobileRevelationSummary[];
}

export type MobileOracleResultKind = "entity" | "fact" | "relation" | "session" | "session_event" | "canvas_node" | "canvas" | "action" | "query_group";
export type MobileOracleActionKind = "open_focus" | "focus_in_constellation" | "mark_revealed" | "mark_found" | "add_to_canvas" | "record_note" | "open_path" | "open_session";

export interface MobileOracleAction {
  kind: MobileOracleActionKind;
  label: string;
  payload: Record<string, unknown>;
}

export interface MobileOracleResult {
  id: string;
  kind: MobileOracleResultKind;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  entityType?: string;
  visibility?: "dm_only" | "public" | "players";
  status?: string;
  importance?: "low" | "normal" | "high" | "critical";
  relatedCount?: number;
  primaryAction: MobileOracleAction;
  secondaryActions?: MobileOracleAction[];
}

export type MobileFocusKind = "entity" | "fact" | "relation" | "session" | "canvas_node" | "note";
export type MobileFocusActionKind = "reveal" | "hide" | "record_session_note" | "change_status" | "mark_found" | "mark_visited" | "mark_dead" | "mark_resolved" | "connect" | "create_fact" | "create_consequence" | "view_in_constellation" | "open_path";

export interface MobileFocusAction {
  kind: MobileFocusActionKind;
  label: string;
  payload: Record<string, unknown>;
  requiresConfirmation?: boolean;
}

export interface MobileFocusViewModel {
  id: string;
  kind: MobileFocusKind;
  title: string;
  subtitle?: string;
  summary?: string;
  contentPreview?: string;
  entityType?: string;
  imageUrl?: string;
  defaultImageUrl?: string;
  visibility: VisibilityRule | unknown;
  status?: string;
  importance?: "low" | "normal" | "high" | "critical";
  appearsInActiveSession: boolean;
  relatedEntities: MobileRelationSummary[];
  relatedFacts: MobileFactSummary[];
  relatedSessions: MobileSessionSummary[];
  pendingRevelations: MobileRevelationSummary[];
  quickActions: MobileFocusAction[];
}

export interface MobileNarrativePathStep {
  entity: MobileEntitySummary;
  relation?: MobileRelationSummary;
}

export interface MobileNarrativePath {
  id: string;
  steps: MobileNarrativePathStep[];
  hasSecretContent: boolean;
}

export interface MobileCampaignStateLike {
  campaign?: { title?: string } | null;
  entities?: Entity[];
  relations?: Relation[];
  facts?: Fact[];
  sessions?: Session[];
  sessionEvents?: Array<Record<string, unknown>>;
  canvases?: Canvas[];
}
