import type { CampaignState } from "../../state.js";
import type { Session } from "../types.js";
import { computeInferenceKey, sessionInferenceReviewMapKey } from "../sessionInferenceReview.js";
import type {
  SessionProjectionPerspective,
  SessionProjectionBasis,
  SessionProjectionNode,
  SessionProjectionEdge,
  SessionProjectionDiagnostic,
  SessionProjectionProvenance,
  SessionProjection,
} from "./sessionProjectionTypes.js";

// §26 of docs/engineering/session-evolution.md. This is the evaluator scaffold only —
// no rules are registered here. Sprint 3 (narrative_map) and Sprint 4 (consequence_chain)
// each bring their own rule sets; §26.4 limits what a rule may do (explicit associations,
// structured metadata, direct relations, one-hop inference — never title similarity, tag
// overlap, or invented causality).

export type SessionProjectionRuleInput = {
  campaignState: CampaignState;
  session: Session;
};

export type SessionProjectionNodeCandidate = {
  kind: "node";
  node: Omit<SessionProjectionNode, "provenance">;
  provenance: Omit<SessionProjectionProvenance, "ruleId">;
};

export type SessionProjectionEdgeCandidate = {
  kind: "edge";
  edge: Omit<SessionProjectionEdge, "provenance">;
  provenance: Omit<SessionProjectionProvenance, "ruleId">;
};

export type SessionProjectionCandidate = SessionProjectionNodeCandidate | SessionProjectionEdgeCandidate;

export type SessionProjectionRule = {
  id: string;
  perspective: SessionProjectionPerspective;
  evaluate(input: SessionProjectionRuleInput): SessionProjectionCandidate[];
};

// Higher wins on an id collision, regardless of registration order. §23's provenance is
// only truthful if a low-confidence inferred rule can never clobber an explicit one just
// because it happened to run later — "last rule wins" silently broke that guarantee the
// moment more than one rule could produce the same node/edge id.
const PROVENANCE_BASIS_PRIORITY: Record<SessionProjectionProvenance["basis"], number> = {
  explicit: 3,
  user_confirmed: 2,
  derived: 1,
  inferred: 0,
};

function isHigherPriorityCandidate(
  incomingBasis: SessionProjectionProvenance["basis"],
  existingBasis: SessionProjectionProvenance["basis"],
): boolean {
  return PROVENANCE_BASIS_PRIORITY[incomingBasis] >= PROVENANCE_BASIS_PRIORITY[existingBasis];
}

/**
 * Runs every rule registered for `perspective`, stamping each candidate with its rule's
 * `id` as provenance and splitting the result into nodes/edges. On an id collision, the
 * candidate with the higher-priority provenance basis wins (explicit > user_confirmed >
 * derived > inferred); ties fall back to registration order, so the result stays
 * deterministic given a deterministic rule list — never based on wall-clock time.
 */
export function evaluateSessionProjectionRules(
  rules: SessionProjectionRule[],
  input: SessionProjectionRuleInput,
  perspective: SessionProjectionPerspective,
): { nodes: SessionProjectionNode[]; edges: SessionProjectionEdge[] } {
  const nodesById = new Map<string, SessionProjectionNode>();
  const edgesById = new Map<string, SessionProjectionEdge>();

  for (const rule of rules) {
    if (rule.perspective !== perspective) continue;
    for (const candidate of rule.evaluate(input)) {
      if (candidate.kind === "node") {
        const existing = nodesById.get(candidate.node.id);
        if (existing && !isHigherPriorityCandidate(candidate.provenance.basis, existing.provenance.basis)) continue;
        nodesById.set(candidate.node.id, { ...candidate.node, provenance: { ...candidate.provenance, ruleId: rule.id } });
      } else {
        const existing = edgesById.get(candidate.edge.id);
        if (existing && !isHigherPriorityCandidate(candidate.provenance.basis, existing.provenance.basis)) continue;
        edgesById.set(candidate.edge.id, { ...candidate.edge, provenance: { ...candidate.provenance, ruleId: rule.id } });
      }
    }
  }

  return { nodes: [...nodesById.values()], edges: [...edgesById.values()] };
}

