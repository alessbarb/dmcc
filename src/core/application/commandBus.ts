import { createId } from "@shared/ids.js";
import type { EntityId, FactId, RelationId, SessionId } from "@shared/ids.js";
import { createCampaign } from "../domain/campaign/campaign.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import { createEntity, entitySchema } from "../domain/entity/entity.js";
import type { Entity } from "../domain/entity/entity.js";
import { validatePlayerCharacterMetadata } from "../domain/entity/metadata.js";
import { normalizeRevelationAnchors } from "../domain/entity/revelationAnchors.js";
import { createFact } from "../domain/fact/fact.js";
import type { Fact } from "../domain/fact/fact.js";
import { createRelation } from "../domain/relation/relation.js";
import type { Relation } from "../domain/relation/relation.js";
import { closeSession, createSession, sessionEventTypeSchema, sessionPrepSchema } from "../domain/session/session.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { CanvasNode } from "../domain/canvas/types.js";
import type { Command } from "./commands.js";
import { hasNotebookCycle, getHierarchyDepthIfParentSet } from "../domain/notebook/notebook.js";
import { validateNotebookTitle, validateNotebookId, validateNotebookItemId, validateNotebookItemTarget } from "../domain/notebook/validators.js";
import { validateStoryThreadId, validateStoryStepId, validateStoryThreadTitle, validateStoryStepTitle, validateStoryStepResolutionCoherence } from "../domain/story/validators.js";
import { canResolveStoryThread } from "../domain/story/story.js";

