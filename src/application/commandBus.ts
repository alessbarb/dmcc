import { createId } from "../shared/ids.js";
import type { EntityId, FactId, RelationId, SessionId } from "../shared/ids.js";
import { createCampaign } from "../domain/campaign/campaign.js";
import { createEntity } from "../domain/entity/entity.js";
import type { Entity } from "../domain/entity/entity.js";
import { createFact } from "../domain/fact/fact.js";
import type { Fact } from "../domain/fact/fact.js";
import { createRelation } from "../domain/relation/relation.js";
import type { Relation } from "../domain/relation/relation.js";
import { closeSession, createSession } from "../domain/session/session.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";

export interface CommandResult {
  state: CampaignState;
  event: StoredEvent;
}

export function handleCommand(state: CampaignState, command: Command): CommandResult {
  switch (command.type) {
    case "CreateCampaign": {
      const campaign = createCampaign({
        campaignId: command.campaignId,
        title: command.title,
        summary: command.summary,
        system: command.system,
        settings: command.settings,
      });
      const nextState = { ...state, campaign };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "CampaignCreated", campaign) };
    }
    case "CreateEntity": {
      const entity = createEntity({
        entityId: command.entityId ?? createId("ent"),
        campaignId: command.campaignId,
        entityType: command.entityType,
        title: command.title,
        summary: command.summary,
        content: command.content,
        status: command.status,
        importance: command.importance,
        visibility: command.visibility,
        metadata: command.metadata,
      });
      const entities = new Map(state.entities);
      entities.set(entity.entityId, entity);
      const nextState = { ...state, entities };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "EntityCreated", entity) };
    }
    case "CreateRelation": {
      const source = requireEntity(state, command.sourceEntityId);
      const target = requireEntity(state, command.targetEntityId);
      const duplicate = [...state.relations.values()].some(
        (relation) =>
          !relation.archived &&
          relation.sourceEntityId === command.sourceEntityId &&
          relation.targetEntityId === command.targetEntityId &&
          relation.relationType === command.relationType,
      );
      if (duplicate && command.allowDuplicate !== true) {
        throw new Error("Duplicate relation requires confirmation");
      }
      const relation = createRelation({
        relationId: command.relationId ?? createId("rel"),
        campaignId: command.campaignId,
        source,
        target,
        relationType: command.relationType,
        description: command.description,
        visibility: command.visibility,
        sourceSessionId: command.sourceSessionId,
        sourceFactId: command.sourceFactId,
      });
      const relations = new Map(state.relations);
      relations.set(relation.relationId, relation);
      const nextState = { ...state, relations };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "RelationCreated", relation) };
    }
    case "RecordFact": {
      const fact = createFact({
        factId: command.factId ?? createId("fact"),
        campaignId: command.campaignId,
        statement: command.statement,
        kind: command.kind,
        confidence: command.confidence,
        visibility: command.visibility,
        relatedEntityIds: command.relatedEntityIds,
        relatedRelationIds: command.relatedRelationIds,
        source: command.source,
      });
      const facts = new Map(state.facts);
      facts.set(fact.factId, fact);
      const nextState = { ...state, facts };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "FactCreated", fact) };
    }
    case "StartSession": {
      const session = createSession({
        sessionId: command.sessionId ?? createId("sess"),
        campaignId: command.campaignId,
        title: command.title,
        existingSessions: [...state.sessions.values()],
      });
      session.startedAt = new Date().toISOString();
      const sessions = new Map(state.sessions);
      sessions.set(session.sessionId, session);
      const nextState = { ...state, sessions };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "SessionStarted", session) };
    }
    case "CloseSession": {
      const session = requireSession(state, command.sessionId);
      const closed = closeSession(session, command.summary);
      closed.endedAt = new Date().toISOString();
      const sessions = new Map(state.sessions);
      sessions.set(closed.sessionId, closed);
      const nextState = { ...state, sessions };
      return { state: nextState, event: makeEvent(command.actorId, command.campaignId, "SessionClosed", closed) };
    }
    case "UpdateEntity": {
      const entity = requireEntity(state, command.entityId);
      if (entity.archived) throw new Error("Cannot update archived entity");
      const updated: Entity = {
        ...entity,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        ...(command.content !== undefined && { content: command.content }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.importance !== undefined && { importance: command.importance }),
        ...(command.visibility !== undefined && { visibility: command.visibility }),
        ...(command.metadata !== undefined && { metadata: command.metadata }),
      };
      if (updated.title.trim().length === 0) throw new Error("Entity title is required");
      const entities = new Map(state.entities);
      entities.set(updated.entityId, updated);
      return { state: { ...state, entities }, event: makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated) };
    }
    case "ArchiveEntity": {
      const entity = requireEntity(state, command.entityId);
      if (entity.archived) throw new Error("Entity is already archived");
      const archived: Entity = { ...entity, archived: true };
      const entities = new Map(state.entities);
      entities.set(archived.entityId, archived);
      return { state: { ...state, entities }, event: makeEvent(command.actorId, command.campaignId, "EntityArchived", { entityId: command.entityId }) };
    }
    case "UpdateRelation": {
      const relation = requireRelation(state, command.relationId);
      if (relation.archived) throw new Error("Cannot update archived relation");
      const updated = {
        ...relation,
        ...(command.description !== undefined && { description: command.description }),
        ...(command.visibility !== undefined && { visibility: command.visibility }),
      };
      const relations = new Map(state.relations);
      relations.set(updated.relationId, updated);
      return { state: { ...state, relations }, event: makeEvent(command.actorId, command.campaignId, "RelationUpdated", updated) };
    }
    case "ArchiveRelation": {
      const relation = requireRelation(state, command.relationId);
      if (relation.archived) throw new Error("Relation is already archived");
      const archived = { ...relation, archived: true, status: "archived" as const };
      const relations = new Map(state.relations);
      relations.set(archived.relationId, archived);
      return { state: { ...state, relations }, event: makeEvent(command.actorId, command.campaignId, "RelationArchived", { relationId: command.relationId }) };
    }
    case "UpdateFact": {
      const fact = requireFact(state, command.factId);
      if (fact.archived) throw new Error("Cannot update archived fact");
      const updated = {
        ...fact,
        ...(command.statement !== undefined && { statement: command.statement }),
        ...(command.kind !== undefined && { kind: command.kind }),
        ...(command.confidence !== undefined && { confidence: command.confidence }),
        ...(command.visibility !== undefined && { visibility: command.visibility }),
      };
      if (updated.statement.trim().length === 0) throw new Error("Fact statement is required");
      const facts = new Map(state.facts);
      facts.set(updated.factId, updated);
      return { state: { ...state, facts }, event: makeEvent(command.actorId, command.campaignId, "FactUpdated", updated) };
    }
    case "ArchiveFact": {
      const fact = requireFact(state, command.factId);
      if (fact.archived) throw new Error("Fact is already archived");
      const archived = { ...fact, archived: true };
      const facts = new Map(state.facts);
      facts.set(archived.factId, archived);
      return { state: { ...state, facts }, event: makeEvent(command.actorId, command.campaignId, "FactArchived", { factId: command.factId }) };
    }
    case "RevealClue": {
      const clue = requireEntity(state, command.clueEntityId);
      if (clue.entityType !== "clue") {
        throw new Error("RevealClue requires a clue entity");
      }
      requireSession(state, command.sessionId);
      const updated: Entity = { ...clue, visibility: command.audience };
      const entities = new Map(state.entities);
      entities.set(updated.entityId, updated);
      const nextState = { ...state, entities };
      return {
        state: nextState,
        event: makeEvent(command.actorId, command.campaignId, "VisibilityChanged", {
          targetId: command.clueEntityId,
          targetType: "entity" as const,
          visibility: command.audience,
          sessionId: command.sessionId,
          note: command.note,
        }),
      };
    }
    case "UpdateCampaignSettings": {
      if (!state.campaign) throw new Error("Campaign not found");
      const nextCampaign = {
        ...state.campaign,
        settings: {
          ...state.campaign.settings,
          ...command.settings,
        } as any,
      };
      return {
        state: { ...state, campaign: nextCampaign },
        event: makeEvent(command.actorId, command.campaignId, "SettingsUpdated", command.settings),
      };
    }
    case "CreatePlayerProfile": {
      const player = {
        id: command.playerId,
        playerId: command.playerId,
        campaignId: command.campaignId,
        displayName: command.displayName || command.name || "Player",
        role: command.role || "player",
        color: command.color || "#3b82f6",
        imageUrl: command.imageUrl || "",
        isActive: true,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const players = new Map(state.players);
      players.set(player.playerId, player);
      return {
        state: { ...state, players },
        event: makeEvent(command.actorId, command.campaignId, "PlayerProfileCreated", player),
      };
    }
    case "UpdatePlayerProfile": {
      const existing = state.players.get(command.playerId);
      if (!existing) throw new Error("Player profile not found");
      const updated = {
        ...existing,
        ...(command.displayName !== undefined && { displayName: command.displayName }),
        ...(command.email !== undefined && { email: command.email }),
        ...(command.imageUrl !== undefined && { imageUrl: command.imageUrl }),
        ...(command.role !== undefined && { role: command.role }),
        ...(command.color !== undefined && { color: command.color }),
        ...(command.isActive !== undefined && { isActive: command.isActive }),
        updatedAt: new Date().toISOString(),
      };
      const players = new Map(state.players);
      players.set(updated.playerId, updated);
      return {
        state: { ...state, players },
        event: makeEvent(command.actorId, command.campaignId, "PlayerProfileUpdated", updated),
      };
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
      return {
        state: { ...state, players },
        event: makeEvent(command.actorId, command.campaignId, "PlayerProfileArchived", { playerId: command.playerId }),
      };
    }
    case "AddAttachment": {
      const attachment = {
        id: command.attachmentId,
        filename: command.filename,
        mimeType: command.mimeType,
        sizeBytes: command.sizeBytes,
      };
      return {
        state,
        event: makeEvent(command.actorId, command.campaignId, "AttachmentAdded", attachment),
      };
    }
    case "RemoveAttachment": {
      return {
        state,
        event: makeEvent(command.actorId, command.campaignId, "AttachmentRemoved", { id: command.attachmentId }),
      };
    }
    case "RecordImport": {
      return {
        state,
        event: makeEvent(command.actorId, command.campaignId, "ImportCompleted", {
          importId: command.importId,
          format: command.format,
          count: command.count,
        }),
      };
    }
    case "RecordExport": {
      return {
        state,
        event: makeEvent(command.actorId, command.campaignId, "ExportCompleted", {
          exportId: command.exportId,
          format: command.format,
        }),
      };
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
      return {
        state: nextState,
        event: makeEvent(command.actorId, command.campaignId, "VisibilityChanged", {
          targetId: command.targetId,
          targetType: command.targetType,
          visibility: command.visibility,
        }),
      };
    }
    case "RecordSessionEvent": {
      requireSession(state, command.sessionId);
      const id = command.sessionEventId ?? createId("sevt");
      const eventRecord = {
        id,
        sessionEventId: id,
        sessionId: command.sessionId,
        campaignId: command.campaignId,
        type: command.eventType as any,
        occurredAt: new Date().toISOString(),
        actorId: command.actorId as any,
        title: command.title,
        description: command.description || "",
        relatedEntityIds: command.relatedEntityIds || [],
        relatedFactIds: command.relatedFactIds || [],
        relatedRelationIds: command.relatedRelationIds || [],
        visibility: command.visibility || { kind: "dm_only" as const },
        metadata: command.metadata || {},
      };
      const sessionEvents = new Map(state.sessionEvents || []);
      sessionEvents.set(id, eventRecord);
      return {
        state: { ...state, sessionEvents },
        event: makeEvent(command.actorId, command.campaignId, "SessionEventRecorded", eventRecord),
      };
    }
  }
}

function requireEntity(state: CampaignState, entityId: EntityId): Entity {
  const entity = state.entities.get(entityId);
  if (!entity) {
    throw new Error(`Entity not found: ${entityId}`);
  }
  return entity;
}

function requireRelation(state: CampaignState, relationId: RelationId): Relation {
  const relation = state.relations.get(relationId);
  if (!relation) throw new Error(`Relation not found: ${relationId}`);
  return relation;
}

function requireFact(state: CampaignState, factId: FactId): Fact {
  const fact = state.facts.get(factId);
  if (!fact) throw new Error(`Fact not found: ${factId}`);
  return fact;
}

function requireSession(state: CampaignState, sessionId: SessionId) {
  const session = state.sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  return session;
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  return {
    sequence: 0,
    eventId: createId("evt"),
    campaignId,
    type,
    occurredAt: new Date().toISOString(),
    actorId,
    payload,
    schemaVersion: 1,
  };
}
