import type { FastifyInstance } from "fastify";
import type { AddressInfo } from "net";
import { join } from "path";
import * as fs from "fs/promises";
import { randomInt, randomBytes } from "crypto";
import { createId } from "@shared/ids.js";
import type { CampaignId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import {
  assertDM,
  assertCampaignAccess,
  getRequestDmId,
  getRequestRoleWithTokens,
  getRequestPlayerId,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
  hashCampaignAccessCode,
  hashPlayerToken,
  generatePlayerToken,
} from "../auth.js";
import {
  getCharacterEntityIdForPlayer,
  getVisibleEntities,
  getVisibleRelations,
  getVisibleFacts,
  getVisibleSessions,
  toPublicCampaign,
  assertWithinDir,
} from "../helpers.js";
import { createCampaignBackup } from "../hardening/backups.js";
import { copyCampaignAcl, ensureCampaignOwner, listCampaignIdsForDmSync, removeCampaignAcl } from "../campaignAclStore.js";
import { addCampaignMembership, getVaultAccessCodePepper } from "../userAuthStore.js";

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
    const events = await repo.loadEvents(campaignId);
    const portal = buildPlayerPortalProjection(state, events);
    const token = portal.tokensByHash.get(hashPlayerToken(rawToken));
    if (!token || token.revokedAt || token.campaignId !== campaignId) return null;
    return { campaignId, playerId: token.playerId };
  }

  function generateLanAccessCode(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 10 }, () => alphabet[randomInt(0, alphabet.length)]).join("");
  }

  // Health
  server.get("/api/health", async () => ({ ok: true, app: "dm-campaign-companion" }));

  // List Campaigns
  server.get("/api/campaigns", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const vaultId = getValidatedVaultId(request);
    const dmId = getRequestDmId(request, server.dmSessionToken);
    const allowedCampaignIds = dmId ? listCampaignIdsForDmSync(dataDir, vaultId, dmId) : new Set<string>();
    const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
    try {
      await fs.mkdir(campaignsDir, { recursive: true });
      const dirs = await fs.readdir(campaignsDir);
      const campaigns = [];
      for (const dirName of dirs) {
        if (!dirName.startsWith("cmp_")) continue;
        if (allowedCampaignIds && !allowedCampaignIds.has(dirName)) continue;
        
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const dmId = getRequestDmId(request, server.dmSessionToken) ?? "usr_dm";
      const campaignId = getValidatedCampaignId(request.body.campaignId);
      const { title, system } = request.body;
      const commandActorId = dmId;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "CreateCampaign",
          campaignId: campaignId,
          actorId: commandActorId,
          title,
          system: system || "generic_fantasy_d20",
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
        });

        // Automatically create default world canvas
        const canvasId = createId("cvs");
        await repo.executeCommand(campaignId, {
          type: "CreateCanvas",
          campaignId: campaignId,
          actorId: commandActorId,
          canvasId,
          title: "Campaña",
          kind: "world",
        });

        await ensureCampaignOwner(dataDir, vaultId, campaignId, dmId);
        if ((request as any).unifiedUser) {
          await addCampaignMembership(join(dataDir, "vaults", vaultId), {
            campaignId,
            userId: dmId,
            role: "dm",
          });
        }

        reply.code(201);
        return { campaignId, title };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Update Campaign Basics
  server.patch<{ Params: { campaignId: string }; Body: Partial<{ title: string; summary: string; system: string; status: string; metadata: Record<string, unknown> }> }>(
    "/api/campaigns/:campaignId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const dmId = getRequestDmId(request, server.dmSessionToken) ?? "usr_dm";
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      const title = typeof request.body?.title === "string" ? request.body.title.trim() : undefined;
      if (request.body?.title !== undefined && !title) {
        reply.code(400);
        return { error: "Campaign title is required" };
      }

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "UpdateCampaign",
          campaignId,
          actorId: dmId,
          ...(title !== undefined && { title }),
          ...(request.body?.summary !== undefined && { summary: request.body.summary }),
          ...(request.body?.system !== undefined && { system: request.body.system }),
          ...(request.body?.status !== undefined && { status: request.body.status }),
          ...(request.body?.metadata !== undefined && { metadata: request.body.metadata }),
        });
        const state = await getRepository(vaultId).getCampaignState(campaignId);
        return { ok: true, campaign: state.campaign };
      } catch (err: any) {
        if (err.statusCode === 401 || err.statusCode === 403) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: `Failed to update campaign: ${err.message}` };
      }
    }
  );

  // Delete Campaign
  server.delete<{ Params: { campaignId: string }; Body: { confirmTitle?: string } }>(
    "/api/campaigns/:campaignId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
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

        const state = await getRepository(vaultId).getCampaignState(campaignId);
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
        server.activeAccessCodes.delete(campaignId);
        await removeCampaignAcl(dataDir, vaultId, campaignId);

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
      let playerId = getRequestPlayerId(request);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        let role = getRequestRoleWithTokens(
          request,
          server.dmSessionToken,
          server.playerTokens,
          campaignId,
          dataDir,
          vaultId
        );

        // If authenticated via player token, derive playerId from token session
        // to prevent a player from spoofing another player's x-player-id header.
        // First use active in-memory LAN sessions, then fall back to persisted portal tokens.
        const playerToken = request.headers["x-player-token"] as string | undefined;
        let tokenSession = playerToken ? server.playerTokens?.get(playerToken) : null;
        if (!tokenSession && playerToken) {
          tokenSession = await getPersistentTokenSession(repo, state, campaignId, playerToken);
          if (tokenSession) {
            server.playerTokens?.set(playerToken, tokenSession);
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
            throw Object.assign(new Error("Unauthorized: Invalid player token"), { statusCode: 401 });
          }
          role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId) as "dm" | "player" | "observer";
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
          campaign: role === "dm" ? state.campaign : toPublicCampaign(state.campaign),
          entities: visibleEntities,
          relations: getVisibleRelations(
            Array.from(state.relations.values()),
            visibleEntityIds,
            role,
            playerId,
            characterEntityId
          ),
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const dmId = getRequestDmId(request, server.dmSessionToken) ?? "usr_dm";
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { newTitle } = request.body;

      if (!newTitle || newTitle.trim() === "") {
        reply.code(400);
        return { error: "New campaign title is required" };
      }

      const newCampaignId = `cmp_${createId("cmp").split("_")[1]}`;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(newCampaignId as CampaignId, {
          type: "DuplicateCampaign",
          sourceCampaignId: campaignId as CampaignId,
          newCampaignId: newCampaignId as CampaignId,
          newTitle,
          actorId: dmId,
        });
        await copyCampaignAcl(dataDir, vaultId, campaignId, newCampaignId, dmId);
        reply.code(201);
        return { campaignId: newCampaignId, title: newTitle };
      } catch (err: any) {
        if (err.message?.includes("Source campaign not found")) {
          reply.code(404);
          return { error: "Source campaign not found" };
        }
        reply.code(500);
        return { error: `Duplication failed: ${err.message}` };
      }
    }
  );

  // Rebuild Snapshot
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/rebuild",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        await getRepository(vaultId).rebuildSnapshot(campaignId);
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: `Rebuild failed: ${err.message}` };
      }
    }
  );

  // Settings
  server.put<{ Params: { campaignId: string }; Body: Partial<{ backupOnClose: boolean; lanModeEnabled: boolean; activeQuestsLimit: number; localAccessCodeHash?: string; localAccessCode?: string }> }>(
    "/api/campaigns/:campaignId/settings",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "UpdateCampaignSettings",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          settings: request.body,
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const enabled = Boolean(request.body?.enabled);

      try {
        const repo = getRepository(vaultId);
        await repo.getCampaignState(campaignId);

        if (!enabled) {
          server.activeAccessCodes.delete(campaignId);
          await repo.executeCommand(campaignId, {
            type: "UpdateCampaignSettings",
            campaignId: campaignId,
            actorId: getRequestActorId(request, server.dmSessionToken),
            settings: {
              lanModeEnabled: false,
              localAccessCodeHash: undefined,
              localAccessCode: undefined,
            },
          });
          return { ok: true, lanModeEnabled: false, accessCode: null };
        }

        const accessCode = generateLanAccessCode();
        const pepper = await getVaultAccessCodePepper(join(dataDir, "vaults", vaultId));
        server.activeAccessCodes.set(campaignId, accessCode);
        await repo.executeCommand(campaignId, {
          type: "UpdateCampaignSettings",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          settings: {
            lanModeEnabled: true,
            localAccessCodeHash: hashCampaignAccessCode(campaignId, accessCode, pepper),
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
    async (_request, reply) => {
      reply.code(410);
      return { error: "Legacy join has been retired; use /api/campaigns/:campaignId/join" };
      /*
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { accessCode, playerId, displayName } = request.body;
      const vaultId = getValidatedVaultId(request);

      if (playerId !== undefined) {
        reply.code(400);
        return { error: "playerId cannot be selected during join" };
      }

      if (!accessCode) {
        reply.code(400);
        return { error: "accessCode is required" };
      }

      try {
        const repo = getRepository(vaultId);
        let state = await repo.getCampaignState(campaignId);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled for this campaign" };
        }

        const hash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;
        const pepper = await getVaultAccessCodePepper(join(dataDir, "vaults", vaultId));

        const isValid =
          verifyCampaignAccessCode(campaignId, accessCode, hash, pepper) ||
          (legacyCode && accessCode === legacyCode);

        if (!isValid) {
          reply.code(401);
          return { error: "Invalid access code" };
        }

        const pid = `ply_${randomBytes(8).toString("hex")}`;
        if (!state.players.has(pid)) {
          await repo.executeCommand(campaignId, {
            type: "CreatePlayerProfile",
            campaignId: campaignId,
            actorId: getRequestActorId(request, server.dmSessionToken),
            playerId: pid,
            displayName: displayName?.trim() || "Player",
            role: "player",
            color: "#3b82f6",
            imageUrl: "",
          });
          state = await repo.getCampaignState(campaignId);
        }

        const playerToken = randomBytes(24).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId, {
          type: "IssuePlayerToken",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId: pid,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "LAN join",
          createdAt: new Date().toISOString(),
        });

        server.playerTokens.set(playerToken, { campaignId, playerId: pid });

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
      */
    }
  );

  // List player invitations (DM only)
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/invitations",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { label, expiresInHours } = request.body ?? {};

      try {
        const repo = getRepository(vaultId);
        await repo.getCampaignState(campaignId);

        const inviteToken = randomBytes(18).toString("base64url"); // ~24 char URL-safe
        const inviteId = `inv_${randomBytes(8).toString("hex")}`;
        const inviteTokenHash = hashPlayerToken(inviteToken);
        const now = new Date().toISOString();
        const expiresAt = expiresInHours
          ? new Date(Date.now() + expiresInHours * 3600_000).toISOString()
          : undefined;

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerInvitation",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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

        const port = (server.server.address() as AddressInfo | null)?.port ?? 4877;
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "RevokePlayerInvitation",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
      /**
       * Deprecated. Character selection now happens inside the player portal,
       * after the player profile and session token have been created.
       */
      characterChoice?: unknown;
    };
  }>(
    "/api/campaigns/:campaignId/register",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { inviteToken, displayName, email } = request.body;

      if (!inviteToken || !displayName?.trim() || !email?.trim()) {
        reply.code(400);
        return { error: "inviteToken, displayName and email are required" };
      }

      const emailNormalized = email.trim().toLowerCase();
      const emailHash = hashPlayerToken(emailNormalized);
      const inviteTokenHash = hashPlayerToken(inviteToken);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

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
          await repo.executeCommand(campaignId, {
            type: "CreatePlayerProfile",
            campaignId: campaignId,
            actorId: playerId,
            playerId,
            displayName: displayName.trim(),
            emailHash,
            role: "player",
            color: "#3b82f6",
          });
        }

        // Mark invitation consumed
        await repo.executeCommand(campaignId, {
          type: "ConsumePlayerInvitation",
          campaignId: campaignId,
          actorId: playerId,
          inviteId: matchedInvite.inviteId,
          playerId,
          emailHash,
          consumedAt: now,
        });

        // Character selection is intentionally not handled during registration.
        // The invite only creates/recovers the player profile and issues a session token.
        // Players choose an available premade character or propose a custom one from
        // the player portal, where the DM can review and approve the link/proposal.

        // Issue session token
        const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId, {
          type: "IssuePlayerToken",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "registration",
          createdAt: now,
        });

        server.playerTokens.set(playerToken, { campaignId, playerId });

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
    async (_request, reply) => {
      reply.code(410);
      return { error: "Legacy rejoin has been retired; sign in to your account" };
      /*
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { email, accessCode } = request.body;

      if (!email?.trim() || !accessCode?.trim()) {
        reply.code(400);
        return { error: "email and accessCode are required" };
      }

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled" };
        }

        const codeHash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;
        const pepper = await getVaultAccessCodePepper(join(dataDir, "vaults", vaultId));
        const isValidCode =
          verifyCampaignAccessCode(campaignId, accessCode, codeHash, pepper) ||
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

        await repo.executeCommand(campaignId, {
          type: "IssuePlayerToken",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          playerId: matchedPlayerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "rejoin",
          createdAt: now,
        });

        server.playerTokens.set(playerToken, { campaignId, playerId: matchedPlayerId });

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
      */
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
    const port = (server.server.address() as AddressInfo | null)?.port ?? 4877;
    return { localIp, port, url: `http://${localIp}:${port}` };
  });
}
