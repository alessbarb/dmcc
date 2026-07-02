import { join } from "node:path";
import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  getAccountAggregate,
  getSessionUser,
  updatePreferences,
  updatePrivateIdentity,
  upsertDmProfile,
  upsertPlayerProfile,
  readUserAuthStore,
  listOwnedSessions,
  revokeOtherOwnedSessions,
  revokeAllOwnedSessions,
  revokeOwnedSession,
  buildPersonalExport,
  deleteAccount,
  findAccountDeletionBlockers,
} from "../userAuthStore.js";
import { getValidatedVaultId } from "../auth.js";
import { readSessionCookie } from "../sessionAuth.js";
import { projectProfile } from "../account/profileProjection.js";
import { assertSameOrigin } from "../sameOrigin.js";

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

  server.put<{
    Body: {
      displayName?: unknown;
      avatarUrl?: unknown;
      email?: unknown;
      currentPassword?: unknown;
    };
  }>(
    "/api/account/identity",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        return {
          account: await updatePrivateIdentity(
            vaultDirFor(request),
            user.userId,
            request.body ?? {},
            readSessionCookie(request)
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

  server.get<{ Querystring: { profile?: string; campaignId?: string } }>(
    "/api/account/privacy/preview",
    async (request, reply) => {
      try {
        const user = await requireUser(request);
        const store = await readUserAuthStore(vaultDirFor(request));
        const profile = request.query.profile === "dm"
          ? store.dmProfiles.find((item) => item.userId === user.userId)
          : store.playerProfiles.find((item) =>
              item.userId === user.userId
              && item.campaignId === request.query.campaignId
            );
        if (!profile) {
          reply.code(404);
          return { error: "Profile not found" };
        }
        return {
          previews: {
            owner: projectProfile(profile, "private"),
            dm: projectProfile(profile, "dm"),
            table: projectProfile(profile, "table"),
            global: projectProfile(profile, "global"),
          },
        };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to preview profile" };
      }
    }
  );

  server.get<{ Params: { publicHandle: string } }>(
    "/api/profiles/:publicHandle",
    async (request, reply) => {
      try {
        await requireUser(request);
        const store = await readUserAuthStore(vaultDirFor(request));
        const profile = [...store.dmProfiles, ...store.playerProfiles].find(
          (item) => item.publicHandle === request.params.publicHandle
        );
        const projected = profile ? projectProfile(profile, "global") : null;
        if (!projected) {
          reply.code(404);
          return { error: "Profile not found" };
        }
        return { profile: projected };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to load profile" };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/member-profiles",
    async (request, reply) => {
      try {
        const user = await requireUser(request);
        const store = await readUserAuthStore(vaultDirFor(request));
        const requesterMembership = store.memberships.find(
          (membership) =>
            membership.userId === user.userId
            && membership.campaignId === request.params.campaignId
            && !membership.revokedAt
        );
        if (!requesterMembership) {
          throw Object.assign(new Error("Active campaign membership required"), { statusCode: 403 });
        }
        const audience = requesterMembership.role === "dm" ? "dm" : "table";
        const profiles = store.memberships.flatMap((membership) => {
          if (membership.campaignId !== request.params.campaignId || membership.revokedAt) return [];
          const source = membership.role === "dm"
            ? store.dmProfiles.find((profile) => profile.userId === membership.userId)
            : membership.role === "player"
              ? store.playerProfiles.find(
                  (profile) =>
                    profile.userId === membership.userId
                    && profile.campaignId === request.params.campaignId
                )
              : undefined;
          if (!source) return [];
          const profile = projectProfile(source, audience);
          return profile ? [{
            userId: membership.userId,
            role: membership.role,
            playerId: membership.playerId,
            profile,
          }] : [];
        });
        return { profiles };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return {
          error: error.statusCode ? error.message : "Unable to load campaign member profiles",
        };
      }
    }
  );

  server.get("/api/account/sessions", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const rawSessionId = readSessionCookie(request);
      if (!rawSessionId) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
      return {
        sessions: await listOwnedSessions(vaultDirFor(request), user.userId, rawSessionId),
      };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to list sessions" };
    }
  });

  server.delete("/api/account/sessions/others", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const user = await requireUser(request);
      const rawSessionId = readSessionCookie(request);
      if (!rawSessionId) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
      await revokeOtherOwnedSessions(vaultDirFor(request), user.userId, rawSessionId);
      return { revoked: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to revoke sessions" };
    }
  });

  server.delete("/api/account/sessions", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const user = await requireUser(request);
      await revokeAllOwnedSessions(vaultDirFor(request), user.userId);
      return { revoked: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to revoke sessions" };
    }
  });

  server.delete<{ Params: { sessionRef: string } }>(
    "/api/account/sessions/:sessionRef",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        const revoked = await revokeOwnedSession(
          vaultDirFor(request),
          user.userId,
          request.params.sessionRef
        );
        if (!revoked) {
          reply.code(404);
          return { error: "Session not found" };
        }
        return { revoked: true };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to revoke session" };
      }
    }
  );

  server.get("/api/account/export", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const exported = buildPersonalExport(
        await readUserAuthStore(vaultDirFor(request)),
        user.userId
      );
      reply.header("Content-Disposition", `attachment; filename="dmcc-account-${user.userId}.json"`);
      return exported;
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to export account" };
    }
  });

  server.get("/api/account/deletion-impact", async (request, reply) => {
    try {
      const user = await requireUser(request);
      return {
        blockers: findAccountDeletionBlockers(
          await readUserAuthStore(vaultDirFor(request)),
          user.userId
        ),
      };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to analyze deletion" };
    }
  });

  server.delete<{
    Body: { currentPassword?: string; confirmation?: string };
  }>("/api/account", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const user = await requireUser(request);
      await deleteAccount(vaultDirFor(request), user.userId, request.body ?? {});
      return { deleted: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return {
        error: error.statusCode ? error.message : "Unable to delete account",
        blockers: error.blockers,
      };
    }
  });
}
