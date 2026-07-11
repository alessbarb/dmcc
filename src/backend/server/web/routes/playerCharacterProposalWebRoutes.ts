import type { FastifyInstance } from "fastify";
import { and, eq, ne } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";

function valuesOf<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as T[];
  if (value instanceof Map) return Array.from(value.values()) as T[];
  if (typeof value === "object") return Object.values(value as Record<string, T>);
  return [];
}

async function validateLinkRequest(campaignId: string, playerId: string, characterEntityId: string) {
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

  const repository = new PostgresCampaignRepository();
  const state = await repository.getCampaignState(campaignId);
  const character = valuesOf<any>(state?.entities).find((entity) =>
    entity?.entityId === characterEntityId &&
    (entity?.entityType === "player_character" || entity?.type === "player_character") &&
    entity?.archived !== true &&
    entity?.status !== "archived"
  );
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

  return profile;
}

export async function registerPlayerCharacterProposalWebRoutes(server: FastifyInstance): Promise<void> {
  server.put<{
    Params: { campaignId: string; proposalId: string };
    Body: { status?: string; dmNote?: string; dmResolutionNote?: string };
  }>("/api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve-character", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const status = request.body?.status === "approved"
      ? "approved"
      : request.body?.status === "rejected"
        ? "rejected"
        : null;
    if (!status) {
      reply.code(400);
      return { error: "status must be approved or rejected" };
    }

    const [proposal] = await db
      .select()
      .from(schema.playerProposals)
      .where(and(
        eq(schema.playerProposals.campaignId, request.params.campaignId),
        eq(schema.playerProposals.proposalId, request.params.proposalId),
      ))
      .limit(1);
    if (!proposal) {
      reply.code(404);
      return { error: "Proposal not found" };
    }
    if (proposal.status === "approved" || proposal.status === "rejected") {
      return { ok: true, status: proposal.status };
    }

    const content = proposal.content && typeof proposal.content === "object"
      ? proposal.content as Record<string, unknown>
      : {};
    const kind = String(content.kind ?? proposal.type);
    const characterEntityId = typeof content.targetCharacterEntityId === "string"
      ? content.targetCharacterEntityId
      : typeof content.characterEntityId === "string"
        ? content.characterEntityId
        : null;

    if (status === "approved" && kind === "link_request") {
      if (!characterEntityId) {
        reply.code(400);
        return { error: "Character link request is missing characterEntityId" };
      }
      const profile = await validateLinkRequest(request.params.campaignId, proposal.playerId, characterEntityId);
      await db
        .update(schema.playerProfiles)
        .set({ linkedCharacterId: characterEntityId, updatedAt: new Date() })
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, proposal.playerId),
        ));
      if (profile.userId) {
        await db
          .insert(schema.visibilityGrants)
          .values({
            campaignId: request.params.campaignId,
            targetType: "entity",
            targetId: characterEntityId,
            scope: "specific_user",
            userId: profile.userId,
            playerId: profile.profileId,
          })
          .onConflictDoUpdate({
            target: [
              schema.visibilityGrants.campaignId,
              schema.visibilityGrants.targetType,
              schema.visibilityGrants.targetId,
              schema.visibilityGrants.scope,
            ],
            set: { userId: profile.userId, playerId: profile.profileId, grantedAt: new Date() },
          });
      }
      await db.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "player.character.linked",
        actorUserId: user.userId,
        content: { playerId: proposal.playerId, characterEntityId, proposalId: proposal.proposalId },
      });
    }

    await db
      .update(schema.playerProposals)
      .set({ status, processedBy: user.userId, processedAt: new Date() })
      .where(and(
        eq(schema.playerProposals.campaignId, request.params.campaignId),
        eq(schema.playerProposals.proposalId, request.params.proposalId),
      ));
    await db.insert(schema.notifications).values({
      notificationId: createId("ntf"),
      userId: proposal.userId,
      type: status === "approved" ? "proposal.approved" : "proposal.rejected",
      content: {
        campaignId: request.params.campaignId,
        proposalId: proposal.proposalId,
        characterEntityId,
        dmNote: request.body?.dmNote ?? request.body?.dmResolutionNote ?? null,
      },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: proposal.playerId });
    return { ok: true, status, characterEntityId: status === "approved" ? characterEntityId : null };
  });
}
