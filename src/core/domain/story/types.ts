import type { CampaignId, StoryThreadId, StoryStepId, SessionId, EntityId } from "@shared/ids.js";

export type StoryThreadStatus = "planned" | "active" | "resolved" | "discarded";
export type StoryStepStatus = "planned" | "ready" | "active" | "resolved" | "discarded";
export type StoryStepResolutionKind = "as_planned" | "changed" | "discarded";

export interface StoryThread {
  campaignId: CampaignId;
  threadId: StoryThreadId;
  title: string;
  summary?: string | null;
  status: StoryThreadStatus;
  sortOrder: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  entityIds: EntityId[]; // associations
}

export interface StoryStep {
  campaignId: CampaignId;
  stepId: StoryStepId;
  threadId: StoryThreadId;
  title: string;
  intent?: string | null;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
  status: StoryStepStatus;
  resolutionKind?: StoryStepResolutionKind | null;
  sceneEntityId?: EntityId | null;
  plannedSessionId?: SessionId | null;
  plannedSessionOrder?: number | null;
  resolvedSessionId?: SessionId | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  entityIds: EntityId[]; // associations
}
