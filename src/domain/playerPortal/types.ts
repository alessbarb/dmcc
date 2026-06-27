export type PlayerCharacterOwnership = "campaign_premade" | "player_owned";
export type PlayerCharacterSyncMode = "live_player_editable" | "dm_review_required";
export type PlayerPortalVisibility = "private" | "dm_visible";
export type PlayerPortalObjectiveKind = "personal" | "session" | "question_for_dm";
export type PlayerPortalObjectiveStatus = "open" | "done" | "archived";
export type PlayerCharacterProposalKind = "create_character" | "update_character_core";
export type PlayerCharacterProposalStatus = "pending" | "approved" | "rejected";
export type PlayerPortalUpdatedBy = "player" | "dm";

export interface PlayerTokenRecord {
  tokenId: string;
  tokenHash: string;
  campaignId: string;
  playerId: string;
  label?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface PlayerCharacterLink {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  ownership: PlayerCharacterOwnership;
  syncMode: PlayerCharacterSyncMode;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerCharacterLiveStatus {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions: string[];
}

export interface PlayerResource {
  resourceId: string;
  label: string;
  current: number;
  max: number;
  recovery?: "short_rest" | "long_rest" | "manual";
}

export interface PlayerCharacterSheetState {
  campaignId: string;
  playerId: string;
  characterEntityId: string;
  status: PlayerCharacterLiveStatus;
  resources: PlayerResource[];
  updatedBy: PlayerPortalUpdatedBy;
  updatedAt: string;
}

export interface PlayerPortalNote {
  noteId: string;
  campaignId: string;
  playerId: string;
  title: string;
  content: string;
  visibility: PlayerPortalVisibility;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface PlayerPortalObjective {
  objectiveId: string;
  campaignId: string;
  playerId: string;
  title: string;
  description?: string;
  kind: PlayerPortalObjectiveKind;
  status: PlayerPortalObjectiveStatus;
  visibility: PlayerPortalVisibility;
  linkedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerCharacterProposal {
  proposalId: string;
  campaignId: string;
  playerId: string;
  targetCharacterEntityId?: string;
  kind: PlayerCharacterProposalKind;
  status: PlayerCharacterProposalStatus;
  proposedChanges: Record<string, unknown>;
  dmResolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}
