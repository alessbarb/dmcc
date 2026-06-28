import { z } from "zod";
import {
  entityIdSchema,
  campaignIdSchema,
  sessionIdSchema,
  tagIdSchema,
  visibilityRuleSchema,
} from "@shared/schemas.js";
import {
  npcMetadataSchema,
  locationMetadataSchema,
  questMetadataSchema,
  clueMetadataSchema,
  secretMetadataSchema,
  decisionMetadataSchema,
  consequenceMetadataSchema,
  frontMetadataSchema,
  clockMetadataSchema,
  playerCharacterMetadataSchema,
} from "./metadata.js";

export const entityTypeSchema = z.enum([
  "player_character",
  "npc",
  "location",
  "faction",
  "quest",
  "clue",
  "secret",
  "item",
  "creature",
  "encounter",
  "scene",
  "front",
  "clock",
  "decision",
  "consequence",
  "rumor",
  "rule_reference",
  "handout",
  "note",
]);
export type EntityType = z.infer<typeof entityTypeSchema>;

export const entityImportanceSchema = z.enum(["low", "normal", "high", "critical"]);
export type EntityImportance = z.infer<typeof entityImportanceSchema>;

export const baseEntitySchema = z.object({
  id: entityIdSchema.optional(), // wait, we can make it optional or keep it
  entityId: entityIdSchema,
  campaignId: campaignIdSchema,
  entityType: entityTypeSchema,
  title: z.string().min(1, "Title must not be empty"),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional().default(""), // make status optional since tests might not pass it
  importance: entityImportanceSchema.optional().default("normal"),
  visibility: visibilityRuleSchema,
  tags: z.array(tagIdSchema).default([]),
  tagIds: z.array(tagIdSchema).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
  createdInSessionId: sessionIdSchema.optional(),
  firstSeenSessionId: sessionIdSchema.optional(),
  lastSeenSessionId: sessionIdSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
  archived: z.boolean().default(false),
});

export const entitySchema = baseEntitySchema.superRefine((val, ctx) => {
    let schema: z.ZodSchema | null = null;
    switch (val.entityType) {
      case "npc":
        schema = npcMetadataSchema;
        break;
      case "location":
        schema = locationMetadataSchema;
        break;
      case "quest":
        schema = questMetadataSchema;
        break;
      case "clue":
        schema = clueMetadataSchema;
        break;
      case "secret":
        schema = secretMetadataSchema;
        break;
      case "decision":
        schema = decisionMetadataSchema;
        break;
      case "consequence":
        schema = consequenceMetadataSchema;
        break;
      case "front":
        schema = frontMetadataSchema;
        break;
      case "clock":
        schema = clockMetadataSchema;
        break;
      case "player_character":
        schema = playerCharacterMetadataSchema;
        break;
    }

    if (schema) {
      const result = schema.safeParse(val.metadata);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["metadata", ...issue.path],
            message: `Invalid metadata for entity type '${val.entityType}': ${issue.message}`,
          });
        }
      }
    }
  });

export type Entity = z.infer<typeof entitySchema>;
