import type { FastifyInstance, FastifyRequest } from "fastify";
import { join } from "node:path";
import {
  addCampaignMembership,
  authenticateUser,
  createSession,
  getSessionUser,
  publicUser,
  registerUser,
  revokeSession,
  readUserAuthStore,
} from "../userAuthStore.js";
import { getValidatedCampaignId, getValidatedVaultId, hashAccessCode } from "../auth.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { randomBytes } from "node:crypto";

const COOKIE = "dmcc_session";

function readCookie(request: FastifyRequest): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function cookieValue(raw: string, secure: boolean): string {
  return `${COOKIE}=${encodeURIComponent(raw)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure ? "; Secure" : ""}`;
}

function expiredCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

function assertSameOrigin(request: FastifyRequest): void {
  const origin = request.headers.origin;
  if (!origin) return;
  const host = request.headers.host;
  try {
    if (!host || new URL(origin).host !== host) {
      throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
    }
  } catch (error: any) {
    if (error.statusCode === 403) throw error;
    throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
  }
}

export async function registerUserAuthRoutes(server: FastifyInstance, options: { dataDir: string }) {
  const vaultDirFor = (request: FastifyRequest) =>
    join(options.dataDir, "vaults", getValidatedVaultId(request));
  const repositoryFor = (request: FastifyRequest) => {
    const vaultId = getValidatedVaultId(request);
    return new CampaignRepository(
      new EventStore(options.dataDir, vaultId),
      new SnapshotStore(options.dataDir, vaultId)
    );
  };
  const requireUser = async (request: FastifyRequest) => {
    const resolved = await getSessionUser(vaultDirFor(request), readCookie(request));
    if (!resolved) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
    return resolved.user;
  };

  server.post<{ Body: { email: string; password: string; displayName?: string } }>(
    "/api/auth/register",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await registerUser(vaultDirFor(request), request.body);
        reply.code(201);
        return { ok: true, user: publicUser(user) };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to register account" };
      }
    }
  );

  server.post<{ Body: { email: string; password: string } }>("/api/auth/login", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const vaultDir = vaultDirFor(request);
      const user = await authenticateUser(vaultDir, request.body.email, request.body.password);
      if (!user) {
        reply.code(401);
        return { error: "Invalid email or password" };
      }
      const rawSessionId = await createSession(vaultDir, user.userId);
      reply.header("Set-Cookie", cookieValue(rawSessionId, request.protocol === "https"));
      return { ok: true, user: publicUser(user) };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to log in" };
    }
  });

  server.get("/api/auth/session", async (request, reply) => {
    const resolved = await getSessionUser(vaultDirFor(request), readCookie(request));
    if (!resolved) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    return { user: publicUser(resolved.user) };
  });

  server.post("/api/auth/logout", async (request, reply) => {
    try {
      assertSameOrigin(request);
      await revokeSession(vaultDirFor(request), readCookie(request));
      reply.header("Set-Cookie", expiredCookie());
      return { ok: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.message };
    }
  });

  server.post<{ Params: { campaignId: string }; Body: { accessCode?: string; playerId?: string } }>(
    "/api/campaigns/:campaignId/join",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        if (request.body?.playerId !== undefined) {
          reply.code(400);
          return { error: "playerId cannot be selected during join" };
        }
        const user = await requireUser(request);
        const campaignId = getValidatedCampaignId(request.params.campaignId);
        const repo = repositoryFor(request);
        let state = await repo.getCampaignState(campaignId);
        const accessCode = request.body?.accessCode ?? "";
        const valid =
          Boolean(state.campaign?.settings?.localAccessCodeHash) &&
          hashAccessCode(accessCode) === state.campaign.settings.localAccessCodeHash;
        const legacyValid =
          Boolean(state.campaign?.settings?.localAccessCode) &&
          accessCode === state.campaign.settings.localAccessCode;
        if (!state.campaign?.settings?.lanModeEnabled || (!valid && !legacyValid)) {
          reply.code(401);
          return { error: "Unable to join campaign" };
        }

        const playerId = `ply_${randomBytes(12).toString("hex")}`;
        await repo.executeCommand(campaignId, {
          type: "CreatePlayerProfile",
          campaignId,
          actorId: user.userId,
          playerId,
          displayName: user.displayName || "Player",
          emailHash: user.emailHash,
          role: "player",
          color: "#3b82f6",
        });
        state = await repo.getCampaignState(campaignId);
        const membership = await addCampaignMembership(vaultDirFor(request), {
          campaignId,
          userId: user.userId,
          role: "player",
          playerId,
        });
        reply.code(201);
        return { membership, campaign: { campaignId, title: state.campaign?.title } };
      } catch (error: any) {
        reply.code(error.statusCode ?? 404);
        return { error: error.statusCode ? error.message : "Unable to join campaign" };
      }
    }
  );

  server.get("/api/me/campaigns", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const store = await readUserAuthStore(vaultDirFor(request));
      const memberships = store.memberships.filter((item) => item.userId === user.userId && !item.revokedAt);
      const repo = repositoryFor(request);
      const campaigns = [];
      for (const membership of memberships) {
        try {
          const state = await repo.getCampaignState(membership.campaignId);
          campaigns.push({
            campaignId: membership.campaignId,
            title: state.campaign?.title ?? membership.campaignId,
            role: membership.role,
            playerId: membership.playerId,
          });
        } catch {
          // A stale membership does not expose or break other campaign entries.
        }
      }
      return { campaigns };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.message };
    }
  });
}
