import type { EntityId } from "@shared/ids.js";
import { entitySchema } from "../domain/entity/entity.js";
import type { Entity } from "../domain/entity/entity.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type PlayerPortalCommandType =
  | "CreatePlayerInvitation"
  | "ConsumePlayerInvitation"
  | "RevokePlayerInvitation"
  | "IssuePlayerToken"
  | "RevokePlayerToken"
  | "UpdatePlayerLiveStatus"
  | "UpsertPlayerResource"
  | "RemovePlayerResource"
  | "CreatePlayerPortalNote"
  | "UpdatePlayerPortalNote"
  | "ArchivePlayerPortalNote"
  | "CreatePlayerPortalObjective"
  | "UpdatePlayerPortalObjective"
  | "ArchivePlayerPortalObjective"
  | "LinkPlayerCharacter"
  | "UnlinkPlayerCharacter"
  | "CreatePlayerCharacterProposal"
  | "ResolvePlayerCharacterProposal";

type PlayerPortalCommand = Extract<Command, { type: PlayerPortalCommandType }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireEntity(state: CampaignState, entityId: EntityId): Entity {
  const entity = state.entities.get(entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return entity;
}

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  // Generic factory: the concrete payload shape is only known by the caller.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return {
    eventId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    type,
    actorId,
    occurredAt: new Date().toISOString(),
    payload,
  } as StoredEvent<TPayload>;
}

