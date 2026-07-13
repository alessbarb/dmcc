import type { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";

interface PortalCharacter {
  entityId: string;
  entityType: string;
  title: string;
  summary?: string;
  status?: string;
  importance?: string;
}

function valuesOf<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (value instanceof Map) return Array.from(value.values()) as T[];
  if (typeof value === "object") return Object.values(value as Record<string, T>);
  return [];
}

function isPlayerCharacter(entity: any): boolean {
  return entity?.entityType === "player_character" || entity?.type === "player_character";
}

function isArchived(entity: any): boolean {
  return entity?.archived === true || entity?.status === "archived";
}

function toPortalCharacter(entity: any): PortalCharacter {
  return {
    entityId: String(entity.entityId),
    entityType: "player_character",
    title: String(entity.title ?? entity.name ?? entity.entityId),
    summary: entity.summary ?? entity.publicSummary ?? undefined,
    status: entity.status ?? undefined,
    importance: entity.importance ?? undefined,
  };
}

async function readCampaignCharacters(campaignId: string): Promise<any[]> {
  const repository = new PostgresCampaignRepository();
  const state = await repository.getCampaignState(campaignId);
  return valuesOf<any>(state?.entities).filter((entity) => isPlayerCharacter(entity) && !isArchived(entity));
}

async function ensureCharacterGrant(
  campaignId: string,
  characterEntityId: string,
  profile: typeof schema.playerProfiles.$inferSelect,
): Promise<void> {
  if (!profile.userId) return;
  await db
    .insert(schema.visibilityGrants)
    .values({
      campaignId,
      targetType: "entity",
      targetId: characterEntityId,
      scope: "specific_user",
      userId: profile.userId,
      playerId: null,
    })
    .onConflictDoNothing();
}

async function migrateLegacyLinks(campaignId: string, profiles: Array<typeof schema.playerProfiles.$inferSelect>, characters: any[]) {
  const claimed = new Set(profiles.map((profile) => profile.linkedCharacterId).filter((id): id is string => Boolean(id)));
  let migrated = false;

  for (const profile of profiles) {
    if (profile.linkedCharacterId) {
      await ensureCharacterGrant(campaignId, profile.linkedCharacterId, profile);
      continue;
    }
    const legacyCharacter = characters.find((character) => {
      const legacyPlayerId = character?.metadata?.playerId;
      return legacyPlayerId === profile.profileId && !claimed.has(character.entityId);
    });
    if (!legacyCharacter?.entityId) continue;

    await db
      .update(schema.playerProfiles)
      .set({ linkedCharacterId: legacyCharacter.entityId, updatedAt: new Date() })
      .where(and(
        eq(schema.playerProfiles.campaignId, campaignId),
        eq(schema.playerProfiles.profileId, profile.profileId),
      ));
    profile.linkedCharacterId = legacyCharacter.entityId;
    await ensureCharacterGrant(campaignId, legacyCharacter.entityId, profile);
    claimed.add(legacyCharacter.entityId);
    migrated = true;
  }

  if (migrated) {
    campaignEventBus.publish(campaignId, { type: "player.portal.updated" });
  }
}

