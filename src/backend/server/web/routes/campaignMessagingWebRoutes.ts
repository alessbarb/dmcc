import type { FastifyInstance } from "fastify";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import { campaignMessageReads, campaignMessages } from "../../../db/messagingSchema.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { isDmRole, requireCampaignMembership } from "../webAccess.js";

const AUDIENCES = new Set(["party", "dm", "player"]);
const MESSAGE_WRITER_ROLES = new Set(["dm", "co_dm", "player"]);
export const MAX_CAMPAIGN_MESSAGE_LENGTH = 4_000;
export const CAMPAIGN_MESSAGE_PAGE_SIZE = 50;
const MAX_READ_RECEIPTS_PER_REQUEST = 100;
const MAX_CLIENT_MESSAGE_ID_LENGTH = 128;

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

function messageVisibilityCondition(viewer: CampaignMessageViewer) {
  if (isDmRole(viewer.role)) return undefined;
  const privateRecipientCondition = viewer.playerId
    ? and(
        eq(campaignMessages.audience, "player"),
        eq(campaignMessages.recipientPlayerId, viewer.playerId),
      )
    : undefined;
  return or(
    eq(campaignMessages.audience, "party"),
    eq(campaignMessages.senderUserId, viewer.userId),
    privateRecipientCondition,
  );
}

