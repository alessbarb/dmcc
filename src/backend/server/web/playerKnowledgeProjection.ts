import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";

export type KnowledgeTargetType = "entity" | "fact" | "relation";

export interface PlayerKnowledgeTarget {
  targetType: KnowledgeTargetType;
  targetId: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  reason: "public" | "all_players" | "specific_player" | "specific_user" | "linked_character" | "hidden";
}

function valuesOf<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (value instanceof Map) return Array.from(value.values()) as T[];
  if (typeof value === "object") return Object.values(value as Record<string, T>);
  return [];
}

function normalizeVisibility(value: unknown): { commonScope?: "public" | "all_players"; playerIds: string[] } {
  if (typeof value === "string") {
    if (value === "public") return { commonScope: "public", playerIds: [] };
    if (value === "party" || value === "all_players") return { commonScope: "all_players", playerIds: [] };
    return { playerIds: [] };
  }
  if (!value || typeof value !== "object") return { playerIds: [] };
  const visibility = value as Record<string, unknown>;
  const kind = String(visibility.kind ?? visibility.mode ?? visibility.scope ?? "dm_only");
  if (kind === "public") return { commonScope: "public", playerIds: [] };
  if (kind === "party" || kind === "all_players") return { commonScope: "all_players", playerIds: [] };
  const rawPlayerIds = visibility.playerIds ?? visibility.players ?? visibility.specificPlayerIds;
  return {
    playerIds: Array.isArray(rawPlayerIds)
      ? rawPlayerIds.filter((playerId): playerId is string => typeof playerId === "string" && playerId.length > 0)
      : [],
  };
}

function specificPlayerScope(playerId: string): string {
  return `specific_player:${playerId}`;
}

async function insertGrant(
  campaignId: string,
  targetType: KnowledgeTargetType,
  targetId: string,
  scope: string,
  playerId?: string,
): Promise<void> {
  await db.insert(schema.visibilityGrants).values({
    campaignId,
    targetType,
    targetId,
    scope,
    playerId: playerId ?? null,
  }).onConflictDoNothing();
}

export function grantAllowsPlayer(
  grant: typeof schema.visibilityGrants.$inferSelect,
  userId: string,
  playerId?: string | null,
): boolean {
  if (grant.scope === "public" || grant.scope === "all_players") return true;
  if (grant.scope === "specific_user" && grant.userId === userId) return true;
  if (!playerId) return false;
  if (grant.scope === "specific_player" && grant.playerId === playerId) return true;
  return grant.scope === specificPlayerScope(playerId) && (!grant.playerId || grant.playerId === playerId);
}

export async function synchronizeLegacyKnowledgeVisibility(campaignId: string): Promise<void> {
  const repository = new PostgresCampaignRepository();
  const [state, facts, relations] = await Promise.all([
    repository.getCampaignState(campaignId),
    db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
    db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
  ]);

  const projectedEntities = valuesOf<any>((state as any)?.entities);
  const projectedFacts = valuesOf<any>((state as any)?.facts);
  const projectedRelations = valuesOf<any>((state as any)?.relations);

  for (const entity of projectedEntities) {
    const targetId = String(entity?.entityId ?? entity?.id ?? "");
    if (!targetId || entity?.archived) continue;
    const visibility = normalizeVisibility(entity?.visibility);
    if (visibility.commonScope) await insertGrant(campaignId, "entity", targetId, visibility.commonScope);
    for (const playerId of visibility.playerIds) {
      await insertGrant(campaignId, "entity", targetId, specificPlayerScope(playerId), playerId);
    }
  }

  const projectedFactById = new Map(projectedFacts.map((fact) => [String(fact?.factId ?? fact?.id ?? ""), fact]));
  for (const fact of facts) {
    if (fact.status === "archived" || fact.kind === "dm_secret") continue;
    const projected = projectedFactById.get(fact.factId);
    const visibility = normalizeVisibility(projected?.visibility ?? { kind: "party" });
    if (visibility.commonScope) await insertGrant(campaignId, "fact", fact.factId, visibility.commonScope);
    for (const playerId of visibility.playerIds) {
      await insertGrant(campaignId, "fact", fact.factId, specificPlayerScope(playerId), playerId);
    }
  }

  const projectedRelationById = new Map(projectedRelations.map((relation) => [String(relation?.relationId ?? relation?.id ?? ""), relation]));
  for (const relation of relations) {
    const projected = projectedRelationById.get(relation.relationId);
    const visibility = normalizeVisibility(projected?.visibility ?? relation.visibility);
    if (visibility.commonScope) await insertGrant(campaignId, "relation", relation.relationId, visibility.commonScope);
    for (const playerId of visibility.playerIds) {
      await insertGrant(campaignId, "relation", relation.relationId, specificPlayerScope(playerId), playerId);
    }
  }
}

export async function buildDmPlayerKnowledgeProjection(campaignId: string) {
  await synchronizeLegacyKnowledgeVisibility(campaignId);
  const [players, entities, facts, relations, grants] = await Promise.all([
    db.select().from(schema.playerProfiles).where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.status, "active"),
    )),
    db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
    db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
    db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
    db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId)),
  ]);

  const targets = [
    ...entities.filter((entity) => entity.status !== "archived").map((entity) => ({
      targetType: "entity" as const,
      targetId: entity.entityId,
      title: entity.name,
      subtitle: entity.type,
    })),
    ...facts.filter((fact) => fact.status !== "archived" && fact.kind !== "dm_secret").map((fact) => ({
      targetType: "fact" as const,
      targetId: fact.factId,
      title: fact.contentPublic ?? fact.contentDm ?? fact.factId,
      subtitle: fact.kind,
    })),
    ...relations.map((relation) => ({
      targetType: "relation" as const,
      targetId: relation.relationId,
      title: relation.publicSummary ?? relation.type,
      subtitle: relation.type,
    })),
  ];

  return {
    players: players.map((player) => ({
      playerId: player.profileId,
      userId: player.userId,
      displayName: player.displayName,
      linkedCharacterId: player.linkedCharacterId,
      knowledge: targets.map((target): PlayerKnowledgeTarget => {
        if (target.targetType === "entity" && target.targetId === player.linkedCharacterId) {
          return { ...target, visible: true, reason: "linked_character" };
        }
        const matching = grants.filter((grant) => grant.targetType === target.targetType && grant.targetId === target.targetId);
        const allowedGrant = matching.find((grant) => grantAllowsPlayer(grant, player.userId ?? "", player.profileId));
        let reason: PlayerKnowledgeTarget["reason"] = "hidden";
        if (allowedGrant?.scope === "public") reason = "public";
        else if (allowedGrant?.scope === "all_players") reason = "all_players";
        else if (allowedGrant?.scope === "specific_user") reason = "specific_user";
        else if (allowedGrant) reason = "specific_player";
        return { ...target, visible: Boolean(allowedGrant), reason };
      }),
    })),
    targets,
  };
}
