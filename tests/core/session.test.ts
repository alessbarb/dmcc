import { describe, expect, it } from "vitest";
import { sessionSchema } from "../../src/core/domain/session/types.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";

function baseSession() {
  return {
    id: "sess_1",
    sessionId: "sess_1",
    campaignId: "cmp_1",
    number: 1,
    title: "La emboscada",
    status: "planned" as const,
    presentPlayerIds: [],
    presentCharacterIds: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("Session v2 coexistence", () => {
  it("accepts a session with no prep and no plan", () => {
    expect(() => sessionSchema.parse(baseSession())).not.toThrow();
  });

  it("accepts a session carrying a v2 plan", () => {
    const session = { ...baseSession(), plan: createEmptySessionPlan() };
    expect(() => sessionSchema.parse(session)).not.toThrow();
  });

  it("accepts a session with activatedPlanRevision and archivedAt", () => {
    const session = {
      ...baseSession(),
      plan: { ...createEmptySessionPlan(), revision: 5, state: "ready" as const },
      activatedPlanRevision: 5,
      status: "archived" as const,
      archivedAt: "2026-02-01T00:00:00.000Z",
    };
    expect(() => sessionSchema.parse(session)).not.toThrow();
  });
});
