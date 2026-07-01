import type { FastifyInstance } from "fastify";
import { readdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import {
  assertDM,
  createDmSessionToken,
  getRequestDmSession,
  getValidatedVaultId,
  hashPlayerToken,
  isLoopbackRequest,
  verifySecret,
} from "../auth.js";
import {
  createDmAccount,
  findDmAccountByEmail,
  readDmAuthStore,
  toPublicDmProfile,
  updateDmLastLogin,
} from "../dmAuthStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";
import { getSessionUser, revokeAllSessions } from "../userAuthStore.js";
import { readSessionCookie, SESSION_COOKIE } from "../sessionAuth.js";

interface DmAttemptState {
  count: number;
  lockedUntil: number;
  lastAttemptAt: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_1 = 30_000;
const LOCKOUT_2 = 120_000;

export async function registerAuthRoutes(
  server: FastifyInstance,
  options: { dataDir: string }
): Promise<void> {
  const { dataDir } = options;
  const dmAttempts = new Map<string, DmAttemptState>();

  function getVaultDir(vaultId: string): string {
    return join(dataDir, "vaults", vaultId);
  }

  function attemptKey(vaultId: string, email: string): string {
    return `${vaultId}:${email.trim().toLowerCase()}`;
  }

  function getAttemptState(key: string): DmAttemptState {
    return dmAttempts.get(key) ?? { count: 0, lockedUntil: 0, lastAttemptAt: 0 };
  }

  function checkRateLimit(key: string): { blocked: boolean; retryAfterMs: number } {
    const state = getAttemptState(key);
    const now = Date.now();
    if (state.lockedUntil > now) return { blocked: true, retryAfterMs: state.lockedUntil - now };
    return { blocked: false, retryAfterMs: 0 };
  }

  function recordFailedAttempt(key: string): void {
    const state = getAttemptState(key);
    const now = Date.now();
    const newCount = state.count + 1;
    let lockedUntil = 0;
    if (newCount >= MAX_ATTEMPTS) {
      const alreadyLocked = state.lockedUntil > 0;
      lockedUntil = now + (alreadyLocked ? LOCKOUT_2 : LOCKOUT_1);
    }
    dmAttempts.set(key, { count: newCount, lockedUntil, lastAttemptAt: now });
  }

  function clearAttempts(key: string): void {
    dmAttempts.delete(key);
  }

  server.get("/api/auth/status", async (request) => {
    const vaultId = getValidatedVaultId(request);
    const vaultDir = getVaultDir(vaultId);
    const store = await readDmAuthStore(vaultDir);
    const dmSession = getRequestDmSession(request, server.dmSessionToken);
    const dmSessionValid = Boolean(dmSession && dmSession.vaultId === vaultId);
    const activeProfiles = store.dmAccounts.filter((account) => !account.archivedAt).map(toPublicDmProfile);

    return {
      dmAccountConfigured: activeProfiles.length > 0,
      dmPinConfigured: activeProfiles.length > 0,
      legacyPinConfigured: Boolean(store.legacyPinConfigured),
      dmSessionValid,
      dm: dmSessionValid && dmSession
        ? {
            dmId: dmSession.dmId,
            email: dmSession.email,
            displayName: dmSession.displayName,
          }
        : null,
      // Do not expose local DM account emails/names to unauthenticated LAN callers.
      // The login screen already remembers known local profiles in localStorage.
      dmProfiles: dmSessionValid ? activeProfiles : [],
      localRequest: isLoopbackRequest(request),
      lanExposed: server.lanExposed ?? false,
    };
  });

  server.post<{ Body: { email: string; secret: string; displayName?: string } }>(
    "/api/auth/dm/setup",
    async (request, reply) => {
      if (!server.allowLegacyTestAuth) {
        reply.code(410);
        return { error: "Legacy DM setup has been retired; use account registration" };
      }
      const vaultId = getValidatedVaultId(request);
      // DM accounts are self-service. Creating another DM does not grant access
      // to existing campaigns; ACL ownership keeps every DM isolated unless
      // campaigns are explicitly shared later.
      try {
        const { account, firstAccount } = await createDmAccount({
          dataDir,
          vaultId,
          email: request.body.email,
          secret: request.body.secret,
          displayName: request.body.displayName,
        });
        const dmSessionToken = createDmSessionToken(
          {
            dmId: account.dmId,
            vaultId,
            email: account.emailNormalized,
            displayName: account.displayName,
          },
          server.dmSessionToken
        );
        return { ok: true, dmSessionToken, dm: toPublicDmProfile(account), firstAccount };
      } catch (err: any) {
        reply.code(err.statusCode ?? 500);
        return { error: err.message ?? "Failed to create DM account" };
      }
    }
  );

  server.post<{ Body: { email: string; secret: string } }>(
    "/api/auth/dm/login",
    async (request, reply) => {
      if (!server.allowLegacyTestAuth) {
        reply.code(410);
        return { error: "Legacy DM login has been retired; use account login" };
      }
      const vaultId = getValidatedVaultId(request);
      const vaultDir = getVaultDir(vaultId);
      const email = request.body.email?.trim().toLowerCase() ?? "";
      const key = attemptKey(vaultId, email);

      const { blocked, retryAfterMs } = checkRateLimit(key);
      if (blocked) {
        reply.code(429);
        return { error: "Too many attempts", retryAfterMs };
      }

      const account = await findDmAccountByEmail(vaultDir, email);
      if (!account) {
        recordFailedAttempt(key);
        reply.code(401);
        return { error: "Invalid email or key" };
      }

      const valid = await verifySecret(request.body.secret ?? "", account.secretSalt, account.secretHash);
      if (!valid) {
        recordFailedAttempt(key);
        reply.code(401);
        return { error: "Invalid email or key" };
      }

      clearAttempts(key);
      const updatedAccount = await updateDmLastLogin(vaultDir, account.dmId);
      const currentAccount = updatedAccount ?? account;
      const dmSessionToken = createDmSessionToken(
        {
          dmId: currentAccount.dmId,
          vaultId,
          email: currentAccount.emailNormalized,
          displayName: currentAccount.displayName,
        },
        server.dmSessionToken
      );

      return { dmSessionToken, dm: toPublicDmProfile(currentAccount) };
    }
  );

  server.post("/api/auth/dm/logout", async () => {
    // DM sessions are signed, process-local tokens. The client drops the token;
    // server restart or /lock rotates the signing secret and invalidates them.
    return { ok: true };
  });

  server.post("/api/auth/lock", async (request, reply) => {
    try {
      const vaultDir = getVaultDir(getValidatedVaultId(request));
      const unified = await getSessionUser(vaultDir, readSessionCookie(request));
      if (unified) {
        if (unified.user.vaultRole !== "admin") {
          reply.code(403);
          return { error: "Administrator access required" };
        }
        await revokeAllSessions(vaultDir);
        reply.header("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
      } else {
        assertDM(request, server.dmSessionToken);
      }
      server.dmSessionToken = randomBytes(32).toString("hex");
      return { ok: true };
    } catch {
      reply.code(403);
      return { error: "Forbidden" };
    }
  });

  server.post("/api/auth/setup-pin", async (_request, reply) => {
    reply.code(410);
    return { error: "PIN setup has been replaced by DM email + key setup" };
  });

  server.post("/api/auth/unlock", async (_request, reply) => {
    reply.code(410);
    return { error: "PIN unlock has been replaced by DM email + key login" };
  });

  // POST /api/auth/player-logout — invalidate a player token server-side
  server.post(
    "/api/auth/player-logout",
    async (request, reply) => {
      if (!server.allowLegacyTestAuth) {
        reply.code(410);
        return { error: "Legacy player tokens have been retired; use account logout" };
      }
      const vaultId = getValidatedVaultId(request);
      const playerToken = request.headers["x-player-token"] as string | undefined;
      if (!playerToken) {
        reply.code(400);
        return { error: "Missing x-player-token header" };
      }
      server.playerTokens.delete(playerToken);
      const tokenHash = hashPlayerToken(playerToken);
      const repo = new CampaignRepository(
        new EventStore(dataDir, vaultId),
        new SnapshotStore(dataDir, vaultId)
      );
      const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
      try {
        const campaignIds = await readdir(campaignsDir);
        for (const campaignId of campaignIds.filter((id) => id.startsWith("cmp_"))) {
          const state = await repo.getCampaignState(campaignId);
          const events = await repo.loadEvents(campaignId);
          const portal = buildPlayerPortalProjection(state, events);
          const token = portal.tokensByHash.get(tokenHash);
          if (token && !token.revokedAt) {
            await repo.executeCommand(campaignId, {
              type: "RevokePlayerToken",
              campaignId: campaignId,
              actorId: token.playerId,
              playerId: token.playerId,
              tokenId: token.tokenId,
              revokedAt: new Date().toISOString(),
            });
            break;
          }
        }
      } catch {
        // In-memory logout still succeeds when there is no persistent campaign yet.
      }
      return { ok: true };
    }
  );

  // POST /api/player/join — join via campaign code + access code (no invite needed)
  server.post<{
    Body: {
      campaignCode: string;
      accessCode: string;
      email?: string;
      displayName?: string;
    };
  }>(
    "/api/player/join",
    async (_request, reply) => {
      reply.code(410);
      return { error: "Legacy join has been retired; sign in and join the campaign" };
      /*
      const vaultId = getValidatedVaultId(request);
      const { campaignCode, accessCode, email, displayName } = request.body;

      if (!campaignCode?.trim() || !accessCode?.trim()) {
        reply.code(400);
        return { error: "campaignCode and accessCode are required" };
      }

      // campaignCode = campaignId (short code feature is a future enhancement)
      const campaignId = campaignCode.trim();

      try {
        const repo = new CampaignRepository(
          new EventStore(dataDir, vaultId),
          new SnapshotStore(dataDir, vaultId)
        );

        let state = await repo.getCampaignState(campaignId);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled for this campaign" };
        }

        const codeHash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;
        const pepper = await getVaultAccessCodePepper(join(dataDir, "vaults", vaultId));
        const isValid =
          verifyCampaignAccessCode(campaignId, accessCode, codeHash, pepper) ||
          (legacyCode && accessCode === legacyCode);

        if (!isValid) {
          reply.code(401);
          return { error: "Invalid access code" };
        }

        // Find existing player by email if provided
        const emailNormalized = email?.trim().toLowerCase() ?? null;
        const emailHash = emailNormalized ? hashPlayerToken(emailNormalized) : null;
        let playerId: string | null = null;

        if (emailHash) {
          for (const [pid, player] of state.players) {
            if (
              (player.emailHash === emailHash ||
                (player.email && player.email.toLowerCase() === emailNormalized)) &&
              !player.archived
            ) {
              playerId = pid;
              break;
            }
          }
        }

        const now = new Date().toISOString();
        if (!playerId) {
          playerId = `ply_${randomBytes(8).toString("hex")}`;
          await repo.executeCommand(campaignId, {
            type: "CreatePlayerProfile",
            campaignId: campaignId,
            actorId: "usr_dm",
            playerId,
            displayName: displayName?.trim() || "Player",
            emailHash: emailHash ?? undefined,
            role: "player",
            color: "#3b82f6",
          });
          state = await repo.getCampaignState(campaignId);
        }

        const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId, {
          type: "IssuePlayerToken",
          campaignId: campaignId,
          actorId: "usr_dm",
          playerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "player_join",
          createdAt: now,
        });

        server.playerTokens.set(playerToken, { campaignId, playerId });

        return {
          playerToken,
          playerId,
          campaignId,
          campaignTitle: state.campaign?.title ?? campaignId,
        };
      } catch (err: any) {
        if (err.statusCode) { reply.code(err.statusCode); return { error: err.message }; }
        reply.code(500);
        return { error: err.message };
      }
      */
    }
  );
}
