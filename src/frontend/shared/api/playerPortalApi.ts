import { apiFetch } from "./apiClient.js";
import type {
  PlayerCharacterProposalKind,
  PlayerCharacterProposalStatus,
  PlayerPortalObjectiveKind,
  PlayerPortalObjectiveStatus,
} from "@core/domain/playerPortal/types.js";

const jsonInit = (method: string, body?: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

// Response contract for GET .../player-portal/dm-character-summary. There is no backend
// Zod schema for this endpoint (it returns an ad hoc shape from playerCharacterLinkWebRoutes.ts),
// so this is the only definition of it; it reuses the official player-portal proposal/objective
// unions where the backend's remapped fields line up with them.
export interface DmPortalCharacterSummary {
  entityId: string;
  entityType: string;
  title: string;
  summary?: string;
  status?: string;
  importance?: string;
}

export interface DmPortalProposal {
  proposalId: string;
  kind?: PlayerCharacterProposalKind;
  status?: PlayerCharacterProposalStatus;
  targetCharacterEntityId?: string;
  proposedChanges?: {
    title?: string;
    name?: string;
    className?: string;
    species?: string;
    race?: string;
    background?: string;
  };
}

export interface DmPortalObjective {
  objectiveId: string;
  title: string;
  description?: string;
  status?: PlayerPortalObjectiveStatus;
  kind?: PlayerPortalObjectiveKind;
}

export interface DmPortalNote {
  noteId: string;
  title: string;
  content?: string;
}

export interface DmPortalPlayerSheetStatus {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions?: string[];
}

export interface DmPortalPlayer {
  playerId: string;
  displayName: string;
  link: { characterEntityId: string } | null;
  linkedCharacter?: DmPortalCharacterSummary | null;
  sheet?: { status?: DmPortalPlayerSheetStatus };
  proposals?: DmPortalProposal[];
  objectives?: DmPortalObjective[];
  notes?: DmPortalNote[];
}

export interface DmPlayerPortalSummary {
  players: DmPortalPlayer[];
  availableCharacters?: DmPortalCharacterSummary[];
}
export const getPlayerPortalState = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/player-portal/state`);
export const updatePlayerPortalStatus = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/status`, { init: jsonInit("PUT", payload) });
export const createPlayerPortalResource = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/resources`, { init: jsonInit("POST", payload) });
export const updatePlayerPortalResource = (campaignId: string, resourceId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/resources/${resourceId}`, { init: jsonInit("PUT", payload) });
export const createPlayerPortalNote = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/notes`, { init: jsonInit("POST", payload) });
export const updatePlayerPortalNote = (campaignId: string, noteId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/notes/${noteId}`, { init: jsonInit("PUT", payload) });
export const createPlayerPortalObjective = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/objectives`, { init: jsonInit("POST", payload) });
export const updatePlayerPortalObjective = (campaignId: string, objectiveId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/objectives/${objectiveId}`, { init: jsonInit("PUT", payload) });
export const createPlayerPortalProposal = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/proposals`, { init: jsonInit("POST", payload) });
export const getPlayerPortalDmSummary = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/player-portal/dm-character-summary`);
export const resolvePlayerPortalProposal = (campaignId: string, proposalId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/proposals/${proposalId}/resolve-character`, { init: jsonInit("PUT", payload) });
export const linkPlayerCharacter = (campaignId: string, payload: unknown) => apiFetch(`/api/campaigns/${campaignId}/player-portal/links`, { init: jsonInit("POST", payload) });
export const unlinkPlayerCharacter = (campaignId: string, playerId: string) => apiFetch(`/api/campaigns/${campaignId}/player-portal/links/${playerId}`, { init: { method: "DELETE" } });
