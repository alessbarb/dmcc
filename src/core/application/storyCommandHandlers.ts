import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";
import {
  validateStoryThreadId,
  validateStoryStepId,
  validateStoryThreadTitle,
  validateStoryStepTitle,
  validateStoryStepResolutionCoherence,
} from "../domain/story/validators.js";
import { canResolveStoryThread } from "../domain/story/story.js";

type StoryCommandType =
  | "CreateStoryThread"
  | "UpdateStoryThread"
  | "ArchiveStoryThread"
  | "ReorderStoryThreads"
  | "ActivateStoryThread"
  | "ResolveStoryThread"
  | "DiscardStoryThread"
  | "CreateStoryStep"
  | "UpdateStoryStep"
  | "ScheduleStoryStep"
  | "DeferStoryStep"
  | "UnscheduleStoryStep"
  | "MarkStoryStepReady"
  | "ActivateStoryStep"
  | "ReconcileStoryStep"
  | "ReorderStorySteps"
  | "LinkEntityToStoryThread"
  | "UnlinkEntityFromStoryThread"
  | "LinkEntityToStoryStep"
  | "UnlinkEntityFromStoryStep"
;
type StoryCommand = Extract<Command, { type: StoryCommandType }>;

function makeEvent<TPayload>(actorId: string, campaignId: CampaignState["campaignId"], type: StoredEvent["type"], payload: TPayload): StoredEvent<TPayload> {
  return {
    eventId: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    campaignId,
    type,
    actorId,
    occurredAt: new Date().toISOString(),
    payload,
  } as StoredEvent<TPayload>;
}

export function handleStoryCommand(state: CampaignState, command: StoryCommand): CommandResult {
  switch (command.type) {
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
  throw new Error("Unsupported story command");
}
