import { createId } from "@shared/ids.js";
import type { EntityId, FactId, RelationId, SessionId } from "@shared/ids.js";
import { createCampaign } from "../domain/campaign/campaign.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import { createEntity } from "../domain/entity/entity.js";
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
import type { Command } from "./commands.js";
import { hasNotebookCycle, getHierarchyDepthIfParentSet } from "../domain/notebook/notebook.js";
import { validateNotebookTitle, validateNotebookId, validateNotebookItemId, validateNotebookItemTarget } from "../domain/notebook/validators.js";
import { handleStoryCommand } from "./storyCommandHandlers.js";
import { handleCanvasCommand } from "./canvasCommandHandlers.js";
import { handlePlayerPortalCommand } from "./playerPortalCommandHandlers.js";

export interface CommandResult {
  state: CampaignState;
  events: StoredEvent[];
}

function singleEvent(state: CampaignState, event: StoredEvent): CommandResult {
  return { state, events: [event] };
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
    case "CreateCanvas":
    case "UpdateCanvas":
    case "ArchiveCanvas":
    case "PlaceNodeOnCanvas":
    case "UpdateCanvasNode":
    case "UpdateCanvasNodesLayout":
    case "RemoveNodeFromCanvas":
    case "AddEdgeToCanvas":
    case "UpdateCanvasEdge":
    case "RemoveEdgeFromCanvas":
      return handleCanvasCommand(state, command);
    case "CreatePlayerInvitation":
    case "ConsumePlayerInvitation":
    case "RevokePlayerInvitation":
    case "IssuePlayerToken":
    case "RevokePlayerToken":
    case "UpdatePlayerLiveStatus":
    case "UpsertPlayerResource":
    case "RemovePlayerResource":
    case "CreatePlayerPortalNote":
    case "UpdatePlayerPortalNote":
    case "ArchivePlayerPortalNote":
    case "CreatePlayerPortalObjective":
    case "UpdatePlayerPortalObjective":
    case "ArchivePlayerPortalObjective":
    case "LinkPlayerCharacter":
    case "UnlinkPlayerCharacter":
    case "CreatePlayerCharacterProposal":
    case "ResolvePlayerCharacterProposal":
      return handlePlayerPortalCommand(state, command);
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
    case "CreateStoryThread":
    case "UpdateStoryThread":
    case "ArchiveStoryThread":
    case "ReorderStoryThreads":
    case "ActivateStoryThread":
    case "ResolveStoryThread":
    case "DiscardStoryThread":
    case "CreateStoryStep":
    case "UpdateStoryStep":
    case "ScheduleStoryStep":
    case "DeferStoryStep":
    case "UnscheduleStoryStep":
    case "MarkStoryStepReady":
    case "ActivateStoryStep":
    case "ReconcileStoryStep":
    case "ReorderStorySteps":
    case "LinkEntityToStoryThread":
    case "UnlinkEntityFromStoryThread":
    case "LinkEntityToStoryStep":
    case "UnlinkEntityFromStoryStep":
      return handleStoryCommand(state, command);

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
