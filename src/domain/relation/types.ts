import { z } from "zod";
import {
  relationIdSchema,
  campaignIdSchema,
  entityIdSchema,
  sessionIdSchema,
  factIdSchema,
  visibilityRuleSchema,
} from "../../shared/schemas.js";

export const builtInRelationTypeSchema = z.enum([
  "appears_in",
  "located_in",
  "contains",
  "lives_in",
  "works_for",
  "member_of",
  "leader_of",
  "ally_of",
  "enemy_of",
  "family_of",
  "owes_debt_to",
  "protects",
  "threatens",
  "hates",
  "loves",
  "fears",
  "trusts",
  "suspects",
  "knows",
  "knows_partially",
  "hides",
  "lies_about",
  "reveals",
  "unlocks",
  "points_to",
  "confirms",
  "contradicts",
  "causes",
  "depends_on",
  "blocks",
  "foreshadows",
  "transforms_into",
  "affected_by",
  "created_by",
  "relacionado_con",
]);

export type BuiltInRelationType = z.infer<typeof builtInRelationTypeSchema>;
export type RelationType = BuiltInRelationType | `custom:${string}`;

export const relationTypeSchema = z.string().refine((val) => {
  const isBuiltIn = builtInRelationTypeSchema.safeParse(val).success;
  const isCustom = val.startsWith("custom:") && val.length > 7;
  return isBuiltIn || isCustom;
}, "Must be a built-in relation type or start with 'custom:' and have a label");

export const relationStatusSchema = z.enum([
  "active",
  "inactive",
  "suspected",
  "false",
  "hidden",
  "resolved",
  "retconned",
  "archived",
]);

export type RelationStatus = z.infer<typeof relationStatusSchema>;

export const baseRelationSchema = z.object({
  id: relationIdSchema.optional(),
  relationId: relationIdSchema,
  campaignId: campaignIdSchema,
  sourceEntityId: entityIdSchema,
  targetEntityId: entityIdSchema,
  type: relationTypeSchema.optional(),
  relationType: relationTypeSchema.optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  status: relationStatusSchema,
  visibility: visibilityRuleSchema,
  sourceSessionId: sessionIdSchema.optional(),
  sourceFactId: factIdSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
  archived: z.boolean().default(false),
});

export const relationSchema = baseRelationSchema.refine(data => data.type || data.relationType, {
  message: "Either type or relationType must be specified",
  path: ["relationType"]
});

export type Relation = z.infer<typeof relationSchema>;

