import type { FastifyInstance } from "fastify";
import { networkInterfaces } from "os";
import Fuse from "fuse.js";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import { buildDashboardProjection } from "../../projections/dashboardProjection.js";
import { buildWhatNowProjection } from "../../projections/whatNowProjection.js";
import {
  assertDM,
  assertCampaignAccess,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestRole,
} from "../auth.js";
import {
  getStoredAccessCode,
  getCharacterEntityIdForPlayer,
  getVisibleEntities,
  getVisibleRelations,
  getVisibleFacts,
} from "../helpers.js";

export async function registerProjectionRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  // Dashboard
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/dashboard",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        return buildDashboardProjection(state);
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // What Now
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/what-now",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        return buildWhatNowProjection(state);
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // Graph
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/graph",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const playerId = request.headers["x-player-id"] as string;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        const role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken);

        const rawEntities = Array.from(state.entities.values());
        const characterEntityId = playerId ? getCharacterEntityIdForPlayer(rawEntities, playerId) : undefined;
        const visibleEntities = getVisibleEntities(rawEntities, role, playerId, characterEntityId);
        const visibleEntityIds = new Set(visibleEntities.map((e: any) => e.entityId));
        const visibleRelations = getVisibleRelations(Array.from(state.relations.values()), visibleEntityIds, role);

        return {
          nodes: visibleEntities.map((e: any) => ({
            id: e.entityId,
            entityType: e.entityType,
            title: e.title,
            status: e.status,
            importance: e.importance,
            visibility: e.visibility,
            hasWarnings: e.hasWarnings,
          })),
          edges: visibleRelations.map((r: any) => ({
            id: r.relationId,
            source: r.sourceEntityId,
            target: r.targetEntityId,
            type: r.relationType,
            relationType: r.relationType,
            label: r.relationType,
            status: r.status,
            visibility: r.visibility,
            description: r.description,
          })),
        };
      } catch (err: any) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // Timeline (event log)
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/timeline",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const events = await (repo as any)["eventStore"].loadEvents(campaignId as any);
        return { events };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // Visibility summary
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/visibility",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        const entities = Array.from(state.entities.values()).filter((e: any) => !e.archived);
        const dmOnlyEntityIds = entities
          .filter((e: any) => (e.visibility?.kind ?? "dm_only") === "dm_only")
          .map((e: any) => e.entityId);
        const partyKnows = entities
          .filter((e: any) => ["party", "group", "public"].includes(e.visibility?.kind))
          .map((e: any) => ({ entityId: e.entityId, title: e.title, entityType: e.entityType }));

        return {
          dmOnlyEntityIds,
          partyKnows,
          summary: { total: entities.length, partyKnowsCount: partyKnows.length, dmOnlyCount: dmOnlyEntityIds.length },
        };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // Search (Fuse.js)
  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>(
    "/api/campaigns/:campaignId/search",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const query = (request.query.q || "").toLowerCase();
      const playerId = request.headers["x-player-id"] as string;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        const role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken);

        const rawEntities = Array.from(state.entities.values());
        const characterEntityId = playerId ? getCharacterEntityIdForPlayer(rawEntities, playerId) : undefined;
        const visibleEntities = getVisibleEntities(rawEntities, role, playerId, characterEntityId);
        const visibleFacts = getVisibleFacts(Array.from(state.facts.values()), role, playerId, characterEntityId);

        const items = [
          ...visibleEntities.map((e: any) => ({ ...e, itemType: "entity" })),
          ...visibleFacts.map((f: any) => ({ ...f, itemType: "fact", title: f.statement, subtitle: `Fact (${f.kind})` })),
        ];

        const results = query
          ? new Fuse(items, { keys: ["title", "subtitle", "summary", "content", "statement"], threshold: 0.35 })
              .search(query).map((r) => r.item)
          : items;

        return { results };
      } catch (err: any) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // LAN Status
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/lan-status",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        let nets: ReturnType<typeof networkInterfaces> = {};
        try {
          nets = networkInterfaces();
        } catch {
          nets = {};
        }
        let localIp = "127.0.0.1";
        for (const name of Object.keys(nets)) {
          for (const net of nets[name] || []) {
            if (net.family === "IPv4" && !net.internal) {
              localIp = net.address;
              break;
            }
          }
        }
        const port = Number(process.env.DMCC_PORT ?? "4877");
        const role = getRequestRole(request, (server as any).dmSessionToken);
        const activeAccessCode = (server as any).activeAccessCodes?.get(campaignId);
        const storedAccessCodeValue = state.campaign?.settings?.localAccessCode;

        const accessCode = role === "dm"
          ? (activeAccessCode || storedAccessCodeValue || getStoredAccessCode(state, campaignId))
          : null;

        return {
          lanModeEnabled: state.campaign?.settings?.lanModeEnabled || false,
          accessCode,
          localIp,
          port,
          joinUrl: `http://${localIp}:${port}/join/${campaignId}`,
        };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );
}
