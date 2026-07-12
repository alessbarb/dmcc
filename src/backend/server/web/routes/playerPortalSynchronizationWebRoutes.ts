import type { FastifyInstance } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { getRequiredWebUser } from "../webSession.js";

function pathOf(url: string): string {
  return url.split("?", 1)[0];
}

function campaignIdFromPath(path: string): string | null {
  const playerMatch = path.match(/^\/api\/player\/campaigns\/([^/]+)/);
  if (playerMatch) return decodeURIComponent(playerMatch[1]);
  const portalMatch = path.match(/^\/api\/campaigns\/([^/]+)\/player-portal(?:\/|$)/);
  return portalMatch ? decodeURIComponent(portalMatch[1]) : null;
}

function resourceIdFromPath(path: string): string | null {
  const match = path.match(/\/player-portal\/resources\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function profileIdFor(campaignId: string, userId: string): Promise<string | null> {
  const [profile] = await db
    .select({ profileId: schema.playerProfiles.profileId })
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.userId, userId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  return profile?.profileId ?? null;
}

async function latestPlayerStatus(campaignId: string, userId: string): Promise<Record<string, unknown>> {
  const [activity] = await db
    .select()
    .from(schema.activityFeed)
    .where(and(
      eq(schema.activityFeed.campaignId, campaignId),
      eq(schema.activityFeed.actorUserId, userId),
      eq(schema.activityFeed.type, "player.status.updated"),
    ))
    .orderBy(desc(schema.activityFeed.occurredAt))
    .limit(1);
  return activity?.content && typeof activity.content === "object"
    ? activity.content as Record<string, unknown>
    : {};
}

async function playerResources(campaignId: string, userId: string): Promise<Array<Record<string, unknown>>> {
  const activities = await db
    .select()
    .from(schema.activityFeed)
    .where(and(
      eq(schema.activityFeed.campaignId, campaignId),
      eq(schema.activityFeed.actorUserId, userId),
    ))
    .orderBy(schema.activityFeed.occurredAt);

  const resources = new Map<string, Record<string, unknown>>();
  for (const activity of activities) {
    if (activity.type !== "player.resource.created" && activity.type !== "player.resource.updated") continue;
    const content = activity.content && typeof activity.content === "object"
      ? activity.content as Record<string, unknown>
      : {};
    const resourceId = typeof content.resourceId === "string" ? content.resourceId : null;
    if (!resourceId) continue;
    resources.set(resourceId, { ...(resources.get(resourceId) ?? {}), ...content, resourceId });
  }
  return Array.from(resources.values());
}

async function latestPublicRecap(campaignId: string) {
  const sessions = await db
    .select()
    .from(schema.campaignSessions)
    .where(eq(schema.campaignSessions.campaignId, campaignId))
    .orderBy(desc(schema.campaignSessions.createdAt));
  const history = sessions
    .filter((session) => Boolean(session.recapPublic))
    .map((session) => ({
      sessionId: session.sessionId,
      number: session.number,
      title: session.title,
      recap: session.recapPublic,
      playedDate: session.playedDate,
    }));
  return { recap: history[0]?.recap ?? null, history };
}

async function currentLiveTable(campaignId: string) {
  const [liveTable] = await db
    .select()
    .from(schema.liveTables)
    .where(and(
      eq(schema.liveTables.campaignId, campaignId),
      eq(schema.liveTables.status, "active"),
    ))
    .orderBy(desc(schema.liveTables.createdAt))
    .limit(1);
  return liveTable && liveTable.expiresAt > new Date() ? liveTable : null;
}

async function unreadNotifications(userId: string, campaignId: string) {
  const notifications = await db
    .select()
    .from(schema.notifications)
    .where(and(
      eq(schema.notifications.userId, userId),
      eq(schema.notifications.readAt, null as never),
    ))
    .orderBy(desc(schema.notifications.createdAt));
  return notifications.filter((notification) => {
    const content = notification.content && typeof notification.content === "object"
      ? notification.content as Record<string, unknown>
      : {};
    return content.campaignId === campaignId;
  });
}

export async function registerPlayerPortalSynchronizationWebRoutes(server: FastifyInstance): Promise<void> {
  server.addHook("preHandler", async (request) => {
    const path = pathOf(request.url);
    const campaignId = campaignIdFromPath(path);
    if (!campaignId) return;

    if (request.method === "POST" && path.endsWith("/player-portal/resources")) {
      const user = getRequiredWebUser(request);
      const resourceId = createId("res");
      await db.insert(schema.activityFeed).values({
        campaignId,
        activityId: createId("act"),
        type: "player.resource.created",
        actorUserId: user.userId,
        content: { ...((request.body ?? {}) as Record<string, unknown>), resourceId },
      });
      (request as typeof request & { portalResourceId?: string }).portalResourceId = resourceId;
    }

    if (request.method === "PUT" && resourceIdFromPath(path)) {
      const user = getRequiredWebUser(request);
      const resourceId = resourceIdFromPath(path)!;
      await db.insert(schema.activityFeed).values({
        campaignId,
        activityId: createId("act"),
        type: "player.resource.updated",
        actorUserId: user.userId,
        content: { ...((request.body ?? {}) as Record<string, unknown>), resourceId },
      });
    }
  });

  server.addHook("preSerialization", async (request, reply, payload) => {
    if (reply.statusCode >= 400) return payload;
    const path = pathOf(request.url);
    const campaignId = campaignIdFromPath(path);
    if (!campaignId || !payload || typeof payload !== "object") return payload;
    const user = getRequiredWebUser(request);

    if (request.method === "POST" && path.endsWith("/player-portal/resources")) {
      const resourceId = (request as typeof request & { portalResourceId?: string }).portalResourceId;
      return { ...(payload as Record<string, unknown>), resourceId };
    }

    if (request.method !== "GET") return payload;

    const [status, resources, recapData, liveTable, notifications, playerId] = await Promise.all([
      latestPlayerStatus(campaignId, user.userId),
      playerResources(campaignId, user.userId),
      latestPublicRecap(campaignId),
      currentLiveTable(campaignId),
      unreadNotifications(user.userId, campaignId),
      profileIdFor(campaignId, user.userId),
    ]);

    const response = payload as Record<string, unknown>;
    const sheet = response.sheet && typeof response.sheet === "object"
      ? response.sheet as Record<string, unknown>
      : {};
    const memory = response.memory && typeof response.memory === "object"
      ? response.memory as Record<string, unknown>
      : {};

    return {
      ...response,
      playerId: response.playerId ?? playerId,
      recap: response.recap ?? recapData.recap,
      history: response.history ?? recapData.history,
      liveTable,
      notifications,
      sheet: { ...sheet, status, resources },
      memory: { ...memory, history: memory.history ?? recapData.history },
    };
  });

  server.addHook("onResponse", async (request, reply) => {
    if (reply.statusCode >= 400) return;
    const path = pathOf(request.url);
    const campaignId = campaignIdFromPath(path);
    if (!campaignId || request.method === "GET") return;
    if (!/\/player-portal\/(status|resources|notes|objectives|proposals)(?:\/|$)/.test(path)) return;
    const user = getRequiredWebUser(request);
    const playerId = await profileIdFor(campaignId, user.userId);
    campaignEventBus.publish(campaignId, { type: "player.portal.updated", playerId: playerId ?? undefined });
  });
}
