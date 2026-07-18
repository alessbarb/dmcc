import { describe, expect, it } from "vitest";
import { sessionEventReferenceSchema } from "../../src/core/domain/session/sessionEventReference.js";

describe("sessionEventReferenceSchema", () => {
  it("accepts a valid reference of each type", () => {
    const references = [
      { type: "entity", entityId: "ent_klarg", role: "participant" },
      { type: "fact", factId: "fact_one", role: "confirmed" },
      { type: "relation", relationId: "rel_one", role: "revealed" },
      { type: "story_step", storyStepId: "stp_one", role: "advanced" },
      { type: "objective", objectiveId: "obj_one", role: "completed" },
    ];
    for (const reference of references) {
      expect(() => sessionEventReferenceSchema.parse(reference)).not.toThrow();
    }
  });

  it("rejects a role that doesn't belong to its reference type", () => {
    expect(() => sessionEventReferenceSchema.parse({ type: "entity", entityId: "ent_klarg", role: "advanced" })).toThrow();
  });

  it("rejects an unknown reference type", () => {
    expect(() => sessionEventReferenceSchema.parse({ type: "clock", clockId: "x", role: "advanced" })).toThrow();
  });
});
