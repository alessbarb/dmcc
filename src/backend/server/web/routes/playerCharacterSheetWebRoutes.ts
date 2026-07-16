import type { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { playerPortalResources, playerPortalStates } from "../../../db/playerPortalSchema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { HttpError } from "../../errors.js";
import { requireCampaignMembership } from "../webAccess.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertDmRole(role: string): void {
  if (role !== "dm" && role !== "co_dm") {
    throw new HttpError("Only the DM team can manage character sheets", 403);
  }
}

async function linkedPlayer(campaignId: string, entityId: string) {
  const [profile] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.linkedCharacterId, entityId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  return profile;
}

async function readCharacterSheet(campaignId: string, entityId: string) {
  const profile = await linkedPlayer(campaignId, entityId);
  if (!profile) {
    return {
      entityId,
      player: null,
      status: {},
      resources: [],
      updatedAt: null,
      source: "entity" as const,
    };
  }

  const [stateRows, resources] = await Promise.all([
    db.select().from(playerPortalStates).where(and(
      eq(playerPortalStates.campaignId, campaignId),
      eq(playerPortalStates.playerId, profile.profileId),
    )).limit(1),
    db.select().from(playerPortalResources).where(and(
      eq(playerPortalResources.campaignId, campaignId),
      eq(playerPortalResources.playerId, profile.profileId),
    )),
  ]);
  const state = stateRows[0];

  return {
    entityId,
    player: {
      playerId: profile.profileId,
      displayName: profile.displayName,
      pronouns: profile.pronouns,
    },
    status: isRecord(state?.status) ? state.status : {},
    resources: resources.map((resource) => ({
      resourceId: resource.resourceId,
      ...(isRecord(resource.data) ? resource.data : {}),
      updatedAt: resource.updatedAt.toISOString(),
    })),
    updatedAt: state?.updatedAt.toISOString() ?? profile.updatedAt.toISOString(),
    source: state ? "player_portal" as const : "entity" as const,
  };
}

export async function registerPlayerCharacterSheetWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string; entityId: string } }>(
    "/api/campaigns/:campaignId/characters/:entityId/sheet",
    async (request) => {
      await requireCampaignMembership(request, request.params.campaignId);
      return readCharacterSheet(request.params.campaignId, request.params.entityId);
    },
  );

  server.put<{ Params: { campaignId: string; entityId: string }; Body: Record<string, unknown> }>(
    "/api/campaigns/:campaignId/characters/:entityId/sheet",
    async (request) => {
      const { membership } = await requireCampaignMembership(request, request.params.campaignId);
      assertDmRole(membership.role);
      const profile = await linkedPlayer(request.params.campaignId, request.params.entityId);
      if (!profile) throw new HttpError("Character is not linked to an active player", 409);

      const status = isRecord(request.body) ? request.body : {};
      const now = new Date();
      await db.insert(playerPortalStates).values({
        campaignId: request.params.campaignId,
        playerId: profile.profileId,
        status,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [playerPortalStates.campaignId, playerPortalStates.playerId],
        set: { status, updatedAt: now },
      });

      campaignEventBus.publish(request.params.campaignId, {
        type: "player.portal.updated",
        playerId: profile.profileId,
      });
      return readCharacterSheet(request.params.campaignId, request.params.entityId);
    },
  );
}
