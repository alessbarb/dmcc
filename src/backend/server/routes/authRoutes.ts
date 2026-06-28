import type { FastifyInstance } from "fastify";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { hashPin, verifyPin, isLoopbackRequest, hashAccessCode, hashPlayerToken, generatePlayerToken, getValidatedVaultId } from "../auth.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { buildPlayerPortalProjection } from "@core/projections/playerPortalProjection.js";

interface AuthConfig {
  dmPinEnabled: boolean;
  dmPinHash: string;
  dmPinSalt: string;
  pinHashAlgorithm: "scrypt";
  createdAt: string;
}

interface PinAttemptState {
  count: number;
  lockedUntil: number;     // epoch ms, 0 = not locked
  lastAttemptAt: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_1 = 30_000;   // 30s after 5 failures
const LOCKOUT_2 = 120_000;  // 2min if they keep trying

async function readAuthConfig(vaultDir: string): Promise<AuthConfig | null> {
  try {
    const raw = await readFile(join(vaultDir, "auth.json"), "utf-8");
    return JSON.parse(raw) as AuthConfig;
  } catch {
    return null;
  }
}

async function writeAuthConfig(vaultDir: string, config: AuthConfig): Promise<void> {
  await mkdir(vaultDir, { recursive: true });
  await writeFile(join(vaultDir, "auth.json"), JSON.stringify(config, null, 2), "utf-8");
}

export async function registerAuthRoutes(
  server: FastifyInstance,
  options: { dataDir: string }
): Promise<void> {
  const { dataDir } = options;
  // Per-vault PIN attempt tracking (in-memory, resets on server restart)
  const pinAttempts = new Map<string, PinAttemptState>();

  function getVaultDir(vaultId: string): string {
    return join(dataDir, "vaults", vaultId);
  }

  function getAttemptState(vaultId: string): PinAttemptState {
    return pinAttempts.get(vaultId) ?? { count: 0, lockedUntil: 0, lastAttemptAt: 0 };
  }

  function checkRateLimit(vaultId: string): { blocked: boolean; retryAfterMs: number } {
    const state = getAttemptState(vaultId);
    const now = Date.now();
    if (state.lockedUntil > now) {
      return { blocked: true, retryAfterMs: state.lockedUntil - now };
    }
    return { blocked: false, retryAfterMs: 0 };
  }

  function recordFailedAttempt(vaultId: string): void {
    const state = getAttemptState(vaultId);
    const now = Date.now();
    const newCount = state.count + 1;
    let lockedUntil = 0;
    if (newCount >= MAX_ATTEMPTS) {
      const alreadyLocked = state.lockedUntil > 0;
      lockedUntil = now + (alreadyLocked ? LOCKOUT_2 : LOCKOUT_1);
    }
    pinAttempts.set(vaultId, { count: newCount, lockedUntil, lastAttemptAt: now });
  }

  function clearAttempts(vaultId: string): void {
    pinAttempts.delete(vaultId);
  }

  // GET /api/auth/status
  server.get("/api/auth/status", async (request) => {
    const vaultId = getValidatedVaultId(request);
    const vaultDir = getVaultDir(vaultId);
    const authConfig = await readAuthConfig(vaultDir);

    const dmPinConfigured = authConfig?.dmPinEnabled ?? false;

    const dmToken = request.headers["x-dm-token"] as string | undefined;
    const dmSessionValid = Boolean(dmToken && dmToken === (server as any).dmSessionToken);

    const localRequest = isLoopbackRequest(request);
    const lanExposed = (server as any).lanExposed ?? false;

    return { dmPinConfigured, dmSessionValid, localRequest, lanExposed };
  });

  // POST /api/auth/setup-pin
  server.post<{ Body: { pin: string } }>(
    "/api/auth/setup-pin",
    async (request, reply) => {
      const dmToken = request.headers["x-dm-token"] as string | undefined;
      const isLocal = isLoopbackRequest(request);
      // Must be either local request OR have a valid DM token to set up PIN
      if (!isLocal && dmToken !== (server as any).dmSessionToken) {
        reply.code(403);
        return { error: "Forbidden" };
      }

      const { pin } = request.body;
      if (!pin || pin.length < 4 || pin.length > 64) {
        reply.code(400);
        return { error: "PIN must be 4–64 characters" };
      }

      const vaultId = getValidatedVaultId(request);
      const vaultDir = getVaultDir(vaultId);
      const { hash, salt } = await hashPin(pin);

      await writeAuthConfig(vaultDir, {
        dmPinEnabled: true,
        dmPinHash: hash,
        dmPinSalt: salt,
        pinHashAlgorithm: "scrypt",
        createdAt: new Date().toISOString(),
      });

      return { ok: true };
    }
  );

  // POST /api/auth/unlock
  server.post<{ Body: { pin: string } }>(
    "/api/auth/unlock",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const vaultDir = getVaultDir(vaultId);

      const { blocked, retryAfterMs } = checkRateLimit(vaultId);
      if (blocked) {
        reply.code(429);
        return { error: "Too many attempts", retryAfterMs };
      }

      const authConfig = await readAuthConfig(vaultDir);
      if (!authConfig?.dmPinEnabled) {
        reply.code(400);
        return { error: "PIN not configured" };
      }

      const { pin } = request.body;
      const valid = await verifyPin(pin, authConfig.dmPinSalt, authConfig.dmPinHash);
      if (!valid) {
        recordFailedAttempt(vaultId);
        reply.code(401);
        return { error: "Incorrect PIN" };
      }

      clearAttempts(vaultId);
      return { dmSessionToken: (server as any).dmSessionToken };
    }
  );

