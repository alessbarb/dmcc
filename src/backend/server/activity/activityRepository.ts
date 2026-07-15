import { and, or, lt, eq, desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { campaignActivity } from "../../db/schema.js";
import type { CampaignHistoryEntry, ActivityFilter } from "../../../core/projections/activity/activityTypes.js";
import { activityIdForSource } from "@core/projections/activity/activityId.js";

export function encodeCursor(occurredAt: Date, activityId: string): string {
  const payload = `${occurredAt.toISOString()}|${activityId}`;
  return Buffer.from(payload).toString("base64url");
}

export function decodeCursor(cursor: string): { occurredAt: Date; activityId: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [dateStr, activityId] = raw.split("|");
    if (!dateStr || !activityId) return null;
    const occurredAt = new Date(dateStr);
    if (Number.isNaN(occurredAt.getTime())) return null;
    return { occurredAt, activityId };
  } catch {
    return null;
  }
}

export const activityRepository = {
  async insertActivity(tx: any, activity: any) {
    const client = tx || db;
    await client
      .insert(campaignActivity)
      .values(activity)
      .onConflictDoNothing();
  },

  async recordOperationalActivity(
    tx: any,
    params: {
      campaignId: string;
      sourceId: string;
      type: string;
      category: "session" | "content" | "knowledge" | "story" | "people" | "collaboration" | "operation";
      data: Record<string, any>;
      actorUserId?: string | null;
      sessionId?: string | null;
      targetType?: string | null;
      targetId?: string | null;
      occurredAt?: Date;
    }
  ) {
    const client = tx || db;
    const occurredAt = params.occurredAt || new Date();
    const activityId = activityIdForSource({
      campaignId: params.campaignId,
      sourceKind: "operation",
      sourceId: params.sourceId,
    });

    await client.insert(campaignActivity).values({
      activityId,
      campaignId: params.campaignId,
      sourceKind: "operation",
      sourceId: params.sourceId,
      type: params.type,
      category: params.category,
      data: params.data,
      actorUserId: params.actorUserId || null,
      sessionId: params.sessionId || null,
      targetType: params.targetType || null,
      targetId: params.targetId || null,
      occurredAt,
    }).onConflictDoNothing();
  },

  async findCampaignHistory(
    tx: any,
    campaignId: string,
    filters: ActivityFilter
  ): Promise<{ entries: CampaignHistoryEntry[]; nextCursor?: string }> {
    const client = tx || db;
    const limit = Math.max(1, Math.min(filters.limit || 50, 100));

    const conditions = [eq(campaignActivity.campaignId, campaignId)];

    if (filters.category) {
      conditions.push(eq(campaignActivity.category, filters.category));
    }
    if (filters.actorUserId) {
      conditions.push(eq(campaignActivity.actorUserId, filters.actorUserId));
    }
    if (filters.sessionId) {
      conditions.push(eq(campaignActivity.sessionId, filters.sessionId));
    }
    if (filters.targetType && filters.targetId) {
      conditions.push(
        and(
          eq(campaignActivity.targetType, filters.targetType),
          eq(campaignActivity.targetId, filters.targetId)
        )!
      );
    }

    if (filters.cursor) {
      const decoded = decodeCursor(filters.cursor);
      if (decoded) {
        conditions.push(
          or(
            lt(campaignActivity.occurredAt, decoded.occurredAt),
            and(
              eq(campaignActivity.occurredAt, decoded.occurredAt),
              lt(campaignActivity.activityId, decoded.activityId)
            )
          )!
        );
      }
    }

    const rows = await client
      .select()
      .from(campaignActivity)
      .where(and(...conditions))
      .orderBy(desc(campaignActivity.occurredAt), desc(campaignActivity.activityId))
      .limit(limit + 1);

    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    const entries: CampaignHistoryEntry[] = items.map((row: any) => ({
      activityId: row.activityId,
      campaignId: row.campaignId,
      sourceKind: row.sourceKind as "domain_event" | "operation",
      sourceId: row.sourceId,
      type: row.type,
      category: row.category as any,
      data: row.data,
      actorUserId: row.actorUserId,
      sessionId: row.sessionId,
      targetType: row.targetType,
      targetId: row.targetId,
      occurredAt: row.occurredAt.toISOString(),
    }));

    let nextCursor: string | undefined;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = encodeCursor(lastItem.occurredAt, lastItem.activityId);
    }

    return { entries, nextCursor };
  },

  async deleteCampaignActivities(tx: any, campaignId: string) {
    const client = tx || db;
    await client.delete(campaignActivity).where(eq(campaignActivity.campaignId, campaignId));
  },
};
