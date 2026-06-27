import type { FastifyInstance } from "fastify";
import { join } from "path";
import * as fs from "fs/promises";
import { randomInt, randomBytes } from "crypto";
import { createId } from "../../shared/ids.js";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import {
  assertDM,
  assertCampaignAccess,
  getRequestRoleWithTokens,
  getValidatedVaultId,
  getValidatedCampaignId,
  hashAccessCode,
} from "../auth.js";
import {
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
  server.get("/api/campaigns", async (request, reply) => {
    assertDM(request, (server as any).dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
    try {
      await fs.mkdir(campaignsDir, { recursive: true });
      const dirs = await fs.readdir(campaignsDir);
      const campaigns = [];
      for (const dirName of dirs) {
        if (!dirName.startsWith("cmp_")) continue;
        
        const dirPath = join(campaignsDir, dirName);
        let hasEvents = false;
        let hasSnapshot = false;
        try {
          const sEvents = await fs.stat(join(dirPath, "events.ndjson"));
          hasEvents = sEvents.isFile();
        } catch {}
        try {
          const sSnapshot = await fs.stat(join(dirPath, "snapshot.json"));
          hasSnapshot = sSnapshot.isFile();
        } catch {}

        if (!hasEvents && !hasSnapshot) {
          try {
            await fs.rm(dirPath, { recursive: true, force: true });
          } catch {}
          continue;
        }

        try {
          const snap = JSON.parse(await fs.readFile(join(campaignsDir, dirName, "snapshot.json"), "utf8"));
          const campaign = snap?.projection?.campaign ?? snap?.campaign;
          const entities = snap?.entities ?? snap?.projection?.entities ?? [];
          const sessions = snap?.sessions ?? snap?.projection?.sessions ?? [];

          const stats = {
            npcsCount: entities.filter((e: any) => !e.archived && e.entityType === "npc").length,
            locationsCount: entities.filter((e: any) => !e.archived && e.entityType === "location").length,
            questsCount: entities.filter((e: any) => !e.archived && e.entityType === "quest").length,
            secretsCount: entities.filter((e: any) => !e.archived && (e.entityType === "secret" || e.entityType === "clue")).length,
            activeSession: sessions.find((s: any) => s.status === "active")?.title || null,
            sessionsCount: sessions.length
          };

          if (campaign) {
            campaigns.push({
              ...campaign,
              campaignId: campaign.campaignId ?? dirName,
              title: campaign.title ?? dirName,
              archived: campaign.archived ?? false,
              stats,
            });
          } else {
            campaigns.push({ campaignId: dirName, title: dirName, archived: false, stats });
          }
        } catch {
          campaigns.push({ campaignId: dirName, title: dirName, archived: false });
        }
      }
      return campaigns;
    } catch (err: any) {
      reply.code(500);
      return { error: `Failed to list campaigns: ${err?.message ?? "unknown error"}` };
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
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "CreateCampaign",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          title,
          system: system || "generic_fantasy_d20",
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
        });

        // Automatically create default world canvas
        const canvasId = createId("cvs");
        await repo.executeCommand(campaignId as any, {
          type: "CreateCanvas",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          canvasId,
          title: "Campaña",
          kind: "world",
        });

        reply.code(201);
        return { campaignId, title };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Delete Campaign
  server.delete<{ Params: { campaignId: string }; Body: { confirmTitle?: string } }>(
    "/api/campaigns/:campaignId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const confirmation = request.body?.confirmTitle?.trim();

      try {
        const campaignDir = getCampaignDir(campaignId, vaultId);
        let exists = false;
        try {
          const stats = await fs.stat(campaignDir);
          exists = stats.isDirectory();
        } catch {}

        if (!exists) {
          reply.code(404);
          return { error: "Campaign not found" };
        }

        const state = await getRepository(vaultId).getCampaignState(campaignId as any);
        const title = state.campaign?.title || campaignId;

        if (confirmation !== title) {
          reply.code(400);
          return { error: "Campaign title confirmation does not match" };
        }

        await fs.rm(campaignDir, { recursive: true, force: true });
        (server as any).activeAccessCodes.delete(campaignId);

        return { ok: true, campaignId };
      } catch (err: any) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: `Failed to delete campaign: ${err.message}` };
      }
    }
  );

  // Get Campaign Details
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      let playerId = request.headers["x-player-id"] as string | undefined;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        let role = getRequestRoleWithTokens(
          request,
          (server as any).dmSessionToken,
          (server as any).playerTokens,
          campaignId
        );

        // If authenticated via player token, derive playerId from token session
        // to prevent a player from spoofing another player's x-player-id header
        if (role === "player") {
          const playerToken = request.headers["x-player-token"] as string;
          const tokenSession = (server as any).playerTokens?.get(playerToken);
          if (tokenSession?.playerId) {
            playerId = tokenSession.playerId;
          }
        }

        if (role === "unauthenticated") {
          // Fall back to old access-code-based check for non-token requests
          role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken) as any;
        } else if (role !== "dm") {
          // Player authenticated via token — verify LAN mode is still enabled
          if (!state?.campaign?.settings?.lanModeEnabled) {
            const err = new Error("Forbidden: LAN Mode is disabled for this campaign");
            (err as any).statusCode = 403;
            throw err;
          }
        }

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
          canvases: role === "dm"
            ? Array.from(state.canvases?.values() || []).filter((c: any) => !c.archived)
            : [],
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

  // LAN Join — exchange access code for player token
  server.post<{ Params: { campaignId: string }; Body: { accessCode: string; playerId?: string } }>(
    "/api/join/:campaignId",
    async (request, reply) => {
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { accessCode, playerId } = request.body;
      const vaultId = getValidatedVaultId(request);

      if (!accessCode) {
        reply.code(400);
        return { error: "accessCode is required" };
      }

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId as any);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled for this campaign" };
        }

        const hash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;

        const isValid =
          (hash && hashAccessCode(accessCode) === hash) ||
          (legacyCode && accessCode === legacyCode);

        if (!isValid) {
          reply.code(401);
          return { error: "Invalid access code" };
        }

        // Issue player token
        const playerToken = randomBytes(24).toString("hex");
        const pid = playerId ?? `ply_${randomBytes(8).toString("hex")}`;
        (server as any).playerTokens.set(playerToken, { campaignId, playerId: pid });

        return {
          playerToken,
          playerId: pid,
          campaignTitle: state.campaign.title,
        };
      } catch (err: any) {
        if (err.statusCode) { reply.code(err.statusCode); return { error: err.message }; }
        reply.code(404);
        return { error: "Campaign not found" };
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
