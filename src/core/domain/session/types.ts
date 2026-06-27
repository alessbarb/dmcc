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

export const sessionStatusSchema = z.enum([
  "planned",
  "active",
  "closed",
  "cancelled",
  "archived",
]);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionSchema = z.object({
  id: sessionIdSchema,
  campaignId: campaignIdSchema,
  number: z.number().int().min(1),
  title: z.string().min(1, "Title must not be empty"),
  status: sessionStatusSchema,
  scheduledAt: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  presentPlayerIds: z.array(playerIdSchema).default([]),
  presentCharacterIds: z.array(entityIdSchema).default([]),
  summary: z.string().optional(),
  dmNotes: z.string().optional(),
  playerSummary: z.string().optional(),
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
  metadata: z.record(z.string(), z.any()).default({}),
});

export type SessionEvent = z.infer<typeof sessionEventSchema>;
