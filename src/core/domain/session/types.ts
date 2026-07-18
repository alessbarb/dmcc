import { z } from "zod";
import {
  sessionIdSchema,
  campaignIdSchema,
  playerIdSchema,
  entityIdSchema,
  sessionEventIdSchema,
  factIdSchema,
  relationIdSchema,
  visibilityRuleSchema,
} from "@shared/schemas.js";
import { sessionPlanSchema } from "./sessionPlan.js";

export const sessionStatusSchema = z.enum([
  "planned",
  "active",
  "closed",
  "cancelled",
  "archived",
]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionPrepStateSchema = z.enum(["draft", "ready"]);
export type SessionPrepState = z.infer<typeof sessionPrepStateSchema>;

export const sessionPrepChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Checklist item label must not be empty"),
  done: z.boolean().default(false),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});
export type SessionPrepChecklistItem = z.infer<typeof sessionPrepChecklistItemSchema>;

export const sessionPrepSchema = z.object({
  state: sessionPrepStateSchema.default("draft"),
  summary: z.string().optional(),
  openingPrompt: z.string().optional(),
  goals: z.array(z.string()).default([]),
  sceneIds: z.array(entityIdSchema).default([]),
  involvedEntityIds: z.array(entityIdSchema).default([]),
  availableClueIds: z.array(entityIdSchema).default([]),
  secretsAtRiskIds: z.array(entityIdSchema).default([]),
  expectedConsequenceIds: z.array(entityIdSchema).default([]),
  checklist: z.array(sessionPrepChecklistItemSchema).default([]),
  notes: z.string().optional(),
});
export type SessionPrep = z.infer<typeof sessionPrepSchema>;

export const sessionSchema = z.object({
  id: sessionIdSchema,
  sessionId: sessionIdSchema,
  campaignId: campaignIdSchema,
  number: z.number().int().min(1),
  title: z.string().min(1, "Title must not be empty"),
  status: sessionStatusSchema,
  scheduledAt: z.string().optional(),
  prep: sessionPrepSchema.optional(),
  plan: sessionPlanSchema.optional(),
  activatedPlanRevision: z.number().int().min(0).optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  archivedAt: z.string().optional(),
  presentPlayerIds: z.array(playerIdSchema).default([]),
  presentCharacterIds: z.array(entityIdSchema).default([]),
  summary: z.string().optional(),
  dmNotes: z.string().optional(),
  playerSummary: z.string().optional(),
  playerSummaryPublishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;

export const sessionEventTypeSchema = z.enum([
  "scene_started",
  "scene_closed",
  "note_recorded",
  "fact_recorded",
  "clue_revealed",
  "secret_hinted",
  "quest_updated",
  "decision_made",
  "consequence_created",
  "consequence_triggered",
  "npc_met",
  "location_visited",
  "item_obtained",
  "combat_started",
  "combat_ended",
  "relationship_changed",
  "status_changed",
  "material_introduced",
  "custom",
]);
export type SessionEventType = z.infer<typeof sessionEventTypeSchema>;

export const sessionEventSchema = z.object({
  id: sessionEventIdSchema,
  campaignId: campaignIdSchema,
  sessionId: sessionIdSchema,
  type: sessionEventTypeSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  occurredAt: z.string(),
  relatedEntityIds: z.array(entityIdSchema).default([]),
  relatedFactIds: z.array(factIdSchema).default([]),
  relatedRelationIds: z.array(relationIdSchema).default([]),
  visibility: visibilityRuleSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type SessionEvent = z.infer<typeof sessionEventSchema>;
