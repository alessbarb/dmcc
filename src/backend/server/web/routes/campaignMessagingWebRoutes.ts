import type { FastifyInstance } from "fastify";
import { and, asc, eq, inArray } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import { campaignMessageReads, campaignMessages } from "../../../db/messagingSchema.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { isDmRole, requireCampaignMembership } from "../webAccess.js";

const AUDIENCES = new Set(["party", "dm", "player"]);
const MESSAGE_WRITER_ROLES = new Set(["dm", "co_dm", "player"]);
export const MAX_CAMPAIGN_MESSAGE_LENGTH = 4_000;
const MAX_READ_RECEIPTS_PER_REQUEST = 100;

export interface CampaignMessageVisibilityInput {
  audience: string;
  senderUserId: string;
  recipientPlayerId?: string | null;
}

export interface CampaignMessageViewer {
  role: string;
  userId: string;
  playerId?: string | null;
}

export function canReadCampaignMessage(
  message: CampaignMessageVisibilityInput,
  viewer: CampaignMessageViewer,
): boolean {
  if (isDmRole(viewer.role)) return true;
  if (message.audience === "party") return true;
  if (message.senderUserId === viewer.userId) return true;
  return message.audience === "player" && message.recipientPlayerId === viewer.playerId;
}

export function canSendCampaignMessage(role: string): boolean {
  return MESSAGE_WRITER_ROLES.has(role);
}

export async function registerCampaignMessagingWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/messages",
    async (request) => {
      const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
      const [messages, profiles] = await Promise.all([
        db.select().from(campaignMessages)
          .where(eq(campaignMessages.campaignId, request.params.campaignId))
          .orderBy(asc(campaignMessages.createdAt)),
        db.select().from(schema.playerProfiles).where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.status, "active"),
        )),
      ]);

      const visible = messages.filter((message) => canReadCampaignMessage(message, {
        role: membership.role,
        userId: user.userId,
        playerId: membership.playerId,
      }));

      const profileById = new Map(profiles.map((profile) => [profile.profileId, profile]));
      const readRows = visible.length > 0
        ? await db.select().from(campaignMessageReads).where(inArray(
            campaignMessageReads.messageId,
            visible.map((message) => message.messageId),
          ))
        : [];
      const readersByMessage = new Map<string, string[]>();
      for (const read of readRows) {
        const readers = readersByMessage.get(read.messageId) ?? [];
        readers.push(read.userId);
        readersByMessage.set(read.messageId, readers);
      }

      return {
        participants: profiles.map((profile) => ({
          playerId: profile.profileId,
          displayName: profile.displayName,
        })),
        messages: visible.map((message) => {
          const readers = readersByMessage.get(message.messageId) ?? [];
          return {
            messageId: message.messageId,
            content: message.content,
            audience: message.audience,
            recipientPlayerId: message.recipientPlayerId,
            senderPlayerId: message.senderPlayerId,
            senderName: message.senderPlayerId
              ? profileById.get(message.senderPlayerId)?.displayName ?? "Jugador"
              : "Dirección de juego",
            sentByMe: message.senderUserId === user.userId,
            createdAt: message.createdAt,
            readByMe: readers.includes(user.userId),
            readByCount: readers.filter((readerUserId) => readerUserId !== message.senderUserId).length,
          };
        }),
      };
    },
  );

  server.post<{
    Params: { campaignId: string };
    Body: { messageIds?: string[] };
  }>("/api/campaigns/:campaignId/messages/read", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const messageIds = [...new Set(request.body?.messageIds ?? [])]
      .filter((messageId): messageId is string => typeof messageId === "string" && messageId.length > 0)
      .slice(0, MAX_READ_RECEIPTS_PER_REQUEST);

    if (messageIds.length === 0) {
      reply.code(204);
      return;
    }

    const candidates = await db.select().from(campaignMessages).where(and(
      eq(campaignMessages.campaignId, request.params.campaignId),
      inArray(campaignMessages.messageId, messageIds),
    ));
    const visibleMessageIds = candidates
      .filter((message) => canReadCampaignMessage(message, {
        role: membership.role,
        userId: user.userId,
        playerId: membership.playerId,
      }))
      .map((message) => message.messageId);

    if (visibleMessageIds.length > 0) {
      await db.insert(campaignMessageReads).values(
        visibleMessageIds.map((messageId) => ({ messageId, userId: user.userId })),
      ).onConflictDoNothing();
      campaignEventBus.publish(request.params.campaignId, {
        type: "campaign.message.read",
      });
    }

    reply.code(204);
  });

  server.post<{
    Params: { campaignId: string };
    Body: { content?: string; audience?: string; recipientPlayerId?: string | null };
  }>("/api/campaigns/:campaignId/messages", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!canSendCampaignMessage(membership.role)) {
      reply.code(403);
      return { error: "Campaign role cannot send messages" };
    }

    const content = request.body?.content?.trim();
    const audience = request.body?.audience ?? "party";
    if (!content) {
      reply.code(400);
      return { error: "Message content is required" };
    }
    if (content.length > MAX_CAMPAIGN_MESSAGE_LENGTH) {
      reply.code(400);
      return { error: `Message content cannot exceed ${MAX_CAMPAIGN_MESSAGE_LENGTH} characters` };
    }
    if (!AUDIENCES.has(audience)) {
      reply.code(400);
      return { error: "Invalid message audience" };
    }
    if (audience === "player" && !request.body?.recipientPlayerId) {
      reply.code(400);
      return { error: "Private player messages require recipientPlayerId" };
    }
    if (audience === "player") {
      const [recipient] = await db.select({ profileId: schema.playerProfiles.profileId })
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, request.body!.recipientPlayerId!),
          eq(schema.playerProfiles.status, "active"),
        ))
        .limit(1);
      if (!recipient) {
        reply.code(404);
        return { error: "Message recipient not found" };
      }
    }

    const messageId = createId("msg");
    await db.insert(campaignMessages).values({
      messageId,
      campaignId: request.params.campaignId,
      senderUserId: user.userId,
      senderPlayerId: membership.role === "player" ? membership.playerId : null,
      audience,
      recipientPlayerId: audience === "player" ? request.body?.recipientPlayerId ?? null : null,
      content,
    });
    await db.insert(campaignMessageReads).values({ messageId, userId: user.userId });
    campaignEventBus.publish(request.params.campaignId, {
      type: "campaign.message.created",
      messageId,
      playerId: membership.role === "player" ? membership.playerId ?? undefined : undefined,
    });
    reply.code(201);
    return { ok: true, messageId };
  });
}