  // POST /api/auth/lock
  server.post(
    "/api/auth/lock",
    async (request, reply) => {
      const dmToken = request.headers["x-dm-token"] as string | undefined;
      if (!dmToken || dmToken !== (server as any).dmSessionToken) {
        reply.code(403);
        return { error: "Forbidden" };
      }
      // Rotate the DM session token so existing sessions are invalidated
      (server as any).dmSessionToken = randomBytes(32).toString("hex");
      return { ok: true };
    }
  );

  // POST /api/auth/player-logout — invalidate a player token server-side
  server.post(
    "/api/auth/player-logout",
    async (request, reply) => {
      const vaultId = getValidatedVaultId(request);
      const playerToken = request.headers["x-player-token"] as string | undefined;
      if (!playerToken) {
        reply.code(400);
        return { error: "Missing x-player-token header" };
      }
      (server as any).playerTokens.delete(playerToken);
      const tokenHash = hashPlayerToken(playerToken);
      const repo = new CampaignRepository(
        new EventStore(dataDir, vaultId),
        new SnapshotStore(dataDir, vaultId)
      );
      const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
      try {
        const campaignIds = await readdir(campaignsDir);
        for (const campaignId of campaignIds.filter((id) => id.startsWith("cmp_"))) {
          const state = await repo.getCampaignState(campaignId as any);
          const events = await repo.loadEvents(campaignId as any);
          const portal = buildPlayerPortalProjection(state, events as any);
          const token = portal.tokensByHash.get(tokenHash);
          if (token && !token.revokedAt) {
            await repo.executeCommand(campaignId as any, {
              type: "RevokePlayerToken",
              campaignId: campaignId as any,
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
    async (request, reply) => {
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

        let state = await repo.getCampaignState(campaignId as any);

        if (!state.campaign?.settings?.lanModeEnabled) {
          reply.code(403);
          return { error: "LAN mode is not enabled for this campaign" };
        }

        const codeHash = state.campaign.settings?.localAccessCodeHash;
        const legacyCode = state.campaign.settings?.localAccessCode;
        const isValid =
          (codeHash && hashAccessCode(accessCode) === codeHash) ||
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
          await repo.executeCommand(campaignId as any, {
            type: "CreatePlayerProfile",
            campaignId: campaignId as any,
            actorId: "usr_dm",
            playerId,
            displayName: displayName?.trim() || "Player",
            emailHash: emailHash ?? undefined,
            role: "player",
            color: "#3b82f6",
          });
          state = await repo.getCampaignState(campaignId as any);
        }

        const playerToken = generatePlayerToken() + randomBytes(8).toString("hex");
        const tokenId = `ptok_${randomBytes(8).toString("hex")}`;
        await repo.executeCommand(campaignId as any, {
          type: "IssuePlayerToken",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          playerId,
          tokenId,
          tokenHash: hashPlayerToken(playerToken),
          label: "player_join",
          createdAt: now,
        });

        (server as any).playerTokens.set(playerToken, { campaignId, playerId });

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
    }
  );
}