async function validateCharacterAssignment(campaignId: string, playerId: string, characterEntityId: string) {
  const [profile] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.profileId, playerId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  if (!profile) {
    const error = new Error("Player profile not found");
    (error as { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const characters = await readCampaignCharacters(campaignId);
  const character = characters.find((candidate) => candidate.entityId === characterEntityId);
  if (!character) {
    const error = new Error("Player character not found");
    (error as { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const [existingOwner] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.linkedCharacterId, characterEntityId),
      eq(schema.playerProfiles.status, "active"),
      ne(schema.playerProfiles.profileId, playerId),
    ))
    .limit(1);
  if (existingOwner) {
    const error = new Error("Character is already linked to another player");
    (error as { statusCode?: number }).statusCode = 409;
    throw error;
  }

  return { profile, character };
}

export async function registerPlayerCharacterLinkWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-portal/dm-character-summary",
    async (request) => {
      await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      const campaignId = request.params.campaignId;
      const profiles = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, campaignId),
          eq(schema.playerProfiles.status, "active"),
        ));
      const characters = await readCampaignCharacters(campaignId);
      await migrateLegacyLinks(campaignId, profiles, characters);

      const [proposals, objectives, notes] = await Promise.all([
        db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, campaignId)),
        db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
        db.select().from(schema.campaignNotes).where(eq(schema.campaignNotes.campaignId, campaignId)),
      ]);

      const linkedIds = new Set(profiles.map((profile) => profile.linkedCharacterId).filter((id): id is string => Boolean(id)));
      const portalCharacters = characters.map(toPortalCharacter);
      const players = profiles.map((profile) => {
        const linkedCharacter = profile.linkedCharacterId
          ? portalCharacters.find((character) => character.entityId === profile.linkedCharacterId) ?? null
          : null;
        return {
          playerId: profile.profileId,
          userId: profile.userId,
          displayName: profile.displayName,
          status: profile.status,
          link: profile.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
          linkedCharacter,
          sheet: { status: {}, resources: [] },
          proposals: proposals
            .filter((proposal) => proposal.playerId === profile.profileId)
            .map((proposal) => {
              const content = proposal.content && typeof proposal.content === "object"
                ? proposal.content as Record<string, unknown>
                : {};
              return {
                ...proposal,
                ...content,
                kind: content.kind ?? proposal.type,
                targetCharacterEntityId: content.targetCharacterEntityId ?? content.characterEntityId,
                status: proposal.status === "submitted" ? "pending" : proposal.status,
              };
            }),
          objectives: objectives.filter((objective) => objective.playerId === profile.profileId),
          notes: notes
            .filter((note) => note.authorPlayerId === profile.profileId && note.visibilityScope !== "private")
            .map((note) => ({
              noteId: note.noteId,
              title: note.content.slice(0, 80),
              content: note.content,
              visibility: note.visibilityScope,
            })),
        };
      });

      return {
        players,
        availableCharacters: portalCharacters.filter((character) => !linkedIds.has(character.entityId)),
        proposals,
      };
    },
  );

  server.post<{
    Params: { campaignId: string };
    Body: { playerId?: string; characterEntityId?: string; ownership?: string; syncMode?: string };
  }>("/api/campaigns/:campaignId/player-portal/links", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const playerId = request.body?.playerId;
    const characterEntityId = request.body?.characterEntityId;
    if (!playerId || !characterEntityId) {
      reply.code(400);
      return { error: "playerId and characterEntityId are required" };
    }

    const { profile } = await validateCharacterAssignment(request.params.campaignId, playerId, characterEntityId);
    if (profile.linkedCharacterId !== characterEntityId) {
      await db
        .update(schema.playerProfiles)
        .set({ linkedCharacterId: characterEntityId, updatedAt: new Date() })
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, playerId),
        ));
      await db.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "player.character.linked",
        actorUserId: user.userId,
        content: { playerId, characterEntityId, ownership: request.body?.ownership, syncMode: request.body?.syncMode },
      });
    }
    await ensureCharacterGrant(request.params.campaignId, characterEntityId, profile);
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId });
    return { ok: true, playerId, characterEntityId };
  });

  server.delete<{ Params: { campaignId: string; playerId: string } }>(
    "/api/campaigns/:campaignId/player-portal/links/:playerId",
    async (request, reply) => {
      const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      const [profile] = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, request.params.playerId),
          eq(schema.playerProfiles.status, "active"),
        ))
        .limit(1);
      if (!profile) {
        reply.code(404);
        return { error: "Player profile not found" };
      }

      await db
        .update(schema.playerProfiles)
        .set({ linkedCharacterId: null, updatedAt: new Date() })
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, request.params.playerId),
        ));
      if (profile.linkedCharacterId && profile.userId) {
        await db
          .delete(schema.visibilityGrants)
          .where(and(
            eq(schema.visibilityGrants.campaignId, request.params.campaignId),
            eq(schema.visibilityGrants.targetType, "entity"),
            eq(schema.visibilityGrants.targetId, profile.linkedCharacterId),
            eq(schema.visibilityGrants.scope, "specific_user"),
            eq(schema.visibilityGrants.userId, profile.userId),
          ));
      }
      await db.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "player.character.unlinked",
        actorUserId: user.userId,
        content: { playerId: request.params.playerId, characterEntityId: profile.linkedCharacterId },
      });
      campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: request.params.playerId });
      return { ok: true };
    },
  );
}
