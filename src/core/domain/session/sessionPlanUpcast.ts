import type { SessionId } from "@shared/ids.js";
import type { SessionPrep } from "./types.js";
import type { StoryStep } from "../story/types.js";
import {
  type SessionPlan,
  type SessionPlanBinding,
  type SessionPlannedScene,
  type SessionPlanContentRole,
} from "./sessionPlan.js";
import { upcastSessionPlanId } from "./sessionPlanIds.js";

function upcastContentLinks(
  sessionId: SessionId,
  entityIds: string[],
  role: SessionPlanContentRole,
): SessionPlan["contentLinks"] {
  return entityIds.map((entityId, index) => ({
    id: upcastSessionPlanId({
      prefix: "spcl",
      sessionId,
      element: "content_link",
      content: `${role}:${entityId}`,
      appearanceIndex: index,
    }),
    entityId,
    role,
    order: index,
  }));
}

// Converts the pre-v2 flat-array SessionPrep into a v2 SessionPlan. Story-step
// bindings are derived separately (see upcastStoryStepBindingsForSession)
// since they need the StoryStep list, not just the prep. See §42.
export function upcastSessionPrepToPlan(sessionId: SessionId, prep: SessionPrep): SessionPlan {
  const flowItems: SessionPlannedScene[] = prep.sceneIds.map((sceneEntityId, index) => ({
    id: upcastSessionPlanId({
      prefix: "spi",
      sessionId,
      element: "flow_item",
      content: sceneEntityId,
      appearanceIndex: index,
    }),
    kind: "scene",
    sceneEntityId,
    order: index,
  }));

  const transitions: SessionPlan["transitions"] = [];
  for (let index = 0; index < flowItems.length - 1; index++) {
    const source = flowItems[index]!;
    const target = flowItems[index + 1]!;
    transitions.push({
      id: upcastSessionPlanId({
        prefix: "sptr",
        sessionId,
        element: "transition",
        content: `${source.id}->${target.id}`,
        appearanceIndex: index,
      }),
      sourceItemId: source.id,
      targetItemId: target.id,
      kind: "next",
      order: index,
    });
  }

  const contentLinks: SessionPlan["contentLinks"] = [
    ...upcastContentLinks(sessionId, prep.availableClueIds, "available_clue"),
    ...upcastContentLinks(sessionId, prep.secretsAtRiskIds, "secret_at_risk"),
    ...upcastContentLinks(sessionId, prep.expectedConsequenceIds, "expected_consequence"),
    ...upcastContentLinks(sessionId, prep.involvedEntityIds, "involved_entity"),
  ];

  const goals: SessionPlan["goals"] = prep.goals.map((text, index) => ({
    id: upcastSessionPlanId({
      prefix: "spgl",
      sessionId,
      element: "goal",
      content: text,
      appearanceIndex: index,
    }),
    text,
    completed: false,
    order: index,
  }));

  const checklist: SessionPlan["checklist"] = prep.checklist.map((item, index) => ({
    id: upcastSessionPlanId({
      prefix: "spck",
      sessionId,
      element: "checklist_item",
      content: item.id,
      appearanceIndex: index,
    }),
    text: item.label,
    checked: item.done,
    priority: item.priority,
    order: index,
  }));

  return {
    version: 2,
    revision: 0,
    state: prep.state,
    ...(prep.summary !== undefined && { summary: prep.summary }),
    ...(prep.openingPrompt !== undefined && { openingPrompt: prep.openingPrompt }),
    goals,
    checklist,
    flowItems,
    contentLinks,
    transitions,
    bindings: [],
    ...(prep.notes !== undefined && { privateNotes: prep.notes }),
  };
}

// §42.5: anchor a StoryStep to a scene appearance only when the reference is
// unambiguous (exactly one flow item for that scene entity); never guess.
export function upcastStoryStepBindingsForSession(params: {
  sessionId: SessionId;
  storySteps: StoryStep[];
  plan: SessionPlan;
}): SessionPlanBinding[] {
  const { sessionId, storySteps, plan } = params;
  const relevantSteps = storySteps.filter((step) => step.plannedSessionId === sessionId);

  return relevantSteps.map((step, index) => {
    const order = step.plannedSessionOrder ?? index;
    const matches = step.sceneEntityId
      ? plan.flowItems.filter(
          (item) => item.kind === "scene" && item.sceneEntityId === step.sceneEntityId,
        )
      : [];
    const anchorFlowItemId = matches.length === 1 ? matches[0]!.id : undefined;

    return {
      id: upcastSessionPlanId({
        prefix: "spbd",
        sessionId,
        element: "binding",
        content: step.stepId,
        appearanceIndex: order,
      }),
      kind: "story_step" as const,
      storyStepId: step.stepId,
      ...(anchorFlowItemId !== undefined && { anchorFlowItemId }),
      order,
    };
  });
}
