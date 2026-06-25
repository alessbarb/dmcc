import { z } from "zod";
import { playerIdSchema, campaignIdSchema, attachmentIdSchema } from "../../shared/schemas.js";

export type CampaignRole = "dm" | "player" | "observer";
export const campaignRoleSchema = z.enum(["dm", "player", "observer"]);

export const playerProfileSchema = z.object({
  id: playerIdSchema,
  campaignId: campaignIdSchema,
  displayName: z.string().min(1, "Display name must not be empty"),
  role: campaignRoleSchema,
  color: z.string().optional(),
  avatarAttachmentId: attachmentIdSchema.optional(),
  localAccessCodeHash: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PlayerProfile = z.infer<typeof playerProfileSchema>;
