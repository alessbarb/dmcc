import { z } from "zod";
import {
  factIdSchema,
  campaignIdSchema,
  entityIdSchema,
  playerIdSchema,
  relationIdSchema,
  sessionIdSchema,
  sessionEventIdSchema,
  visibilityRuleSchema,
} from "@shared/schemas.js";

export const factKindSchema = z.enum([
  "canon",
  "dm_secret",
  "rumor",
  "lie",
  "player_theory",
  "mistake",
  "retcon",
  "unknown",
]);
export type FactKind = z.infer<typeof factKindSchema>;

export const factConfidenceSchema = z.enum([
  "unconfirmed",
  "suspected",
  "likely",
  "confirmed",
  "false",
]);
export type FactConfidence = z.infer<typeof factConfidenceSchema>;

export const factSourceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("session"), sessionId: sessionIdSchema, sessionEventId: sessionEventIdSchema.optional() }),
  z.object({ kind: z.literal("preparation") }),
  z.object({ kind: z.literal("manual"), note: z.string().optional() }),
  z.object({ kind: z.literal("player"), playerId: playerIdSchema }),
  z.object({ kind: z.literal("import"), importId: z.string(), sourcePath: z.string().optional() }),
]);
export type FactSource = z.infer<typeof factSourceSchema>;

export const factSchema = z.object({
  id: factIdSchema.optional(),
  factId: factIdSchema,
  campaignId: campaignIdSchema,
  statement: z.string().min(1, "Statement must not be empty"),
  kind: factKindSchema,
  confidence: factConfidenceSchema,
  visibility: visibilityRuleSchema,
  source: factSourceSchema,
  relatedEntityIds: z.array(entityIdSchema).default([]),
  relatedRelationIds: z.array(relationIdSchema).default([]),
  contradictedByFactIds: z.array(factIdSchema).default([]),
  confirmedByFactIds: z.array(factIdSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
});

export type Fact = z.infer<typeof factSchema>;
