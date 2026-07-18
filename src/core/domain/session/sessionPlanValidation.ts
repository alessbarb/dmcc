import type { EntityId } from "@shared/ids.js";
import type {
  SessionPlan,
  SessionPlanContentRole,
  SessionFlowItem,
} from "./sessionPlan.js";

const ROLE_COMPATIBLE_ENTITY_TYPES: Record<SessionPlanContentRole, readonly string[]> = {
  available_clue: ["clue"],
  secret_at_risk: ["secret"],
  expected_consequence: ["consequence"],
  front_in_play: ["front"],
  clock_in_play: ["clock"],
  involved_entity: [],
};

function assertUniqueIds(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate ${label} id: ${id}`);
    }
    seen.add(id);
  }
}

function detectCycle(
  flowItemIds: Set<string>,
  edges: Array<{ sourceItemId: string; targetItemId: string }>,
): void {
  const adjacency = new Map<string, string[]>();
  for (const id of flowItemIds) adjacency.set(id, []);
  for (const edge of edges) {
    adjacency.get(edge.sourceItemId)?.push(edge.targetItemId);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const id of flowItemIds) color.set(id, WHITE);

  const visit = (node: string): void => {
    color.set(node, GRAY);
    for (const next of adjacency.get(node) ?? []) {
      const state = color.get(next);
      if (state === GRAY) {
        throw new Error(`Causal cycle detected in session plan transitions involving ${node}`);
      }
      if (state === WHITE) visit(next);
    }
    color.set(node, BLACK);
  };

  for (const id of flowItemIds) {
    if (color.get(id) === WHITE) visit(id);
  }
}

export type SessionPlanValidationContext = {
  entityTypesById?: Record<EntityId, string>;
};

export function validateSessionPlan(
  plan: SessionPlan,
  context: SessionPlanValidationContext = {},
): void {
  const flowItemIds = plan.flowItems.map((item: SessionFlowItem) => item.id);
  assertUniqueIds(flowItemIds, "flow item");
  assertUniqueIds(
    plan.contentLinks.map((link) => link.id),
    "content link",
  );
  assertUniqueIds(
    plan.transitions.map((transition) => transition.id),
    "transition",
  );
  assertUniqueIds(
    plan.bindings.map((binding) => binding.id),
    "binding",
  );
  assertUniqueIds(
    plan.goals.map((goal) => goal.id),
    "goal",
  );
  assertUniqueIds(
    plan.checklist.map((item) => item.id),
    "checklist item",
  );

  const flowItemIdSet = new Set(flowItemIds);
  const goalIdSet = new Set(plan.goals.map((goal) => goal.id));

  for (const transition of plan.transitions) {
    if (transition.sourceItemId === transition.targetItemId) {
      throw new Error(
        `Reflexive transition not allowed: ${transition.id} points to itself`,
      );
    }
    if (!flowItemIdSet.has(transition.sourceItemId)) {
      throw new Error(
        `Dangling transition ${transition.id}: source item ${transition.sourceItemId} does not exist`,
      );
    }
    if (!flowItemIdSet.has(transition.targetItemId)) {
      throw new Error(
        `Dangling transition ${transition.id}: target item ${transition.targetItemId} does not exist`,
      );
    }
  }

  detectCycle(flowItemIdSet, plan.transitions);

  for (const link of plan.contentLinks) {
    if (link.anchorFlowItemId !== undefined && !flowItemIdSet.has(link.anchorFlowItemId)) {
      throw new Error(
        `Content link ${link.id} anchors to nonexistent flow item ${link.anchorFlowItemId}`,
      );
    }
    const compatibleTypes = ROLE_COMPATIBLE_ENTITY_TYPES[link.role];
    if (compatibleTypes.length > 0 && context.entityTypesById) {
      const entityType = context.entityTypesById[link.entityId];
      if (entityType !== undefined && !compatibleTypes.includes(entityType)) {
        throw new Error(
          `Content link ${link.id} has role ${link.role} incompatible with entity type ${entityType}`,
        );
      }
    }
  }

  const storyStepBindingSeen = new Set<string>();
  for (const binding of plan.bindings) {
    if (binding.anchorFlowItemId !== undefined && !flowItemIdSet.has(binding.anchorFlowItemId)) {
      throw new Error(
        `Binding ${binding.id} anchors to nonexistent flow item ${binding.anchorFlowItemId}`,
      );
    }
    if (binding.kind === "story_step") {
      if (storyStepBindingSeen.has(binding.storyStepId)) {
        throw new Error(
          `Story step ${binding.storyStepId} is bound more than once in the same session plan`,
        );
      }
      storyStepBindingSeen.add(binding.storyStepId);
    }
    if (binding.kind === "objective" && !goalIdSet.has(binding.goalId)) {
      throw new Error(
        `Objective binding ${binding.id} references nonexistent goal ${binding.goalId}`,
      );
    }
  }
}
