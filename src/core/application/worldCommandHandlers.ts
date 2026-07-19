import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Entity } from "../domain/entity/entity.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";

type WorldCommandType =
  | "AdvanceClock"
  | "TriggerConsequence"
  | "ResolveConsequence"
  | "ActivateFront"
  | "ResolveFront"
  | "HintSecret"
  | "UpdateObjectiveProgress";

type WorldCommand = Extract<Command, { type: WorldCommandType }>;

function singleEvent(state: CampaignState, event: StoredEvent<unknown>): CommandResult {
  return { state, events: [event] };
}

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
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

function requireEntityOfType(state: CampaignState, entityId: string, entityType: Entity["entityType"]): Entity {
  const entity = requireEntity(state, entityId);
  if (entity.archived) throw new Error(`Cannot mutate archived entity: ${entityId}`);
  if (entity.entityType !== entityType) {
    throw new Error(`Expected entity ${entityId} to be of type "${entityType}", got "${entity.entityType}"`);
  }
  return entity;
}

function withEntity(state: CampaignState, entity: Entity): CampaignState {
  const entities = new Map(state.entities);
  entities.set(entity.entityId, entity);
  return { ...state, entities };
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function handleWorldCommand(state: CampaignState, command: WorldCommand): CommandResult {
  switch (command.type) {
    case "AdvanceClock": {
      const entity = requireEntityOfType(state, command.entityId, "clock");
      const maxSegments = readNumber(entity.metadata.maxSegments, 4);
      const previousSegments = readNumber(entity.metadata.currentSegments, 0);
      const segments = Math.max(0, Math.min(maxSegments, previousSegments + command.delta));
      const updated: Entity = { ...entity, metadata: { ...entity.metadata, currentSegments: segments } };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "ClockAdvanced", {
          entityId: command.entityId,
          previousSegments,
          segments,
          maxSegments,
          delta: command.delta,
          note: command.note,
        }),
      );
    }
    case "TriggerConsequence": {
      const entity = requireEntityOfType(state, command.entityId, "consequence");
      const previousStatus = entity.status;
      const updated: Entity = { ...entity, status: "triggered" };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "ConsequenceTriggered", {
          entityId: command.entityId,
          previousStatus,
          status: "triggered",
          note: command.note,
        }),
      );
    }
    case "ResolveConsequence": {
      const entity = requireEntityOfType(state, command.entityId, "consequence");
      const previousStatus = entity.status;
      const updated: Entity = { ...entity, status: "resolved" };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "ConsequenceResolved", {
          entityId: command.entityId,
          previousStatus,
          status: "resolved",
          resolutionNote: command.resolutionNote,
        }),
      );
    }
    case "ActivateFront": {
      const entity = requireEntityOfType(state, command.entityId, "front");
      const previousStatus = entity.status;
      const updated: Entity = { ...entity, status: "active" };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "FrontActivated", {
          entityId: command.entityId,
          previousStatus,
          status: "active",
          note: command.note,
        }),
      );
    }
    case "ResolveFront": {
      const entity = requireEntityOfType(state, command.entityId, "front");
      const previousStatus = entity.status;
      const updated: Entity = { ...entity, status: "resolved" };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "FrontResolved", {
          entityId: command.entityId,
          previousStatus,
          status: "resolved",
          note: command.note,
        }),
      );
    }
    case "HintSecret": {
      const entity = requireEntityOfType(state, command.entityId, "secret");
      const previousStatus = entity.status;
      const updated: Entity = { ...entity, status: "hinted" };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "SecretHinted", {
          entityId: command.entityId,
          previousStatus,
          status: "hinted",
          note: command.note,
        }),
      );
    }
    case "UpdateObjectiveProgress": {
      const entity = requireEntityOfType(state, command.entityId, "quest");
      const statusByProgress: Record<typeof command.progress, string | undefined> = {
        advanced: undefined,
        completed: "completed",
        blocked: "blocked",
        failed: "failed",
        unchanged: undefined,
      };
      const previousStatus = entity.status;
      const nextStatus = statusByProgress[command.progress];
      const updated: Entity = nextStatus === undefined ? entity : { ...entity, status: nextStatus };
      const nextState = withEntity(state, updated);
      return singleEvent(
        nextState,
        makeEvent(command.actorId, command.campaignId, "ObjectiveProgressUpdated", {
          entityId: command.entityId,
          previousStatus,
          status: nextStatus ?? previousStatus,
          progress: command.progress,
          note: command.note,
        }),
      );
    }
  }
}
