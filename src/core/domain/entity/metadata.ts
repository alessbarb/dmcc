import { z } from "zod";
import {
  entityIdSchema,
  playerIdSchema,
  sessionIdSchema,
  factIdSchema,
  attachmentIdSchema,
} from "@shared/schemas.js";

// NPC Metadata
export const npcAttitudeSchema = z.enum([
  "unknown",
  "friendly",
  "neutral",
  "suspicious",
  "hostile",
  "afraid",
  "loyal",
  "deceptive",
]);
export type NpcAttitude = z.infer<typeof npcAttitudeSchema>;

export const npcMetadataSchema = z.object({
  role: z.string().optional(),
  publicDescription: z.string().optional(),
  privateTruth: z.string().optional(),
  personality: z.string().optional(),
  voice: z.string().optional(),
  goal: z.string().optional(),
  fear: z.string().optional(),
  secret: z.string().optional(),
  attitudeToParty: npcAttitudeSchema.optional(),
  currentLocationId: entityIdSchema.optional(),
  factionId: entityIdSchema.optional(),
});
export type NpcMetadata = z.infer<typeof npcMetadataSchema>;

// Location Metadata
export const locationTypeSchema = z.enum([
  "settlement",
  "building",
  "dungeon",
  "region",
  "room",
  "landmark",
  "plane",
  "other",
]);
export type LocationType = z.infer<typeof locationTypeSchema>;

export const locationMetadataSchema = z.object({
  locationType: locationTypeSchema.optional(),
  publicDescription: z.string().optional(),
  privateDescription: z.string().optional(),
  dangers: z.array(z.string()).optional(),
  atmosphere: z.string().optional(),
  mapAttachmentId: attachmentIdSchema.optional(),
});
export type LocationMetadata = z.infer<typeof locationMetadataSchema>;

// Quest Metadata
export const questPrioritySchema = z.enum(["background", "side", "main", "urgent"]);
export type QuestPriority = z.infer<typeof questPrioritySchema>;

export const questMetadataSchema = z.object({
  publicObjective: z.string().optional(),
  hiddenObjective: z.string().optional(),
  originEntityId: entityIdSchema.optional(),
  rewardPromised: z.string().optional(),
  rewardActual: z.string().optional(),
  failureConsequence: z.string().optional(),
  completionConsequence: z.string().optional(),
  priority: questPrioritySchema.optional(),
});
export type QuestMetadata = z.infer<typeof questMetadataSchema>;

// Clue Metadata
export const clueTypeSchema = z.enum([
  "physical",
  "verbal",
  "visual",
  "magical",
  "document",
  "behavioral",
  "other",
]);
export type ClueType = z.infer<typeof clueTypeSchema>;

export const clueMetadataSchema = z.object({
  clueType: clueTypeSchema.optional(),
  content: z.string(),
  interpretation: z.string().optional(),
  unlocksEntityIds: z.array(entityIdSchema).optional(),
  confirmsFactIds: z.array(factIdSchema).optional(),
  contradictsFactIds: z.array(factIdSchema).optional(),
  discoveredByPlayerIds: z.array(playerIdSchema).optional(),
  discoveredByCharacterIds: z.array(entityIdSchema).optional(),
  revealedInSessionId: sessionIdSchema.optional(),
});
export type ClueMetadata = z.infer<typeof clueMetadataSchema>;

// Secret Metadata
export const secretMetadataSchema = z.object({
  truth: z.string(),
  publicVersion: z.string().optional(),
  impact: z.string().optional(),
  revealConditions: z.array(z.string()).optional(),
  knownByPlayerIds: z.array(playerIdSchema).optional(),
  knownByCharacterIds: z.array(entityIdSchema).optional(),
  relatedClueIds: z.array(entityIdSchema).optional(),
});
export type SecretMetadata = z.infer<typeof secretMetadataSchema>;

// Decision Metadata
export const decisionMetadataSchema = z.object({
  decisionText: z.string(),
  madeByCharacterIds: z.array(entityIdSchema).optional(),
  madeByPlayerIds: z.array(playerIdSchema).optional(),
  sessionId: sessionIdSchema,
  locationId: entityIdSchema.optional(),
  immediateConsequence: z.string().optional(),
  pendingConsequenceIds: z.array(entityIdSchema).optional(),
});
export type DecisionMetadata = z.infer<typeof decisionMetadataSchema>;

// Consequence Metadata
export const consequenceMetadataSchema = z.object({
  originEntityId: entityIdSchema.optional(),
  originFactId: factIdSchema.optional(),
  triggerCondition: z.string().optional(),
  impact: z.string().optional(),
  affectedEntityIds: z.array(entityIdSchema).optional(),
  suggestedSessionId: sessionIdSchema.optional(),
});
export type ConsequenceMetadata = z.infer<typeof consequenceMetadataSchema>;

// Front Metadata
export const frontMetadataSchema = z.object({
  goal: z.string(),
  resources: z.array(z.string()).optional(),
  nextMove: z.string().optional(),
  triggerConditions: z.array(z.string()).optional(),
  clockEntityId: entityIdSchema.optional(),
  relatedQuestIds: z.array(entityIdSchema).optional(),
});
export type FrontMetadata = z.infer<typeof frontMetadataSchema>;

// Clock Metadata
export const clockMetadataSchema = z.object({
  maxSegments: z.number().int().min(1),
  currentSegments: z.number().int().nonnegative(),
  meaning: z.string(),
  onComplete: z.string().optional(),
});
export type ClockMetadata = z.infer<typeof clockMetadataSchema>;

import { getRuleSystem } from "../rules/index.js";
import { genericPlayerCharacterMetadataSchema } from "../rules/generic.js";

export const playerCharacterMetadataSchema = genericPlayerCharacterMetadataSchema;
export type PlayerCharacterMetadata = z.infer<typeof playerCharacterMetadataSchema>;

export function validatePlayerCharacterMetadata(metadata: unknown, system?: string): void {
  const rules = getRuleSystem(system);
  rules.characterMetadataSchema.parse(metadata);
}
