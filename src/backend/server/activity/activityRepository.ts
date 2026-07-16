import { and, or, lt, eq, desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import type { DbClient, DbTransaction } from "../../db/client.js";
import { campaignActivity } from "../../db/schema.js";
import type {
  CampaignActivityCategory,
  CampaignActivityData,
  CampaignHistoryEntry,
  ActivityFilter,
} from "../../../core/projections/activity/activityTypes.js";
import { activityIdForSource } from "@core/projections/activity/activityId.js";

type DbExecutor = DbClient | DbTransaction | null;
type CampaignActivityInsert = typeof campaignActivity.$inferInsert;
const ACTIVITY_CATEGORIES = [
  "session",
  "content",
  "knowledge",
  "story",
  "people",
  "collaboration",
  "operation",
] as const satisfies readonly CampaignActivityCategory[];

function getClient(tx: DbExecutor | undefined): DbClient | DbTransaction {
  return tx ?? db;
}

function campaignActivityCategory(value: string): CampaignActivityCategory {
  const category = ACTIVITY_CATEGORIES.find((candidate) => candidate === value);
  if (category) {
    return category;
  }
  throw new Error(`Invalid campaign activity category: ${value}`);
}

function campaignActivitySourceKind(value: string): "domain_event" | "operation" {
  if (value === "domain_event" || value === "operation") return value;
  throw new Error(`Invalid campaign activity source kind: ${value}`);
}

function encodeCursor(occurredAt: Date, activityId: string): string {
  const payload = `${occurredAt.toISOString()}|${activityId}`;
  return Buffer.from(payload).toString("base64url");
}

function decodeCursor(cursor: string): { occurredAt: Date; activityId: string } | null {
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
  async insertActivity(tx: DbExecutor, activity: CampaignActivityInsert) {
    const client = getClient(tx);
    await client
      .insert(campaignActivity)
      .values(activity)
      .onConflictDoNothing();
  },

  async recordOperationalActivity(
    tx: DbExecutor,
    params: {
      campaignId: string;
      sourceId: string;
      type: string;
      category: "session" | "content" | "knowledge" | "story" | "people" | "collaboration" | "operation";
      data: CampaignActivityData;
      actorUserId?: string | null;
      sessionId?: string | null;
      targetType?: string | null;
      targetId?: string | null;
      occurredAt?: Date;
    }
  ) {
    const client = getClient(tx);
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
    tx: DbExecutor,
    campaignId: string,
    filters: ActivityFilter
  ): Promise<{ entries: CampaignHistoryEntry[]; nextCursor?: string }> {
    const client = getClient(tx);
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

    const entries: CampaignHistoryEntry[] = items.map((row) => ({
      activityId: row.activityId,
      campaignId: row.campaignId,
      sourceKind: campaignActivitySourceKind(row.sourceKind),
      sourceId: row.sourceId,
      type: row.type,
      category: campaignActivityCategory(row.category),
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

  async deleteCampaignActivities(tx: DbExecutor, campaignId: string) {
    const client = getClient(tx);
    await client.delete(campaignActivity).where(eq(campaignActivity.campaignId, campaignId));
  },
};
