import { z } from "zod";
import {
  factIdSchema,
  campaignIdSchema,
  entityIdSchema,
  relationIdSchema,
  sessionIdSchema,
  sessionEventIdSchema,
  visibilityRuleSchema,
} from "../../shared/schemas.js";

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

export const factSourceSchema = z.union([
  z.object({
    type: z.string().optional(),
    kind: z.string().optional(),
    sessionId: sessionIdSchema,
    sessionEventId: sessionEventIdSchema,
  }),
  z.object({
    type: z.string().optional(),
    kind: z.string().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.string().optional(),
    kind: z.string().optional(),
    importId: z.string(),
    sourcePath: z.string().optional(),
  }),
  z.object({
    type: z.string().optional(),
    kind: z.string().optional(),
    note: z.string().optional(),
  }),
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
