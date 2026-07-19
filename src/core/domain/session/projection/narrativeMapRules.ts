import type { SessionPlanContentRole } from "../sessionPlan.js";
import type { SessionProjectionNodeKind } from "./sessionProjectionTypes.js";
import { resolveSessionPlan } from "../sessionPlanUpcast.js";
import type { SessionProjectionCandidate, SessionProjectionRule, SessionProjectionRuleInput } from "./sessionProjectionEngine.js";

// §26.1 "reglas explícitas" + §28.1 "mapa narrativo" of docs/engineering/session-evolution.md.
// Every rule here reads only explicit SessionPlan structure — no title similarity, no tag
// overlap, no multi-hop traversal (§26.4). All candidates carry basis "explicit": the plan
// itself is the DM's own explicit authoring, not an inference about it.
//
// Known gap: §28.1 lists "objetivos" as part of the narrative map, but §24's node-kind enum
// has no kind for an objective (only story steps get "open_thread"). Rather than invent a
// kind the spec doesn't define, objective bindings are left out of this rule set.

export const CONTENT_ROLE_TO_NODE_KIND: Record<SessionPlanContentRole, SessionProjectionNodeKind> = {
  available_clue: "clue",
  secret_at_risk: "secret",
  expected_consequence: "consequence",
  involved_entity: "context_entity",
  front_in_play: "front",
  clock_in_play: "clock",
};

export function entityLabel(input: SessionProjectionRuleInput, entityId: string): string {
  return input.campaignState.entities.get(entityId)?.title ?? entityId;
}

export const openingRule: SessionProjectionRule = {
  id: "session.plan.opening",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    if (!plan.openingPrompt) return [];
    return [
      {
        kind: "node",
        node: {
          id: `${input.session.sessionId}:opening`,
          kind: "opening",
          reference: { type: "plan_item", planItemId: `${input.session.sessionId}:opening` },
          label: plan.openingPrompt,
        },
        provenance: { basis: "explicit", sourceRefs: [] },
      },
    ];
  },
};

export const flowItemRule: SessionProjectionRule = {
  id: "session.plan.flow-item",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    return plan.flowItems.map((item): SessionProjectionCandidate => {
      if (item.kind === "scene") {
        return {
          kind: "node",
          node: {
            id: item.id,
            kind: "scene",
            reference: { type: "entity", entityId: item.sceneEntityId },
            label: item.titleOverride ?? entityLabel(input, item.sceneEntityId),
          },
          provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: item.id }] },
        };
      }
      return {
        kind: "node",
        node: {
          id: item.id,
          kind: "decision_point",
          reference: { type: "plan_item", planItemId: item.id },
          label: item.title,
        },
        provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: item.id }] },
      };
    });
  },
};

export const transitionRule: SessionProjectionRule = {
  id: "session.plan.transition",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    return plan.transitions.map((transition): SessionProjectionCandidate => ({
      kind: "edge",
      edge: {
        id: transition.id,
        sourceId: transition.sourceItemId,
        targetId: transition.targetItemId,
        kind: transition.kind,
        label: transition.label,
      },
      provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: transition.id }] },
    }));
  },
};

export const contentAnchoredRule: SessionProjectionRule = {
  id: "session.plan.content-anchored",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    const candidates: SessionProjectionCandidate[] = [];
    for (const link of plan.contentLinks) {
      if (!link.anchorFlowItemId) continue;
      candidates.push({
        kind: "node",
        node: {
          id: link.id,
          kind: CONTENT_ROLE_TO_NODE_KIND[link.role],
          reference: { type: "entity", entityId: link.entityId },
          label: entityLabel(input, link.entityId),
        },
        provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: link.id }] },
      });
      candidates.push({
        kind: "edge",
        edge: {
          id: `${link.anchorFlowItemId}->${link.id}`,
          sourceId: link.anchorFlowItemId,
          targetId: link.id,
          kind: "appears_in",
        },
        provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: link.id }] },
      });
    }
    return candidates;
  },
};

export const contentGlobalRule: SessionProjectionRule = {
  id: "session.plan.content-global",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    return plan.contentLinks
      .filter((link) => !link.anchorFlowItemId)
      .map((link): SessionProjectionCandidate => ({
        kind: "node",
        node: {
          id: link.id,
          kind: CONTENT_ROLE_TO_NODE_KIND[link.role],
          reference: { type: "entity", entityId: link.entityId },
          label: entityLabel(input, link.entityId),
        },
        provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: link.id }] },
      }));
  },
};

export const storyStepBindingRule: SessionProjectionRule = {
  id: "session.plan.story-step-binding",
  perspective: "narrative_map",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    const candidates: SessionProjectionCandidate[] = [];
    for (const binding of plan.bindings) {
      if (binding.kind !== "story_step") continue;
      const storyStep = input.campaignState.storySteps.get(binding.storyStepId);
      candidates.push({
        kind: "node",
        node: {
          id: binding.id,
          kind: "open_thread",
          reference: { type: "story_step", storyStepId: binding.storyStepId },
          label: storyStep?.title ?? binding.storyStepId,
        },
        provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: binding.id }] },
      });
      if (binding.anchorFlowItemId) {
        candidates.push({
          kind: "edge",
          edge: {
            id: `${binding.anchorFlowItemId}->${binding.id}`,
            sourceId: binding.anchorFlowItemId,
            targetId: binding.id,
            kind: "appears_in",
          },
          provenance: { basis: "explicit", sourceRefs: [{ type: "plan_item", planItemId: binding.id }] },
        });
      }
    }
    return candidates;
  },
};

export const NARRATIVE_MAP_RULES: SessionProjectionRule[] = [
  openingRule,
  flowItemRule,
  transitionRule,
  contentAnchoredRule,
  contentGlobalRule,
  storyStepBindingRule,
];
