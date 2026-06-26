import { z } from "zod";
import { eventIdSchema, campaignIdSchema } from "../../shared/schemas.js";
import { campaignSchema, campaignSettingsSchema } from "../campaign/types.js";
import { playerProfileSchema } from "../campaign/player.js";
import { entitySchema, baseEntitySchema } from "../entity/types.js";
import { relationSchema, baseRelationSchema } from "../relation/types.js";
import { factSchema } from "../fact/types.js";
import { sessionSchema, sessionEventSchema, sessionStatusSchema } from "../session/types.js";
import { visibilityRuleSchema } from "../../shared/schemas.js";

export const canvasViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

export const canvasNodeSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  canvasId: z.string(),
  kind: z.enum(["entity", "note", "group", "image", "fact"]),
  entityId: z.string().optional(),
  factId: z.string().optional(),
  text: z.string().optional(),
  title: z.string().optional(),
  color: z.enum(["yellow", "blue", "green", "pink", "purple"]).optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  collapsed: z.boolean().optional(),
  zIndex: z.number().optional(),
  status: z.enum(["draft", "ready", "revealed", "resolved"]).optional(),
  visibility: z.enum(["dm", "public"]).optional(),
  groupId: z.string().optional(),
  parentId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const canvasEdgeSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  canvasId: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  relationshipId: z.string().optional(),
  label: z.string().optional(),
  status: z.enum(["draft", "domain"]),
  visibility: z.enum(["dm", "public"]).optional(),
  style: z.enum(["solid", "dashed", "secret", "weak", "strong"]).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const canvasSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  title: z.string(),
  kind: z.enum(["world", "session", "mystery", "location", "characters", "custom"]),
  description: z.string().optional(),
  nodes: z.array(canvasNodeSchema),
  edges: z.array(canvasEdgeSchema),
  viewport: canvasViewportSchema,
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const domainEventTypeSchema = z.enum([
  "VaultCreated",
  "CampaignCreated",
  "CampaignUpdated",
  "PlayerProfileCreated",
  "PlayerProfileUpdated",
  "PlayerProfileArchived",
  "EntityCreated",
  "EntityUpdated",
  "EntityArchived",
  "RelationCreated",
  "RelationUpdated",
  "RelationArchived",
  "FactCreated",
  "FactUpdated",
  "FactArchived",
  "VisibilityChanged",
  "SessionCreated",
  "SessionStarted",
  "SessionClosed",
  "SessionEventRecorded",
  "AttachmentAdded",
  "AttachmentRemoved",
  "TagCreated",
  "TagUpdated",
  "ImportCompleted",
  "ExportCompleted",
  "SnapshotCreated",
  "SettingsUpdated",
  "CanvasCreated",
  "CanvasUpdated",
  "CanvasArchived",
  "CanvasNodePlaced",
  "CanvasNodeUpdated",
  "CanvasNodesLayoutUpdated",
  "CanvasNodeRemoved",
  "CanvasEdgeAdded",
  "CanvasEdgeUpdated",
  "CanvasEdgeRemoved",
  "CanvasNoteConvertedToEntity",
]);

export type DomainEventType = z.infer<typeof domainEventTypeSchema>;

export const storedEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  eventId: eventIdSchema,
  campaignId: campaignIdSchema.optional(),
  type: domainEventTypeSchema,
  occurredAt: z.string(),
  actorId: z.string(),
  payload: z.any(),
  previousHash: z.string().optional(),
  hash: z.string().optional(),
  schemaVersion: z.number().int().default(1),
});

export type StoredEvent<TPayload = any> = z.infer<typeof storedEventSchema> & {
  payload: TPayload;
};

