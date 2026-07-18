import { describe, expect, it } from "vitest";
import { addEntitiesToSessionPlan } from "../../src/core/domain/session/sessionPlanCanvasClassification.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";
import { validateSessionPlan } from "../../src/core/domain/session/sessionPlanValidation.js";

describe("addEntitiesToSessionPlan", () => {
  it("classifies a scene as a flow item", () => {
    const plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [{ entityId: "ent_cave", entityType: "scene" }],
    });
    expect(plan.flowItems).toHaveLength(1);
    expect(plan.flowItems[0]).toMatchObject({ kind: "scene", sceneEntityId: "ent_cave", order: 0 });
  });

  it("classifies clue/secret/consequence/front/clock into their content-link roles", () => {
    const plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [
        { entityId: "ent_clue", entityType: "clue" },
        { entityId: "ent_secret", entityType: "secret" },
        { entityId: "ent_conseq", entityType: "consequence" },
        { entityId: "ent_front", entityType: "front" },
        { entityId: "ent_clock", entityType: "clock" },
      ],
    });
    const roleByEntity = Object.fromEntries(plan.contentLinks.map((link) => [link.entityId, link.role]));
    expect(roleByEntity).toEqual({
      ent_clue: "available_clue",
      ent_secret: "secret_at_risk",
      ent_conseq: "expected_consequence",
      ent_front: "front_in_play",
      ent_clock: "clock_in_play",
    });
  });

  it("falls back to involved_entity for unrecognized types", () => {
    const plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [{ entityId: "ent_npc", entityType: "npc" }],
    });
    expect(plan.contentLinks[0]?.role).toBe("involved_entity");
  });

  it("does not duplicate a scene already present as a flow item", () => {
    let plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [{ entityId: "ent_cave", entityType: "scene" }],
    });
    plan = addEntitiesToSessionPlan({ plan, entities: [{ entityId: "ent_cave", entityType: "scene" }] });
    expect(plan.flowItems).toHaveLength(1);
  });

  it("does not duplicate a content link with the same role and entity", () => {
    let plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [{ entityId: "ent_clue", entityType: "clue" }],
    });
    plan = addEntitiesToSessionPlan({ plan, entities: [{ entityId: "ent_clue", entityType: "clue" }] });
    expect(plan.contentLinks).toHaveLength(1);
  });

  it("anchors new content links to the given flow item", () => {
    const plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [{ entityId: "ent_clue", entityType: "clue" }],
      anchorFlowItemId: "spi_scene1",
    });
    expect(plan.contentLinks[0]?.anchorFlowItemId).toBe("spi_scene1");
  });

  it("produces a plan that passes structural validation", () => {
    const plan = addEntitiesToSessionPlan({
      plan: createEmptySessionPlan(),
      entities: [
        { entityId: "ent_cave", entityType: "scene" },
        { entityId: "ent_clue", entityType: "clue" },
      ],
    });
    expect(() => validateSessionPlan({ ...plan, revision: 0 })).not.toThrow();
  });
});
