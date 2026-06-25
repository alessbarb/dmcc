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

export const visibilityRuleSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("dm_only") }),
  z.object({ kind: z.literal("party") }),
  z.object({ kind: z.literal("public") }),
  z.object({ kind: z.literal("players"), playerIds: z.array(z.string()) }),
  z.object({ kind: z.literal("characters"), characterEntityIds: z.array(z.string()) }),
]);
