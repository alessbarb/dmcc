import type { SessionEvent, SessionEventType } from "./types.js";
import type { SessionEventReference } from "./sessionEventReference.js";

const REVEALING_EVENT_TYPES = new Set<SessionEventType>(["clue_revealed", "secret_hinted"]);

/**
 * §42.4 of docs/engineering/session-evolution.md: legacy flat relatedEntityIds/
 * relatedFactIds/relatedRelationIds carry no role, so the upcast is deliberately
 * conservative (mentioned/changed) rather than guessing a precise one.
 */
export function upcastLegacySessionEventReferences(event: SessionEvent): SessionEventReference[] {
  const relationRole = REVEALING_EVENT_TYPES.has(event.type) ? "revealed" : "changed";
  return [
    ...event.relatedEntityIds.map((entityId): SessionEventReference => ({ type: "entity", entityId, role: "mentioned" })),
    ...event.relatedFactIds.map((factId): SessionEventReference => ({ type: "fact", factId, role: "mentioned" })),
    ...event.relatedRelationIds.map((relationId): SessionEventReference => ({ type: "relation", relationId, role: relationRole })),
  ];
}

/** Read-time resolver: returns the event's own references if present, else upcasts the legacy arrays. */
export function resolveSessionEventReferences(event: SessionEvent): SessionEventReference[] {
  if (event.references.length > 0) return event.references;
  return upcastLegacySessionEventReferences(event);
}
