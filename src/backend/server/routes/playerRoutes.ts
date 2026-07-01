import type { FastifyInstance } from "fastify";
import { randomBytes } from "crypto";
import { createId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import {
  assertDM,
  assertCampaignAccess,
  getRequestPlayerId,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
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

export async function registerPlayerRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post(
    "/api/player/rejoin/lookup",
    async (_request, reply) => {
      reply.code(410);
      return { error: "Legacy rejoin has been retired; sign in to your account" };
    }
  );

  server.post(
    "/api/player/rejoin",
    async (_request, reply) => {
      reply.code(410);
      return { error: "Legacy rejoin has been retired; sign in to your account" };
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

        assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);

        await repo.executeCommand(campaignId, {
          type: "CreatePlayerProfile",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);
        const playerId = getRequestPlayerId(request);
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
    const headerPlayerId = getRequestPlayerId(request);

    try {
      const repo = getRepository(vaultId);
      const state = await repo.getCampaignState(campaignId);

      const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);

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
        actorId: role === "player" ? headerPlayerId! : "usr_dm",
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

        const role = assertCampaignAccess(request, state, campaignId, server.dmSessionToken, dataDir, vaultId);

        if (role !== "dm") {
          reply.code(403);
          return { error: "Forbidden: Only DMs can archive players" };
        }

        await repo.executeCommand(campaignId, {
          type: "ArchivePlayerProfile",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
          actorId: getRequestActorId(request, server.dmSessionToken),
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
          actorId: getRequestActorId(request, server.dmSessionToken),
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
