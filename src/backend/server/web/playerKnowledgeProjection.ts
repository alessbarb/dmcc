import { and, eq } from "drizzle-orm";
import type { Entity } from "@core/domain/entity/types.js";
import type { Fact } from "@core/domain/fact/fact.js";
import type { Relation } from "@core/domain/relation/relation.js";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";

export type KnowledgeTargetType = "entity" | "fact" | "relation" | "clue" | "objective";
export type KnowledgeAccessReason = "public" | "all_players" | "specific_player" | "specific_user" | "linked_character" | "hidden";

export interface PlayerKnowledgeTarget {
  targetType: KnowledgeTargetType;
  targetId: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  reason: KnowledgeAccessReason;
}

interface KnowledgeAccessRule {
  commonScope?: "public" | "all_players";
  playerIds: Set<string>;
  userIds: Set<string>;
}

export interface KnowledgeSnapshot {
  state: Awaited<ReturnType<PostgresCampaignRepository["getCampaignState"]>>;
  entities: Array<typeof schema.campaignEntities.$inferSelect>;
  facts: Array<typeof schema.campaignFacts.$inferSelect>;
  relations: Array<typeof schema.campaignRelations.$inferSelect>;
  clues: Array<typeof schema.campaignClues.$inferSelect>;
  objectives: Array<typeof schema.campaignObjectives.$inferSelect>;
  grants: Array<typeof schema.visibilityGrants.$inferSelect>;
}

export type KnowledgeAccessIndex = Map<string, KnowledgeAccessRule>;
type VisibilityGrant = typeof schema.visibilityGrants.$inferSelect;

const KNOWLEDGE_TARGET_TYPES: ReadonlySet<string> = new Set(["entity", "fact", "relation", "clue", "objective"]);

function valuesOf<T>(value: Map<string, T> | T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return Array.from(value.values());
  return Object.values(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function targetKey(targetType: KnowledgeTargetType, targetId: string): string {
  return `${targetType}\u0000${targetId}`;
}

function ruleFor(index: KnowledgeAccessIndex, targetType: KnowledgeTargetType, targetId: string): KnowledgeAccessRule {
  const key = targetKey(targetType, targetId);
  const existing = index.get(key);
  if (existing) return existing;
  const created: KnowledgeAccessRule = { playerIds: new Set(), userIds: new Set() };
  index.set(key, created);
  return created;
}

function applyVisibility(index: KnowledgeAccessIndex, targetType: KnowledgeTargetType, targetId: string, value: unknown): void {
  const rule = ruleFor(index, targetType, targetId);
  if (typeof value === "string") {
    if (value === "public") rule.commonScope = "public";
    else if (value === "party" || value === "players" || value === "all_players") rule.commonScope = "all_players";
    return;
  }
  if (!isRecord(value)) return;

  const visibility = value;
  const kind = String(visibility.kind ?? visibility.mode ?? visibility.scope ?? "dm_only");
  if (kind === "public") rule.commonScope = "public";
  else if (kind === "party" || kind === "players" || kind === "all_players") rule.commonScope = "all_players";

  const rawPlayerIds = visibility.playerIds ?? visibility.players ?? visibility.specificPlayerIds;
  if (Array.isArray(rawPlayerIds)) {
    for (const playerId of rawPlayerIds) {
      if (typeof playerId === "string" && playerId.length > 0) rule.playerIds.add(playerId);
    }
  }
}

function isKnowledgeTargetType(value: string): value is KnowledgeTargetType {
  return KNOWLEDGE_TARGET_TYPES.has(value);
}

function applyExplicitGrant(index: KnowledgeAccessIndex, grant: VisibilityGrant): void {
  if (!isKnowledgeTargetType(grant.targetType)) return;
  const rule = ruleFor(index, grant.targetType, grant.targetId);
  if (grant.scope === "specific_player" && grant.playerId) rule.playerIds.add(grant.playerId);
  else if (grant.scope === "specific_user" && grant.userId) rule.userIds.add(grant.userId);
}

export async function loadKnowledgeSnapshot(campaignId: string): Promise<KnowledgeSnapshot> {
  const repository = new PostgresCampaignRepository();
  const [state, entities, facts, relations, clues, objectives, grants] = await Promise.all([
    repository.getCampaignState(campaignId),
    db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
    db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
    db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
    db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)),
    db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
    db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId)),
  ]);
  return { state, entities, facts, relations, clues, objectives, grants };
}

