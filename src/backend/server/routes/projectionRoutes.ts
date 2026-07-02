import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import { networkInterfaces } from "os";
import Fuse from "fuse.js";
import { buildDashboardProjection } from "@core/projections/dashboardProjection.js";
import { buildWhatNowProjection } from "@core/projections/whatNowProjection.js";
import {
  assertDM,
  assertCampaignAccess,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestPlayerId,
  getRequestDmSession,
} from "../auth.js";
import { hasCampaignDmAccessSync } from "../campaignAclStore.js";
import {
  getStoredAccessCode,
  getCharacterEntityIdForPlayer,
  getVisibleEntities,
  getVisibleRelations,
  getVisibleFacts,
} from "../helpers.js";
import { sendCommandError } from "../commandHttp.js";

export async function registerProjectionRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  function getAdvertisedPort(request: any): number {
    const backendPort = Number(process.env.DMCC_PORT ?? "4877");
    const origin = request.headers.origin as string | undefined;
    if (!origin) return backendPort;

    try {
      const url = new URL(origin);
      return Number(url.port || (url.protocol === "https:" ? "443" : "80"));
    } catch {
      return backendPort;
    }
  }

  // Dashboard
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/dashboard",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId);
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId);
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
      const playerId = getRequestPlayerId(request);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);

        const rawEntities = Array.from(state.entities.values());
        const characterEntityId = playerId ? getCharacterEntityIdForPlayer(rawEntities, playerId) : undefined;
        const visibleEntities = getVisibleEntities(rawEntities, role, playerId, characterEntityId);
        const visibleEntityIds = new Set(visibleEntities.map((e: any) => e.entityId));
        const visibleRelations = getVisibleRelations(
          Array.from(state.relations.values()),
          visibleEntityIds,
          role,
          playerId,
          characterEntityId
        );

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
        if (sendCommandError(reply, err)) return;
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const events = await repo.loadEvents(campaignId);
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId);
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
      const playerId = getRequestPlayerId(request);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);

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
        if (sendCommandError(reply, err)) return;
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
        const state = await getRepository(vaultId).getCampaignState(campaignId);
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
        const port = getAdvertisedPort(request);
        const dmSession = getRequestDmSession(request, server.dmSessionToken);
        const hasLegacyAuth = server.allowLegacyTestAuth &&
          (request.headers["x-dm-token"] || request.headers["x-role"] === "dm");

        const dmId = dmSession?.dmId ?? (hasLegacyAuth ? "usr_dm" : undefined);
        const isDmWithAccess = dmId && hasCampaignDmAccessSync(dataDir, vaultId, campaignId, dmId);

        const lanModeEnabled = state.campaign?.settings?.lanModeEnabled || false;
        const joinUrl = lanModeEnabled ? `http://${localIp}:${port}/join/${campaignId}` : null;

        if (isDmWithAccess || hasLegacyAuth) {
          const activeAccessCode = server.activeAccessCodes?.get(campaignId);
          const storedAccessCodeValue = state.campaign?.settings?.localAccessCode;
          const accessCode = activeAccessCode || storedAccessCodeValue || getStoredAccessCode(state, campaignId) || null;

          return {
            lanModeEnabled,
            joinUrl,
            accessCode,
            localIp,
            port,
          };
        } else {
          return {
            lanModeEnabled,
            joinUrl,
            accessCode: null,
          };
        }
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(404);
        return { error: `Campaign not found: ${err.message}` };
      }
    }
  );
}