// Event payload schemas helper
export const eventPayloadSchemas = {
  VaultCreated: z.object({ name: z.string() }),
  CampaignCreated: campaignSchema,
  CampaignUpdated: campaignSchema.partial().extend({ id: campaignIdSchema }),
  PlayerProfileCreated: playerProfileSchema,
  PlayerProfileUpdated: playerProfileSchema.partial().extend({ id: z.string() }),
  PlayerProfileArchived: z.object({ id: z.string().optional(), playerId: z.string().optional() }),
  EntityCreated: entitySchema,
  EntityUpdated: baseEntitySchema.partial().extend({ id: z.string().optional(), entityId: z.string().optional() }),
  EntityArchived: z.object({ id: z.string().optional(), entityId: z.string().optional() }),
  RelationCreated: relationSchema,
  RelationUpdated: baseRelationSchema.partial().extend({ id: z.string().optional(), relationId: z.string().optional() }),
  RelationArchived: z.object({ id: z.string() }),
  FactCreated: factSchema,
  FactUpdated: factSchema.partial().extend({ id: z.string() }),
  FactArchived: z.object({ id: z.string() }),
  VisibilityChanged: z.object({
    targetId: z.string(),
    targetType: z.enum(["entity", "relation", "fact"]),
    visibility: visibilityRuleSchema,
    sessionId: z.string().optional(),
    note: z.string().optional(),
  }),
  SessionCreated: sessionSchema,
  SessionStarted: z.object({
    id: z.string(),
    startedAt: z.string(),
    campaignId: campaignIdSchema.optional(),
    number: z.number().int().min(1).optional(),
    title: z.string().min(1).optional(),
    status: sessionStatusSchema.optional(),
  }),
  SessionClosed: z.object({
    id: z.string(),
    endedAt: z.string(),
    summary: z.string().optional(),
    playerSummary: z.string().optional(),
    campaignId: campaignIdSchema.optional(),
    number: z.number().int().min(1).optional(),
    title: z.string().min(1).optional(),
    status: sessionStatusSchema.optional(),
  }),
  SessionEventRecorded: sessionEventSchema,
  AttachmentAdded: z.object({
    id: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
  }),
  AttachmentRemoved: z.object({ id: z.string() }),
  TagCreated: z.object({ id: z.string(), name: z.string(), color: z.string().optional() }),
  TagUpdated: z.object({ id: z.string(), name: z.string().optional(), color: z.string().optional() }),
  ImportCompleted: z.object({ importId: z.string(), format: z.string(), count: z.number() }),
  ExportCompleted: z.object({ exportId: z.string(), format: z.string() }),
  SnapshotCreated: z.object({ sequence: z.number().int() }),
  SettingsUpdated: campaignSettingsSchema,
  CanvasCreated: canvasSchema,
  CanvasUpdated: z.object({
    canvasId: z.string(),
    title: z.string().optional(),
    viewport: canvasViewportSchema.optional(),
    description: z.string().optional(),
  }),
  CanvasArchived: z.object({
    canvasId: z.string(),
  }),
  CanvasNodePlaced: z.object({
    canvasId: z.string(),
    node: canvasNodeSchema,
  }),
  CanvasNodeUpdated: z.object({
    canvasId: z.string(),
    nodeId: z.string(),
    updates: z.any(),
  }),
  CanvasNodesLayoutUpdated: z.object({
    canvasId: z.string(),
    nodeUpdates: z.array(z.object({
      nodeId: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
    })),
  }),
  CanvasNodeRemoved: z.object({
    canvasId: z.string(),
    nodeId: z.string(),
  }),
  CanvasEdgeAdded: z.object({
    canvasId: z.string(),
    edge: canvasEdgeSchema,
  }),
  CanvasEdgeUpdated: z.object({
    canvasId: z.string(),
    edgeId: z.string(),
    updates: z.any(),
  }),
  CanvasEdgeRemoved: z.object({
    canvasId: z.string(),
    edgeId: z.string(),
  }),
  CanvasNoteConvertedToEntity: z.object({
    canvasId: z.string(),
    nodeId: z.string(),
    entity: entitySchema,
  }),
};
export type EventPayloads = {
  [K in keyof typeof eventPayloadSchemas]: z.infer<(typeof eventPayloadSchemas)[K]>;
};
