import type { FastifyInstance } from "fastify";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { isDmRole, requireCampaignMembership } from "../webAccess.js";
import type { WebUser } from "../webSession.js";

function sqlRows<T = any>(result: unknown): T[] {
  const value = result as any;
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray(value?.rows)) return value.rows as T[];
  return [];
}

function sanitizeSearchQuery(raw?: string): string {
  return (raw ?? "").trim().slice(0, 120);
}

async function playerProfileFor(userId: string, campaignId: string) {
  const [profile] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.userId, userId),
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  return profile;
}

async function runDmSearch(campaignId: string, query: string) {
  const like = `%${query}%`;
  const result = await db.execute(sql`
    SELECT 'entity' AS type, entity_id AS id, name AS title, public_summary AS summary, dm_summary AS dm_summary, 'dm' AS visibility
      FROM campaign_entities
      WHERE campaign_id = ${campaignId} AND (name ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'fact' AS type, fact_id AS id, kind AS title, content_public AS summary, content_dm AS dm_summary, kind AS visibility
      FROM campaign_facts
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (content_public ILIKE ${like} OR content_dm ILIKE ${like})
    UNION ALL
    SELECT 'relation' AS type, relation_id AS id, type AS title, public_summary AS summary, dm_summary AS dm_summary, visibility
      FROM campaign_relations
      WHERE campaign_id = ${campaignId} AND (type ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, dm_summary AS dm_summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, NULL AS dm_summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR description ILIKE ${like})
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      dmSummary: row.dm_summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}

async function runPlayerSearch(campaignId: string, user: WebUser, query: string) {
  const like = `%${query}%`;
  const profile = await playerProfileFor(user.userId, campaignId);
  const playerId = profile?.profileId ?? "";
  const result = await db.execute(sql`
    SELECT 'entity' AS type, e.entity_id AS id, e.name AS title, e.public_summary AS summary, g.scope AS visibility
      FROM campaign_entities e
      JOIN visibility_grants g
        ON g.campaign_id = e.campaign_id
       AND g.target_type = 'entity'
       AND g.target_id = e.entity_id
      WHERE e.campaign_id = ${campaignId}
        AND (e.name ILIKE ${like} OR e.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'fact' AS type, f.fact_id AS id, f.kind AS title, f.content_public AS summary, g.scope AS visibility
      FROM campaign_facts f
      JOIN visibility_grants g
        ON g.campaign_id = f.campaign_id
       AND g.target_type = 'fact'
       AND g.target_id = f.fact_id
      WHERE f.campaign_id = ${campaignId}
        AND f.status <> 'archived'
        AND f.kind <> 'dm_secret'
        AND f.content_public ILIKE ${like}
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'relation' AS type, r.relation_id AS id, r.type AS title, r.public_summary AS summary, g.scope AS visibility
      FROM campaign_relations r
      JOIN visibility_grants g
        ON g.campaign_id = r.campaign_id
       AND g.target_type = 'relation'
       AND g.target_id = r.relation_id
      WHERE r.campaign_id = ${campaignId}
        AND (r.type ILIKE ${like} OR r.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND visibility_scope <> 'dm_only'
        AND (title ILIKE ${like} OR public_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND (title ILIKE ${like} OR description ILIKE ${like})
        AND (visibility_scope IN ('public', 'all_players') OR player_id = ${playerId})
    UNION ALL
    SELECT 'note' AS type, note_id AS id, split_part(content, E'\n', 1) AS title, content AS summary, visibility_scope AS visibility
      FROM campaign_notes
      WHERE campaign_id = ${campaignId}
        AND author_user_id = ${user.userId}
        AND content ILIKE ${like}
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}

export async function registerSearchWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: isDmRole(membership.role)
      ? await runDmSearch(request.params.campaignId, query)
      : await runPlayerSearch(request.params.campaignId, user, query) };
  });

  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/player/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as { statusCode?: number }).statusCode = 403;
      throw error;
    }
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: await runPlayerSearch(request.params.campaignId, user, query) };
  });
}
