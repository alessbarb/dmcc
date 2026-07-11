import type { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { isDmRole, requireCampaignMembership } from "../webAccess.js";

function valuesOf<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (value instanceof Map) return Array.from(value.values()) as T[];
  if (typeof value === "object") return Object.values(value as Record<string, T>);
  return [];
}

function isPlayerCharacter(entity: any): boolean {
  return (entity?.entityType === "player_character" || entity?.type === "player_character") &&
    entity?.archived !== true &&
    entity?.status !== "archived";
}

function toPortalCharacter(entity: any) {
  return {
    entityId: String(entity.entityId),
    entityType: "player_character",
    title: String(entity.title ?? entity.name ?? entity.entityId),
    summary: entity.summary ?? entity.publicSummary ?? undefined,
    status: entity.status ?? undefined,
    importance: entity.importance ?? undefined,
  };
}

export async function registerPlayerCharacterSelectionWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/player/campaigns/:campaignId/character-selection",
    async (request) => {
      const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
      if (membership.role !== "player" && !isDmRole(membership.role)) {
        const error = new Error("Player portal requires player membership");
        (error as { statusCode?: number }).statusCode = 403;
        throw error;
      }

      const [profile] = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.userId, user.userId),
          eq(schema.playerProfiles.status, "active"),
        ))
        .limit(1);

      const repository = new PostgresCampaignRepository();
      const state = await repository.getCampaignState(request.params.campaignId);
      const characters = valuesOf<any>(state?.entities).filter(isPlayerCharacter).map(toPortalCharacter);
      const profiles = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.status, "active"),
        ));
      const linkedByOthers = new Set(
        profiles
          .filter((candidate) => candidate.profileId !== profile?.profileId)
          .map((candidate) => candidate.linkedCharacterId)
          .filter((id): id is string => Boolean(id)),
      );

      const linkedCharacter = profile?.linkedCharacterId
        ? characters.find((character) => character.entityId === profile.linkedCharacterId) ?? null
        : null;

      return {
        player: profile ? { playerId: profile.profileId, displayName: profile.displayName } : null,
        link: profile?.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
        linkedCharacter,
        availableCharacters: characters.filter((character) => !linkedByOthers.has(character.entityId)),
      };
    },
  );
}
