import { join } from "node:path";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  getAccountAggregate,
  getSessionUser,
  updatePreferences,
  updatePrivateIdentity,
  upsertDmProfile,
  upsertPlayerProfile,
} from "../userAuthStore.js";
import { getValidatedVaultId } from "../auth.js";
import { readSessionCookie } from "../sessionAuth.js";

function assertSameOrigin(request: FastifyRequest): void {
  const origin = request.headers.origin;
  if (!origin) return;
  const host = request.headers.host;
  if (!host || new URL(origin).host !== host) {
    throw Object.assign(new Error("Cross-origin mutation rejected"), { statusCode: 403 });
  }
}

export async function registerAccountRoutes(
  server: FastifyInstance,
  options: { dataDir: string }
) {
  const vaultDirFor = (request: FastifyRequest) =>
    join(options.dataDir, "vaults", getValidatedVaultId(request));
  const requireUser = async (request: FastifyRequest) => {
    const resolved = await getSessionUser(vaultDirFor(request), readSessionCookie(request));
    if (!resolved) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
    return resolved.user;
  };

  server.get("/api/account", async (request, reply) => {
    try {
      const user = await requireUser(request);
      return await getAccountAggregate(vaultDirFor(request), user.userId);
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to load account" };
    }
  });

  server.put<{ Body: { displayName?: unknown; avatarUrl?: unknown } }>(
    "/api/account/identity",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        return {
          account: await updatePrivateIdentity(
            vaultDirFor(request),
            user.userId,
            request.body ?? {}
          ),
        };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to update account", field: error.field };
      }
    }
  );

  server.put<{ Body: { version: number } & Record<string, unknown> }>(
    "/api/account/preferences",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        const { version, ...patch } = request.body ?? { version: -1 };
        return {
          preferences: await updatePreferences(
            vaultDirFor(request),
            user.userId,
            version,
            patch
          ),
        };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return {
          error: error.statusCode ? error.message : "Unable to update preferences",
          field: error.field,
          current: error.current,
        };
      }
    }
  );

  server.put<{ Body: { version: number } & Record<string, unknown> }>(
    "/api/account/profiles/dm",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        const { version, ...input } = request.body;
        return {
          profile: await upsertDmProfile(vaultDirFor(request), user.userId, version, input),
        };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.message, field: error.field, current: error.current };
      }
    }
  );

  server.put<{
    Params: { campaignId: string };
    Body: { version: number } & Record<string, unknown>;
  }>("/api/account/profiles/player/:campaignId", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const user = await requireUser(request);
      const { version, ...input } = request.body;
      return {
        profile: await upsertPlayerProfile(
          vaultDirFor(request),
          user.userId,
          request.params.campaignId,
          version,
          input
        ),
      };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.message, field: error.field, current: error.current };
    }
  });
}
