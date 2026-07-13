import { z } from "zod";
import { campaignIdSchema, sessionIdSchema, entityIdSchema, safeImageUrlSchema } from "@shared/schemas.js";

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type CampaignSystem = "generic_fantasy_d20" | "dnd_srd_5_2_1" | "custom";

export const campaignStatusSchema = z.enum(["draft", "active", "paused", "completed", "archived"]);
export const campaignSystemSchema = z.enum(["generic_fantasy_d20", "dnd_srd_5_2_1", "custom"]);

export const campaignSettingsSchema = z.object({
  backupOnClose: z.boolean().default(true),
  lanModeEnabled: z.boolean().default(false),
  activeQuestsLimit: z.number().default(10),
  localAccessCodeHash: z.string().optional(),
  localAccessCode: z.string().optional(),
});

export type CampaignSettings = z.infer<typeof campaignSettingsSchema>;

export const campaignSchema = z.object({
  id: campaignIdSchema.optional(),
  campaignId: campaignIdSchema.optional(),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  summary: z.string().optional(),
  system: campaignSystemSchema.optional().default("generic_fantasy_d20"),
  status: campaignStatusSchema.optional().default("active"),
  coverUrl: safeImageUrlSchema.optional(),
  currentSessionId: sessionIdSchema.optional(),
  currentLocationId: entityIdSchema.optional(),
  currentQuestId: entityIdSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  settings: campaignSettingsSchema.optional().default({ backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 10 }),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  archived: z.boolean().optional().default(false),
});

export type Campaign = z.infer<typeof campaignSchema>;
