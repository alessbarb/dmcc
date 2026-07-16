import { createId } from "@shared/ids.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type SupportCommandType =
  | "UpdateCampaignSettings"
  | "CreatePlayerProfile"
  | "UpdatePlayerProfile"
  | "ArchivePlayerProfile"
  | "AddAttachment"
  | "RemoveAttachment"
  | "RecordImport"
  | "RecordExport"
  | "ChangeVisibility"
  | "RestoreBackup"
  | "CreateTag"
  | "AddTagToEntity"
  | "RemoveTagFromEntity";

type SupportCommand = Extract<Command, { type: SupportCommandType }>;

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  // The event union is discriminated by the command handlers above; the generic payload is preserved by callers.
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

function requireEntity(state: CampaignState, entityId: string) {
  const entity = state.entities.get(entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return entity;
}

function requireRelation(state: CampaignState, relationId: string) {
  const relation = state.relations.get(relationId);
  if (!relation) throw new Error(`Relation not found: ${relationId}`);
  return relation;
}

function requireFact(state: CampaignState, factId: string) {
  const fact = state.facts.get(factId);
  if (!fact) throw new Error(`Fact not found: ${factId}`);
  return fact;
}

export function handleSupportCommand(state: CampaignState, command: SupportCommand): CommandResult {
  switch (command.type) {
case "UpdateCampaignSettings": {
  if (!state.campaign) throw new Error("Campaign not found");
  const nextCampaign = {
    ...state.campaign,
    settings: campaignSettingsSchema.parse({
      ...state.campaign.settings,
      ...command.settings,
    }),
  };
  return singleEvent({ ...state, campaign: nextCampaign }, makeEvent(command.actorId, command.campaignId, "SettingsUpdated", command.settings));
}
case "CreatePlayerProfile": {
  const player = {
    id: command.playerId,
    playerId: command.playerId,
    campaignId: command.campaignId,
    displayName: command.displayName || command.name || "Player",
    ...(command.emailHash && { emailHash: command.emailHash }),
    role: command.role || "player",
    color: command.color || "#3b82f6",
    imageUrl: command.imageUrl || "",
    avatarUrl: command.avatarUrl,
    isActive: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const players = new Map(state.players);
  players.set(player.playerId, player);
  return singleEvent({ ...state, players }, makeEvent(command.actorId, command.campaignId, "PlayerProfileCreated", player));
}
case "UpdatePlayerProfile": {
  const existing = state.players.get(command.playerId);
  if (!existing) throw new Error("Player profile not found");
  const updated = {
    ...existing,
    ...(command.displayName !== undefined && { displayName: command.displayName }),
    ...(command.emailHash !== undefined && { emailHash: command.emailHash }),
    ...(command.email !== undefined && command.emailHash === undefined && { email: command.email }),
    ...(command.imageUrl !== undefined && { imageUrl: command.imageUrl }),
    ...(command.avatarUrl !== undefined && { avatarUrl: command.avatarUrl }),
    ...(command.role !== undefined && { role: command.role }),
    ...(command.color !== undefined && { color: command.color }),
    ...(command.isActive !== undefined && { isActive: command.isActive }),
    updatedAt: new Date().toISOString(),
  };
  const players = new Map(state.players);
  players.set(updated.playerId, updated);
  return singleEvent({ ...state, players }, makeEvent(command.actorId, command.campaignId, "PlayerProfileUpdated", updated));
}
case "ArchivePlayerProfile": {
  const existing = state.players.get(command.playerId);
  if (!existing) throw new Error("Player profile not found");
  const updated = {
    ...existing,
    archived: true,
    updatedAt: new Date().toISOString(),
  };
  const players = new Map(state.players);
  players.set(updated.playerId, updated);
  return singleEvent({ ...state, players }, makeEvent(command.actorId, command.campaignId, "PlayerProfileArchived", { playerId: command.playerId }));
}
case "AddAttachment": {
  const attachment = {
    id: command.attachmentId,
    filename: command.filename,
    mimeType: command.mimeType,
    sizeBytes: command.sizeBytes,
  };
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "AttachmentAdded", attachment));
}
case "RemoveAttachment": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "AttachmentRemoved", { id: command.attachmentId }));
}
case "RecordImport": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "ImportCompleted", {
    importId: command.importId,
    format: command.format,
    count: command.count,
  }));
}
case "RecordExport": {
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "ExportCompleted", {
    exportId: command.exportId,
    format: command.format,
  }));
}
case "ChangeVisibility": {
  const nextState = { ...state };
  if (command.targetType === "entity") {
    const entity = requireEntity(state, command.targetId);
    const updated = { ...entity, visibility: command.visibility };
    nextState.entities = new Map(state.entities);
    nextState.entities.set(updated.entityId, updated);
  } else if (command.targetType === "relation") {
    const relation = requireRelation(state, command.targetId);
    const updated = { ...relation, visibility: command.visibility };
    nextState.relations = new Map(state.relations);
    nextState.relations.set(updated.relationId, updated);
  } else if (command.targetType === "fact") {
    const fact = requireFact(state, command.targetId);
    const updated = { ...fact, visibility: command.visibility };
    nextState.facts = new Map(state.facts);
    nextState.facts.set(updated.factId, updated);
  }
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "VisibilityChanged", {
      targetId: command.targetId,
      targetType: command.targetType,
      visibility: command.visibility,
    }));
}
case "RestoreBackup": {
  // Restore is handled at the persistence layer (file copy).
  // This command records the restore event in the event log AFTER
  // the persistence layer has already swapped the files.
  return singleEvent(state, makeEvent(command.actorId, command.campaignId, "SettingsUpdated", {
    restoredFromBackup: command.backupId,
    restoredAt: new Date().toISOString(),
  }));
}
case "CreateTag": {
  const tagId = command.tagId ?? createId("tag");
  const tag = { id: tagId, name: command.name, color: command.color ?? "#6366f1" };
  const tags = new Map(state.tags ?? []);
  tags.set(tagId, tag);
  return singleEvent({ ...state, tags }, makeEvent(command.actorId, command.campaignId, "TagCreated", tag));
}
case "AddTagToEntity": {
  const entity = requireEntity(state, command.entityId);
  const tagIds = [...new Set([...(entity.tagIds ?? []), command.tagId])];
  const updated = { ...entity, tagIds };
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  return singleEvent({ ...state, entities }, makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated));
}
case "RemoveTagFromEntity": {
  const entity = requireEntity(state, command.entityId);
  const tagIds = (entity.tagIds ?? []).filter((t: string) => t !== command.tagId);
  const updated = { ...entity, tagIds };
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  return singleEvent({ ...state, entities }, makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated));
}
  }
  throw new Error("Unsupported support command");
}
