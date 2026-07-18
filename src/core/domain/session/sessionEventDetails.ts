import { z } from "zod";
import { entityIdSchema, sessionPlanItemIdSchema } from "@shared/schemas.js";
import type { SessionEventType } from "./types.js";

// §15 of docs/engineering/session-evolution.md. Not every SessionEventType carries
// structured details yet — types absent from this map keep the loose `details` record.
export const sceneStartedDetailsSchema = z.object({
  sceneEntityId: entityIdSchema.optional(),
});
export type SceneStartedDetails = z.infer<typeof sceneStartedDetailsSchema>;

export const sceneSkippedDetailsSchema = z.object({
  reason: z.string().optional(),
});
export type SceneSkippedDetails = z.infer<typeof sceneSkippedDetailsSchema>;

export const sceneImprovisedDetailsSchema = z.object({
  sceneEntityId: entityIdSchema.optional(),
  afterPlanItemId: sessionPlanItemIdSchema.optional(),
});
export type SceneImprovisedDetails = z.infer<typeof sceneImprovisedDetailsSchema>;

export const decisionMadeDetailsSchema = z.object({
  choice: z.string(),
  alternativesRejected: z.array(z.string()).optional(),
});
export type DecisionMadeDetails = z.infer<typeof decisionMadeDetailsSchema>;

export const noteRecordedDetailsSchema = z.object({
  observationKind: z.enum(["world", "character", "knowledge", "story", "preparation", "other"]),
});
export type NoteRecordedDetails = z.infer<typeof noteRecordedDetailsSchema>;

export const materialIntroducedDetailsSchema = z.object({
  source: z.enum(["canvas", "notebook", "manual"]),
});
export type MaterialIntroducedDetails = z.infer<typeof materialIntroducedDetailsSchema>;

export const SESSION_EVENT_DETAILS_SCHEMAS: Partial<Record<SessionEventType, z.ZodTypeAny>> = {
  scene_started: sceneStartedDetailsSchema,
  scene_skipped: sceneSkippedDetailsSchema,
  scene_improvised: sceneImprovisedDetailsSchema,
  decision_made: decisionMadeDetailsSchema,
  note_recorded: noteRecordedDetailsSchema,
  material_introduced: materialIntroducedDetailsSchema,
};

/**
 * Validates `details` against the schema registered for this event type, if any.
 * An empty object means "no details supplied" and is left unvalidated — most existing
 * callers don't populate details yet, and this must stay backward compatible with them.
 */
export function validateSessionEventDetails(type: SessionEventType, details: unknown): unknown {
  const schema = SESSION_EVENT_DETAILS_SCHEMAS[type];
  if (!schema) return details;
  if (details !== null && typeof details === "object" && Object.keys(details).length === 0) return details;
  return schema.parse(details);
}
