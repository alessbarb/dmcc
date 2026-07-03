import type { FastifyInstance } from "fastify";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import {
  getValidatedVaultId,
  isLoopbackRequest,
} from "../auth.js";
import {
  getSessionUser,
  publicUser,
  readUserAuthStore,
  revokeAllSessions,
} from "../userAuthStore.js";
import { readSessionCookie, SESSION_COOKIE } from "../sessionAuth.js";

function expiredCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

function retired(reply: { code: (statusCode: number) => unknown }, message: string) {
  reply.code(410);
  return { error: message };
}

export async function registerAuthRoutes(
  server: FastifyInstance,
  options: { dataDir: string }
): Promise<void> {
  const { dataDir } = options;

  function getVaultDir(vaultId: string): string {
    return join(dataDir, "vaults", vaultId);
  }

  server.get("/api/auth/status", async (request) => {
    const vaultId = getValidatedVaultId(request);
    const vaultDir = getVaultDir(vaultId);
    const resolved = await getSessionUser(vaultDir, readSessionCookie(request));
    const store = await readUserAuthStore(vaultDir).catch(() => null);
    const activeUsers = store?.users.filter((user) => !user.disabledAt) ?? [];
    const memberships = resolved
      ? (store?.memberships ?? []).filter(
          (membership) => membership.userId === resolved.user.userId && !membership.revokedAt
        )
      : [];
    const user = resolved ? publicUser(resolved.user) : null;

    return {
      accountConfigured: activeUsers.length > 0,
      dmAccountConfigured: activeUsers.length > 0,
      dmPinConfigured: activeUsers.length > 0,
      legacyPinConfigured: false,
      dmSessionValid: Boolean(user),
      sessionValid: Boolean(user),
      user,
      dm: user
        ? {
            dmId: user.userId,
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          }
        : null,
      memberships,
      dmProfiles: [],
      localRequest: isLoopbackRequest(request),
      lanExposed: server.lanExposed ?? false,
    };
  });

  server.post("/api/auth/lock", async (request, reply) => {
    try {
      const vaultId = getValidatedVaultId(request);
      const vaultDir = getVaultDir(vaultId);
      const resolved = await getSessionUser(vaultDir, readSessionCookie(request));
      if (!resolved || resolved.user.vaultRole !== "admin") {
        reply.code(403);
        return { error: "Administrator access required" };
      }

      await revokeAllSessions(vaultDir);
      server.dmSessionToken = randomBytes(32).toString("hex");
      reply.header("Set-Cookie", expiredCookie());
      return { ok: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to lock application" };
    }
  });

  server.post("/api/auth/dm/setup", async (_request, reply) =>
    retired(reply, "DM-specific setup has been removed. Use /api/auth/register.")
  );

  server.post("/api/auth/dm/login", async (_request, reply) =>
    retired(reply, "DM-specific login has been removed. Use /api/auth/login.")
  );

  server.post("/api/auth/dm/logout", async (_request, reply) =>
    retired(reply, "DM-specific logout has been removed. Use /api/auth/logout.")
  );

  server.post("/api/auth/setup-pin", async (_request, reply) =>
    retired(reply, "PIN setup has been removed. Use account registration.")
  );

  server.post("/api/auth/unlock", async (_request, reply) =>
    retired(reply, "PIN unlock has been removed. Use account login.")
  );

  server.post("/api/player/join", async (_request, reply) =>
    retired(reply, "Legacy player join has been retired. Sign in and join the campaign.")
  );

  server.post("/api/auth/player-logout", async (_request, reply) =>
    retired(reply, "Player tokens have been removed from authentication. Use /api/auth/logout.")
  );
}
