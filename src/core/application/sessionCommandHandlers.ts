import { createId } from "@shared/ids.js";
import type { StoredEvent } from "../domain/events.js";
import type { CampaignState } from "../domain/state.js";
import type { Command } from "./commands.js";
import type { CommandResult } from "./commandBus.js";
import { closeSession, createSession, sessionEventTypeSchema } from "../domain/session/session.js";
import { sessionPlanSchema } from "../domain/session/sessionPlan.js";
import { validateSessionPlan } from "../domain/session/sessionPlanValidation.js";
import { resolveSessionPlan } from "../domain/session/sessionPlanUpcast.js";
import { validateSessionEventDetails } from "../domain/session/sessionEventDetails.js";

type SessionCommandType =
  | "CreatePreparedSession"
  | "ReviseSessionPlan"
  | "ActivatePlannedSession"
  | "StartSession"
  | "CloseSession"
  | "CancelPreparedSession"
  | "ArchiveSession"
  | "RecordSessionEvent";

type SessionCommand = Extract<Command, { type: SessionCommandType }>;

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

function requireSession(state: CampaignState, sessionId: string) {
  const session = state.sessions.get(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  return session;
}

function sessionCommandError(code: string, message: string, statusCode: number): Error {
  return Object.assign(new Error(`${code}: ${message}`), { statusCode });
}

export function handleSessionCommand(state: CampaignState, command: SessionCommand): CommandResult {
  switch (command.type) {
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
case "ReviseSessionPlan": {
  const session = requireSession(state, command.sessionId);
  if (session.status !== "planned") {
    throw sessionCommandError("SESSION_NOT_PLANNED", "only planned sessions accept plan revisions", 409);
  }
  const previousRevision = resolveSessionPlan(session).revision;
  if (command.expectedRevision !== previousRevision) {
    throw sessionCommandError(
      "SESSION_PLAN_REVISION_CONFLICT",
      `expected revision ${command.expectedRevision}, current revision is ${previousRevision}`,
      409,
    );
  }
  const revision = previousRevision + 1;
  const plan = sessionPlanSchema.parse({ ...command.plan, revision });
  validateSessionPlan(plan);
  const updated = {
    ...session,
    title: command.title,
    ...(command.scheduledAt !== undefined && { scheduledAt: command.scheduledAt }),
    plan,
    updatedAt: new Date().toISOString(),
  };
  const sessions = new Map(state.sessions);
  sessions.set(updated.sessionId, updated);
  return singleEvent(
    { ...state, sessions },
    makeEvent(command.actorId, command.campaignId, "SessionPlanRevised", {
      sessionId: command.sessionId,
      title: command.title,
      scheduledAt: command.scheduledAt,
      previousRevision,
      revision,
      plan,
    }),
  );
}
case "ActivatePlannedSession": {
  const session = requireSession(state, command.sessionId);
  if (session.status !== "planned") {
    throw sessionCommandError("SESSION_NOT_PLANNED", "only planned sessions can be activated", 409);
  }
  const activeExists = [...state.sessions.values()].some(
    (s) => s.status === "active" && s.sessionId !== command.sessionId,
  );
  if (activeExists) {
    throw sessionCommandError("ACTIVE_SESSION_EXISTS", "only one active session per campaign is allowed", 409);
  }
  const plan = resolveSessionPlan(session);
  const activated = {
    ...session,
    status: "active" as const,
    startedAt: new Date().toISOString(),
    plan,
    activatedPlanRevision: plan.revision,
    updatedAt: new Date().toISOString(),
  };
  const sessions = new Map(state.sessions);
  sessions.set(activated.sessionId, activated);
  return singleEvent(
    { ...state, sessions },
    makeEvent(command.actorId, command.campaignId, "SessionStarted", activated),
  );
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
case "RecordSessionEvent": {
  const session = requireSession(state, command.sessionId);
  if (session.status !== "active") {
    throw new Error("Session events can only be recorded in an active session");
  }
  const parsedEventType = sessionEventTypeSchema.parse(command.eventType);
  const metadata = command.metadata || {};
  validateSessionEventDetails(parsedEventType, metadata);
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
    planItemId: command.planItemId,
    relatedEntityIds: command.relatedEntityIds || [],
    relatedFactIds: command.relatedFactIds || [],
    relatedRelationIds: command.relatedRelationIds || [],
    references: command.references || [],
    visibility: command.visibility || { kind: "dm_only" as const },
    metadata,
  };
  const sessionEvents = new Map(state.sessionEvents || []);
  sessionEvents.set(id, eventRecord);
  return singleEvent({ ...state, sessionEvents }, makeEvent(command.actorId, command.campaignId, "SessionEventRecorded", eventRecord));
}
  }
  throw new Error("Unsupported session command");
}