export interface CommandResult {
  state: CampaignState;
  events: StoredEvent[];
}

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function handleCommand(state: CampaignState, command: Command): CommandResult {
  switch (command.type) {
    case "CreateCampaign": {
      const campaign = createCampaign({
        campaignId: command.campaignId,
        title: command.title,
        summary: command.summary,
        system: command.system,
        coverUrl: command.coverUrl,
        settings: command.settings ? campaignSettingsSchema.parse(command.settings) : undefined,
        metadata: command.metadata,
      });
      const nextState = { ...state, campaign };
      return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "CampaignCreated", campaign));
    }
    case "UpdateCampaign": {
      if (!state.campaign) throw new Error("Campaign not found");
      const title = command.title !== undefined ? command.title.trim() : undefined;
      if (title !== undefined && title.length === 0) {
        throw new Error("Campaign title is required");
      }
      const nextCampaign = {
        ...state.campaign,
        ...(title !== undefined && { title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        ...(command.system !== undefined && { system: command.system }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
        ...(command.metadata !== undefined && { metadata: { ...state.campaign.metadata, ...command.metadata } }),
        updatedAt: new Date().toISOString(),
      };
      return singleEvent({ ...state, campaign: nextCampaign }, makeEvent(command.actorId, command.campaignId, "CampaignUpdated", {
        id: command.campaignId,
        campaignId: command.campaignId,
        ...(title !== undefined && { title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        ...(command.system !== undefined && { system: command.system }),
        ...(command.status !== undefined && { status: command.status }),
        ...(command.coverUrl !== undefined && { coverUrl: command.coverUrl }),
        ...(command.metadata !== undefined && { metadata: nextCampaign.metadata }),
      }));
    }
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
    case "CreatePreparedSession": {
      const session = createSession({
        sessionId: command.sessionId ?? createId("sess"),
        campaignId: command.campaignId,
        title: command.title,
        status: "planned",
        scheduledAt: command.scheduledAt,
        prep: command.prep ?? { state: "draft" },
        existingSessions: [...state.sessions.values()],
      });
      const sessions = new Map(state.sessions);
      sessions.set(session.sessionId, session);
      const nextState = { ...state, sessions };
      return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "SessionCreated", session));
    }
    case "UpdateSessionPrep": {
      const session = requireSession(state, command.sessionId);
      if (session.status !== "planned") {
        throw new Error("Only planned sessions can be prepared");
      }
      const currentPrep = session.prep ?? { state: "draft" };
      const updatedPrep = sessionPrepSchema.parse({
        ...currentPrep,
        ...command.prep,
        state: command.prep.state ?? currentPrep.state ?? "draft",
      });
      const updated = {
        ...session,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.scheduledAt !== undefined && { scheduledAt: command.scheduledAt }),
        prep: updatedPrep,
        updatedAt: new Date().toISOString(),
      };
      const sessions = new Map(state.sessions);
      sessions.set(updated.sessionId, updated);
      return singleEvent({ ...state, sessions }, makeEvent(command.actorId, command.campaignId, "SessionPrepUpdated", updated));
    }
    case "ActivatePreparedSession": {
      const session = requireSession(state, command.sessionId);
      if (session.status !== "planned") {
        throw new Error("Only planned sessions can be activated");
      }
      const activeExists = [...state.sessions.values()].some((s) => s.status === "active" && s.sessionId !== command.sessionId);
      if (activeExists) {
        throw new Error("Only one active session per campaign is allowed");
      }
      const activated = {
        ...session,
        status: "active" as const,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const sessions = new Map(state.sessions);
      sessions.set(activated.sessionId, activated);
      return singleEvent({ ...state, sessions }, makeEvent(command.actorId, command.campaignId, "SessionStarted", activated));
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
      return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "SessionStarted", session));
    }
    case "CloseSession": {
      const session = requireSession(state, command.sessionId);
      const closed = closeSession(session, command.summary);
      closed.endedAt = new Date().toISOString();
      const sessions = new Map(state.sessions);
      sessions.set(closed.sessionId, closed);
      const nextState = { ...state, sessions };
      return singleEvent(nextState, makeEvent(command.actorId, command.campaignId, "SessionClosed", closed));
    }
    case "CancelPreparedSession": {
      const session = requireSession(state, command.sessionId);
      if (session.status !== "planned") {
        throw new Error("Only planned sessions can be cancelled");
      }
      const cancelled = {
        ...session,
        status: "cancelled" as const,
        updatedAt: new Date().toISOString(),
      };
      const sessions = new Map(state.sessions);
      sessions.set(cancelled.sessionId, cancelled);
      return singleEvent({ ...state, sessions }, makeEvent(command.actorId, command.campaignId, "SessionCancelled", cancelled));
    }
    case "ArchiveSession": {
      const session = requireSession(state, command.sessionId);
      if (session.status === "active") {
        throw new Error("Active sessions must be closed before archiving");
      }
      const archived = {
        ...session,
        status: "archived" as const,
        archived: true,
        updatedAt: new Date().toISOString(),
      };
      const sessions = new Map(state.sessions);
      sessions.set(archived.sessionId, archived);
      return singleEvent({ ...state, sessions }, makeEvent(command.actorId, command.campaignId, "SessionArchived", archived));
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
    case "RecordSessionEvent": {
      const session = requireSession(state, command.sessionId);
      if (session.status !== "active") {
        throw new Error("Session events can only be recorded in an active session");
      }
      const parsedEventType = sessionEventTypeSchema.parse(command.eventType);
      const id = command.sessionEventId ?? createId("sevt");
      const eventRecord = {
        id,
        sessionEventId: id,
        sessionId: command.sessionId,
        campaignId: command.campaignId,
        type: parsedEventType,
        occurredAt: new Date().toISOString(),
        actorId: command.actorId,
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
      return singleEvent({ ...state, sessionEvents }, makeEvent(command.actorId, command.campaignId, "SessionEventRecorded", eventRecord));
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
    case "CreateCanvas": {
      const canvasId = command.canvasId ?? createId("cvs");
      const templateNodes = command.template ? createCanvasTemplateNodes(command.campaignId, canvasId, command.kind) : [];
      const canvas = {
        id: canvasId,
        campaignId: command.campaignId,
        title: command.title,
        kind: command.kind,
        description: command.description,
        nodes: templateNodes,
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const canvases = new Map(state.canvases || new Map());
      canvases.set(canvasId, canvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasCreated", canvas));
    }
    case "UpdateCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot update archived canvas");
      const updated = {
        ...canvas,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.viewport !== undefined && { viewport: command.viewport }),
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updated);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasUpdated", {
          canvasId: command.canvasId,
          title: command.title,
          viewport: command.viewport,
          description: command.description,
        }));
    }
    case "ArchiveCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Canvas is already archived");
      const updated = {
        ...canvas,
        archived: true,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updated);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasArchived", {
          canvasId: command.canvasId,
        }));
    }
    case "PlaceNodeOnCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot place node on archived canvas");
      
      const node = command.node;
      const nodeId = node.id ?? createId("cvn");
      
      if (node.kind === "entity") {
        if (!node.entityId) throw new Error("Entity node must specify entityId");
        const entity = state.entities.get(node.entityId);
        if (!entity || entity.archived) {
          throw new Error(`Entity not found or archived: ${node.entityId}`);
        }
      }

      if (node.kind === "fact") {
        if (!node.factId) throw new Error("Fact node must specify factId");
        const fact = state.facts.get(node.factId);
        if (!fact || fact.archived) {
          throw new Error(`Fact not found or archived: ${node.factId}`);
        }
      }

      const canvasNode = {
        id: nodeId,
        campaignId: command.campaignId,
        canvasId: command.canvasId,
        kind: node.kind,
        entityId: node.entityId,
        factId: node.factId,
        text: node.text,
        title: node.title,
        color: node.color,
        groupId: node.groupId,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        collapsed: node.collapsed ?? false,
        zIndex: node.zIndex ?? 1,
        status: node.status ?? "draft",
        visibility: node.visibility ?? "dm",
        metadata: node.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = {
        ...canvas,
        nodes: [...canvas.nodes, canvasNode],
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updated);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodePlaced", {
          canvasId: command.canvasId,
          node: canvasNode,
        }));
    }
    case "UpdateCanvasNode": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot update node on archived canvas");

      const nodeIndex = canvas.nodes.findIndex((n) => n.id === command.nodeId);
      if (nodeIndex === -1) throw new Error(`Node not found: ${command.nodeId}`);

      const existingNode = canvas.nodes[nodeIndex];
      const updatedNode = {
        ...existingNode,
        ...command.updates,
        updatedAt: new Date().toISOString(),
      };

      const nodes = [...canvas.nodes];
      nodes[nodeIndex] = updatedNode;

      const updatedCanvas = {
        ...canvas,
        nodes,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodeUpdated", {
          canvasId: command.canvasId,
          nodeId: command.nodeId,
          updates: command.updates,
        }));
    }
    case "UpdateCanvasNodesLayout": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot update layout on archived canvas");

      const nodes = canvas.nodes.map((n) => {
        const update = command.nodeUpdates.find((up) => up.nodeId === n.id);
        if (update) {
          return {
            ...n,
            x: update.x,
            y: update.y,
            ...(update.width !== undefined && { width: update.width }),
            ...(update.height !== undefined && { height: update.height }),
            ...(update.parentId !== undefined && { parentId: update.parentId ?? undefined }),
            ...(update.groupId !== undefined && { groupId: update.groupId ?? undefined }),
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });

      const updatedCanvas = {
        ...canvas,
        nodes,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodesLayoutUpdated", {
          canvasId: command.canvasId,
          nodeUpdates: command.nodeUpdates,
        }));
    }
    case "RemoveNodeFromCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot remove node from archived canvas");

      const nodeExists = canvas.nodes.some((n) => n.id === command.nodeId);
      if (!nodeExists) throw new Error(`Node not found: ${command.nodeId}`);

      const nodes = canvas.nodes.filter((n) => n.id !== command.nodeId);
      const edges = canvas.edges.filter((e) => e.sourceNodeId !== command.nodeId && e.targetNodeId !== command.nodeId);

      const updatedCanvas = {
        ...canvas,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasNodeRemoved", {
          canvasId: command.canvasId,
          nodeId: command.nodeId,
        }));
    }
    case "AddEdgeToCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot add edge to archived canvas");

      const { edge } = command;
      const edgeId = edge.id ?? createId("cve");

      const sourceExists = canvas.nodes.some((n) => n.id === edge.sourceNodeId);
      const targetExists = canvas.nodes.some((n) => n.id === edge.targetNodeId);
      if (!sourceExists || !targetExists) {
        throw new Error("Edge source or target node not found on canvas");
      }

      if (edge.status === "domain") {
        if (!edge.relationshipId) throw new Error("Domain edge must specify relationshipId");
        const rel = state.relations.get(edge.relationshipId);
        if (!rel || rel.archived) throw new Error(`Relation not found or archived: ${edge.relationshipId}`);
      }

      const canvasEdge = {
        id: edgeId,
        campaignId: command.campaignId,
        canvasId: command.canvasId,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        relationshipId: edge.relationshipId,
        label: edge.label,
        status: edge.status,
        visibility: edge.visibility ?? "dm",
        style: edge.style ?? "solid",
        metadata: edge.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCanvas = {
        ...canvas,
        edges: [...canvas.edges, canvasEdge],
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeAdded", {
          canvasId: command.canvasId,
          edge: canvasEdge,
        }));
    }
    case "UpdateCanvasEdge": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot update edge on archived canvas");

      const edgeIndex = canvas.edges.findIndex((e) => e.id === command.edgeId);
      if (edgeIndex === -1) throw new Error(`Edge not found: ${command.edgeId}`);

      const existingEdge = canvas.edges[edgeIndex];
      const updatedEdge = {
        ...existingEdge,
        ...command.updates,
        updatedAt: new Date().toISOString(),
      };

      const edges = [...canvas.edges];
      edges[edgeIndex] = updatedEdge;

      const updatedCanvas = {
        ...canvas,
        edges,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeUpdated", {
          canvasId: command.canvasId,
          edgeId: command.edgeId,
          updates: command.updates,
        }));
    }
    case "RemoveEdgeFromCanvas": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot remove edge from archived canvas");

      const edgeExists = canvas.edges.some((e) => e.id === command.edgeId);
      if (!edgeExists) throw new Error(`Edge not found: ${command.edgeId}`);

      const edges = canvas.edges.filter((e) => e.id !== command.edgeId);

      const updatedCanvas = {
        ...canvas,
        edges,
        updatedAt: new Date().toISOString(),
      };
      canvases.set(command.canvasId, updatedCanvas);
      return singleEvent({ ...state, canvases }, makeEvent(command.actorId, command.campaignId, "CanvasEdgeRemoved", {
          canvasId: command.canvasId,
          edgeId: command.edgeId,
        }));
    }
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
    case "DuplicateCampaign": {
      throw new Error("DuplicateCampaign must be handled by the repository layer, not the command bus");
    }
    case "ConvertCanvasNoteToEntity": {
      const canvases = new Map(state.canvases || new Map());
      const canvas = canvases.get(command.canvasId);
      if (!canvas) throw new Error(`Canvas not found: ${command.canvasId}`);
      if (canvas.archived) throw new Error("Cannot convert note on archived canvas");

      const nodeIndex = canvas.nodes.findIndex((n) => n.id === command.nodeId);
      if (nodeIndex === -1) throw new Error(`Node not found: ${command.nodeId}`);
      const node = canvas.nodes[nodeIndex];
      if (node.kind !== "note") throw new Error("Canvas node is not a note");

      const entityId = createId("ent");
      const entity = createEntity({
        entityId,
        campaignId: command.campaignId,
        entityType: command.entityType,
        title: command.title,
        subtitle: command.subtitle,
        summary: command.summary,
        content: command.content,
        status: command.status ?? "ready",
        importance: command.importance ?? "normal",
        visibility: command.visibility ?? { kind: "dm_only" },
        metadata: command.metadata,
        campaignSystem: state.campaign?.system,
      });

      const updatedNode = {
        ...node,
        kind: "entity" as const,
        entityId,
        text: undefined,
        title: undefined,
        updatedAt: new Date().toISOString(),
      };

      const nodes = [...canvas.nodes];
      nodes[nodeIndex] = updatedNode;

      const updatedCanvas = {
        ...canvas,
        nodes,
        updatedAt: new Date().toISOString(),
      };

      const entities = new Map(state.entities);
      entities.set(entityId, entity);
      
      canvases.set(command.canvasId, updatedCanvas);

      return {
        state: { ...state, entities, canvases },
        events: [
          makeEvent(command.actorId, command.campaignId, "EntityCreated", entity),
          makeEvent(command.actorId, command.campaignId, "CanvasNoteConvertedToEntity", {
            canvasId: command.canvasId,
            nodeId: command.nodeId,
            entityId,
          }),
        ],
      };
    }
    case "CreateNotebook": {
      validateNotebookId(command.notebookId);
      validateNotebookTitle(command.title);

      const notebooks = new Map(state.notebooks || new Map());
      if (command.parentNotebookId) {
        validateNotebookId(command.parentNotebookId);
        const parent = notebooks.get(command.parentNotebookId);
        if (!parent) {
          throw new Error(`Parent notebook not found: ${command.parentNotebookId}`);
        }
        if (parent.archivedAt) {
          throw new Error("Cannot create a notebook under an archived parent");
        }
        if (getHierarchyDepthIfParentSet(notebooks, command.notebookId, command.parentNotebookId) > 3) {
          throw new Error("Notebook depth limit exceeded. Maximum depth is 3");
        }
      }

      const notebook = {
        campaignId: command.campaignId,
        notebookId: command.notebookId,
        parentNotebookId: command.parentNotebookId ?? null,
        title: command.title,
        description: command.description ?? null,
        icon: command.icon ?? null,
        sortOrder: command.sortOrder,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notebooks.set(command.notebookId, notebook);

      return {
        state: { ...state, notebooks },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookCreated", notebook)],
      };
    }
    case "UpdateNotebook": {
      validateNotebookId(command.notebookId);
      const notebooks = new Map(state.notebooks || new Map());
      const existing = notebooks.get(command.notebookId);
      if (!existing) {
        throw new Error(`Notebook not found: ${command.notebookId}`);
      }

      if (command.title !== undefined) {
        validateNotebookTitle(command.title);
      }

      let parentNotebookId = existing.parentNotebookId;
      if (command.parentNotebookId !== undefined) {
        parentNotebookId = command.parentNotebookId;
        if (parentNotebookId) {
          validateNotebookId(parentNotebookId);
          const parent = notebooks.get(parentNotebookId);
          if (!parent) {
            throw new Error(`Parent notebook not found: ${parentNotebookId}`);
          }
          if (parent.archivedAt) {
            throw new Error("Cannot move a notebook under an archived parent");
          }
          if (hasNotebookCycle(notebooks, command.notebookId, parentNotebookId)) {
            throw new Error("Setting parent would create a cycle");
          }
          if (getHierarchyDepthIfParentSet(notebooks, command.notebookId, parentNotebookId) > 3) {
            throw new Error("Notebook depth limit exceeded. Maximum depth is 3");
          }
        }
      }

      const updated = {
        ...existing,
        parentNotebookId,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.icon !== undefined && { icon: command.icon }),
        updatedAt: new Date().toISOString(),
      };
      notebooks.set(command.notebookId, updated);

      return {
        state: { ...state, notebooks },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookUpdated", updated)],
      };
    }
    case "ArchiveNotebook": {
      validateNotebookId(command.notebookId);
      const notebooks = new Map(state.notebooks || new Map());
      const existing = notebooks.get(command.notebookId);
      if (!existing) {
        throw new Error(`Notebook not found: ${command.notebookId}`);
      }

      const now = new Date().toISOString();
      const updated = {
        ...existing,
        archivedAt: now,
        updatedAt: now,
      };
      notebooks.set(command.notebookId, updated);

      return {
        state: { ...state, notebooks },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookArchived", { notebookId: command.notebookId })],
      };
    }
    case "AddNotebookItem": {
      validateNotebookItemId(command.notebookItemId);
      validateNotebookId(command.notebookId);
      
      const notebooks = state.notebooks || new Map();
      const notebook = notebooks.get(command.notebookId);
      if (!notebook) {
        throw new Error(`Notebook not found: ${command.notebookId}`);
      }
      if (notebook.archivedAt) {
        throw new Error("Cannot add an item to an archived notebook");
      }

      validateNotebookItemTarget(command.targetType, command.targetId);

      // Validate target existence in the campaign
      const targetType = command.targetType;
      const targetId = command.targetId;
      if (targetType === "entity") {
        if (!state.entities.has(targetId)) throw new Error(`Entity not found: ${targetId}`);
      } else if (targetType === "fact") {
        if (!state.facts.has(targetId)) throw new Error(`Fact not found: ${targetId}`);
      } else if (targetType === "relation") {
        if (!state.relations.has(targetId)) throw new Error(`Relation not found: ${targetId}`);
      } else if (targetType === "session") {
        if (!state.sessions.has(targetId)) throw new Error(`Session not found: ${targetId}`);
      } else if (targetType === "session_event") {
        if (!state.sessionEvents.has(targetId)) throw new Error(`Session event not found: ${targetId}`);
      } else if (targetType === "canvas") {
        if (!state.canvases.has(targetId)) throw new Error(`Canvas not found: ${targetId}`);
      } else if (targetType === "attachment") {
        if (!state.attachments.has(targetId)) throw new Error(`Attachment not found: ${targetId}`);
      }

      // No duplicate resources in the same notebook
      const items = new Map(state.notebookItems || new Map());
      for (const item of items.values()) {
        if (item.notebookId === command.notebookId && item.targetType === targetType && item.targetId === targetId) {
          throw Object.assign(
            new Error(`Notebook item already exists: Resource ${targetType}:${targetId} is already in the notebook`),
            {
              errorCode: "NOTEBOOK_ITEM_DUPLICATE",
              details: {
                notebookId: command.notebookId,
                targetType,
                targetId,
              },
            }
          );
        }
      }

      const item = {
        campaignId: command.campaignId,
        notebookItemId: command.notebookItemId,
        notebookId: command.notebookId,
        targetType,
        targetId: targetId,
        sortOrder: command.sortOrder,
        createdAt: new Date().toISOString(),
      };
      items.set(command.notebookItemId, item);

      return {
        state: { ...state, notebookItems: items },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookItemAdded", item)],
      };
    }
    case "RemoveNotebookItem": {
      validateNotebookItemId(command.notebookItemId);
      const items = new Map(state.notebookItems || new Map());
      if (!items.has(command.notebookItemId)) {
        throw new Error(`Notebook item not found: ${command.notebookItemId}`);
      }
      items.delete(command.notebookItemId);

      return {
        state: { ...state, notebookItems: items },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookItemRemoved", { notebookItemId: command.notebookItemId })],
      };
    }
    case "ReorderNotebookItems": {
      validateNotebookId(command.notebookId);
      const items = new Map(state.notebookItems || new Map());
      const notebookItemIds = Array.from(items.values()).filter((item) => item.notebookId === command.notebookId).map((item) => item.notebookItemId);
      const requestedItemIds = command.orderedItemIds;
      if (new Set(requestedItemIds).size !== requestedItemIds.length || requestedItemIds.length !== notebookItemIds.length || requestedItemIds.some((itemId) => !notebookItemIds.includes(itemId))) {
        throw new Error("orderedItemIds must exactly match the notebook items");
      }

      for (const [idx, itemId] of requestedItemIds.entries()) {
        const item = items.get(itemId);
        if (!item) {
          throw new Error(`Notebook item not found: ${itemId}`);
        }
        if (item.notebookId !== command.notebookId) {
          throw new Error(`Notebook item ${itemId} does not belong to notebook ${command.notebookId}`);
        }
        items.set(itemId, { ...item, sortOrder: idx });
      }

      return {
        state: { ...state, notebookItems: items },
        events: [makeEvent(command.actorId, command.campaignId, "NotebookItemsReordered", { notebookId: command.notebookId, orderedItemIds: command.orderedItemIds })],
      };
    }
    case "CreateStoryThread": {
      validateStoryThreadId(command.threadId);
      validateStoryThreadTitle(command.title);

      const threads = new Map(state.storyThreads || new Map());
      const thread = {
        campaignId: command.campaignId,
        threadId: command.threadId,
        title: command.title,
        summary: command.summary ?? null,
        status: "planned" as const,
        sortOrder: command.sortOrder,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entityIds: [],
      };
      threads.set(command.threadId, thread);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadCreated", thread)],
      };
    }
    case "UpdateStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const existing = threads.get(command.threadId);
      if (!existing) {
        throw new Error(`Story thread not found: ${command.threadId}`);
      }

      if (command.title !== undefined) validateStoryThreadTitle(command.title);

      const updated = {
        ...existing,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.summary !== undefined && { summary: command.summary }),
        updatedAt: new Date().toISOString(),
      };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadUpdated", updated)],
      };
    }
    case "ArchiveStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const existing = threads.get(command.threadId);
      if (!existing) {
        throw new Error(`Story thread not found: ${command.threadId}`);
      }

      const now = new Date().toISOString();
      const updated = {
        ...existing,
        archivedAt: now,
        updatedAt: now,
      };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadArchived", { threadId: command.threadId })],
      };
    }
    case "ReorderStoryThreads": {
      const threads = new Map(state.storyThreads || new Map());
      const reorderableThreadIds = Array.from(threads.values()).filter((thread) => !thread.archivedAt).map((thread) => thread.threadId);
      const requestedThreadIds = command.orderedThreadIds;
      if (new Set(requestedThreadIds).size !== requestedThreadIds.length || requestedThreadIds.length !== reorderableThreadIds.length || requestedThreadIds.some((threadId) => !reorderableThreadIds.includes(threadId))) {
        throw new Error("orderedThreadIds must exactly match the active story threads");
      }

      for (const [idx, threadId] of requestedThreadIds.entries()) {
        const thread = threads.get(threadId);
        if (!thread) throw new Error(`Story thread not found: ${threadId}`);
        threads.set(threadId, { ...thread, sortOrder: idx, updatedAt: new Date().toISOString() });
      }

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadReordered", { orderedThreadIds: command.orderedThreadIds })],
      };
    }
    case "ActivateStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const existing = threads.get(command.threadId);
      if (!existing) throw new Error(`Story thread not found: ${command.threadId}`);
      if (existing.archivedAt) throw new Error("Cannot activate an archived story thread");
      if (existing.status === "resolved" || existing.status === "discarded") {
        throw new Error("Cannot activate a terminal story thread");
      }
      if (existing.status === "active") return { state, events: [] };

      const updated = { ...existing, status: "active" as const, updatedAt: new Date().toISOString() };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadActivated", { threadId: command.threadId })],
      };
    }
    case "ResolveStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const existing = threads.get(command.threadId);
      if (!existing) throw new Error(`Story thread not found: ${command.threadId}`);
      if (existing.archivedAt) throw new Error("Cannot resolve an archived story thread");
      if (existing.status === "discarded") throw new Error("Cannot resolve a discarded story thread");
      if (existing.status === "resolved") return { state, events: [] };

      const steps = Array.from((state.storySteps || new Map()).values())
        .filter((step) => step.threadId === command.threadId);

      if (!canResolveStoryThread(steps)) {
        throw new Error("Cannot resolve story thread: not all steps are terminal or no steps are resolved");
      }

      const updated = { ...existing, status: "resolved" as const, updatedAt: new Date().toISOString() };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadResolved", { threadId: command.threadId })],
      };
    }
    case "DiscardStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const existing = threads.get(command.threadId);
      if (!existing) throw new Error(`Story thread not found: ${command.threadId}`);
      if (existing.archivedAt) throw new Error("Cannot discard an archived story thread");
      if (existing.status === "resolved") throw new Error("Cannot discard a resolved story thread");
      if (existing.status === "discarded") return { state, events: [] };

      const steps = Array.from((state.storySteps || new Map()).values())
        .filter((step) => step.threadId === command.threadId);
      if (steps.some((step) => step.status !== "discarded")) {
        throw new Error("Cannot discard story thread while it has non-discarded steps");
      }

      const updated = { ...existing, status: "discarded" as const, updatedAt: new Date().toISOString() };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "StoryThreadDiscarded", { threadId: command.threadId })],
      };
    }
    case "CreateStoryStep": {
      validateStoryStepId(command.stepId);
      validateStoryThreadId(command.threadId);
      validateStoryStepTitle(command.title);

      const threads = state.storyThreads || new Map();
      if (!threads.has(command.threadId)) {
        throw new Error(`Story thread not found: ${command.threadId}`);
      }

      if (command.sceneEntityId) {
        const scene = state.entities.get(command.sceneEntityId);
        if (!scene) throw new Error(`Scene entity not found: ${command.sceneEntityId}`);
        if (scene.entityType !== "scene") {
          throw new Error("Scene entity ID must reference an entity of type 'scene'");
        }
      }

      const hasPlannedSession = command.plannedSessionId !== undefined && command.plannedSessionId !== null;
      const hasPlannedOrder = command.plannedSessionOrder !== undefined && command.plannedSessionOrder !== null;
      if (hasPlannedSession !== hasPlannedOrder) {
        throw new Error("plannedSessionId and plannedSessionOrder must be provided together");
      }
      if (hasPlannedOrder && command.plannedSessionOrder! < 0) {
        throw new Error("plannedSessionOrder must be non-negative");
      }
      if (command.plannedSessionId) {
        const plannedSession = state.sessions.get(command.plannedSessionId);
        if (!plannedSession) {
          throw new Error(`Session not found: ${command.plannedSessionId}`);
        }
        if (plannedSession.status !== "planned") {
          throw new Error("Story steps can only be created for a planned session");
        }
      }

      const steps = new Map(state.storySteps || new Map());
      const step = {
        campaignId: command.campaignId,
        stepId: command.stepId,
        threadId: command.threadId,
        title: command.title,
        intent: command.intent ?? null,
        expectedOutcome: command.expectedOutcome ?? null,
        actualOutcome: null,
        status: "planned" as const,
        resolutionKind: null,
        sceneEntityId: command.sceneEntityId ?? null,
        plannedSessionId: command.plannedSessionId ?? null,
        plannedSessionOrder: command.plannedSessionOrder ?? null,
        resolvedSessionId: null,
        sortOrder: command.sortOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entityIds: [],
      };
      steps.set(command.stepId, step);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepCreated", step)],
      };
    }
    case "UpdateStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) {
        throw new Error(`Story step not found: ${command.stepId}`);
      }

      if (command.title !== undefined) validateStoryStepTitle(command.title);
      if (command.sceneEntityId) {
        const scene = state.entities.get(command.sceneEntityId);
        if (!scene) throw new Error(`Scene entity not found: ${command.sceneEntityId}`);
        if (scene.entityType !== "scene") {
          throw new Error("Scene entity ID must reference an entity of type 'scene'");
        }
      }

      const updated = {
        ...existing,
        ...(command.title !== undefined && { title: command.title }),
        ...(command.intent !== undefined && { intent: command.intent }),
        ...(command.expectedOutcome !== undefined && { expectedOutcome: command.expectedOutcome }),
        ...(command.sceneEntityId !== undefined && { sceneEntityId: command.sceneEntityId }),
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepUpdated", updated)],
      };
    }
    case "ScheduleStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status === "resolved" || existing.status === "discarded") {
        throw new Error("Cannot schedule a terminal story step");
      }
      if (command.plannedSessionOrder < 0) {
        throw new Error("plannedSessionOrder must be non-negative");
      }

      const plannedSession = state.sessions.get(command.plannedSessionId);
      if (!plannedSession) {
        throw new Error(`Session not found: ${command.plannedSessionId}`);
      }
      if (plannedSession.status !== "planned") {
        throw new Error("Story steps can only be scheduled to a planned session");
      }

      const updated = {
        ...existing,
        plannedSessionId: command.plannedSessionId,
        plannedSessionOrder: command.plannedSessionOrder,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepScheduled", { stepId: command.stepId, plannedSessionId: command.plannedSessionId, plannedSessionOrder: command.plannedSessionOrder })],
      };
    }
    case "DeferStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status === "resolved" || existing.status === "discarded") {
        throw new Error("Cannot defer a terminal story step");
      }
      if (command.plannedSessionOrder < 0) {
        throw new Error("plannedSessionOrder must be non-negative");
      }

      const plannedSession = state.sessions.get(command.plannedSessionId);
      if (!plannedSession) {
        throw new Error(`Session not found: ${command.plannedSessionId}`);
      }
      if (plannedSession.status !== "planned") {
        throw new Error("Story steps can only be scheduled to a planned session");
      }

      const updated = {
        ...existing,
        plannedSessionId: command.plannedSessionId,
        plannedSessionOrder: command.plannedSessionOrder,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepDeferred", { stepId: command.stepId, plannedSessionId: command.plannedSessionId, plannedSessionOrder: command.plannedSessionOrder })],
      };
    }
    case "UnscheduleStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status === "resolved" || existing.status === "discarded") {
        throw new Error("Cannot unschedule a terminal story step");
      }

      const updated = {
        ...existing,
        plannedSessionId: null,
        plannedSessionOrder: null,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepUnscheduled", { stepId: command.stepId })],
      };
    }
    case "MarkStoryStepReady": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status === "ready") return { state, events: [] };
      if (existing.status !== "planned") {
        throw new Error("Only a planned story step can be marked ready");
      }

      const updated = {
        ...existing,
        status: "ready" as const,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepMarkedReady", { stepId: command.stepId })],
      };
    }
    case "ActivateStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status === "active") return { state, events: [] };
      if (existing.status !== "ready") {
        throw new Error("Only a ready story step can be activated");
      }

      const threads = new Map(state.storyThreads || new Map());
      const thread = threads.get(existing.threadId);
      if (!thread) throw new Error(`Story thread not found: ${existing.threadId}`);
      if (thread.archivedAt) throw new Error("Cannot activate a step in an archived story thread");
      if (thread.status === "resolved" || thread.status === "discarded") {
        throw new Error("Cannot activate a step in a terminal story thread");
      }

      const updated = {
        ...existing,
        status: "active" as const,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      const events = [];
      if (thread.status === "planned") {
        threads.set(existing.threadId, {
          ...thread,
          status: "active" as const,
          updatedAt: new Date().toISOString(),
        });
        events.push(makeEvent(command.actorId, command.campaignId, "StoryThreadActivated", { threadId: existing.threadId }));
      }
      events.push(makeEvent(command.actorId, command.campaignId, "StoryStepActivated", { stepId: command.stepId }));

      return {
        state: { ...state, storyThreads: threads, storySteps: steps },
        events,
      };
    }
    case "ReconcileStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const existing = steps.get(command.stepId);
      if (!existing) throw new Error(`Story step not found: ${command.stepId}`);
      if (existing.status !== "ready" && existing.status !== "active") {
        throw new Error("Only a ready or active story step can be reconciled");
      }

      const session = state.sessions.get(command.resolvedSessionId);
      if (!session) throw new Error(`Session not found: ${command.resolvedSessionId}`);
      if (session.status !== "archived" && session.status !== "closed") {
        throw new Error("Resolved session must be closed or archived");
      }

      validateStoryStepResolutionCoherence(command.status, command.resolutionKind, command.actualOutcome);

      const updated = {
        ...existing,
        status: command.status,
        resolutionKind: command.resolutionKind,
        resolvedSessionId: command.resolvedSessionId,
        actualOutcome: command.actualOutcome ?? null,
        plannedSessionId: null,
        plannedSessionOrder: null,
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepReconciled", {
          stepId: command.stepId,
          resolvedSessionId: command.resolvedSessionId,
          status: command.status,
          resolutionKind: command.resolutionKind,
          actualOutcome: command.actualOutcome
        })],
      };
    }
    case "ReorderStorySteps": {
      validateStoryThreadId(command.threadId);
      const steps = new Map(state.storySteps || new Map());
      const threadStepIds = Array.from(steps.values()).filter((step) => step.threadId === command.threadId).map((step) => step.stepId);
      const requestedStepIds = command.orderedStepIds;
      if (new Set(requestedStepIds).size !== requestedStepIds.length || requestedStepIds.length !== threadStepIds.length || requestedStepIds.some((stepId) => !threadStepIds.includes(stepId))) {
        throw new Error("orderedStepIds must exactly match the story thread steps");
      }

      for (const [idx, stepId] of requestedStepIds.entries()) {
        const step = steps.get(stepId);
        if (!step) throw new Error(`Story step not found: ${stepId}`);
        if (step.threadId !== command.threadId) {
          throw new Error(`Story step ${stepId} does not belong to thread ${command.threadId}`);
        }
        steps.set(stepId, { ...step, sortOrder: idx, updatedAt: new Date().toISOString() });
      }

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "StoryStepsReordered", { threadId: command.threadId, orderedStepIds: command.orderedStepIds })],
      };
    }
    case "LinkEntityToStoryThread": {
      validateStoryThreadId(command.threadId);
      if (!state.entities.has(command.entityId)) {
        throw new Error(`Entity not found: ${command.entityId}`);
      }

      const threads = new Map(state.storyThreads || new Map());
      const thread = threads.get(command.threadId);
      if (!thread) throw new Error(`Story thread not found: ${command.threadId}`);

      if (thread.entityIds.includes(command.entityId)) {
        return { state, events: [] };
      }

      const updated = {
        ...thread,
        entityIds: [...thread.entityIds, command.entityId],
        updatedAt: new Date().toISOString(),
      };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "EntityLinkedToStoryThread", { threadId: command.threadId, entityId: command.entityId })],
      };
    }
    case "UnlinkEntityFromStoryThread": {
      validateStoryThreadId(command.threadId);
      const threads = new Map(state.storyThreads || new Map());
      const thread = threads.get(command.threadId);
      if (!thread) throw new Error(`Story thread not found: ${command.threadId}`);

      if (!thread.entityIds.includes(command.entityId)) {
        return { state, events: [] };
      }

      const updated = {
        ...thread,
        entityIds: thread.entityIds.filter((id) => id !== command.entityId),
        updatedAt: new Date().toISOString(),
      };
      threads.set(command.threadId, updated);

      return {
        state: { ...state, storyThreads: threads },
        events: [makeEvent(command.actorId, command.campaignId, "EntityUnlinkedFromStoryThread", { threadId: command.threadId, entityId: command.entityId })],
      };
    }
    case "LinkEntityToStoryStep": {
      validateStoryStepId(command.stepId);
      if (!state.entities.has(command.entityId)) {
        throw new Error(`Entity not found: ${command.entityId}`);
      }

      const steps = new Map(state.storySteps || new Map());
      const step = steps.get(command.stepId);
      if (!step) throw new Error(`Story step not found: ${command.stepId}`);

      if (step.entityIds.includes(command.entityId)) {
        return { state, events: [] };
      }

      const updated = {
        ...step,
        entityIds: [...step.entityIds, command.entityId],
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "EntityLinkedToStoryStep", { stepId: command.stepId, entityId: command.entityId })],
      };
    }
    case "UnlinkEntityFromStoryStep": {
      validateStoryStepId(command.stepId);
      const steps = new Map(state.storySteps || new Map());
      const step = steps.get(command.stepId);
      if (!step) throw new Error(`Story step not found: ${command.stepId}`);

      if (!step.entityIds.includes(command.entityId)) {
        return { state, events: [] };
      }

      const updated = {
        ...step,
        entityIds: step.entityIds.filter((id) => id !== command.entityId),
        updatedAt: new Date().toISOString(),
      };
      steps.set(command.stepId, updated);

      return {
        state: { ...state, storySteps: steps },
        events: [makeEvent(command.actorId, command.campaignId, "EntityUnlinkedFromStoryStep", { stepId: command.stepId, entityId: command.entityId })],
      };
    }
  }
}

