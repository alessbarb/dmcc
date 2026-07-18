import { describe, expect, it } from "vitest";
import {
  upcastSessionPrepToPlan,
  upcastStoryStepBindingsForSession,
} from "../../src/core/domain/session/sessionPlanUpcast.js";
import { validateSessionPlan } from "../../src/core/domain/session/sessionPlanValidation.js";
import type { SessionPrep } from "../../src/core/domain/session/types.js";
import type { StoryStep } from "../../src/core/domain/story/types.js";

function basePrep(overrides: Partial<SessionPrep> = {}): SessionPrep {
  return {
    state: "ready",
    summary: "The party investigates Cragmaw hideout",
    goals: [],
    sceneIds: [],
    involvedEntityIds: [],
    availableClueIds: [],
    secretsAtRiskIds: [],
    expectedConsequenceIds: [],
    checklist: [],
    ...overrides,
  };
}

describe("upcastSessionPrepToPlan", () => {
  it("is deterministic across repeated runs (upcast is a no-op re-run)", () => {
    const prep = basePrep({ sceneIds: ["ent_cave", "ent_town"] });
    const a = upcastSessionPrepToPlan("sess_1", prep);
    const b = upcastSessionPrepToPlan("sess_1", prep);
    expect(a).toEqual(b);
  });

  it("converts sceneIds into ordered flow items linked by next transitions", () => {
    const prep = basePrep({ sceneIds: ["ent_cave", "ent_town", "ent_castle"] });
    const plan = upcastSessionPrepToPlan("sess_1", prep);

    expect(plan.flowItems).toHaveLength(3);
    expect(plan.flowItems.map((item) => (item.kind === "scene" ? item.sceneEntityId : null))).toEqual([
      "ent_cave",
      "ent_town",
      "ent_castle",
    ]);
    expect(plan.transitions).toHaveLength(2);
    expect(plan.transitions[0]!.sourceItemId).toBe(plan.flowItems[0]!.id);
    expect(plan.transitions[0]!.targetItemId).toBe(plan.flowItems[1]!.id);
    expect(plan.transitions[0]!.kind).toBe("next");
  });

  it("converts the four legacy arrays into content links with the correct roles", () => {
    const prep = basePrep({
      availableClueIds: ["ent_clue1"],
      secretsAtRiskIds: ["ent_secret1"],
      expectedConsequenceIds: ["ent_conseq1"],
      involvedEntityIds: ["ent_npc1"],
    });
    const plan = upcastSessionPrepToPlan("sess_1", prep);

    const roleByEntity = Object.fromEntries(plan.contentLinks.map((link) => [link.entityId, link.role]));
    expect(roleByEntity).toEqual({
      ent_clue1: "available_clue",
      ent_secret1: "secret_at_risk",
      ent_conseq1: "expected_consequence",
      ent_npc1: "involved_entity",
    });
    expect(plan.contentLinks.every((link) => link.anchorFlowItemId === undefined)).toBe(true);
  });

  it("converts goal strings into SessionPlanGoal objects with stable order", () => {
    const prep = basePrep({ goals: ["Foreshadow the Red Cloaks", "Introduce Gundren"] });
    const plan = upcastSessionPrepToPlan("sess_1", prep);

    expect(plan.goals.map((g) => g.text)).toEqual(["Foreshadow the Red Cloaks", "Introduce Gundren"]);
    expect(plan.goals.every((g) => g.completed === false)).toBe(true);
    expect(plan.goals.map((g) => g.order)).toEqual([0, 1]);
  });

  it("converts checklist items, preserving label/done/priority", () => {
    const prep = basePrep({
      checklist: [
        { id: "chk_1", label: "Print handouts", done: true, priority: "high" },
        { id: "chk_2", label: "Prep minis", done: false, priority: "low" },
      ],
    });
    const plan = upcastSessionPrepToPlan("sess_1", prep);

    expect(plan.checklist).toEqual([
      expect.objectContaining({ text: "Print handouts", checked: true, priority: "high", order: 0 }),
      expect.objectContaining({ text: "Prep minis", checked: false, priority: "low", order: 1 }),
    ]);
  });

  it("produces a plan that passes structural validation", () => {
    const prep = basePrep({
      sceneIds: ["ent_cave", "ent_town"],
      availableClueIds: ["ent_clue1"],
      goals: ["Foreshadow"],
      checklist: [{ id: "chk_1", label: "Print handouts", done: false, priority: "medium" }],
    });
    const plan = upcastSessionPrepToPlan("sess_1", prep);
    expect(() => validateSessionPlan(plan)).not.toThrow();
  });

  it("carries over summary, openingPrompt, and private notes", () => {
    const prep = basePrep({ openingPrompt: "The rain begins to fall...", notes: "Remember Sildar's ring" });
    const plan = upcastSessionPrepToPlan("sess_1", prep);
    expect(plan.summary).toBe(prep.summary);
    expect(plan.openingPrompt).toBe("The rain begins to fall...");
    expect(plan.privateNotes).toBe("Remember Sildar's ring");
  });
});

function baseStep(overrides: Partial<StoryStep> = {}): StoryStep {
  return {
    campaignId: "cmp_1",
    stepId: "stp_1",
    threadId: "sth_1",
    title: "Discover Glasstaff's identity",
    status: "planned",
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
    entityIds: [],
    ...overrides,
  };
}

describe("upcastStoryStepBindingsForSession", () => {
  it("binds only steps planned for the given session", () => {
    const plan = upcastSessionPrepToPlan("sess_1", basePrep({ sceneIds: ["ent_cave"] }));
    const steps = [
      baseStep({ stepId: "stp_1", plannedSessionId: "sess_1", plannedSessionOrder: 0 }),
      baseStep({ stepId: "stp_2", plannedSessionId: "sess_2", plannedSessionOrder: 0 }),
    ];
    const bindings = upcastStoryStepBindingsForSession({ sessionId: "sess_1", storySteps: steps, plan });
    expect(bindings).toHaveLength(1);
    expect(bindings[0]!.storyStepId).toBe("stp_1");
  });

  it("anchors to the matching scene appearance when the scene is unambiguous", () => {
    const plan = upcastSessionPrepToPlan("sess_1", basePrep({ sceneIds: ["ent_cave", "ent_town"] }));
    const steps = [
      baseStep({
        stepId: "stp_1",
        plannedSessionId: "sess_1",
        plannedSessionOrder: 0,
        sceneEntityId: "ent_cave",
      }),
    ];
    const bindings = upcastStoryStepBindingsForSession({ sessionId: "sess_1", storySteps: steps, plan });
    expect(bindings[0]!.anchorFlowItemId).toBe(plan.flowItems[0]!.id);
  });

  it("does not invent an ambiguous anchor when the same scene appears twice", () => {
    const plan = upcastSessionPrepToPlan(
      "sess_1",
      basePrep({ sceneIds: ["ent_cave", "ent_town", "ent_cave"] }),
    );
    const steps = [
      baseStep({
        stepId: "stp_1",
        plannedSessionId: "sess_1",
        plannedSessionOrder: 0,
        sceneEntityId: "ent_cave",
      }),
    ];
    const bindings = upcastStoryStepBindingsForSession({ sessionId: "sess_1", storySteps: steps, plan });
    expect(bindings[0]!.anchorFlowItemId).toBeUndefined();
  });
});
