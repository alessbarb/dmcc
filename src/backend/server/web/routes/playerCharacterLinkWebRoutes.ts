import type { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import type { Entity } from "@core/domain/entity/types.js";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";
import { HttpError } from "../../errors.js";
import { recordOperationalActivity } from "../../activity/recordOperationalActivity.js";

interface PortalCharacter {
  entityId: string;
  entityType: string;
  title: string;
  summary?: string;
  status?: string;
  importance?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function valuesOf<T>(value: Map<string, T> | T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return Array.from(value.values());
  return Object.values(value);
}

function isPlayerCharacter(entity: Entity): boolean {
  return entity.entityType === "player_character";
}

function isArchived(entity: Entity): boolean {
  return entity.archived === true || entity.status === "archived";
}

function toPortalCharacter(entity: Entity): PortalCharacter {
  return {
    entityId: String(entity.entityId),
    entityType: "player_character",
    title: String(entity.title ?? entity.entityId),
    summary: entity.summary,
    status: entity.status ?? undefined,
    importance: entity.importance ?? undefined,
  };
}

async function readCampaignCharacters(campaignId: string): Promise<Entity[]> {
  const repository = new PostgresCampaignRepository();
  const state = await repository.getCampaignState(campaignId);
  return valuesOf(state.entities).filter((entity) => isPlayerCharacter(entity) && !isArchived(entity));
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
    throw new HttpError("Player profile not found", 404);
  }

  const characters = await readCampaignCharacters(campaignId);
  const character = characters.find((candidate) => candidate.entityId === characterEntityId);
  if (!character) {
    throw new HttpError("Player character not found", 404);
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
    throw new HttpError("Character is already linked to another player", 409);
  }

  return profile;
}

export function registerPlayerCharacterLinkWebRoutes(server: FastifyInstance): void {
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
              const content: Record<string, unknown> = isRecord(proposal.content) ? proposal.content : {};
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

    const profile = await validateCharacterAssignment(request.params.campaignId, playerId, characterEntityId);
    if (profile.linkedCharacterId !== characterEntityId) {
      await db
        .update(schema.playerProfiles)
        .set({ linkedCharacterId: characterEntityId, updatedAt: new Date() })
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, playerId),
        ));
      await recordOperationalActivity(db, {
        campaignId: request.params.campaignId,
        sourceId: createId("act"),
        type: "player.character.linked",
        category: "people",
        data: { playerId, characterEntityId, ownership: request.body?.ownership, syncMode: request.body?.syncMode },
        actorUserId: user.userId,
      });
    }
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
      await recordOperationalActivity(db, {
        campaignId: request.params.campaignId,
        sourceId: createId("act"),
        type: "player.character.unlinked",
        category: "people",
        data: { playerId: request.params.playerId, characterEntityId: profile.linkedCharacterId },
        actorUserId: user.userId,
      });
      campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: request.params.playerId });
      return { ok: true };
    },
  );
}
