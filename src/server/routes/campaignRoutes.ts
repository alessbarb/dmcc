import type { FastifyInstance } from "fastify";
import { join } from "path";
import * as fs from "fs/promises";
import { randomInt } from "crypto";
import { createId } from "../../shared/ids.js";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import {
  assertDM,
  assertCampaignAccess,
  getValidatedVaultId,
  getValidatedCampaignId,
  hashAccessCode,
} from "../auth.js";
import {
  getStoredAccessCode,
  getCharacterEntityIdForPlayer,
  getVisibleEntities,
  getVisibleRelations,
  getVisibleFacts,
  getVisibleSessions,
} from "../helpers.js";

export async function registerCampaignRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getCampaignDir(campaignId: string, vaultId = "default") {
    return join(dataDir, "vaults", vaultId, "campaigns", campaignId);
  }

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  // Health
  server.get("/api/health", async () => ({ ok: true, app: "dm-campaign-companion" }));

  // List Campaigns
  server.get("/api/campaigns", async (request, _reply) => {
    assertDM(request, (server as any).dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
    try {
      await fs.mkdir(campaignsDir, { recursive: true });
      const dirs = await fs.readdir(campaignsDir);
      const campaigns = [];
      for (const dirName of dirs) {
        if (!dirName.startsWith("cmp_")) continue;
        try {
          const snap = JSON.parse(await fs.readFile(join(campaignsDir, dirName, "snapshot.json"), "utf8"));
          if (snap?.projection?.campaign) {
            campaigns.push(snap.projection.campaign);
          } else {
            campaigns.push({ campaignId: dirName, title: dirName, archived: false });
          }
        } catch {
          campaigns.push({ campaignId: dirName, title: dirName, archived: false });
        }
      }
      return campaigns;
    } catch {
      return [];
    }
  });

  // Create Campaign
  server.post<{ Body: { campaignId: string; actorId: string; title: string; system?: string } }>(
    "/api/campaigns",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.body.campaignId);
      const { actorId, title, system } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "CreateCampaign",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          title,
          system: system || "generic_fantasy_d20",
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
        });
        reply.code(201);
        return { campaignId, title };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Get Campaign Details
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId",
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

        return {
          schemaVersion: 1,
          lastSequence: state.lastSequence,
          campaign: state.campaign,
          entities: visibleEntities,
          relations: getVisibleRelations(Array.from(state.relations.values()), visibleEntityIds, role),
          facts: getVisibleFacts(Array.from(state.facts.values()), role, playerId, characterEntityId),
          sessions: getVisibleSessions(Array.from(state.sessions.values()), role),
          players: role === "dm"
            ? Array.from(state.players?.values() || [])
            : Array.from(state.players?.values() || []).filter((p: any) => p.playerId === playerId),
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

  // Duplicate Campaign
  server.post<{ Params: { campaignId: string }; Body: { newTitle: string } }>(
    "/api/campaigns/:campaignId/duplicate",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { newTitle } = request.body;

      if (!newTitle || newTitle.trim() === "") {
        reply.code(400);
        return { error: "New campaign title is required" };
      }

      const sourceDir = getCampaignDir(campaignId, vaultId);
      const newCampaignId = `cmp_${createId("cmp").split("_")[1]}`;
      const targetDir = getCampaignDir(newCampaignId, vaultId);

      try {
        await fs.mkdir(targetDir, { recursive: true });
        let eventsContent: string;
        try {
          eventsContent = await fs.readFile(join(sourceDir, "events.ndjson"), "utf8");
        } catch {
          reply.code(404);
          return { error: "Source campaign not found" };
        }

        const newRepo = getRepository(vaultId);
        const lines = eventsContent.trim().split("\n").filter(Boolean);
        for (const line of lines) {
          const ev = JSON.parse(line);
          const payload = { ...ev.payload, campaignId: newCampaignId };
          if (ev.type === "CampaignCreated") {
            payload.campaignId = newCampaignId;
            payload.title = newTitle;
          }
          await newRepo.appendEvent(newCampaignId as any, ev.type, ev.actorId || "usr_dm", payload);
        }

        await newRepo.rebuildSnapshot(newCampaignId as any);
        reply.code(201);
        return { campaignId: newCampaignId, title: newTitle };
      } catch (err: any) {
        reply.code(500);
        return { error: `Duplication failed: ${err.message}` };
      }
    }
  );

  // Rebuild Snapshot
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/rebuild",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        await getRepository(vaultId).rebuildSnapshot(campaignId as any);
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: `Rebuild failed: ${err.message}` };
      }
    }
  );

  // Settings
  server.put<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/settings",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "UpdateCampaignSettings",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          settings: request.body as any,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: `Failed to update settings: ${err.message}` };
      }
    }
  );

  // LAN Toggle
  server.post<{ Params: { campaignId: string }; Body: { enabled: boolean } }>(
    "/api/campaigns/:campaignId/lan/toggle",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { enabled } = request.body;

      try {
        const accessCode = enabled ? randomInt(100000, 1000000).toString() : undefined;
        const localAccessCodeHash = accessCode ? hashAccessCode(accessCode) : undefined;

        if (enabled && accessCode) {
          (server as any).activeAccessCodes.set(campaignId, accessCode);
        } else {
          (server as any).activeAccessCodes.delete(campaignId);
        }

        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "UpdateCampaignSettings",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          settings: {
            lanModeEnabled: enabled,
            localAccessCodeHash,
            localAccessCode: undefined, // Clear legacy cleartext setting
          },
        });
        return { ok: true, accessCode };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}
