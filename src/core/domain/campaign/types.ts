import { z } from "zod";
import { campaignIdSchema, sessionIdSchema, entityIdSchema, safeImageUrlSchema } from "@shared/schemas.js";

export type CampaignStatus = "importing" | "active" | "trashed";
export type CampaignSystem = "dnd_5e" | "pathfinder_2e" | "shadowdark" | "custom";

export const campaignStatusSchema = z.enum(["importing", "active", "trashed"]);
export const campaignSystemSchema = z.enum(["dnd_5e", "pathfinder_2e", "shadowdark", "custom"]);

export const campaignSettingsSchema = z.object({
  activeQuestsLimit: z.number().default(10),
});

export type CampaignSettings = z.infer<typeof campaignSettingsSchema>;

export const campaignSchema = z.object({
  campaignId: campaignIdSchema.optional(),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  summary: z.string().optional(),
  system: campaignSystemSchema.optional().default("custom"),
  status: campaignStatusSchema.optional().default("active"),
  coverUrl: safeImageUrlSchema.optional(),
  currentSessionId: sessionIdSchema.optional(),
  currentLocationId: entityIdSchema.optional(),
  currentQuestId: entityIdSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  settings: campaignSettingsSchema.optional().default({ activeQuestsLimit: 10 }),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type Campaign = z.infer<typeof campaignSchema>;