export async function registerCampaignMessagingWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Params: { campaignId: string };
    Querystring: { before?: string };
  }>(
    "/api/campaigns/:campaignId/messages",
    async (request, reply) => {
      const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
      const viewer = {
        role: membership.role,
        userId: user.userId,
        playerId: membership.playerId,
      };
      const visibilityCondition = messageVisibilityCondition(viewer);
      const baseConditions = [eq(campaignMessages.campaignId, request.params.campaignId)];
      if (visibilityCondition) baseConditions.push(visibilityCondition);

      if (request.query.before) {
        const [cursorMessage] = await db.select({
          messageId: campaignMessages.messageId,
          createdAt: campaignMessages.createdAt,
        }).from(campaignMessages).where(and(
          ...baseConditions,
          eq(campaignMessages.messageId, request.query.before),
        )).limit(1);

        if (!cursorMessage) {
          reply.code(400);
          return { error: "Invalid message cursor" };
        }

        baseConditions.push(or(
          lt(campaignMessages.createdAt, cursorMessage.createdAt),
          and(
            eq(campaignMessages.createdAt, cursorMessage.createdAt),
            lt(campaignMessages.messageId, cursorMessage.messageId),
          ),
        )!);
      }

      const [messageRows, profiles] = await Promise.all([
        db.select().from(campaignMessages)
          .where(and(...baseConditions))
          .orderBy(desc(campaignMessages.createdAt), desc(campaignMessages.messageId))
          .limit(CAMPAIGN_MESSAGE_PAGE_SIZE + 1),
        db.select().from(schema.playerProfiles).where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.status, "active"),
        )),
      ]);

      const hasMore = messageRows.length > CAMPAIGN_MESSAGE_PAGE_SIZE;
      const pageMessages = messageRows.slice(0, CAMPAIGN_MESSAGE_PAGE_SIZE).reverse();
      const readRows = pageMessages.length > 0
        ? await db.select().from(campaignMessageReads).where(inArray(
            campaignMessageReads.messageId,
            pageMessages.map((message) => message.messageId),
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
        messages: pageMessages.map((message) => {
          const readers = readersByMessage.get(message.messageId) ?? [];
          return {
            messageId: message.messageId,
            content: message.content,
            audience: message.audience,
            recipientPlayerId: message.recipientPlayerId,
            senderPlayerId: message.senderPlayerId,
            senderName: message.senderDisplayName,
            sentByMe: message.senderUserId === user.userId,
            createdAt: message.createdAt,
            readByMe: readers.includes(user.userId),
            readByCount: readers.filter((readerUserId) => readerUserId !== message.senderUserId).length,
          };
        }),
        pageInfo: {
          hasMore,
          nextCursor: hasMore ? pageMessages[0]?.messageId ?? null : null,
        },
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
        messageIds: visibleMessageIds,
      });
    }

    reply.code(204);
  });

  server.post<{
    Params: { campaignId: string };
    Body: {
      content?: string;
      audience?: string;
      recipientPlayerId?: string | null;
      clientMessageId?: string;
    };
  }>("/api/campaigns/:campaignId/messages", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!canSendCampaignMessage(membership.role)) {
      reply.code(403);
      return { error: "Campaign role cannot send messages" };
    }

    const content = request.body?.content?.trim();
    const audience = request.body?.audience ?? "party";
    const recipientPlayerId = audience === "player" ? request.body?.recipientPlayerId ?? null : null;
    const clientMessageId = request.body?.clientMessageId?.trim();
    if (!content) {
      reply.code(400);
      return { error: "Message content is required" };
    }
    if (content.length > MAX_CAMPAIGN_MESSAGE_LENGTH) {
      reply.code(400);
      return { error: `Message content cannot exceed ${MAX_CAMPAIGN_MESSAGE_LENGTH} characters` };
    }
    if (!clientMessageId || clientMessageId.length > MAX_CLIENT_MESSAGE_ID_LENGTH) {
      reply.code(400);
      return { error: "A valid clientMessageId is required" };
    }
    if (!AUDIENCES.has(audience)) {
      reply.code(400);
      return { error: "Invalid message audience" };
    }
    if (audience === "player" && !recipientPlayerId) {
      reply.code(400);
      return { error: "Private player messages require recipientPlayerId" };
    }
    if (audience === "player") {
      const [recipient] = await db.select({ profileId: schema.playerProfiles.profileId })
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, recipientPlayerId!),
          eq(schema.playerProfiles.status, "active"),
        ))
        .limit(1);
      if (!recipient) {
        reply.code(404);
        return { error: "Message recipient not found" };
      }
    }

    const existingWhere = and(
      eq(campaignMessages.campaignId, request.params.campaignId),
      eq(campaignMessages.senderUserId, user.userId),
      eq(campaignMessages.clientMessageId, clientMessageId),
    );
    const [existing] = await db.select().from(campaignMessages).where(existingWhere).limit(1);
    if (existing) {
      if (existing.content !== content || existing.audience !== audience || existing.recipientPlayerId !== recipientPlayerId) {
        reply.code(409);
        return { error: "clientMessageId was already used for a different message" };
      }
      return { ok: true, messageId: existing.messageId, replayed: true };
    }

    let senderDisplayName = user.displayName;
    if (membership.role === "player" && membership.playerId) {
      const [profile] = await db.select({ displayName: schema.playerProfiles.displayName })
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
          eq(schema.playerProfiles.profileId, membership.playerId),
        ))
        .limit(1);
      senderDisplayName = profile?.displayName ?? user.displayName;
    }

    const messageId = createId("msg");
    const inserted = await db.insert(campaignMessages).values({
      messageId,
      campaignId: request.params.campaignId,
      senderUserId: user.userId,
      senderPlayerId: membership.role === "player" ? membership.playerId : null,
      senderDisplayName,
      clientMessageId,
      audience,
      recipientPlayerId,
      content,
    }).onConflictDoNothing().returning({ messageId: campaignMessages.messageId });

    if (inserted.length === 0) {
      const [replayed] = await db.select().from(campaignMessages).where(existingWhere).limit(1);
      if (!replayed || replayed.content !== content || replayed.audience !== audience || replayed.recipientPlayerId !== recipientPlayerId) {
        reply.code(409);
        return { error: "Message request conflicted with an existing operation" };
      }
      return { ok: true, messageId: replayed.messageId, replayed: true };
    }

    await db.insert(campaignMessageReads).values({ messageId, userId: user.userId });
    campaignEventBus.publish(request.params.campaignId, {
      type: "campaign.message.created",
      messageId,
      playerId: membership.role === "player" ? membership.playerId ?? undefined : undefined,
    });
    reply.code(201);
    return { ok: true, messageId, replayed: false };
  });
}
