import { z } from "zod";
import {
  sessionIdSchema,
  sessionEventIdSchema,
  storyStepIdSchema,
  objectiveIdSchema,
  sessionPlanItemIdSchema,
} from "@shared/schemas.js";

export const narrativeChangeOriginSchema = z.enum([
  "manual",
  "session_live",
  "session_reconciliation",
  "player",
  "import",
  "system",
]);
export type NarrativeChangeOrigin = z.infer<typeof narrativeChangeOriginSchema>;

export const narrativeChangeContextSchema = z
  .object({
    origin: narrativeChangeOriginSchema,
    sessionId: sessionIdSchema.optional(),
    sessionEventId: sessionEventIdSchema.optional(),
    planItemId: sessionPlanItemIdSchema.optional(),
    storyStepId: storyStepIdSchema.optional(),
    objectiveId: objectiveIdSchema.optional(),
    reason: z.string().optional(),
  })
  .refine(
    (context) =>
      (context.origin !== "session_live" && context.origin !== "session_reconciliation") ||
      context.sessionId !== undefined,
    {
      message: "sessionId is required when origin is session_live or session_reconciliation",
      path: ["sessionId"],
    },
  );
export type NarrativeChangeContext = z.infer<typeof narrativeChangeContextSchema>;
