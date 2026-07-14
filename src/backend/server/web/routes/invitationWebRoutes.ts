import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { userRoles } from "../../../db/authSchema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { requireCampaignOwner } from "../webAccess.js";
import { HttpError } from "../../errors.js";
import { hashOpaque, issueOpaqueToken, type WebUser } from "../webSession.js";

function makeInviteUrl(request: FastifyRequest, token: string): string {
  const origin = process.env.DMCC_PUBLIC_ORIGIN ?? `${request.protocol}://${request.headers.host}`;
  return `${origin.replace(/\/$/, "")}/invitations/${token}`;
}

function invitationRole(value: unknown): "player" | "co_dm" {
  if (value === undefined || value === "player") return "player";
  if (value === "co_dm") return "co_dm";
  throw new HttpError("Invitation role must be player or co_dm", 400);
}

async function acceptInvitation(token: string, user: WebUser) {
  const tokenHash = hashOpaque(token);
  return db.transaction(async (tx) => {
    const [invitation] = await tx
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.tokenHash, tokenHash))
      .limit(1);
    if (!invitation || invitation.revokedAt || invitation.expiresAt < new Date()) {
      throw new HttpError("Invitation is invalid or expired", 404);
    }

    const [existingMembership] = await tx
      .select()
      .from(schema.campaignMemberships)
      .where(and(
        eq(schema.campaignMemberships.campaignId, invitation.campaignId),
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
      ))
      .limit(1);
    if (existingMembership) {
      return { campaignId: invitation.campaignId, membership: existingMembership, alreadyAccepted: true };
    }
    if (invitation.usesCount >= invitation.maxUses) {
      throw new HttpError("Invitation has no remaining uses", 409);
    }

    let playerId: string | null = null;
    if (invitation.role === "player") {
      playerId = createId("ply");
      await tx.insert(schema.playerProfiles).values({
        profileId: playerId,
        campaignId: invitation.campaignId,
        userId: user.userId,
        displayName: user.displayName,
        status: "active",
      });
    }

    const membership = {
      campaignId: invitation.campaignId,
      userId: user.userId,
      role: invitation.role,
      playerId,
      createdAt: new Date(),
    };
    await tx.insert(schema.campaignMemberships).values(membership);
    await tx.insert(userRoles).values({
      userId: user.userId,
      role: invitation.role === "player" ? "player" : "dm",
      source: "invitation",
    }).onConflictDoNothing();
    await tx.update(schema.campaignInvitations)
      .set({ usesCount: invitation.usesCount + 1 })
      .where(eq(schema.campaignInvitations.invitationId, invitation.invitationId));
    await tx.insert(schema.campaignInvitationAcceptances).values({
      acceptanceId: createId("acc"),
      invitationId: invitation.invitationId,
      userId: user.userId,
      acceptedAt: new Date(),
    });
    await tx.insert(schema.activityFeed).values({
      campaignId: invitation.campaignId,
      activityId: createId("act"),
      type: "invitation.accepted",
      actorUserId: user.userId,
      content: { role: invitation.role, playerId },
    });
    return { campaignId: invitation.campaignId, membership, alreadyAccepted: false };
  });
}

export async function registerInvitationWebRoutes(server: FastifyInstance): Promise<void> {
  server.post<{
    Params: { campaignId: string };
    Body: { role?: string; maxUses?: number; expiresInHours?: number; label?: string };
  }>("/api/campaigns/:campaignId/invitations", async (request, reply) => {
    const { user } = await requireCampaignOwner(request, request.params.campaignId);
    const role = invitationRole(request.body?.role);
    const token = issueOpaqueToken("inv");
    const invitationId = createId("inv");
    const expiresAt = new Date(Date.now() + (request.body?.expiresInHours ?? 168) * 60 * 60 * 1000);
    await db.insert(schema.campaignInvitations).values({
      invitationId,
      campaignId: request.params.campaignId,
      tokenHash: hashOpaque(token),
      role,
      maxUses: request.body?.maxUses ?? 1,
      usesCount: 0,
      expiresAt,
      createdBy: user.userId,
    });
    reply.code(201);
    return { invitation: { invitationId, url: makeInviteUrl(request, token), token, expiresAt, role } };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/invitations", async (request) => {
    await requireCampaignOwner(request, request.params.campaignId);
    const invitations = await db.select().from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.campaignId, request.params.campaignId))
      .orderBy(desc(schema.campaignInvitations.createdAt));
    return {
      invitations: invitations.map((invitation) => ({
        invitationId: invitation.invitationId,
        role: invitation.role,
        maxUses: invitation.maxUses,
        usesCount: invitation.usesCount,
        expiresAt: invitation.expiresAt,
        revokedAt: invitation.revokedAt,
        createdAt: invitation.createdAt,
        status: invitation.revokedAt
          ? "revoked"
          : invitation.expiresAt < new Date()
            ? "expired"
            : invitation.usesCount >= invitation.maxUses
              ? "exhausted"
              : "active",
      })),
    };
  });

  server.post<{ Params: { campaignId: string; invitationId: string } }>(
    "/api/campaigns/:campaignId/invitations/:invitationId/revoke",
    async (request) => {
      const { user } = await requireCampaignOwner(request, request.params.campaignId);
      await db.update(schema.campaignInvitations).set({ revokedAt: new Date() }).where(and(
        eq(schema.campaignInvitations.campaignId, request.params.campaignId),
        eq(schema.campaignInvitations.invitationId, request.params.invitationId),
      ));
      await db.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "invitation.revoked",
        actorUserId: user.userId,
        content: { invitationId: request.params.invitationId },
      });
      return { ok: true };
    },
  );

  server.get<{ Params: { token: string } }>("/api/invitations/:token", async (request, reply) => {
    const [row] = await db
      .select({ invitation: schema.campaignInvitations, campaign: schema.campaigns })
      .from(schema.campaignInvitations)
      .innerJoin(schema.campaigns, eq(schema.campaignInvitations.campaignId, schema.campaigns.campaignId))
      .where(eq(schema.campaignInvitations.tokenHash, hashOpaque(request.params.token)))
      .limit(1);
    if (!row || row.invitation.revokedAt || row.invitation.expiresAt < new Date()) {
      reply.code(404);
      return { error: "Invitation not found" };
    }
    return {
      campaign: {
        campaignId: row.campaign.campaignId,
        title: row.campaign.title,
        summary: row.campaign.summary,
      },
      role: row.invitation.role,
      expiresAt: row.invitation.expiresAt,
    };
  });

  server.post<{ Params: { token: string } }>("/api/invitations/:token/accept", async (request, reply) => {
    const user = (request as { webUser?: WebUser }).webUser;
    if (!user) {
      reply.code(401);
      return { error: "AUTH_REQUIRED" };
    }
    const result = await acceptInvitation(request.params.token, user);
    campaignEventBus.publish(result.campaignId, { type: "invitation.accepted" });
    return {
      ok: true,
      campaignId: result.campaignId,
      portal: result.membership.role === "player" ? "player" : "dm",
    };
  });
}
