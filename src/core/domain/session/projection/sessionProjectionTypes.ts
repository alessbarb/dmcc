import { z } from "zod";
import {
  entityIdSchema,
  factIdSchema,
  relationIdSchema,
  sessionEventIdSchema,
  storyStepIdSchema,
  objectiveIdSchema,
  sessionPlanItemIdSchema,
} from "@shared/schemas.js";

// §22-26 of docs/engineering/session-evolution.md. Contracts only in this Sprint 2 slice —
// no rules are registered yet (see sessionProjectionEngine.ts) and no perspective consumes
// these types yet; Sprint 3 (narrative map) is the first real consumer.

export const sessionProjectionPerspectiveSchema = z.enum([
  "narrative_map",
  "consequence_chain",
  "outcome",
  "comparison",
]);
export type SessionProjectionPerspective = z.infer<typeof sessionProjectionPerspectiveSchema>;

export const sessionProjectionBasisSchema = z.enum(["planned", "live", "closed"]);
export type SessionProjectionBasis = z.infer<typeof sessionProjectionBasisSchema>;

// Points at the domain/session record a node, edge, or diagnostic is grounded in.
// Deliberately reused for both "reference" (§23, what a node represents) and "sourceRef"
// (§23/§25, what evidence supports a provenance or diagnostic) — the doc names them
// separately but gives them no distinct shape, and inventing two near-identical unions
// would just be duplication.
export const sessionProjectionReferenceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("entity"), entityId: entityIdSchema }),
  z.object({ type: z.literal("fact"), factId: factIdSchema }),
  z.object({ type: z.literal("relation"), relationId: relationIdSchema }),
  z.object({ type: z.literal("plan_item"), planItemId: sessionPlanItemIdSchema }),
  z.object({ type: z.literal("session_event"), sessionEventId: sessionEventIdSchema }),
  z.object({ type: z.literal("story_step"), storyStepId: storyStepIdSchema }),
  z.object({ type: z.literal("objective"), objectiveId: objectiveIdSchema }),
]);
export type SessionProjectionReference = z.infer<typeof sessionProjectionReferenceSchema>;
export const sessionProjectionSourceRefSchema = sessionProjectionReferenceSchema;
export type SessionProjectionSourceRef = SessionProjectionReference;

export const sessionProjectionProvenanceBasisSchema = z.enum([
  "explicit",
  "derived",
  "inferred",
  "user_confirmed",
]);
export type SessionProjectionProvenanceBasis = z.infer<typeof sessionProjectionProvenanceBasisSchema>;

export const sessionProjectionConfidenceSchema = z.enum(["high", "medium", "low"]);
export type SessionProjectionConfidence = z.infer<typeof sessionProjectionConfidenceSchema>;

export const sessionProjectionProvenanceSchema = z.object({
  basis: sessionProjectionProvenanceBasisSchema,
  ruleId: z.string(),
  sourceRefs: z.array(sessionProjectionSourceRefSchema),
  confidence: sessionProjectionConfidenceSchema.optional(),
});
export type SessionProjectionProvenance = z.infer<typeof sessionProjectionProvenanceSchema>;

export const sessionProjectionNodeKindSchema = z.enum([
  "opening",
  "scene",
  "decision_point",
  "decision_made",
  "clue",
  "secret",
  "revelation",
  "context_entity",
  "consequence",
  "front",
  "clock",
  "open_thread",
]);
export type SessionProjectionNodeKind = z.infer<typeof sessionProjectionNodeKindSchema>;

export const sessionProjectionEdgeKindSchema = z.enum([
  "next",
  "alternative",
  "conditional",
  "appears_in",
  "reveals",
  "unlocks",
  "confirms",
  "contradicts",
  "causes",
  "affects",
  "advances",
  "depends_on",
]);
export type SessionProjectionEdgeKind = z.infer<typeof sessionProjectionEdgeKindSchema>;

export const sessionProjectionNodeSchema = z.object({
  id: z.string(),
  kind: sessionProjectionNodeKindSchema,
  reference: sessionProjectionReferenceSchema,
  label: z.string(),
  summary: z.string().optional(),
  provenance: sessionProjectionProvenanceSchema,
});
export type SessionProjectionNode = z.infer<typeof sessionProjectionNodeSchema>;

export const sessionProjectionEdgeSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  kind: sessionProjectionEdgeKindSchema,
  label: z.string().optional(),
  provenance: sessionProjectionProvenanceSchema,
});
export type SessionProjectionEdge = z.infer<typeof sessionProjectionEdgeSchema>;

export const sessionProjectionDiagnosticCodeSchema = z.enum([
  "missing_scene",
  "unanchored_content",
  "causal_cycle",
  "missing_consequence_origin",
  "dangling_transition",
  "missing_entity",
  "duplicate_plan_item",
  "unsupported_relation",
  "missing_story_step",
  "missing_objective",
]);
export type SessionProjectionDiagnosticCode = z.infer<typeof sessionProjectionDiagnosticCodeSchema>;

export const sessionProjectionDiagnosticSeveritySchema = z.enum(["info", "warning", "error"]);
export type SessionProjectionDiagnosticSeverity = z.infer<typeof sessionProjectionDiagnosticSeveritySchema>;

export const sessionProjectionDiagnosticSchema = z.object({
  code: sessionProjectionDiagnosticCodeSchema,
  severity: sessionProjectionDiagnosticSeveritySchema,
  messageKey: z.string(),
  parameters: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  sourceRefs: z.array(sessionProjectionSourceRefSchema),
});
export type SessionProjectionDiagnostic = z.infer<typeof sessionProjectionDiagnosticSchema>;

export const sessionProjectionSourceSchema = z.object({
  planRevision: z.number().int().min(0),
  activatedPlanRevision: z.number().int().min(0).optional(),
  lastEventSequence: z.number().int().min(0).optional(),
  fingerprint: z.string(),
});
export type SessionProjectionSource = z.infer<typeof sessionProjectionSourceSchema>;

export const sessionProjectionSchema = z.object({
  version: z.literal(1),
  sessionId: z.string(),
  perspective: sessionProjectionPerspectiveSchema,
  basis: sessionProjectionBasisSchema,
  source: sessionProjectionSourceSchema,
  nodes: z.array(sessionProjectionNodeSchema),
  edges: z.array(sessionProjectionEdgeSchema),
  diagnostics: z.array(sessionProjectionDiagnosticSchema),
});
// Deliberately no `generatedAt` (§22): a timestamp would break determinism — the same
// session state must always produce byte-identical nodes/edges/diagnostics.
export type SessionProjection = z.infer<typeof sessionProjectionSchema>;
