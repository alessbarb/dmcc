import { describe, expect, it } from "vitest";
import {
  createEmptySessionPlan,
  sessionPlanSchema,
  type SessionPlan,
} from "../../src/core/domain/session/sessionPlan.js";
import { validateSessionPlan } from "../../src/core/domain/session/sessionPlanValidation.js";
import { upcastSessionPlanId } from "../../src/core/domain/session/sessionPlanIds.js";

function planWithScenes(): SessionPlan {
  const plan = createEmptySessionPlan();
  plan.flowItems = [
    { id: "spi_a", kind: "scene", sceneEntityId: "ent_cave", order: 0 },
    { id: "spi_b", kind: "scene", sceneEntityId: "ent_town", order: 1 },
  ];
  return plan;
}

describe("SessionPlan v2 schema", () => {
  it("parses an empty plan", () => {
    expect(() => sessionPlanSchema.parse(createEmptySessionPlan())).not.toThrow();
  });

  it("rejects a plan with wrong version", () => {
    const plan = { ...createEmptySessionPlan(), version: 1 };
    expect(() => sessionPlanSchema.parse(plan)).toThrow();
  });

  it("rejects negative order on a flow item", () => {
    const plan = planWithScenes();
    plan.flowItems[0]!.order = -1;
    expect(() => sessionPlanSchema.parse(plan)).toThrow();
  });
});

describe("validateSessionPlan", () => {
  it("accepts a plan with no violations", () => {
    const plan = planWithScenes();
    expect(() => validateSessionPlan(plan)).not.toThrow();
  });

  it("rejects duplicate flow item ids", () => {
    const plan = planWithScenes();
    plan.flowItems[1]!.id = plan.flowItems[0]!.id;
    expect(() => validateSessionPlan(plan)).toThrow(/Duplicate flow item id/);
  });

  it("rejects a reflexive transition", () => {
    const plan = planWithScenes();
    plan.transitions = [
      { id: "sptr_1", sourceItemId: "spi_a", targetItemId: "spi_a", kind: "next", order: 0 },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/Reflexive transition/);
  });

  it("rejects a dangling transition", () => {
    const plan = planWithScenes();
    plan.transitions = [
      { id: "sptr_1", sourceItemId: "spi_a", targetItemId: "spi_missing", kind: "next", order: 0 },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/Dangling transition/);
  });

  it("rejects a causal cycle across transitions", () => {
    const plan = planWithScenes();
    plan.transitions = [
      { id: "sptr_1", sourceItemId: "spi_a", targetItemId: "spi_b", kind: "next", order: 0 },
      { id: "sptr_2", sourceItemId: "spi_b", targetItemId: "spi_a", kind: "next", order: 1 },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/Causal cycle/);
  });

  it("allows the same scene to reappear via a second appearance id", () => {
    const plan = createEmptySessionPlan();
    plan.flowItems = [
      { id: "spi_a1", kind: "scene", sceneEntityId: "ent_cave", order: 0 },
      { id: "spi_b", kind: "scene", sceneEntityId: "ent_town", order: 1 },
      { id: "spi_a2", kind: "scene", sceneEntityId: "ent_cave", order: 2 },
    ];
    plan.transitions = [
      { id: "sptr_1", sourceItemId: "spi_a1", targetItemId: "spi_b", kind: "next", order: 0 },
      { id: "sptr_2", sourceItemId: "spi_b", targetItemId: "spi_a2", kind: "next", order: 1 },
    ];
    expect(() => validateSessionPlan(plan)).not.toThrow();
  });

  it("rejects a content link anchored to a nonexistent flow item", () => {
    const plan = planWithScenes();
    plan.contentLinks = [
      {
        id: "spcl_1",
        entityId: "ent_clue",
        role: "available_clue",
        anchorFlowItemId: "spi_missing",
        order: 0,
      },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/anchors to nonexistent/);
  });

  it("rejects a content link role incompatible with the entity's type", () => {
    const plan = planWithScenes();
    plan.contentLinks = [
      { id: "spcl_1", entityId: "ent_npc", role: "available_clue", order: 0 },
    ];
    expect(() =>
      validateSessionPlan(plan, { entityTypesById: { ent_npc: "npc" } }),
    ).toThrow(/incompatible with entity type/);
  });

  it("rejects two story-step bindings to the same story step", () => {
    const plan = planWithScenes();
    plan.bindings = [
      { id: "spbd_1", kind: "story_step", storyStepId: "stp_x", order: 0 },
      { id: "spbd_2", kind: "story_step", storyStepId: "stp_x", order: 1 },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/bound more than once/);
  });

  it("rejects an objective binding to a nonexistent goal", () => {
    const plan = planWithScenes();
    plan.bindings = [
      { id: "spbd_1", kind: "objective", objectiveId: "obj_x", goalId: "spgl_missing", order: 0 },
    ];
    expect(() => validateSessionPlan(plan)).toThrow(/nonexistent goal/);
  });

  it("accepts an objective binding to an existing goal", () => {
    const plan = planWithScenes();
    plan.goals = [{ id: "spgl_1", text: "Foreshadow the Red Cloaks", completed: false, order: 0 }];
    plan.bindings = [
      { id: "spbd_1", kind: "objective", objectiveId: "obj_x", goalId: "spgl_1", order: 0 },
    ];
    expect(() => validateSessionPlan(plan)).not.toThrow();
  });
});

describe("upcastSessionPlanId", () => {
  it("is deterministic for the same inputs", () => {
    const a = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_1",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 0,
    });
    const b = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_1",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 0,
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^spi_[0-9a-f]{16}$/);
  });

  it("differs when the appearance index differs", () => {
    const a = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_1",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 0,
    });
    const b = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_1",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 1,
    });
    expect(a).not.toBe(b);
  });

  it("differs across sessions for otherwise identical content", () => {
    const a = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_1",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 0,
    });
    const b = upcastSessionPlanId({
      prefix: "spi",
      sessionId: "sess_2",
      element: "flow_item",
      content: "ent_cave",
      appearanceIndex: 0,
    });
    expect(a).not.toBe(b);
  });
});
