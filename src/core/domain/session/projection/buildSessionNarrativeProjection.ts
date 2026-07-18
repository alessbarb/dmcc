import type { CampaignState } from "../../state.js";
import type { Session } from "../types.js";
import { resolveSessionPlan } from "../sessionPlanUpcast.js";
import { buildSessionProjection } from "./sessionProjectionEngine.js";
import { NARRATIVE_MAP_RULES } from "./narrativeMapRules.js";
import type { SessionProjection, SessionProjectionBasis } from "./sessionProjectionTypes.js";

// §28.1 of docs/engineering/session-evolution.md — "¿Cómo se relaciona lo preparado?"
function basisForSession(session: Session): SessionProjectionBasis {
  if (session.status === "planned") return "planned";
  if (session.status === "active") return "live";
  return "closed";
}

export function buildSessionNarrativeProjection(session: Session, campaignState: CampaignState): SessionProjection {
  const plan = resolveSessionPlan(session);
  return buildSessionProjection({
    rules: NARRATIVE_MAP_RULES,
    input: { campaignState, session },
    perspective: "narrative_map",
    basis: basisForSession(session),
    planRevision: plan.revision,
    activatedPlanRevision: session.activatedPlanRevision,
  });
}
