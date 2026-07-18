import type { FastifyInstance } from "fastify";
import { and, asc, eq } from "drizzle-orm";
import { generateShortcutId } from "@shared/ids.js";
import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";
import type { CampaignResourceRef } from "@core/domain/resource/resourceRef.js";
import { campaignResourceRefKey } from "@core/domain/resource/resourceRef.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { requireCampaignRole } from "../webAccess.js";
import { HttpError } from "../../errors.js";
import { assertCampaignResourceAccess } from "../../resources/assertCampaignResourceAccess.js";
import { resolveManyCampaignResources } from "../../resources/CampaignResourceResolver.js";

const SHORTCUT_TARGET_TYPES: readonly ShortcutTargetType[] = ["entity", "session", "canvas", "notebook", "story_thread", "story_step"];

function isShortcutTargetType(value: unknown): value is ShortcutTargetType {
  return typeof value === "string" && (SHORTCUT_TARGET_TYPES as readonly string[]).includes(value);
}

function toShortcutTargetType(value: string): ShortcutTargetType {
  if (!isShortcutTargetType(value)) {
    throw new HttpError(`Invalid shortcut target type: ${value}`, 500);
  }
  return value;
}

export async function registerShortcutsWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/shortcuts",
    async (request) => {
      const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      const campaignId = request.params.campaignId;

      const rows = await db
        .select()
        .from(schema.campaignShortcuts)
        .where(and(
          eq(schema.campaignShortcuts.campaignId, campaignId),
          eq(schema.campaignShortcuts.userId, user.userId),
        ))
        .orderBy(asc(schema.campaignShortcuts.sortOrder));

      const refs: CampaignResourceRef[] = rows.map((row) => ({
        type: toShortcutTargetType(row.targetType),
        resourceId: row.targetId,
      }));
      const resolved = await resolveManyCampaignResources(campaignId, refs);

      return {
        shortcuts: rows.map((row) => ({
          shortcutId: row.shortcutId,
          targetType: row.targetType,
          targetId: row.targetId,
          sortOrder: row.sortOrder,
          resource: resolved.get(campaignResourceRefKey({ type: toShortcutTargetType(row.targetType), resourceId: row.targetId })) ?? null,
        })),
      };
    },
  );

  server.post<{
    Params: { campaignId: string };
    Body: { targetType?: string; targetId?: string };
  }>("/api/campaigns/:campaignId/shortcuts", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const campaignId = request.params.campaignId;
    const { targetType, targetId } = request.body ?? {};

    if (!isShortcutTargetType(targetType) || !targetId) {
      reply.code(400);
      return { error: `targetType (${SHORTCUT_TARGET_TYPES.join("|")}) and targetId are required` };
    }

    await assertCampaignResourceAccess(campaignId, { type: targetType, resourceId: targetId });

    const [existing] = await db
      .select()
      .from(schema.campaignShortcuts)
      .where(and(
        eq(schema.campaignShortcuts.campaignId, campaignId),
        eq(schema.campaignShortcuts.userId, user.userId),
        eq(schema.campaignShortcuts.targetType, targetType),
        eq(schema.campaignShortcuts.targetId, targetId),
      ))
      .limit(1);
    if (existing) {
      return { ok: true, shortcutId: existing.shortcutId, sortOrder: existing.sortOrder };
    }

    const existingRows = await db
      .select({ sortOrder: schema.campaignShortcuts.sortOrder })
      .from(schema.campaignShortcuts)
      .where(and(
        eq(schema.campaignShortcuts.campaignId, campaignId),
        eq(schema.campaignShortcuts.userId, user.userId),
      ));
    const nextSortOrder = existingRows.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;

    const shortcutId = generateShortcutId();
    await db.insert(schema.campaignShortcuts).values({
      shortcutId,
      campaignId,
      userId: user.userId,
      targetType,
      targetId,
      sortOrder: nextSortOrder,
    });

    return { ok: true, shortcutId, sortOrder: nextSortOrder };
  });

  server.patch<{
    Params: { campaignId: string };
    Body: { shortcutIds?: string[] };
  }>("/api/campaigns/:campaignId/shortcuts/reorder", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const campaignId = request.params.campaignId;
    const shortcutIds = request.body?.shortcutIds;

    if (!Array.isArray(shortcutIds) || shortcutIds.length === 0) {
      reply.code(400);
      return { error: "shortcutIds is required" };
    }

    const owned = await db
      .select({ shortcutId: schema.campaignShortcuts.shortcutId })
      .from(schema.campaignShortcuts)
      .where(and(
        eq(schema.campaignShortcuts.campaignId, campaignId),
        eq(schema.campaignShortcuts.userId, user.userId),
      ));
    const ownedIds = new Set(owned.map((row) => row.shortcutId));
    if (shortcutIds.some((id) => !ownedIds.has(id)) || shortcutIds.length !== ownedIds.size) {
      throw new HttpError("shortcutIds must exactly match the caller's own shortcuts in this campaign", 400);
    }

    await db.transaction(async (tx) => {
      for (const [index, shortcutId] of shortcutIds.entries()) {
        await tx
          .update(schema.campaignShortcuts)
          .set({ sortOrder: index })
          .where(and(
            eq(schema.campaignShortcuts.campaignId, campaignId),
            eq(schema.campaignShortcuts.userId, user.userId),
            eq(schema.campaignShortcuts.shortcutId, shortcutId),
          ));
      }
    });

    return { ok: true };
  });

  server.delete<{ Params: { campaignId: string; shortcutId: string } }>(
    "/api/campaigns/:campaignId/shortcuts/:shortcutId",
    async (request, reply) => {
      const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      const campaignId = request.params.campaignId;

      const [existing] = await db
        .select({ shortcutId: schema.campaignShortcuts.shortcutId })
        .from(schema.campaignShortcuts)
        .where(and(
          eq(schema.campaignShortcuts.campaignId, campaignId),
          eq(schema.campaignShortcuts.userId, user.userId),
          eq(schema.campaignShortcuts.shortcutId, request.params.shortcutId),
        ))
        .limit(1);
      if (!existing) {
        reply.code(404);
        return { error: "Shortcut not found" };
      }

      await db
        .delete(schema.campaignShortcuts)
        .where(eq(schema.campaignShortcuts.shortcutId, request.params.shortcutId));

      return { ok: true };
    },
  );
}
