import { eventPayloadSchemas, type StoredEvent } from "../domain/shared/events.js";
import type { CampaignProjection } from "./campaignProjection.js";
import type { CampaignPlayerRecord } from "../domain/state.js";
import type { Entity } from "../domain/entity/types.js";
import type {
  PlayerCharacterLink,
  PlayerCharacterProposal,
  PlayerCharacterSheetState,
  PlayerPortalNote,
  PlayerPortalObjective,
  PlayerResource,
  PlayerTokenRecord,
} from "../domain/playerPortal/types.js";

type PlayerTokenIssuedPayload = ReturnType<typeof eventPayloadSchemas.PlayerTokenIssued.parse>;
type PlayerTokenRevokedPayload = ReturnType<typeof eventPayloadSchemas.PlayerTokenRevoked.parse>;
type PlayerCharacterLinkedPayload = ReturnType<typeof eventPayloadSchemas.PlayerCharacterLinked.parse>;
type PlayerCharacterUnlinkedPayload = ReturnType<typeof eventPayloadSchemas.PlayerCharacterUnlinked.parse>;
type PlayerCharacterLiveStateUpdatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerCharacterLiveStateUpdated.parse>;
type PlayerResourceUpsertedPayload = ReturnType<typeof eventPayloadSchemas.PlayerResourceUpserted.parse>;
type PlayerResourceRemovedPayload = ReturnType<typeof eventPayloadSchemas.PlayerResourceRemoved.parse>;
type PlayerPortalNoteCreatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalNoteCreated.parse>;
type PlayerPortalNoteUpdatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalNoteUpdated.parse>;
type PlayerPortalNoteArchivedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalNoteArchived.parse>;
type PlayerPortalObjectiveCreatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalObjectiveCreated.parse>;
type PlayerPortalObjectiveUpdatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalObjectiveUpdated.parse>;
type PlayerPortalObjectiveArchivedPayload = ReturnType<typeof eventPayloadSchemas.PlayerPortalObjectiveArchived.parse>;
type PlayerCharacterProposalCreatedPayload = ReturnType<typeof eventPayloadSchemas.PlayerCharacterProposalCreated.parse>;
type PlayerCharacterProposalResolvedPayload = ReturnType<typeof eventPayloadSchemas.PlayerCharacterProposalResolved.parse>;

export interface PlayerPortalDmSummary {
  playerId: string;
  displayName: string;
  link?: PlayerCharacterLink;
  sheet?: PlayerCharacterSheetState;
  notes: PlayerPortalNote[];
  objectives: PlayerPortalObjective[];
  proposals: PlayerCharacterProposal[];
}

export interface PlayerPortalProjection {
  tokensByHash: Map<string, PlayerTokenRecord>;
  tokensById: Map<string, PlayerTokenRecord>;
  linksByPlayerId: Map<string, PlayerCharacterLink>;
  sheetsByPlayerId: Map<string, PlayerCharacterSheetState>;
  notesByPlayerId: Map<string, PlayerPortalNote[]>;
  objectivesByPlayerId: Map<string, PlayerPortalObjective[]>;
  proposalsByPlayerId: Map<string, PlayerCharacterProposal[]>;
  dmSummaries: PlayerPortalDmSummary[];
}

/** Normalizes a Map or array into an iterable of values. */
function toValues<T>(collection: Map<string, T> | T[] | undefined | null): T[] {
  if (!collection) return [];
  if (collection instanceof Map) return [...collection.values()];
  return collection as T[];
}

