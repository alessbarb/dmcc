import type { FastifyInstance } from "fastify";
import { join } from "path";
import * as fs from "fs/promises";
import { randomInt, randomBytes } from "crypto";
import { createId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import {
  assertDM,
  assertCampaignAccess,
  getRequestRoleWithTokens,
  getValidatedVaultId,
  getValidatedCampaignId,
  hashAccessCode,
  hashPlayerToken,
  generatePlayerToken,
} from "../auth.js";
import {
  getCharacterEntityIdForPlayer,
  getVisibleEntities,
  getVisibleRelations,
  getVisibleFacts,
  getVisibleSessions,
  assertWithinDir,
} from "../helpers.js";
import { createCampaignBackup } from "../hardening/backups.js";

export async function registerCampaignRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getCampaignDir(campaignId: string, vaultId = "default") {
    return join(dataDir, "vaults", vaultId, "campaigns", campaignId);
  }

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  async function getPersistentTokenSession(
    repo: CampaignRepository,
    state: any,
    campaignId: string,
    rawToken: string | undefined
  ): Promise<{ campaignId: string; playerId: string } | null> {
    if (!rawToken) return null;
    const events = await repo.loadEvents(campaignId as any);
    const portal = buildPlayerPortalProjection(state, events as any);
    const token = portal.tokensByHash.get(hashPlayerToken(rawToken));
    if (!token || token.revokedAt || token.campaignId !== campaignId) return null;
    return { campaignId, playerId: token.playerId };
  }

  function generateLanAccessCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, "0");
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
            secretsCount: entities.filter((e: any) => !e.archived && e.entityType === "secret").length,
            cluesCount: entities.filter((e: any) => !e.archived && e.entityType === "clue").length,
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

        const autoBackup = await createCampaignBackup({
          dataDir,
          vaultId,
          campaignId,
          reason: "auto-before-delete",
          description: `Auto-backup before deleting campaign ${title}`,
        });

        const deletedDir = join(dataDir, "vaults", vaultId, "deleted-campaigns");
        await fs.mkdir(deletedDir, { recursive: true });
        const deletedPath = join(
          deletedDir,
          `${new Date().toISOString().replace(/[:.]/g, "-")}_${campaignId}`,
        );
        assertWithinDir(deletedPath, deletedDir);
        await fs.rename(campaignDir, deletedPath);
        (server as any).activeAccessCodes.delete(campaignId);

        return { ok: true, campaignId, deletedPath, autoBackup };
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
        // to prevent a player from spoofing another player's x-player-id header.
        // First use active in-memory LAN sessions, then fall back to persisted portal tokens.
        const playerToken = request.headers["x-player-token"] as string | undefined;
        let tokenSession = playerToken ? (server as any).playerTokens?.get(playerToken) : null;
        if (!tokenSession && playerToken) {
          tokenSession = await getPersistentTokenSession(repo, state, campaignId, playerToken);
          if (tokenSession) {
            (server as any).playerTokens?.set(playerToken, tokenSession);
            role = "player";
          }
        }
        if (role === "player" && tokenSession?.playerId) {
          playerId = tokenSession.playerId;
        }

        if (role === "unauthenticated") {
          // Fall back to old access-code-based check for non-token requests.
          // A presented but invalid player token must fail closed instead of falling back.
          if (playerToken) {
            const err = new Error("Unauthorized: Invalid player token");
            (err as any).statusCode = 401;
            throw err;
          }
          role = assertCampaignAccess(request, state, campaignId, (server as any).dmSessionToken) as any;
        }

        if (role === "player" && !state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled for this campaign" };
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
          sessionEvents: role === "dm" ? Array.from(state.sessionEvents?.values() || []) : [],
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

  // LAN toggle — explicit local-network sharing switch for player access.
  server.post<{ Params: { campaignId: string }; Body: { enabled?: boolean } }>(
    "/api/campaigns/:campaignId/lan/toggle",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const enabled = Boolean(request.body?.enabled);

      try {
        const repo = getRepository(vaultId);
        await repo.getCampaignState(campaignId as any);

        if (!enabled) {
          (server as any).activeAccessCodes.delete(campaignId);
          await repo.executeCommand(campaignId as any, {
            type: "UpdateCampaignSettings",
            campaignId: campaignId as any,
            actorId: "usr_dm",
            settings: {
              lanModeEnabled: false,
              localAccessCodeHash: undefined,
              localAccessCode: undefined,
            },
          });
          return { ok: true, lanModeEnabled: false, accessCode: null };
        }

        const accessCode = generateLanAccessCode();
        (server as any).activeAccessCodes.set(campaignId, accessCode);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateCampaignSettings",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          settings: {
            lanModeEnabled: true,
            localAccessCodeHash: hashAccessCode(accessCode),
            localAccessCode: undefined,
          },
        });

        return { ok: true, lanModeEnabled: true, accessCode };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // LAN Join — exchange access code for player token
  server.post<{ Params: { campaignId: string }; Body: { accessCode: string; playerId?: string; displayName?: string } }>(
    "/api/join/:campaignId",
    async (request, reply) => {
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { accessCode, playerId, displayName } = request.body;
      const vaultId = getValidatedVaultId(request);

      if (!accessCode) {
        reply.code(400);
        return { error: "accessCode is required" };
      }

      try {
        const repo = getRepository(vaultId);
        let state = await repo.getCampaignState(campaignId as any);

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

        const pid = playerId ?? `ply_${randomBytes(8).toString("hex")}`;
        if (!state.players.has(pid as any)) {
          await repo.executeCommand(campaignId as any, {
            type: "CreatePlayerProfile",
            campaignId: campaignId as any,
            actorId: "usr_dm",
            playerId: pid,
            displayName: displayName?.trim() || "Player",
            role: "player",
            color: "#3b82f6",
            imageUrl: "",
          });
          state = await repo.getCampaignState(campaignId as any);
        }

        const playerToken = randomBytes(24).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId as any, {
          type: "IssuePlayerToken",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          playerId: pid,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "LAN join",
          createdAt: new Date().toISOString(),
        });

        (server as any).playerTokens.set(playerToken, { campaignId, playerId: pid });

        return {
          playerToken,
          playerId: pid,
          tokenId,
          campaignTitle: state.campaign.title,
        };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // List player invitations (DM only)
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/invitations",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);
        const invitations = Array.from(
          (state.invitations instanceof Map ? state.invitations : new Map()).values()
        ).map(({ inviteTokenHash: _hash, ...rest }) => rest); // strip token hash from response
        return { invitations };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Create player invitation (DM only)
  server.post<{ Params: { campaignId: string }; Body: { label?: string; expiresInHours?: number } }>(
    "/api/campaigns/:campaignId/invitations",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { label, expiresInHours } = request.body ?? {};

      try {
        const repo = getRepository(vaultId);
        await repo.getCampaignState(campaignId as any);

        const inviteToken = randomBytes(18).toString("base64url"); // ~24 char URL-safe
        const inviteId = `inv_${randomBytes(8).toString("hex")}`;
        const inviteTokenHash = hashPlayerToken(inviteToken);
        const now = new Date().toISOString();
        const expiresAt = expiresInHours
          ? new Date(Date.now() + expiresInHours * 3600_000).toISOString()
          : undefined;

        await repo.executeCommand(campaignId as any, {
          type: "CreatePlayerInvitation",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          inviteId,
          inviteTokenHash,
          label: label?.trim() || undefined,
          createdAt: now,
          expiresAt,
        });

        const { networkInterfaces } = await import("os");
        let localIp = "127.0.0.1";
        try {
          const nets = networkInterfaces();
          for (const name of Object.keys(nets)) {
            for (const net of (nets[name] || [])) {
              if (net.family === "IPv4" && !net.internal) { localIp = net.address; break; }
            }
          }
        } catch { /* ignore */ }

        const port = (server as any).server?.address?.()?.port ?? 4877;
        const registerUrl = `http://${localIp}:${port}/register/${campaignId}/${inviteToken}`;

        return { ok: true, inviteId, inviteToken, registerUrl, expiresAt };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Revoke player invitation (DM only)
  server.delete<{ Params: { campaignId: string; inviteId: string } }>(
    "/api/campaigns/:campaignId/invitations/:inviteId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "RevokePlayerInvitation",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          inviteId: request.params.inviteId,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Player registration — consume invite token, create profile, issue session token
  server.post<{
    Params: { campaignId: string };
    Body: {
      inviteToken: string;
      displayName: string;
      email: string;
      characterChoice: { kind: "premade"; entityId: string } | { kind: "new"; name: string; characterClass?: string; race?: string } | null;
    };
  }>(
    "/api/campaigns/:campaignId/register",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { inviteToken, displayName, email, characterChoice } = request.body;

      if (!inviteToken || !displayName?.trim() || !email?.trim()) {
        reply.code(400);
        return { error: "inviteToken, displayName and email are required" };
      }

      const emailNormalized = email.trim().toLowerCase();
      const emailHash = hashPlayerToken(emailNormalized);
      const inviteTokenHash = hashPlayerToken(inviteToken);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        // Find the matching pending invitation
        const invitations: Map<string, any> = state.invitations instanceof Map
          ? state.invitations
          : new Map();

        let matchedInvite: any = null;
        for (const [, inv] of invitations) {
          if (inv.inviteTokenHash === inviteTokenHash && inv.status === "pending") {
            matchedInvite = inv;
            break;
          }
        }

        if (!matchedInvite) {
          reply.code(404);
          return { error: "Invalid or already-used invitation link" };
        }

        if (matchedInvite.expiresAt && new Date(matchedInvite.expiresAt) < new Date()) {
          reply.code(410);
          return { error: "Invitation has expired" };
        }

        // Check if this email already has a player profile in this campaign
        let playerId: string | null = null;
        const players: Map<string, any> = state.players instanceof Map ? state.players : new Map();
        for (const [pid, player] of players) {
          if (
            (player.emailHash === emailHash ||
              (player.email && player.email.toLowerCase() === emailNormalized)) &&
            !player.archived
          ) {
            playerId = pid;
            break;
          }
        }

        const now = new Date().toISOString();

        if (!playerId) {
          playerId = `ply_${randomBytes(8).toString("hex")}`;
          await repo.executeCommand(campaignId as any, {
            type: "CreatePlayerProfile",
            campaignId: campaignId as any,
            actorId: playerId,
            playerId,
            displayName: displayName.trim(),
            emailHash,
            role: "player",
            color: "#3b82f6",
          });
        }

        // Mark invitation consumed
        await repo.executeCommand(campaignId as any, {
          type: "ConsumePlayerInvitation",
          campaignId: campaignId as any,
          actorId: playerId,
          inviteId: matchedInvite.inviteId,
          playerId,
          emailHash,
          consumedAt: now,
        });

        // Handle character choice
        if (characterChoice?.kind === "new" && characterChoice.name?.trim()) {
          const newEntityId = createId("ent");
          await repo.executeCommand(campaignId as any, {
            type: "CreateEntity",
            campaignId: campaignId as any,
            actorId: playerId,
            entityId: newEntityId,
            entityType: "player_character",
            title: characterChoice.name.trim(),
            status: "active",
            importance: "high",
            visibility: { kind: "party" },
            metadata: {
              playerId,
              class: characterChoice.characterClass ?? "",
              race: characterChoice.race ?? "",
            },
          });
        } else if (characterChoice?.kind === "premade" && characterChoice.entityId) {
          await repo.executeCommand(campaignId as any, {
            type: "LinkPlayerCharacter",
            campaignId: campaignId as any,
            actorId: "usr_dm",
            playerId,
            characterEntityId: characterChoice.entityId,
            ownership: "campaign_premade",
            syncMode: "live_player_editable",
            createdAt: now,
          });
        }

        // Issue session token
        const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId as any, {
          type: "IssuePlayerToken",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          playerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "registration",
          createdAt: now,
        });

        (server as any).playerTokens.set(playerToken, { campaignId, playerId });

        return {
          playerToken,
          playerId,
          tokenId,
          campaignId,
          campaignTitle: state.campaign?.title,
        };
      } catch (err: any) {
        if (err.statusCode) { reply.code(err.statusCode); return { error: err.message }; }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Rejoin by email + campaign access code (cross-device token re-issue)
  server.post<{ Params: { campaignId: string }; Body: { email: string; accessCode: string } }>(
    "/api/campaigns/:campaignId/rejoin",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { email, accessCode } = request.body;

      if (!email?.trim() || !accessCode?.trim()) {
        reply.code(400);
        return { error: "email and accessCode are required" };
      }

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled" };
        }

        const codeHash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;
        const isValidCode =
          (codeHash && hashAccessCode(accessCode) === codeHash) ||
          (legacyCode && accessCode === legacyCode);

        if (!isValidCode) {
          reply.code(401);
          return { error: "Invalid campaign access code" };
        }

        const emailNormalized = email.trim().toLowerCase();
        const emailHash = hashPlayerToken(emailNormalized);

        // Find player by emailHash
        let matchedPlayerId: string | null = null;
        for (const [pid, player] of state.players) {
          if (
            (player.emailHash === emailHash ||
              (player.email && player.email.toLowerCase() === emailNormalized)) &&
            !player.archived
          ) {
            matchedPlayerId = pid;
            break;
          }
        }

        if (!matchedPlayerId) {
          reply.code(404);
          return { error: "No player found with this email in this campaign. Ask the DM to send you a new invitation." };
        }

        const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        const now = new Date().toISOString();

        await repo.executeCommand(campaignId as any, {
          type: "IssuePlayerToken",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          playerId: matchedPlayerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "rejoin",
          createdAt: now,
        });

        (server as any).playerTokens.set(playerToken, { campaignId, playerId: matchedPlayerId });

        return {
          playerToken,
          playerId: matchedPlayerId,
          tokenId,
          campaignTitle: state.campaign?.title,
        };
      } catch (err: any) {
        if (err.statusCode) { reply.code(err.statusCode); return { error: err.message }; }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // GET /api/network-info — returns local network address (no auth required, info only)
  server.get("/api/network-info", async () => {
    const { networkInterfaces } = await import("os");
    let localIp = "127.0.0.1";
    try {
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of (nets[name] || [])) {
          if (net.family === "IPv4" && !net.internal) { localIp = net.address; break; }
        }
      }
    } catch { /* ignore */ }
    const port = (server as any).server?.address?.()?.port ?? 4877;
    return { localIp, port, url: `http://${localIp}:${port}` };
  });
}