export function handlePlayerPortalCommand(state: CampaignState, command: PlayerPortalCommand): CommandResult {
  switch (command.type) {
case "CreatePlayerInvitation": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerInvitationCreated", {
    inviteId: command.inviteId,
    inviteTokenHash: command.inviteTokenHash,
    label: command.label,
    createdAt: command.createdAt,
    expiresAt: command.expiresAt,
  }));
}
case "ConsumePlayerInvitation": {
  const inv = state.invitations?.get(command.inviteId);
  if (!inv) throw new Error("Invitation not found");
  if (inv.status !== "pending") throw new Error(`Invitation already ${inv.status}`);
  if (inv.expiresAt && new Date(inv.expiresAt) < new Date()) throw new Error("Invitation has expired");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerInvitationConsumed", {
    inviteId: command.inviteId,
    playerId: command.playerId,
    emailHash: command.emailHash,
    consumedAt: command.consumedAt,
  }));
}
case "RevokePlayerInvitation": {
  const inv = state.invitations?.get(command.inviteId);
  if (!inv) throw new Error("Invitation not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerInvitationRevoked", {
    inviteId: command.inviteId,
  }));
}
case "IssuePlayerToken": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerTokenIssued", {
    tokenId: command.tokenId,
    tokenHash: command.tokenHash,
    campaignId: command.campaignId,
    playerId: command.playerId,
    label: command.label,
    createdAt: command.createdAt,
  }));
}
case "RevokePlayerToken": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerTokenRevoked", {
    tokenId: command.tokenId,
    campaignId: command.campaignId,
    revokedAt: command.revokedAt,
  }));
}
case "UpdatePlayerLiveStatus": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerCharacterLiveStateUpdated", {
    campaignId: command.campaignId,
    playerId: command.playerId,
    characterEntityId: command.characterEntityId,
    status: command.status,
    updatedBy: command.updatedBy,
    updatedAt: command.updatedAt,
  }));
}
case "UpsertPlayerResource": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerResourceUpserted", {
    campaignId: command.campaignId,
    playerId: command.playerId,
    characterEntityId: command.characterEntityId,
    resource: command.resource,
    updatedBy: command.updatedBy,
    updatedAt: command.updatedAt,
  }));
}
case "RemovePlayerResource": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerResourceRemoved", {
    campaignId: command.campaignId,
    playerId: command.playerId,
    characterEntityId: command.characterEntityId,
    resourceId: command.resourceId,
    removedAt: command.removedAt,
  }));
}
case "CreatePlayerPortalNote": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalNoteCreated", {
    noteId: command.noteId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    title: command.title,
    content: command.content,
    visibility: command.visibility,
    linkedEntityIds: command.linkedEntityIds,
    createdAt: command.createdAt,
    updatedAt: command.createdAt,
  }));
}
case "UpdatePlayerPortalNote": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalNoteUpdated", {
    noteId: command.noteId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    ...(command.title !== undefined && { title: command.title }),
    ...(command.content !== undefined && { content: command.content }),
    ...(command.visibility !== undefined && { visibility: command.visibility }),
    ...(command.linkedEntityIds !== undefined && { linkedEntityIds: command.linkedEntityIds }),
    ...(command.archived !== undefined && { archived: command.archived }),
    updatedAt: command.updatedAt,
  }));
}
case "ArchivePlayerPortalNote": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalNoteArchived", {
    noteId: command.noteId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    archivedAt: command.archivedAt,
  }));
}
case "CreatePlayerPortalObjective": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalObjectiveCreated", {
    objectiveId: command.objectiveId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    title: command.title,
    description: command.description,
    kind: command.kind,
    status: command.status,
    visibility: command.visibility,
    linkedEntityIds: command.linkedEntityIds,
    createdAt: command.createdAt,
    updatedAt: command.createdAt,
  }));
}
case "UpdatePlayerPortalObjective": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalObjectiveUpdated", {
    objectiveId: command.objectiveId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    ...(command.title !== undefined && { title: command.title }),
    ...(command.description !== undefined && { description: command.description }),
    ...(command.kind !== undefined && { kind: command.kind }),
    ...(command.status !== undefined && { status: command.status }),
    ...(command.visibility !== undefined && { visibility: command.visibility }),
    ...(command.linkedEntityIds !== undefined && { linkedEntityIds: command.linkedEntityIds }),
    updatedAt: command.updatedAt,
  }));
}
case "ArchivePlayerPortalObjective": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerPortalObjectiveArchived", {
    objectiveId: command.objectiveId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    archivedAt: command.archivedAt,
  }));
}
case "LinkPlayerCharacter": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  requireEntity(state, command.characterEntityId);
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerCharacterLinked", {
    campaignId: command.campaignId,
    playerId: command.playerId,
    characterEntityId: command.characterEntityId,
    ownership: command.ownership,
    syncMode: command.syncMode,
    createdAt: command.createdAt,
    updatedAt: command.createdAt,
  }));
}
case "UnlinkPlayerCharacter": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerCharacterUnlinked", {
    campaignId: command.campaignId,
    playerId: command.playerId,
    characterEntityId: command.characterEntityId,
    unlinkedAt: command.removedAt,
  }));
}
case "CreatePlayerCharacterProposal": {
  if (!state.players.has(command.playerId)) throw new Error("Player not found");
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "PlayerCharacterProposalCreated", {
    proposalId: command.proposalId,
    campaignId: command.campaignId,
    playerId: command.playerId,
    targetCharacterEntityId: command.targetCharacterEntityId,
    kind: command.kind,
    proposedChanges: command.proposedChanges,
    status: "pending" as const,
    createdAt: command.createdAt,
  }));
}
case "ResolvePlayerCharacterProposal": {
  const resolvedEvent = makeEvent(command.actorId, command.campaignId, "PlayerCharacterProposalResolved", {
    proposalId: command.proposal.proposalId,
    campaignId: command.campaignId,
    playerId: command.proposal.playerId,
    status: command.status,
    dmResolutionNote: command.dmResolutionNote,
    resolvedAt: command.resolvedAt,
  });

  if (command.status === "rejected" || (!command.entityUpdate && !command.linkUpdate)) {
    return { state, events: [resolvedEvent] };
  }

  if (command.linkUpdate) {
    return {
      state,
      events: [
        resolvedEvent,
        makeEvent(command.actorId, command.campaignId, "PlayerCharacterLinked", {
          campaignId: command.campaignId,
          playerId: command.linkUpdate.playerId,
          characterEntityId: command.linkUpdate.characterEntityId,
          ownership: command.linkUpdate.ownership,
          syncMode: command.linkUpdate.syncMode,
          createdAt: command.linkUpdate.linkedAt,
          updatedAt: command.linkUpdate.linkedAt,
        }),
      ],
    };
  }

  if (!command.entityUpdate) {
    return { state, events: [resolvedEvent] };
  }

  const entity = requireEntity(state, command.entityUpdate.entityId);
  const metadataUpdate = isRecord(command.entityUpdate.updates.metadata)
    ? command.entityUpdate.updates.metadata
    : {};
  const updatedEntity = entitySchema.parse({
    ...entity,
    ...command.entityUpdate.updates,
    metadata: {
      ...entity.metadata,
      ...metadataUpdate,
    },
    updatedAt: command.resolvedAt,
  });

  return {
    state: { ...state, entities: new Map(state.entities).set(updatedEntity.entityId, updatedEntity) },
    events: [
      resolvedEvent,
      makeEvent(command.actorId, command.campaignId, "EntityUpdated", updatedEntity),
    ],
  };
}
  }
  throw new Error("Unsupported player portal command");
}