export function buildPlayerPortalProjection(
  campaign: CampaignProjection,
  events: StoredEvent[]
): PlayerPortalProjection {
  const tokensByHash = new Map<string, PlayerTokenRecord>();
  const tokensById = new Map<string, PlayerTokenRecord>();
  const explicitLinkedPlayers = new Set<string>();
  const linksByPlayerId = new Map<string, PlayerCharacterLink>();
  const sheetsByPlayerId = new Map<string, PlayerCharacterSheetState>();
  const notesById = new Map<string, PlayerPortalNote>();
  const objectivesById = new Map<string, PlayerPortalObjective>();
  const proposalsById = new Map<string, PlayerCharacterProposal>();

  // Synthesize previous soft links from player_character entities with metadata.playerId
  for (const item of toValues<Entity>(campaign.entities)) {
    if (item.entityType !== "player_character" || item.archived) continue;
    const playerId = typeof item.metadata.playerId === "string" ? item.metadata.playerId : undefined;
    if (!playerId) continue;
    linksByPlayerId.set(playerId, {
      campaignId: item.campaignId,
      playerId,
      characterEntityId: item.entityId,
      ownership: "campaign_premade",
      syncMode: "live_player_editable",
      createdAt: item.createdAt ?? "",
      updatedAt: item.updatedAt ?? item.createdAt ?? "",
    });
  }

  // Process events in sequence order
  for (const ev of [...events].sort((a, b) => a.sequence - b.sequence)) {
    switch (ev.type) {
      case "PlayerTokenIssued": {
        const payload: PlayerTokenIssuedPayload = eventPayloadSchemas.PlayerTokenIssued.parse(ev.payload);
        const record: PlayerTokenRecord = { ...payload };
        tokensByHash.set(record.tokenHash, record);
        tokensById.set(record.tokenId, record);
        break;
      }
      case "PlayerTokenRevoked": {
        const payload: PlayerTokenRevokedPayload = eventPayloadSchemas.PlayerTokenRevoked.parse(ev.payload);
        const existing = tokensById.get(payload.tokenId);
        if (existing) {
          const revoked = { ...existing, revokedAt: payload.revokedAt };
          tokensById.set(payload.tokenId, revoked);
          tokensByHash.set(revoked.tokenHash, revoked);
        }
        break;
      }
      case "PlayerCharacterLinked": {
        const payload: PlayerCharacterLinkedPayload = eventPayloadSchemas.PlayerCharacterLinked.parse(ev.payload);
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.set(payload.playerId, { ...payload });
        break;
      }
      case "PlayerCharacterUnlinked": {
        const payload: PlayerCharacterUnlinkedPayload = eventPayloadSchemas.PlayerCharacterUnlinked.parse(ev.payload);
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.delete(payload.playerId);
        sheetsByPlayerId.delete(payload.playerId);
        break;
      }
      case "PlayerCharacterLiveStateUpdated": {
        const payload: PlayerCharacterLiveStateUpdatedPayload = eventPayloadSchemas.PlayerCharacterLiveStateUpdated.parse(ev.payload);
        const previous = sheetsByPlayerId.get(payload.playerId);
        const previousStatus = previous?.status ?? { conditions: [] as string[] };
        const incomingStatus = payload.status ?? {};
        sheetsByPlayerId.set(payload.playerId, {
          campaignId: payload.campaignId,
          playerId: payload.playerId,
          characterEntityId: payload.characterEntityId,
          status: {
            ...previousStatus,
            ...incomingStatus,
            // conditions array replaces if present in payload, otherwise keep previous
            conditions: incomingStatus.conditions ?? previousStatus.conditions ?? [],
          },
          resources: previous?.resources ?? [],
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerResourceUpserted": {
        const payload: PlayerResourceUpsertedPayload = eventPayloadSchemas.PlayerResourceUpserted.parse(ev.payload);
        const previous = sheetsByPlayerId.get(payload.playerId);
        const resources = upsertResource(previous?.resources ?? [], payload.resource);
        sheetsByPlayerId.set(payload.playerId, {
          campaignId: payload.campaignId,
          playerId: payload.playerId,
          characterEntityId: payload.characterEntityId,
          status: previous?.status ?? { conditions: [] },
          resources,
          updatedBy: payload.updatedBy ?? "dm",
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerResourceRemoved": {
        const payload: PlayerResourceRemovedPayload = eventPayloadSchemas.PlayerResourceRemoved.parse(ev.payload);
        const previous = sheetsByPlayerId.get(payload.playerId);
        if (!previous) break;
        sheetsByPlayerId.set(payload.playerId, {
          ...previous,
          resources: previous.resources.filter((r) => r.resourceId !== payload.resourceId),
          updatedBy: "dm",
          updatedAt: payload.removedAt,
        });
        break;
      }
      case "PlayerPortalNoteCreated": {
        const payload: PlayerPortalNoteCreatedPayload = eventPayloadSchemas.PlayerPortalNoteCreated.parse(ev.payload);
        notesById.set(payload.noteId, { ...payload, archived: false });
        break;
      }
      case "PlayerPortalNoteUpdated": {
        const payload: PlayerPortalNoteUpdatedPayload = eventPayloadSchemas.PlayerPortalNoteUpdated.parse(ev.payload);
        const existing = notesById.get(payload.noteId);
        if (existing) notesById.set(payload.noteId, { ...existing, ...payload });
        break;
      }
      case "PlayerPortalNoteArchived": {
        const payload: PlayerPortalNoteArchivedPayload = eventPayloadSchemas.PlayerPortalNoteArchived.parse(ev.payload);
        const note = notesById.get(payload.noteId);
        if (note) notesById.set(payload.noteId, { ...note, archived: true, updatedAt: payload.archivedAt });
        break;
      }
      case "PlayerPortalObjectiveCreated": {
        const payload: PlayerPortalObjectiveCreatedPayload = eventPayloadSchemas.PlayerPortalObjectiveCreated.parse(ev.payload);
        objectivesById.set(payload.objectiveId, payload);
        break;
      }
      case "PlayerPortalObjectiveUpdated": {
        const payload: PlayerPortalObjectiveUpdatedPayload = eventPayloadSchemas.PlayerPortalObjectiveUpdated.parse(ev.payload);
        const existing = objectivesById.get(payload.objectiveId);
        if (existing) {
          objectivesById.set(payload.objectiveId, {
            ...existing,
            ...payload,
          });
        }
        break;
      }
      case "PlayerPortalObjectiveArchived": {
        const payload: PlayerPortalObjectiveArchivedPayload = eventPayloadSchemas.PlayerPortalObjectiveArchived.parse(ev.payload);
        const objective = objectivesById.get(payload.objectiveId);
        if (objective) {
          objectivesById.set(payload.objectiveId, {
            ...objective,
            status: "archived" as const,
            updatedAt: payload.archivedAt,
          });
        }
        break;
      }
      case "PlayerCharacterProposalCreated": {
        const payload: PlayerCharacterProposalCreatedPayload = eventPayloadSchemas.PlayerCharacterProposalCreated.parse(ev.payload);
        proposalsById.set(payload.proposalId, { ...payload, status: "pending" as const });
        break;
      }
      case "PlayerCharacterProposalResolved": {
        const payload: PlayerCharacterProposalResolvedPayload = eventPayloadSchemas.PlayerCharacterProposalResolved.parse(ev.payload);
        const proposal = proposalsById.get(payload.proposalId);
        if (proposal) {
          proposalsById.set(payload.proposalId, {
            ...proposal,
            status: payload.status,
            dmResolutionNote: payload.dmResolutionNote,
            resolvedAt: payload.resolvedAt,
          });
        }
        break;
      }
    }
  }

  // Supersede any soft previous link for players that had explicit link/unlink events.
  // The event processing already handled Linked (set) and Unlinked (delete), so
  // this ensures that players with only Unlinked events don't retain a soft link.
  for (const playerId of explicitLinkedPlayers) {
    const hasLinkedEvent = events.some(
      (ev) =>
        ev.type === "PlayerCharacterLinked" &&
        eventPayloadSchemas.PlayerCharacterLinked.safeParse(ev.payload).data?.playerId === playerId
    );
    if (!hasLinkedEvent) {
      // Only Unlinked events fired — no active explicit link; soft link already deleted
      linksByPlayerId.delete(playerId);
    }
  }

  const notesByPlayerId = groupByPlayer([...notesById.values()].filter((n) => !n.archived));
  const objectivesByPlayerId = groupByPlayer(
    [...objectivesById.values()].filter((o) => o.status !== "archived")
  );
  const proposalsByPlayerId = groupByPlayer([...proposalsById.values()]);

  const players = toValues<CampaignPlayerRecord>(campaign.players);
  const dmSummaries: PlayerPortalDmSummary[] = players
    .filter((p) => !p.archived)
    .map((p) => ({
      playerId: p.playerId,
      displayName: p.displayName ?? p.playerId,
      link: linksByPlayerId.get(p.playerId),
      sheet: sheetsByPlayerId.get(p.playerId),
      notes: (notesByPlayerId.get(p.playerId) ?? []).filter((n) => n.visibility === "dm_visible"),
      objectives: (objectivesByPlayerId.get(p.playerId) ?? []).filter(
        (o) => o.visibility === "dm_visible"
      ),
      proposals: proposalsByPlayerId.get(p.playerId) ?? [],
    }));

  return {
    tokensByHash,
    tokensById,
    linksByPlayerId,
    sheetsByPlayerId,
    notesByPlayerId,
    objectivesByPlayerId,
    proposalsByPlayerId,
    dmSummaries,
  };
}

function upsertResource(resources: PlayerResource[], resource: PlayerResource): PlayerResource[] {
  const next = resources.filter((r) => r.resourceId !== resource.resourceId);
  next.push(resource);
  return next;
}

function groupByPlayer<T extends { playerId: string }>(items: T[]): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const item of items) {
    const existing = result.get(item.playerId) ?? [];
    existing.push(item);
    result.set(item.playerId, existing);
  }
  return result;
}
