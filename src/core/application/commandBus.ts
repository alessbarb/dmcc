import { createId } from "@shared/ids.js";
import type { EntityId, FactId, RelationId, SessionId } from "@shared/ids.js";
import { createCampaign } from "../domain/campaign/campaign.js";
import { campaignSettingsSchema } from "../domain/campaign/types.js";
import type { Entity } from "../domain/entity/entity.js";
import type { Fact } from "../domain/fact/fact.js";
import type { Relation } from "../domain/relation/relation.js";
import { closeSession, createSession, sessionEventTypeSchema, sessionPrepSchema } from "../domain/session/session.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import { handleStoryCommand } from "./storyCommandHandlers.js";
import { handleCanvasCommand } from "./canvasCommandHandlers.js";
import { handlePlayerPortalCommand } from "./playerPortalCommandHandlers.js";
import { handleNotebookCommand } from "./notebookCommandHandlers.js";
import { handleContentCommand } from "./contentCommandHandlers.js";

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
    case "CreateEntity":
    case "CreateRelation":
    case "RecordFact":
    case "UpdateEntity":
    case "ArchiveEntity":
    case "UpdateRelation":
    case "ArchiveRelation":
    case "UpdateFact":
    case "ArchiveFact":
    case "RevealClue":
      return handleContentCommand(state, command);
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
    case "ConvertCanvasNoteToEntity":
      return handleCanvasCommand(state, command);
    case "CreateNotebook":
    case "UpdateNotebook":
    case "ArchiveNotebook":
    case "AddNotebookItem":
    case "RemoveNotebookItem":
    case "ReorderNotebookItems":
      return handleNotebookCommand(state, command);
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
