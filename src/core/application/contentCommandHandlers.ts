import { createId } from "@shared/ids.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import { createEntity } from "../domain/entity/entity.js";
import type { Entity } from "../domain/entity/entity.js";
import { validatePlayerCharacterMetadata } from "../domain/entity/metadata.js";
import { normalizeRevelationAnchors } from "../domain/entity/revelationAnchors.js";
import { createFact } from "../domain/fact/fact.js";
import { createRelation } from "../domain/relation/relation.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type ContentCommandType =
  | "CreateEntity"
  | "CreateRelation"
  | "RecordFact"
  | "UpdateEntity"
  | "ArchiveEntity"
  | "UpdateRelation"
  | "ArchiveRelation"
  | "UpdateFact"
  | "ArchiveFact"
  | "RevealClue";

type ContentCommand = Extract<Command, { type: ContentCommandType }>;

function singleEvent(state: CampaignState, event: StoredEvent<unknown>): CommandResult {
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

function requireEntity(state: CampaignState, entityId: string): Entity {
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

function requireSession(state: CampaignState, sessionId: string) {
  const session = state.sessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  return session;
}

export function handleContentCommand(state: CampaignState, command: ContentCommand): CommandResult {
  switch (command.type) {
case "CreateEntity": {
  const entity = createEntity({
    entityId: command.entityId ?? createId("ent"),
    campaignId: command.campaignId,
    entityType: command.entityType,
    title: command.title,
    subtitle: command.subtitle,
    tagIds: command.tagIds,
    createdInSessionId: command.createdInSessionId,
    firstSeenSessionId: command.createdInSessionId,
    lastSeenSessionId: command.createdInSessionId,
    summary: command.summary,
    content: command.content,
    status: command.status,
    importance: command.importance,
    visibility: command.visibility,
    metadata: command.metadata,
    campaignSystem: state.campaign?.system,
  });
  const entities = new Map(state.entities);
  entities.set(entity.entityId, entity);
  const nextState = { ...state, entities };
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "EntityCreated", entity));
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
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "RelationCreated", relation));
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
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "FactCreated", fact));
}
case "UpdateEntity": {
  const entity = requireEntity(state, command.entityId);
  if (entity.archived) throw new Error("Cannot update archived entity");
  const updated: Entity = {
    ...entity,
    ...(command.title !== undefined && { title: command.title }),
    ...(command.subtitle !== undefined && { subtitle: command.subtitle }),
    ...(command.tagIds !== undefined && { tagIds: command.tagIds }),
    ...(command.summary !== undefined && { summary: command.summary }),
    ...(command.content !== undefined && { content: command.content }),
    ...(command.status !== undefined && { status: command.status }),
    ...(command.importance !== undefined && { importance: command.importance }),
    ...(command.visibility !== undefined && { visibility: command.visibility }),
    ...(command.metadata !== undefined && { metadata: command.metadata }),
  };
  if (updated.title.trim().length === 0) throw new Error("Entity title is required");
  if (updated.entityType === "player_character") {
    validatePlayerCharacterMetadata(updated.metadata, state.campaign?.system);
  }
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  return singleEvent({ ...state, entities }, makeEvent(command.actorId, command.campaignId, "EntityUpdated", updated));
}
case "ArchiveEntity": {
  const entity = requireEntity(state, command.entityId);
  if (entity.archived) throw new Error("Entity is already archived");
  const archived: Entity = { ...entity, archived: true };
  const entities = new Map(state.entities);
  entities.set(archived.entityId, archived);
  return singleEvent({ ...state, entities }, makeEvent(command.actorId, command.campaignId, "EntityArchived", { entityId: command.entityId }));
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
  return singleEvent({ ...state, relations }, makeEvent(command.actorId, command.campaignId, "RelationUpdated", updated));
}
case "ArchiveRelation": {
  const relation = requireRelation(state, command.relationId);
  if (relation.archived) throw new Error("Relation is already archived");
  const archived = { ...relation, archived: true, status: "archived" as const };
  const relations = new Map(state.relations);
  relations.set(archived.relationId, archived);
  return singleEvent({ ...state, relations }, makeEvent(command.actorId, command.campaignId, "RelationArchived", { relationId: command.relationId }));
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
  return singleEvent({ ...state, facts }, makeEvent(command.actorId, command.campaignId, "FactUpdated", updated));
}
case "ArchiveFact": {
  const fact = requireFact(state, command.factId);
  if (fact.archived) throw new Error("Fact is already archived");
  const archived = { ...fact, archived: true };
  const facts = new Map(state.facts);
  facts.set(archived.factId, archived);
  return singleEvent({ ...state, facts }, makeEvent(command.actorId, command.campaignId, "FactArchived", { factId: command.factId }));
}
case "RevealClue": {
  const clue = requireEntity(state, command.clueEntityId);
  if (clue.entityType !== "clue") {
    throw new Error("RevealClue requires a clue entity");
  }
  requireSession(state, command.sessionId);
  const updated: Entity = { ...clue, visibility: command.audience, status: "revealed" };
  const entities = new Map(state.entities);
  entities.set(updated.entityId, updated);
  const nextState = { ...state, entities };
  return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "ClueRevealed", {
      clueEntityId: command.clueEntityId,
      sessionId: command.sessionId,
      visibility: command.audience,
      note: command.note,
      revelationAnchors: command.revelationAnchors ? normalizeRevelationAnchors(command.revelationAnchors) : undefined,
    }));
}
  }
  throw new Error("Unsupported content command");
}
