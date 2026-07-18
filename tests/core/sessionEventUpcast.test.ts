import { describe, expect, it } from "vitest";
import { resolveSessionEventReferences, upcastLegacySessionEventReferences } from "../../src/core/domain/session/sessionEventUpcast.js";
import type { SessionEvent } from "../../src/core/domain/session/types.js";

function legacyEvent(overrides: Partial<SessionEvent> = {}): SessionEvent {
  return {
    id: "sevt_1",
    campaignId: "cmp_one",
    sessionId: "sess_1",
    type: "note_recorded",
    title: "A note",
    occurredAt: "2026-01-01T00:00:00.000Z",
    relatedEntityIds: ["ent_klarg"],
    relatedFactIds: ["fact_one"],
    relatedRelationIds: ["rel_one"],
    references: [],
    visibility: { kind: "dm_only" },
    metadata: {},
    ...overrides,
  };
}

describe("upcastLegacySessionEventReferences", () => {
  it("converts legacy arrays into conservative references", () => {
    const references = upcastLegacySessionEventReferences(legacyEvent());
    expect(references).toEqual([
      { type: "entity", entityId: "ent_klarg", role: "mentioned" },
      { type: "fact", factId: "fact_one", role: "mentioned" },
      { type: "relation", relationId: "rel_one", role: "changed" },
    ]);
  });

  it("uses a revealed relation role for revealing event types", () => {
    const references = upcastLegacySessionEventReferences(legacyEvent({ type: "clue_revealed" }));
    expect(references.find((ref) => ref.type === "relation")).toEqual({ type: "relation", relationId: "rel_one", role: "revealed" });
  });
});

describe("resolveSessionEventReferences", () => {
  it("returns the event's own references when present, without upcasting", () => {
    const event = legacyEvent({ references: [{ type: "entity", entityId: "ent_gundren", role: "subject" }] });
    expect(resolveSessionEventReferences(event)).toEqual([{ type: "entity", entityId: "ent_gundren", role: "subject" }]);
  });

  it("falls back to the legacy upcast when references is empty", () => {
    const event = legacyEvent({ relatedEntityIds: [], relatedFactIds: [], relatedRelationIds: ["rel_one"] });
    expect(resolveSessionEventReferences(event)).toEqual([{ type: "relation", relationId: "rel_one", role: "changed" }]);
  });
});