function createCanvasTemplateNodes(campaignId: string, canvasId: string, kind: string): CanvasNode[] {
  if (kind === "custom") return [];
  const now = new Date().toISOString();
  const labels: Record<string, { title: string; note: string; groups: string[] }> = {
    world: {
      title: "Cómo usar este tablero de mundo",
      note: "Coloca aquí regiones, facciones, amenazas, misiones y secretos. Empieza añadiendo entidades existentes o crea una entidad rápida.",
      groups: ["Lugares", "Facciones", "Amenazas", "Misiones"],
    },
    characters: {
      title: "Cómo usar este tablero de personajes",
      note: "Organiza PNJs, personajes, familias y facciones. Conecta dos entidades para crear una relación real de campaña.",
      groups: ["Aliados", "Rivales", "Facciones", "Secretos"],
    },
    mystery: {
      title: "Cómo usar este tablero de misterio",
      note: "Agrupa sospechosos, pistas, secretos y revelaciones. Usa líneas visuales para hipótesis y relaciones reales para canon confirmado.",
      groups: ["Sospechosos", "Pistas", "Secretos", "Revelaciones"],
    },
    location: {
      title: "Cómo usar este tablero de localización",
      note: "Divide la localización en zonas, encuentros, pistas y complicaciones. No se genera lore automático: añade solo lo que necesites.",
      groups: ["Zonas", "Encuentros", "Pistas", "Complicaciones"],
    },
    session: {
      title: "Cómo usar este tablero de sesión",
      note: "Prepara escenas, PNJs, pistas, decisiones y consecuencias para la próxima sesión.",
      groups: ["Escenas", "PNJs", "Pistas", "Consecuencias"],
    },
  };
  const template = labels[kind] || labels.world;
  const note = {
    id: createId("cvn"),
    campaignId,
    canvasId,
    kind: "note" as const,
    title: template.title,
    text: template.note,
    color: "yellow" as const,
    x: -360,
    y: -260,
    width: 300,
    height: 160,
    collapsed: false,
    zIndex: 2,
    status: "draft" as const,
    visibility: "dm" as const,
    metadata: { template: true, role: "instructions" },
    createdAt: now,
    updatedAt: now,
  };
  const groups = template.groups.map((title, index) => ({
    id: createId("cvn"),
    campaignId,
    canvasId,
    kind: "group" as const,
    title,
    color: (["blue", "green", "purple", "pink"] as const)[index % 4],
    x: -360 + (index % 2) * 380,
    y: -40 + Math.floor(index / 2) * 260,
    width: 320,
    height: 200,
    collapsed: false,
    zIndex: 1,
    status: "draft" as const,
    visibility: "dm" as const,
    metadata: { template: true, role: "suggested-space" },
    createdAt: now,
    updatedAt: now,
  }));
  return [note, ...groups];
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
