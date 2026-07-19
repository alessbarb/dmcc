import type { Campaign } from "./campaign/types.js";
import type { Entity } from "./entity/entity.js";
import type { Relation } from "./relation/relation.js";
import type { Fact } from "./fact/fact.js";
import type { Session } from "./session/session.js";
import type { SessionEvent } from "./session/types.js";
import type { Canvas } from "./canvas/types.js";
import type { CampaignRole } from "./campaign/player.js";
import type { CampaignNotebook, CampaignNotebookItem } from "./notebook/types.js";
import type { StoryThread, StoryStep } from "./story/types.js";
import type { SessionInferenceReview } from "./session/sessionInferenceReview.js";

export interface CampaignPlayerRecord {
  id: string;
  playerId: string;
  campaignId: string;
  displayName: string;
  role: CampaignRole | string;
  color?: string;
  imageUrl?: string;
  avatarUrl?: string;
  email?: string | null;
  emailHash?: string | null;
  isActive: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignInvitationRecord {
  inviteId: string;
  inviteTokenHash?: string;
  label?: string;
  status: "pending" | "consumed" | "revoked";
  createdAt: string;
  expiresAt?: string;
  consumedByPlayerId?: string;
  consumedAt?: string;
  revokedAt?: string;
}

export interface CampaignTagRecord {
  id: string;
  name: string;
  color?: string;
}

export interface CampaignAttachmentRecord {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CampaignState {
  campaignId: string;
  campaign: Campaign | null;
  players: Map<string, CampaignPlayerRecord>;
  invitations: Map<string, CampaignInvitationRecord>;
  entities: Map<string, Entity>;
  relations: Map<string, Relation>;
  facts: Map<string, Fact>;
  sessions: Map<string, Session>;
  sessionEvents: Map<string, SessionEvent & { sessionEventId?: string; actorId?: string }>;
  tags: Map<string, CampaignTagRecord>;
  attachments: Map<string, CampaignAttachmentRecord>;
  canvases: Map<string, Canvas>;
  notebooks: Map<string, CampaignNotebook>;
  notebookItems: Map<string, CampaignNotebookItem>;
  storyThreads: Map<string, StoryThread>;
  storySteps: Map<string, StoryStep>;
  sessionInferenceReviews: Map<string, SessionInferenceReview>;
}

export function createCampaignState(campaignId: string): CampaignState {
  return {
    campaignId,
    campaign: null,
    players: new Map(),
    invitations: new Map(),
    entities: new Map(),
    relations: new Map(),
    facts: new Map(),
    sessions: new Map(),
    sessionEvents: new Map(),
    tags: new Map(),
    attachments: new Map(),
    canvases: new Map(),
    notebooks: new Map(),
    notebookItems: new Map(),
    storyThreads: new Map(),
    storySteps: new Map(),
    sessionInferenceReviews: new Map(),
  };
}
