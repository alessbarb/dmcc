import { randomInt, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus, type CampaignRealtimeEvent } from "../../realtime/campaignEventBus.js";
import { getRequiredWebUser } from "../webSession.js";
import { getMembership, requireCampaignMembership, requireCampaignRole } from "../webAccess.js";
import { recordOperationalActivity } from "../../activity/recordOperationalActivity.js";

export const SHORT_TABLE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortTableCode(): string {
  const pick = () =>
    Array.from(
      { length: 4 },
      () => SHORT_TABLE_CODE_ALPHABET[randomInt(SHORT_TABLE_CODE_ALPHABET.length)],
    ).join("");
  return `${pick()}-${pick()}`;
}

export async function registerLiveTableWebRoutes(server: FastifyInstance): Promise<void> {
  server.post<{
    Params: { campaignId: string };
    Body: { activeSessionId?: string; durationHours?: number };
  }>("/api/campaigns/:campaignId/live-tables", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const liveTableId = createId("live");
    const shortCode = generateShortTableCode();
    const expiresAt = new Date(
      Date.now() + Math.max(1, Math.min(24, request.body?.durationHours ?? 4)) * 60 * 60 * 1000,
    );
    await db.transaction(async (tx) => {
      await tx
        .update(schema.liveTables)
        .set({ status: "closed", closedAt: new Date() })
        .where(and(
          eq(schema.liveTables.campaignId, request.params.campaignId),
          eq(schema.liveTables.status, "active"),
        ));
      await tx.insert(schema.liveTables).values({
        liveTableId,
        campaignId: request.params.campaignId,
        activeSessionId: request.body?.activeSessionId ?? null,
        shortCode,
        status: "active",
        expiresAt,
      });
      await recordOperationalActivity(tx, {
        campaignId: request.params.campaignId,
        sourceId: createId("act"),
        type: "live_table.opened",
        category: "collaboration",
        data: { liveTableId, activeSessionId: request.body?.activeSessionId ?? null, expiresAt },
        actorUserId: user.userId,
        sessionId: request.body?.activeSessionId ?? null,
      });
    });
    campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
    reply.code(201);
    return { liveTable: { liveTableId, shortCode, expiresAt, status: "active" } };
  });

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/live-tables/current",
    async (request) => {
      await requireCampaignMembership(request, request.params.campaignId);
      const [liveTable] = await db
        .select()
        .from(schema.liveTables)
        .where(and(
          eq(schema.liveTables.campaignId, request.params.campaignId),
          eq(schema.liveTables.status, "active"),
        ))
        .limit(1);
      if (!liveTable || liveTable.expiresAt < new Date()) return { liveTable: null };
      return { liveTable };
    },
  );

  server.post<{ Params: { campaignId: string; liveTableId: string } }>(
    "/api/campaigns/:campaignId/live-tables/:liveTableId/close",
    async (request) => {
      const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      await db
        .update(schema.liveTables)
        .set({ status: "closed", closedAt: new Date() })
        .where(and(
          eq(schema.liveTables.campaignId, request.params.campaignId),
          eq(schema.liveTables.liveTableId, request.params.liveTableId),
        ));
      await recordOperationalActivity(db, {
        campaignId: request.params.campaignId,
        sourceId: createId("act"),
        type: "live_table.closed",
        category: "collaboration",
        data: { liveTableId: request.params.liveTableId },
        actorUserId: user.userId,
      });
      campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
      return { ok: true };
    },
  );

  server.post<{ Params: { code: string } }>(
    "/api/live-tables/:code/join",
    async (request, reply) => {
      const user = getRequiredWebUser(request);
      const [liveTable] = await db
        .select()
        .from(schema.liveTables)
        .where(and(
          eq(schema.liveTables.shortCode, request.params.code.toUpperCase()),
          eq(schema.liveTables.status, "active"),
        ))
        .limit(1);
      if (!liveTable || liveTable.expiresAt < new Date()) {
        reply.code(404);
        return { error: "Live table code is invalid or expired" };
      }
      const membership = await getMembership(liveTable.campaignId, user.userId);
      if (!membership) {
        reply.code(403);
        return { error: "Campaign invitation must be accepted before joining live table" };
      }
      return {
        ok: true,
        campaignId: liveTable.campaignId,
        liveTableId: liveTable.liveTableId,
      };
    },
  );

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/events/stream",
    async (request, reply) => {
      const { user } = await requireCampaignMembership(request, request.params.campaignId);
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });
      const listenerId = randomUUID();
      const listener = (event: CampaignRealtimeEvent) => {
        if (event.targetUserIds && !event.targetUserIds.includes(user.userId)) return;
        reply.raw.write(`event: ${event.type}\n`);
        reply.raw.write(`data: ${JSON.stringify({
          type: event.type,
          sequence: event.sequence,
          playerId: event.playerId,
          messageId: event.messageId,
          messageIds: event.messageIds,
        })}\n\n`);
      };
      campaignEventBus.subscribe(request.params.campaignId, listenerId, listener);
      request.raw.on("close", () => campaignEventBus.unsubscribe(request.params.campaignId, listenerId));
    },
  );
}
