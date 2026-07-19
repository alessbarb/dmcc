import type { CampaignState } from "../../state.js";
import type { Session } from "../types.js";
import { resolveSessionPlan } from "../sessionPlanUpcast.js";
import { evaluateSessionProjectionRules, buildSessionProjection } from "./sessionProjectionEngine.js";
import { CONSEQUENCE_CHAIN_RULES } from "./consequenceChainRules.js";
import type {
  SessionProjection,
  SessionProjectionBasis,
  SessionProjectionDiagnostic,
  SessionProjectionEdge,
  SessionProjectionNode,
} from "./sessionProjectionTypes.js";

// §28.2 of docs/engineering/session-evolution.md — "¿Qué puede provocar esta sesión?"
function basisForSession(session: Session): SessionProjectionBasis {
  if (session.status === "planned") return "planned";
  if (session.status === "active") return "live";
  return "closed";
}

// Same three-color DFS approach as sessionPlanValidation.ts's detectCycle, adapted to (a)
// operate over the perspective's own node/edge id graph rather than flow-item transitions,
// and (b) report the cycle as a diagnostic instead of throwing -- a consequence chain is
// read-only derived data; a cycle in it is a modeling warning to surface to the DM (§28.2
// "ciclos y huecos causales"), not a write the system can reject.
function findCausalCycle(nodes: SessionProjectionNode[], edges: SessionProjectionEdge[]): string[] | undefined {
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) adjacency.get(edge.sourceId)?.push(edge.targetId);

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const node of nodes) color.set(node.id, WHITE);
  const stack: string[] = [];

  function visit(nodeId: string): string[] | undefined {
    color.set(nodeId, GRAY);
    stack.push(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      const state = color.get(next);
      if (state === GRAY) {
        const cycleStart = stack.indexOf(next);
        return stack.slice(cycleStart);
      }
      if (state === WHITE) {
        const found = visit(next);
        if (found) return found;
      }
    }
    stack.pop();
    color.set(nodeId, BLACK);
    return undefined;
  }

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      const found = visit(node.id);
      if (found) return found;
    }
  }
  return undefined;
}

function buildDiagnostics(
  campaignState: CampaignState,
  nodes: SessionProjectionNode[],
  edges: SessionProjectionEdge[],
): SessionProjectionDiagnostic[] {
  const diagnostics: SessionProjectionDiagnostic[] = [];

  const cycle = findCausalCycle(nodes, edges);
  if (cycle) {
    diagnostics.push({
      code: "causal_cycle",
      severity: "warning",
      messageKey: "sessionConsequenceChain.diagnostics.causalCycle",
      parameters: { nodeIds: cycle.join(",") },
      sourceRefs: cycle
        .map((nodeId) => nodes.find((node) => node.id === nodeId)?.reference)
        .filter((ref): ref is NonNullable<typeof ref> => ref !== undefined),
    });
  }

  for (const node of nodes) {
    if (node.kind !== "consequence" || node.reference.type !== "entity") continue;
    const entity = campaignState.entities.get(node.reference.entityId);
    if (entity?.metadata.originEntityId === undefined && entity?.metadata.originFactId === undefined) {
      diagnostics.push({
        code: "missing_consequence_origin",
        severity: "info",
        messageKey: "sessionConsequenceChain.diagnostics.missingConsequenceOrigin",
        sourceRefs: [node.reference],
      });
    }
  }

  return diagnostics;
}

export function buildSessionConsequenceProjection(session: Session, campaignState: CampaignState): SessionProjection {
  const plan = resolveSessionPlan(session);
  const { nodes, edges } = evaluateSessionProjectionRules(
    CONSEQUENCE_CHAIN_RULES,
    { campaignState, session },
    "consequence_chain",
  );
  return buildSessionProjection({
    rules: CONSEQUENCE_CHAIN_RULES,
    input: { campaignState, session },
    perspective: "consequence_chain",
    basis: basisForSession(session),
    planRevision: plan.revision,
    activatedPlanRevision: session.activatedPlanRevision,
    diagnostics: buildDiagnostics(campaignState, nodes, edges),
  });
}