/**
 * §27's DM-review overlay, applied after rule evaluation so it works identically for every
 * perspective (narrative_map, consequence_chain, ...) without each rule set having to know
 * about reviews. "accepted" bumps a candidate's basis to user_confirmed (the first real
 * producer of that basis — see PROVENANCE_BASIS_PRIORITY above); "hidden" drops it entirely,
 * along with any edge that would otherwise dangle off a hidden node. Never creates or
 * touches a relation: promoting an inference to a world relation is a deliberately separate,
 * explicit CreateRelation call (§27.1 "Confirmar una lectura local no creará silenciosamente
 * una relación global").
 */
function applyInferenceReviews(
  nodes: SessionProjectionNode[],
  edges: SessionProjectionEdge[],
  sessionId: string,
  perspective: SessionProjectionPerspective,
  reviews: Map<string, { decision: "accepted" | "hidden" }>,
): { nodes: SessionProjectionNode[]; edges: SessionProjectionEdge[] } {
  function reviewFor(ruleId: string, sourceRefs: SessionProjectionProvenance["sourceRefs"], targetId: string) {
    const key = computeInferenceKey({ perspective, ruleId, sourceRefs, targetId });
    return reviews.get(sessionInferenceReviewMapKey(sessionId, key));
  }

  const keptNodes: SessionProjectionNode[] = [];
  for (const node of nodes) {
    const review = reviewFor(node.provenance.ruleId, node.provenance.sourceRefs, node.id);
    if (review?.decision === "hidden") continue;
    keptNodes.push(
      review?.decision === "accepted" ? { ...node, provenance: { ...node.provenance, basis: "user_confirmed" } } : node,
    );
  }

  const keptNodeIds = new Set(keptNodes.map((node) => node.id));
  const keptEdges: SessionProjectionEdge[] = [];
  for (const edge of edges) {
    if (!keptNodeIds.has(edge.sourceId) || !keptNodeIds.has(edge.targetId)) continue;
    const review = reviewFor(edge.provenance.ruleId, edge.provenance.sourceRefs, edge.id);
    if (review?.decision === "hidden") continue;
    keptEdges.push(
      review?.decision === "accepted" ? { ...edge, provenance: { ...edge.provenance, basis: "user_confirmed" } } : edge,
    );
  }

  return { nodes: keptNodes, edges: keptEdges };
}

/**
 * Deterministic fingerprint of the state a projection was built from — no timestamps,
 * no randomness. Two builds from identical plan/event state must produce identical output.
 */
export function computeSessionProjectionFingerprint(input: {
  planRevision: number;
  activatedPlanRevision?: number;
  lastEventSequence?: number;
}): string {
  return `plan:${input.planRevision}|activated:${input.activatedPlanRevision ?? "none"}|events:${input.lastEventSequence ?? 0}`;
}

export function buildSessionProjection(params: {
  rules: SessionProjectionRule[];
  input: SessionProjectionRuleInput;
  perspective: SessionProjectionPerspective;
  basis: SessionProjectionBasis;
  planRevision: number;
  activatedPlanRevision?: number;
  lastEventSequence?: number;
  diagnostics?: SessionProjectionDiagnostic[];
}): SessionProjection {
  const evaluated = evaluateSessionProjectionRules(params.rules, params.input, params.perspective);
  const { nodes, edges } = applyInferenceReviews(
    evaluated.nodes,
    evaluated.edges,
    params.input.session.sessionId,
    params.perspective,
    params.input.campaignState.sessionInferenceReviews,
  );
  return {
    version: 1,
    sessionId: params.input.session.sessionId,
    perspective: params.perspective,
    basis: params.basis,
    source: {
      planRevision: params.planRevision,
      activatedPlanRevision: params.activatedPlanRevision,
      lastEventSequence: params.lastEventSequence,
      fingerprint: computeSessionProjectionFingerprint({
        planRevision: params.planRevision,
        activatedPlanRevision: params.activatedPlanRevision,
        lastEventSequence: params.lastEventSequence,
      }),
    },
    nodes,
    edges,
    diagnostics: params.diagnostics ?? [],
  };
}