export function buildKnowledgeAccessIndex(snapshot: KnowledgeSnapshot): KnowledgeAccessIndex {
  const index: KnowledgeAccessIndex = new Map();
  const projectedEntities = valuesOf<Entity>(snapshot.state.entities);
  const projectedFacts = valuesOf<Fact>(snapshot.state.facts);
  const projectedRelations = valuesOf<Relation>(snapshot.state.relations);

  for (const entity of projectedEntities) {
    const targetId = String(entity.entityId ?? entity.id ?? "");
    if (!targetId || entity.archived || entity.status === "archived") continue;
    applyVisibility(index, "entity", targetId, entity.visibility);
  }

  const projectedFactById = new Map(projectedFacts.map((fact) => [String(fact.factId ?? fact.id ?? ""), fact]));
  for (const fact of snapshot.facts) {
    if (fact.status === "archived" || fact.kind === "dm_secret") continue;
    applyVisibility(index, "fact", fact.factId, projectedFactById.get(fact.factId)?.visibility ?? { kind: "dm_only" });
  }

  const projectedRelationById = new Map(projectedRelations.map((relation) => [String(relation.relationId ?? relation.id ?? ""), relation]));
  for (const relation of snapshot.relations) {
    applyVisibility(index, "relation", relation.relationId, projectedRelationById.get(relation.relationId)?.visibility ?? relation.visibility);
  }

  for (const clue of snapshot.clues) {
    if (clue.status === "archived") continue;
    applyVisibility(index, "clue", clue.clueId, clue.visibilityScope);
  }

  for (const objective of snapshot.objectives) {
    if (objective.status === "archived") continue;
    if (objective.playerId) ruleFor(index, "objective", objective.objectiveId).playerIds.add(objective.playerId);
    else applyVisibility(index, "objective", objective.objectiveId, objective.visibilityScope);
  }

  for (const grant of snapshot.grants) applyExplicitGrant(index, grant);
  return index;
}

function knowledgeAccessReason(
  index: KnowledgeAccessIndex,
  targetType: KnowledgeTargetType,
  targetId: string,
  userId: string,
  playerId?: string | null,
  linkedCharacterId?: string | null,
): KnowledgeAccessReason {
  if (targetType === "entity" && linkedCharacterId === targetId) return "linked_character";
  const rule = index.get(targetKey(targetType, targetId));
  if (!rule) return "hidden";
  if (rule.commonScope === "public") return "public";
  if (rule.commonScope === "all_players") return "all_players";
  if (userId && rule.userIds.has(userId)) return "specific_user";
  if (playerId && rule.playerIds.has(playerId)) return "specific_player";
  return "hidden";
}

export function playerCanAccessKnowledge(
  index: KnowledgeAccessIndex,
  targetType: KnowledgeTargetType,
  targetId: string,
  userId: string,
  playerId?: string | null,
  linkedCharacterId?: string | null,
): boolean {
  return knowledgeAccessReason(index, targetType, targetId, userId, playerId, linkedCharacterId) !== "hidden";
}

export async function buildDmPlayerKnowledgeProjection(campaignId: string) {
  const [snapshot, players] = await Promise.all([
    loadKnowledgeSnapshot(campaignId),
    db.select().from(schema.playerProfiles).where(and(eq(schema.playerProfiles.campaignId, campaignId), eq(schema.playerProfiles.status, "active"))),
  ]);
  const accessIndex = buildKnowledgeAccessIndex(snapshot);

  const targets = [
    ...snapshot.entities.filter((entity) => entity.status !== "archived").map((entity) => ({ targetType: "entity" as const, targetId: entity.entityId, title: entity.name, subtitle: entity.type })),
    ...snapshot.facts.filter((fact) => fact.status !== "archived" && fact.kind !== "dm_secret").map((fact) => ({ targetType: "fact" as const, targetId: fact.factId, title: fact.contentPublic ?? fact.contentDm ?? fact.factId, subtitle: fact.kind })),
    ...snapshot.relations.map((relation) => ({ targetType: "relation" as const, targetId: relation.relationId, title: relation.publicSummary ?? relation.type, subtitle: relation.type })),
    ...snapshot.clues.filter((clue) => clue.status !== "archived").map((clue) => ({ targetType: "clue" as const, targetId: clue.clueId, title: clue.title, subtitle: "clue" })),
    ...snapshot.objectives.filter((objective) => objective.status !== "archived").map((objective) => ({ targetType: "objective" as const, targetId: objective.objectiveId, title: objective.title, subtitle: objective.kind })),
  ];

  return {
    players: players.map((player) => ({
      playerId: player.profileId,
      userId: player.userId,
      displayName: player.displayName,
      linkedCharacterId: player.linkedCharacterId,
      knowledge: targets.map((target): PlayerKnowledgeTarget => {
        const reason = knowledgeAccessReason(accessIndex, target.targetType, target.targetId, player.userId ?? "", player.profileId, player.linkedCharacterId);
        return { ...target, visible: reason !== "hidden", reason };
      }),
    })),
    targets,
  };
}
