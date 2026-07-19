import { z } from "zod";
import { sessionIdSchema } from "@shared/schemas.js";
import type { SessionProjectionPerspective, SessionProjectionSourceRef } from "./projection/sessionProjectionTypes.js";

// §27 of docs/engineering/session-evolution.md. A review is scoped to one session and one
// projection candidate, identified by a deterministic key so the same inference always maps
// to the same review regardless of when/how many times the projection is rebuilt.
export const sessionInferenceDecisionSchema = z.enum(["accepted", "hidden"]);
export type SessionInferenceDecision = z.infer<typeof sessionInferenceDecisionSchema>;

export const sessionInferenceReviewSchema = z.object({
  sessionId: sessionIdSchema,
  inferenceKey: z.string(),
  decision: sessionInferenceDecisionSchema,
  reviewedAt: z.string(),
  reviewedByUserId: z.string(),
});
export type SessionInferenceReview = z.infer<typeof sessionInferenceReviewSchema>;

// §27: "perspective + ruleId + fuentes ordenadas + destino". Source refs are sorted here
// (not just concatenated in whatever order the caller passed them) so the key is stable
// regardless of the order a rule happened to list its sourceRefs in.
export function computeInferenceKey(input: {
  perspective: SessionProjectionPerspective;
  ruleId: string;
  sourceRefs: SessionProjectionSourceRef[];
  targetId: string;
}): string {
  const sortedSourceRefs = input.sourceRefs.map((ref) => JSON.stringify(ref)).sort();
  return [input.perspective, input.ruleId, sortedSourceRefs.join(","), input.targetId].join("|");
}

export function sessionInferenceReviewMapKey(sessionId: string, inferenceKey: string): string {
  return `${sessionId}:${inferenceKey}`;
}
