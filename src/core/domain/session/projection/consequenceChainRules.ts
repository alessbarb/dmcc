import { resolveSessionPlan } from "../sessionPlanUpcast.js";
import { CONTENT_ROLE_TO_NODE_KIND, entityLabel } from "./narrativeMapRules.js";
import type { SessionProjectionCandidate, SessionProjectionRule, SessionProjectionRuleInput } from "./sessionProjectionEngine.js";

// §26.2 "metadata estructurada", §26.3 "relaciones directas" and §28.2 "cadena de
// consecuencias" of docs/engineering/session-evolution.md. Rule ids below reuse the exact
// strings the spec lists in §26.2/26.3 ("entity.consequence-origin", "relation.direct-causes",
// etc.) so the doc and the code stay traceable to each other.
//
// Basis convention for this perspective: content-anchored/global rules read the SessionPlan
// itself (the DM's direct authoring) -> "explicit", same as narrative_map. The metadata- and
// relation-derived rules combine two already-explicit facts (an entity's own metadata field,
// or an existing relation record) into a graph edge the DM never directly drew -> "derived".
// Neither category invents causality (§26.4) or walks more than one hop.

function readEntityIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function readEntityId(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const consequenceContentAnchoredRule: SessionProjectionRule = {
  id: "session.plan.content-anchored",
  perspective: "consequence_chain",
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

export const consequenceContentGlobalRule: SessionProjectionRule = {
  id: "session.plan.content-global",
  perspective: "consequence_chain",
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

// A content link's node id is `link.id` (a plan-scoped id), not the underlying entityId --
// the metadata/relation rules below need to translate "this entity is in the chain" back to
// "this is the node id to attach an edge to."
function planItemIdForEntity(input: SessionProjectionRuleInput, entityId: string): string | undefined {
  const plan = resolveSessionPlan(input.session);
  return plan.contentLinks.find((link) => link.entityId === entityId)?.id;
}

export const consequenceOriginRule: SessionProjectionRule = {
  id: "entity.consequence-origin",
  perspective: "consequence_chain",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    const candidates: SessionProjectionCandidate[] = [];
    for (const link of plan.contentLinks) {
      if (link.role !== "expected_consequence") continue;
      const consequence = input.campaignState.entities.get(link.entityId);
      const originEntityId = readEntityId(consequence?.metadata.originEntityId);
      if (!originEntityId) continue;
      const originNodeId = planItemIdForEntity(input, originEntityId) ?? `entity:${originEntityId}`;
      if (!planItemIdForEntity(input, originEntityId)) {
        candidates.push({
          kind: "node",
          node: {
            id: originNodeId,
            kind: "context_entity",
            reference: { type: "entity", entityId: originEntityId },
            label: entityLabel(input, originEntityId),
          },
          provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
        });
      }
      candidates.push({
        kind: "edge",
        edge: {
          id: `${originNodeId}->${link.id}:causes`,
          sourceId: originNodeId,
          targetId: link.id,
          kind: "causes",
        },
        provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
      });
    }
    return candidates;
  },
};

export const consequenceAffectsRule: SessionProjectionRule = {
  id: "entity.consequence-affects",
  perspective: "consequence_chain",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    const candidates: SessionProjectionCandidate[] = [];
    for (const link of plan.contentLinks) {
      if (link.role !== "expected_consequence") continue;
      const consequence = input.campaignState.entities.get(link.entityId);
      const affectedEntityIds = readEntityIds(consequence?.metadata.affectedEntityIds);
      for (const affectedEntityId of affectedEntityIds) {
        const affectedNodeId = planItemIdForEntity(input, affectedEntityId) ?? `entity:${affectedEntityId}`;
        if (!planItemIdForEntity(input, affectedEntityId)) {
          candidates.push({
            kind: "node",
            node: {
              id: affectedNodeId,
              kind: "context_entity",
              reference: { type: "entity", entityId: affectedEntityId },
              label: entityLabel(input, affectedEntityId),
            },
            provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
          });
        }
        candidates.push({
          kind: "edge",
          edge: {
            id: `${link.id}->${affectedNodeId}:affects`,
            sourceId: link.id,
            targetId: affectedNodeId,
            kind: "affects",
          },
          provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
        });
      }
    }
    return candidates;
  },
};

export const frontUsesClockRule: SessionProjectionRule = {
  id: "entity.front-uses-clock",
  perspective: "consequence_chain",
  evaluate(input): SessionProjectionCandidate[] {
    const plan = resolveSessionPlan(input.session);
    const candidates: SessionProjectionCandidate[] = [];
    for (const link of plan.contentLinks) {
      if (link.role !== "front_in_play") continue;
      const front = input.campaignState.entities.get(link.entityId);
      const clockEntityId = readEntityId(front?.metadata.clockEntityId);
      if (!clockEntityId) continue;
      const clockNodeId = planItemIdForEntity(input, clockEntityId) ?? `entity:${clockEntityId}`;
      if (!planItemIdForEntity(input, clockEntityId)) {
        candidates.push({
          kind: "node",
          node: {
            id: clockNodeId,
            kind: "clock",
            reference: { type: "entity", entityId: clockEntityId },
            label: entityLabel(input, clockEntityId),
          },
          provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
        });
      }
      candidates.push({
        kind: "edge",
        edge: {
          id: `${link.id}->${clockNodeId}:advances`,
          sourceId: link.id,
          targetId: clockNodeId,
          kind: "advances",
        },
        provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: link.entityId }] },
      });
    }
    return candidates;
  },
};

const DIRECT_RELATION_EDGE_KIND = {
  causes: "causes",
  depends_on: "depends_on",
  affected_by: "affects",
} as const;

function directRelationRule(
  id: string,
  relationType: keyof typeof DIRECT_RELATION_EDGE_KIND,
): SessionProjectionRule {
  return {
    id,
    perspective: "consequence_chain",
    evaluate(input): SessionProjectionCandidate[] {
      const linkedEntityIds = new Set(resolveSessionPlan(input.session).contentLinks.map((link) => link.entityId));
      const candidates: SessionProjectionCandidate[] = [];
      for (const relation of input.campaignState.relations.values()) {
        if (relation.archived || relation.relationType !== relationType) continue;
        if (!linkedEntityIds.has(relation.sourceEntityId) || !linkedEntityIds.has(relation.targetEntityId)) continue;
        const sourceNodeId = planItemIdForEntity(input, relation.sourceEntityId);
        const targetNodeId = planItemIdForEntity(input, relation.targetEntityId);
        if (!sourceNodeId || !targetNodeId) continue;
        candidates.push({
          kind: "edge",
          edge: {
            id: `relation:${relation.relationId}`,
            sourceId: sourceNodeId,
            targetId: targetNodeId,
            kind: DIRECT_RELATION_EDGE_KIND[relationType],
          },
          provenance: { basis: "derived", sourceRefs: [{ type: "entity", entityId: relation.sourceEntityId }] },
        });
      }
      return candidates;
    },
  };
}

export const directCausesRule = directRelationRule("relation.direct-causes", "causes");
export const directDependsOnRule = directRelationRule("relation.direct-depends-on", "depends_on");
export const directAffectedByRule = directRelationRule("relation.direct-affected-by", "affected_by");

export const CONSEQUENCE_CHAIN_RULES: SessionProjectionRule[] = [
  consequenceContentAnchoredRule,
  consequenceContentGlobalRule,
  consequenceOriginRule,
  consequenceAffectsRule,
  frontUsesClockRule,
  directCausesRule,
  directDependsOnRule,
  directAffectedByRule,
];
