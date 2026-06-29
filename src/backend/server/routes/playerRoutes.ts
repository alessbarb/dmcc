import type { FastifyInstance } from "fastify";
import { randomBytes } from "crypto";
import { join } from "path";
import { readdir } from "fs/promises";
import { createId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import {
  assertDM,
  assertCampaignAccess,
  getValidatedVaultId,
  getValidatedCampaignId,
  generatePlayerToken,
  hashPlayerToken,
} from "../auth.js";

type CreatePlayerBody = {
  displayName?: string;
  name?: string;
  id?: string;
  playerId?: string;
  email?: string;
  role?: string;
  color?: string;
  imageUrl?: string;
};

type UpdatePlayerBody = {
  displayName?: string;
  imageUrl?: string;
  role?: string;
  color?: string;
  isActive?: boolean;
};

type PlayerRejoinMatch = {
  campaignId: string;
  campaignTitle: string;
  playerId: string;
  displayName: string;
  characterEntityId?: string;
  characterName?: string;
  hasLinkedCharacter: boolean;
  lastActiveAt?: string;
};

type PlayerRejoinLookupBody = {
  email?: string;
};

type PlayerRejoinBody = {
  email?: string;
  campaignId?: string;
  playerId?: string;
};

export async function registerPlayerRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  function normalizeEmail(email?: string): string | null {
    const normalized = email?.trim().toLowerCase();
    return normalized || null;
  }

  function playerMatchesEmail(player: any, emailNormalized: string, emailHash: string): boolean {
    return (
      player?.emailHash === emailHash ||
      (typeof player?.email === "string" && player.email.trim().toLowerCase() === emailNormalized)
    );
  }

  async function findPlayerRejoinMatches(vaultId: string, emailNormalized: string): Promise<PlayerRejoinMatch[]> {
    const repo = getRepository(vaultId);
    const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
    const emailHash = hashPlayerToken(emailNormalized);
    const matches: PlayerRejoinMatch[] = [];

    let campaignIds: string[] = [];
    try {
      campaignIds = await readdir(campaignsDir);
    } catch {
      return matches;
    }

    for (const rawCampaignId of campaignIds.filter((id) => id.startsWith("cmp_"))) {
      let campaignId: string;
      try {
        campaignId = getValidatedCampaignId(rawCampaignId);
      } catch {
        continue;
      }

      try {
        const state = await repo.getCampaignState(campaignId);
        if (!state.campaign || (state.campaign as any).archived) continue;

        const events = await repo.loadEvents(campaignId);
        const portal = buildPlayerPortalProjection(state, events);
        const players: Map<string, any> = state.players instanceof Map ? state.players : new Map();
        const entities: Map<string, any> = state.entities instanceof Map ? state.entities : new Map();

        for (const [playerId, player] of players) {
          if (player.archived || player.isActive === false) continue;
          if (!playerMatchesEmail(player, emailNormalized, emailHash)) continue;

          const link = portal.linksByPlayerId.get(playerId);
          const character = link ? entities.get(link.characterEntityId) : undefined;

          matches.push({
            campaignId,
            campaignTitle: state.campaign.title ?? campaignId,
            playerId,
            displayName: player.displayName ?? player.name ?? playerId,
            characterEntityId: link?.characterEntityId,
            characterName: character?.title,
            hasLinkedCharacter: Boolean(link?.characterEntityId),
            lastActiveAt: player.updatedAt ?? player.createdAt,
          });
        }
      } catch {
        // A broken or half-created campaign should not block rejoin lookup for other campaigns.
        continue;
      }
    }

    return matches.sort((a, b) => {
      const byCampaign = a.campaignTitle.localeCompare(b.campaignTitle);
      if (byCampaign !== 0) return byCampaign;
      return a.displayName.localeCompare(b.displayName);
    });
  }

  async function issueRejoinToken(vaultId: string, match: PlayerRejoinMatch): Promise<{ playerToken: string; tokenId: string }> {
    const repo = getRepository(vaultId);
    const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
    const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
    const now = new Date().toISOString();

    await repo.executeCommand(match.campaignId, {
      type: "IssuePlayerToken",
      campaignId: match.campaignId,
      actorId: match.playerId,
      playerId: match.playerId,
      tokenId,
      tokenHash: hashPlayerToken(playerToken),
      label: "email_rejoin",
      createdAt: now,
    });

    server.playerTokens.set(playerToken, { campaignId: match.campaignId, playerId: match.playerId });
    return { playerToken, tokenId };
  }

  server.post<{ Body: PlayerRejoinLookupBody }>(
    "/api/player/rejoin/lookup",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const emailNormalized = normalizeEmail(request.body?.email);

      if (!emailNormalized) {
        reply.code(400);
        return { error: "email is required" };
      }

      try {
        const matches = await findPlayerRejoinMatches(vaultId, emailNormalized);
        return { matches };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.post<{ Body: PlayerRejoinBody }>(
    "/api/player/rejoin",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const emailNormalized = normalizeEmail(request.body?.email);
      const rawCampaignId = request.body?.campaignId?.trim();
      const playerId = request.body?.playerId?.trim();

      if (!emailNormalized || !rawCampaignId || !playerId) {
        reply.code(400);
        return { error: "email, campaignId and playerId are required" };
      }

      let campaignId: string;
      try {
        campaignId = getValidatedCampaignId(rawCampaignId);
      } catch (err: any) {
        reply.code(err.statusCode ?? 400);
        return { error: err.message };
      }

      try {
        const matches = await findPlayerRejoinMatches(vaultId, emailNormalized);
        const match = matches.find((item) => item.campaignId === campaignId && item.playerId === playerId);

        if (!match) {
          reply.code(404);
          return { error: "No active player found for this email and campaign" };
        }

        const { playerToken, tokenId } = await issueRejoinToken(vaultId, match);

        return {
          playerToken,
          tokenId,
          campaignId: match.campaignId,
          campaignTitle: match.campaignTitle,
          playerId: match.playerId,
          displayName: match.displayName,
          characterName: match.characterName,
        };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.post<{ Params: { campaignId: string }; Body: CreatePlayerBody }>(
    "/api/campaigns/:campaignId/players",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body;

      const displayName = body.displayName || body.name;
      if (!displayName || displayName.trim() === "") {
        reply.code(400);
        return { error: "Player name is required" };
      }

      const playerId = body.id || body.playerId || `ply_${createId("ply").split("_")[1]}`;
      const emailNormalized = typeof body.email === "string" && body.email.trim()
        ? body.email.trim().toLowerCase()
        : null;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        assertCampaignAccess(request, state, campaignId, server.dmSessionToken);

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerProfile",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId,
          name: displayName,
          displayName,
          emailHash: emailNormalized ? hashPlayerToken(emailNormalized) : undefined,
          role: body.role || "player",
          color: body.color || "#3b82f6",
          imageUrl: body.imageUrl || "",
        });

        reply.code(201);
        return {
          id: playerId,
          playerId,
          campaignId,
          displayName,
          role: body.role || "player",
          color: body.color || "#3b82f6",
          imageUrl: body.imageUrl || "",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/players",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken);
        const playerId = request.headers["x-player-id"] as string | undefined;
        const players = Array.from(state.players.values()).filter((p: any) => !p.archived);

        if (role === "dm") {
          return players;
        }

        if (!playerId) {
          reply.code(401);
          return { error: "Unauthorized: Player id is required" };
        }

        return players.filter((p: any) => p.playerId === playerId);
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  const handleEditPlayer = async (request: any, reply: any) => {
    const vaultId = getValidatedVaultId(request);
    const campaignId = getValidatedCampaignId(request.params.campaignId);
    const playerId = request.params.playerId;
    const updates = request.body;
    const headerPlayerId = request.headers["x-player-id"] as string;

    try {
      const repo = getRepository(vaultId);
      const state = await repo.getCampaignState(campaignId);

      const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken);

      if (role !== "dm" && playerId !== headerPlayerId) {
        reply.code(403);
        return { error: "Forbidden: Players can only edit their own profile" };
      }

      const existing = state.players.get(playerId);
      if (!existing) {
        reply.code(404);
        return { error: "Player profile not found" };
      }

      await repo.executeCommand(campaignId, {
        type: "UpdatePlayerProfile",
        campaignId: campaignId,
        actorId: role === "player" ? headerPlayerId : "usr_dm",
        playerId,
        displayName: updates.displayName,
        imageUrl: updates.imageUrl,
        role: updates.role,
        color: updates.color,
        isActive: updates.isActive,
      });

      return {
        id: playerId,
        playerId,
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.statusCode) {
        reply.code(err.statusCode);
        return { error: err.message };
      }
      reply.code(500);
      return { error: err.message };
    }
  };

  server.put<{ Params: { campaignId: string; playerId: string }; Body: UpdatePlayerBody }>(
    "/api/campaigns/:campaignId/players/:playerId",
    handleEditPlayer
  );
  server.patch<{ Params: { campaignId: string; playerId: string }; Body: UpdatePlayerBody }>(
    "/api/campaigns/:campaignId/players/:playerId",
    handleEditPlayer
  );

  server.delete<{ Params: { campaignId: string; playerId: string } }>(
    "/api/campaigns/:campaignId/players/:playerId",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const playerId = request.params.playerId;

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken);

        if (role !== "dm") {
          reply.code(403);
          return { error: "Forbidden: Only DMs can archive players" };
        }

        await repo.executeCommand(campaignId, {
          type: "ArchivePlayerProfile",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId,
        });

        return { ok: true };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.post<{ Params: { campaignId: string; playerId: string }; Body: { label?: string } }>(
    "/api/campaigns/:campaignId/players/:playerId/token",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { playerId } = request.params;

      try {
        const repo = getRepository(vaultId);
        const rawToken = generatePlayerToken();
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;

        await repo.executeCommand(campaignId, {
          type: "IssuePlayerToken",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId,
          tokenId,
          tokenHash: hashPlayerToken(rawToken),
          label: request.body?.label,
          createdAt: new Date().toISOString(),
        });

        return { tokenId, token: rawToken };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.delete<{ Params: { campaignId: string; playerId: string; tokenId: string } }>(
    "/api/campaigns/:campaignId/players/:playerId/token/:tokenId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { playerId, tokenId } = request.params;

      try {
        const repo = getRepository(vaultId);

        await repo.executeCommand(campaignId, {
          type: "RevokePlayerToken",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId,
          tokenId,
          revokedAt: new Date().toISOString(),
        });

        return { ok: true };
      } catch (err: any) {
        if (err.statusCode) {
          reply.code(err.statusCode);
          return { error: err.message };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}
