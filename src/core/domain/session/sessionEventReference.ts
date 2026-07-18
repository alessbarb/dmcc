import { z } from "zod";
import {
  entityIdSchema,
  factIdSchema,
  relationIdSchema,
  storyStepIdSchema,
  objectiveIdSchema,
} from "@shared/schemas.js";

// §14 of docs/engineering/session-evolution.md — lets a session event distinguish
// "Klarg participates" from "Klarg is mentioned" instead of one flat relatedEntityIds list.
export const sessionEventReferenceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("entity"),
    entityId: entityIdSchema,
    role: z.enum(["participant", "location", "subject", "affected", "source", "mentioned"]),
  }),
  z.object({
    type: z.literal("fact"),
    factId: factIdSchema,
    role: z.enum(["created", "confirmed", "contradicted", "mentioned"]),
  }),
  z.object({
    type: z.literal("relation"),
    relationId: relationIdSchema,
    role: z.enum(["created", "changed", "revealed"]),
  }),
  z.object({
    type: z.literal("story_step"),
    storyStepId: storyStepIdSchema,
    role: z.enum(["advanced", "resolved", "deviated"]),
  }),
  z.object({
    type: z.literal("objective"),
    objectiveId: objectiveIdSchema,
    role: z.enum(["advanced", "completed", "failed"]),
  }),
]);
export type SessionEventReference = z.infer<typeof sessionEventReferenceSchema>;
