import { z } from "zod";
import type {
  CampaignId,
  PlayerId,
  EntityId,
  RelationId,
  FactId,
  SessionId,
  SessionEventId,
  EventId,
  AttachmentId,
  TagId,
  StoryStepId,
  ObjectiveId,
  SessionPlanItemId,
  SessionPlanContentLinkId,
  SessionPlanTransitionId,
  SessionPlanBindingId,
  SessionPlanGoalId,
  SessionPlanChecklistItemId,
} from "./ids.js";

export const campaignIdSchema = z
  .string()
  .refine((val): val is CampaignId => val.startsWith("cmp_"), "Must start with 'cmp_'");

export const playerIdSchema = z
  .string()
  .refine((val): val is PlayerId => val.startsWith("ply_"), "Must start with 'ply_'");

export const entityIdSchema = z
  .string()
  .refine((val): val is EntityId => val.startsWith("ent_"), "Must start with 'ent_'");

export const relationIdSchema = z
  .string()
  .refine((val): val is RelationId => val.startsWith("rel_"), "Must start with 'rel_'");

export const factIdSchema = z
  .string()
  .refine((val): val is FactId => val.startsWith("fact_"), "Must start with 'fact_'");

export const sessionIdSchema = z
  .string()
  .refine((val): val is SessionId => val.startsWith("sess_"), "Must start with 'sess_'");

export const sessionEventIdSchema = z
  .string()
  .refine((val): val is SessionEventId => val.startsWith("sevt_"), "Must start with 'sevt_'");

export const eventIdSchema = z
  .string()
  .refine((val): val is EventId => val.startsWith("evt_"), "Must start with 'evt_'");

export const attachmentIdSchema = z
  .string()
  .refine((val): val is AttachmentId => val.startsWith("att_"), "Must start with 'att_'");

export const tagIdSchema = z
  .string()
  .refine((val): val is TagId => val.startsWith("tag_"), "Must start with 'tag_'");

export const storyStepIdSchema = z
  .string()
  .refine((val): val is StoryStepId => val.startsWith("stp_"), "Must start with 'stp_'");

export const objectiveIdSchema = z
  .string()
  .refine((val): val is ObjectiveId => val.startsWith("obj_"), "Must start with 'obj_'");

export const sessionPlanItemIdSchema = z
  .string()
  .refine((val): val is SessionPlanItemId => val.startsWith("spi_"), "Must start with 'spi_'");

export const sessionPlanContentLinkIdSchema = z
  .string()
  .refine(
    (val): val is SessionPlanContentLinkId => val.startsWith("spcl_"),
    "Must start with 'spcl_'",
  );

export const sessionPlanTransitionIdSchema = z
  .string()
  .refine(
    (val): val is SessionPlanTransitionId => val.startsWith("sptr_"),
    "Must start with 'sptr_'",
  );

export const sessionPlanBindingIdSchema = z
  .string()
  .refine(
    (val): val is SessionPlanBindingId => val.startsWith("spbd_"),
    "Must start with 'spbd_'",
  );

export const sessionPlanGoalIdSchema = z
  .string()
  .refine((val): val is SessionPlanGoalId => val.startsWith("spgl_"), "Must start with 'spgl_'");

export const sessionPlanChecklistItemIdSchema = z
  .string()
  .refine(
    (val): val is SessionPlanChecklistItemId => val.startsWith("spck_"),
    "Must start with 'spck_'",
  );

export const visibilityRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("dm_only") }),
  z.object({ kind: z.literal("party") }),
  z.object({ kind: z.literal("public") }),
  z.object({ kind: z.literal("players"), playerIds: z.array(z.string()) }),
  z.object({ kind: z.literal("characters"), characterEntityIds: z.array(z.string()) }),
]);

const ALLOWED_ASSET_PREFIXES = [
  "/assets/campaigns/",
  "/assets/avatars/",
  "/assets/entities/",
  "/assets/ui/",
];

export function isSafeImageUrl(value: string): boolean {
  if (typeof value !== "string") return false;
  const val = value.trim();
  if (val.length === 0) return false;

  const hasAllowedPrefix = ALLOWED_ASSET_PREFIXES.some((prefix) => val.startsWith(prefix));
  if (!hasAllowedPrefix) return false;

  if (val.includes("..") || val.includes("\\")) return false;
  if (/(javascript:|data:|http:|https:)/i.test(val)) return false;

  return true;
}

export const safeImageUrlSchema = z
  .string()
  .refine(isSafeImageUrl, {
    message: "Must be a safe local path under /assets/campaigns/, /assets/avatars/, /assets/entities/ or /assets/ui/",
  });
