import type { StoredEvent } from "../domain/shared/events.js";
import type { CampaignProjection } from "./campaignProjection.js";
import type {
  PlayerCharacterLink,
  PlayerCharacterProposal,
  PlayerCharacterSheetState,
  PlayerPortalNote,
  PlayerPortalObjective,
  PlayerResource,
  PlayerTokenRecord,
} from "../domain/playerPortal/types.js";

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

  // Synthesize legacy soft links from player_character entities with metadata.playerId
  for (const item of toValues<any>(campaign.entities as any)) {
    if (item.entityType !== "player_character" || item.archived) continue;
    const playerId = item.metadata?.playerId;
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
    const payload: any = ev.payload;
    switch (ev.type) {
      case "PlayerTokenIssued": {
        const record: PlayerTokenRecord = { ...payload };
        tokensByHash.set(record.tokenHash, record);
        tokensById.set(record.tokenId, record);
        break;
      }
      case "PlayerTokenRevoked": {
        const existing = tokensById.get(payload.tokenId);
        if (existing) {
          const revoked = { ...existing, revokedAt: payload.revokedAt };
          tokensById.set(payload.tokenId, revoked);
          tokensByHash.set(revoked.tokenHash, revoked);
        }
        break;
      }
      case "PlayerCharacterLinked": {
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.set(payload.playerId, { ...payload });
        break;
      }
      case "PlayerCharacterUnlinked": {
        explicitLinkedPlayers.add(payload.playerId);
        linksByPlayerId.delete(payload.playerId);
        sheetsByPlayerId.delete(payload.playerId);
        break;
      }
      case "PlayerCharacterLiveStateUpdated": {
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
        const previous = sheetsByPlayerId.get(payload.playerId);
        const resources = upsertResource(previous?.resources ?? [], payload.resource);
        sheetsByPlayerId.set(payload.playerId, {
          campaignId: payload.campaignId,
          playerId: payload.playerId,
          characterEntityId: payload.characterEntityId,
          status: previous?.status ?? { conditions: [] },
          resources,
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerResourceRemoved": {
        const previous = sheetsByPlayerId.get(payload.playerId);
        if (!previous) break;
        sheetsByPlayerId.set(payload.playerId, {
          ...previous,
          resources: previous.resources.filter((r) => r.resourceId !== payload.resourceId),
          updatedBy: payload.updatedBy,
          updatedAt: payload.updatedAt,
        });
        break;
      }
      case "PlayerPortalNoteCreated":
      case "PlayerPortalNoteUpdated": {
        notesById.set(payload.noteId, { ...(notesById.get(payload.noteId) as any), ...payload });
        break;
      }
      case "PlayerPortalNoteArchived": {
        const note = notesById.get(payload.noteId);
        if (note) notesById.set(payload.noteId, { ...note, archived: true, updatedAt: payload.archivedAt });
        break;
      }
      case "PlayerPortalObjectiveCreated":
      case "PlayerPortalObjectiveUpdated": {
        objectivesById.set(payload.objectiveId, {
          ...(objectivesById.get(payload.objectiveId) as any),
          ...payload,
        });
        break;
      }
      case "PlayerPortalObjectiveArchived": {
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
        proposalsById.set(payload.proposalId, { ...payload, status: "pending" as const });
        break;
      }
      case "PlayerCharacterProposalResolved": {
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

  // Supersede any soft legacy link for players that had explicit link/unlink events.
  // The event processing already handled Linked (set) and Unlinked (delete), so
  // this ensures that players with only Unlinked events don't retain a soft link.
  for (const playerId of explicitLinkedPlayers) {
    const hasLinkedEvent = events.some(
      (ev) => ev.type === "PlayerCharacterLinked" && (ev.payload as any).playerId === playerId
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

  const players = toValues<any>(campaign.players as any);
  const dmSummaries: PlayerPortalDmSummary[] = players
    .filter((p: any) => !p.archived)
    .map((p: any) => ({
      playerId: p.playerId,
      displayName: p.displayName ?? p.name ?? p.playerId,
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
