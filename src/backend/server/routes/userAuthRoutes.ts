import type { FastifyInstance, FastifyRequest } from "fastify";
import { join } from "node:path";
import { PersistentRateLimit } from "../rateLimitStore.js";
import {
  addCampaignMembership,
  authenticateUser,
  createSession,
  changeUserPassword,
  getSessionUser,
  publicUser,
  registerUser,
  revokeSession,
  readUserAuthStore,
  recoverUserPassword,
  regenerateRecoveryCodes,
  issuePasswordResetToken,
  issuePasswordResetTokenByEmail,
  resetPasswordWithToken,
  getVaultAccessCodePepper,
  normalizeEmail,
} from "../userAuthStore.js";
import { getValidatedCampaignId, getValidatedVaultId, verifyCampaignAccessCode, hashPlayerToken } from "../auth.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { randomBytes } from "node:crypto";
import { readSessionCookie, SESSION_COOKIE } from "../sessionAuth.js";
import { assertSameOrigin, isLoopbackIp } from "../sameOrigin.js";
import { sendPasswordResetEmail } from "../emailService.js";

function cookieValue(raw: string, secure: boolean): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(raw)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure ? "; Secure" : ""}`;
}

function expiredCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

function validateCredentials(email: unknown, password: unknown): string | null {
  if (typeof email !== "string" || email.length === 0 || email.length > 254) {
    return "Invalid email";
  }
  if (typeof password !== "string" || password.length === 0 || password.length > 128) {
    return "Password must be between 1 and 128 characters";
  }
  return null;
}

export async function registerUserAuthRoutes(server: FastifyInstance, options: { dataDir: string }) {
  const attempts = await PersistentRateLimit.load(options.dataDir, "user-auth");
  server.addHook("onClose", async () => {
    await attempts.close();
  });
  const enforceLimit = (request: FastifyRequest, operation: string, limit: number) => {
    const vaultId = getValidatedVaultId(request);
    const key = `${vaultId}:${request.ip}:${operation}`;
    const now = Date.now();
    const current = attempts.get<{ count: number; resetAt: number }>(key);
    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + 60_000 });
      return;
    }
    if (current.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      throw Object.assign(new Error("Too many attempts"), { statusCode: 429, retryAfter });
    }
    current.count += 1;
    attempts.set(key, current);
  };
  const clearLimit = (request: FastifyRequest, operation: string) => {
    attempts.delete(`${getValidatedVaultId(request)}:${request.ip}:${operation}`);
  };
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
    const resolved = await getSessionUser(vaultDirFor(request), readSessionCookie(request));
    if (!resolved) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
    return resolved.user;
  };

  server.post<{ Body: { email: string; password: string; displayName?: string; avatarUrl?: string } }>(
    "/api/auth/register",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const credError = validateCredentials(request.body?.email, request.body?.password);
        if (credError) { reply.code(400); return { error: credError }; }
        enforceLimit(request, "register", 3);

        // The first account can be created from loopback or tests. After that,
        // registration stays local/admin-driven to keep one vault identity model.
        if (!isLoopbackIp(request.ip) && process.env.NODE_ENV !== "test") {
          const vaultDir = vaultDirFor(request);
          const existingStore = await readUserAuthStore(vaultDir).catch(() => null);
          const hasUsers = existingStore?.users.some((u) => !u.disabledAt);
          if (hasUsers) {
            reply.code(403);
            return { error: "Registration is closed. Contact the vault administrator." };
          }
        }

        const vaultDir = vaultDirFor(request);
        const user = await registerUser(vaultDir, request.body);
        const rawSessionId = await createSession(vaultDir, user.userId);
        clearLimit(request, "register");
        reply.header("Set-Cookie", cookieValue(rawSessionId, request.protocol === "https"));
        reply.code(201);
        return { ok: true, user: publicUser(user) };
      } catch (error: any) {
        if (error.statusCode === 409) {
          reply.code(409);
          return { error: "Email is already in use" };
        }
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to register account" };
      }
    }
  );

  server.post<{ Body: { email: string; password: string } }>("/api/auth/login", async (request, reply) => {
    try {
      assertSameOrigin(request);
      const credError = validateCredentials(request.body?.email, request.body?.password);
      if (credError) { reply.code(400); return { error: credError }; }
      enforceLimit(request, "login", 5);
      const vaultDir = vaultDirFor(request);
      const user = await authenticateUser(vaultDir, request.body.email, request.body.password);
      if (!user) {
        reply.code(401);
        return { error: "Invalid email or password" };
      }
      const rawSessionId = await createSession(vaultDir, user.userId);
      clearLimit(request, "login");
      reply.header("Set-Cookie", cookieValue(rawSessionId, request.protocol === "https"));
      return { ok: true, user: publicUser(user) };
    } catch (error: any) {
      if (error.retryAfter) reply.header("Retry-After", String(error.retryAfter));
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to log in" };
    }
  });

  async function readCurrentUser(request: FastifyRequest, reply: any) {
    const resolved = await getSessionUser(vaultDirFor(request), readSessionCookie(request));
    if (!resolved) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    return { user: publicUser(resolved.user) };
  }

  server.get("/api/auth/session", async (request, reply) => readCurrentUser(request, reply));
  server.get("/api/auth/me", async (request, reply) => readCurrentUser(request, reply));

  server.post("/api/auth/logout", async (request, reply) => {
    try {
      assertSameOrigin(request);
      await revokeSession(vaultDirFor(request), readSessionCookie(request));
      reply.header("Set-Cookie", expiredCookie());
      return { ok: true };
    } catch (error: any) {
      reply.code(error.statusCode ?? 500);
      return { error: error.message };
    }
  });

  server.post<{ Body: { currentPassword?: string; newPassword?: string } }>(
    "/api/auth/password/change",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        const changed = await changeUserPassword(
          vaultDirFor(request),
          user.userId,
          request.body?.currentPassword ?? "",
          request.body?.newPassword ?? ""
        );
        if (!changed) {
          reply.code(401);
          return { error: "Unable to change password" };
        }
        reply.header("Set-Cookie", expiredCookie());
        return { ok: true };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to change password" };
      }
    }
  );

  server.post<{ Body: { currentPassword?: string } }>(
    "/api/auth/recovery-codes/regenerate",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const user = await requireUser(request);
        const codes = await regenerateRecoveryCodes(
          vaultDirFor(request),
          user.userId,
          request.body?.currentPassword ?? ""
        );
        if (!codes) {
          reply.code(401);
          return { error: "Unable to regenerate recovery codes" };
        }
        return { codes };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to regenerate recovery codes" };
      }
    }
  );

  server.post<{ Body: { email?: string } }>("/api/auth/forgot-password", async (request, reply) => {
    try {
      assertSameOrigin(request);
      enforceLimit(request, "forgot-password", 5);

      const email = typeof request.body?.email === "string" ? request.body.email : "";
      const token = email ? await issuePasswordResetTokenByEmail(vaultDirFor(request), email) : null;
      clearLimit(request, "forgot-password");

      // Try to send email when SMTP is configured and a token was issued.
      if (token && email) {
        // Build the reset URL exclusively from the configured public origin.
        // We intentionally avoid falling back to request.Host because that
        // header can be spoofed or mis-set by a proxy, which would send users
        // a link pointing at the wrong domain.
        const publicOrigin = process.env.DMCC_PUBLIC_ORIGIN?.replace(/\/$/, "");
        if (publicOrigin) {
          const resetUrl = `${publicOrigin}/reset-password/${encodeURIComponent(token)}`;

          // Read the user's display name for a personalised email.
          let displayName: string | undefined;
          try {
            const store = await readUserAuthStore(vaultDirFor(request));
            const norm = normalizeEmail(email);
            displayName = store.users.find((u) => u.emailNormalized === norm)?.displayName;
          } catch { /* non-critical */ }

          await sendPasswordResetEmail({
            to: normalizeEmail(email),
            resetUrl,
            expiresInMinutes: 30,
          });
        } else if (process.env.NODE_ENV !== "production") {
          // Dev/test: log the token path so developers can still test manually.
          console.warn("[forgot-password] DMCC_PUBLIC_ORIGIN not set; skipping email dispatch.");
        }
      }

      // In production the token is NEVER returned in the response, regardless
      // of SMTP config or caller IP — even if email sending failed.
      // In non-production it is only surfaced when the operator has explicitly
      // opted in via DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE=true, so a
      // mis-configured staging/Render environment cannot accidentally leak tokens.
      const allowDevToken =
        process.env.NODE_ENV !== "production" &&
        process.env.DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE === "true";
      return allowDevToken && token
        ? { ok: true, resetToken: token, expiresInSeconds: 1800 }
        : { ok: true };
    } catch (error: any) {
      if (error.retryAfter) reply.header("Retry-After", String(error.retryAfter));
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to request password reset" };
    }
  });

  server.post<{ Body: { token?: string; resetToken?: string; newPassword?: string } }>("/api/auth/reset-password", async (request, reply) => {
    try {
      assertSameOrigin(request);
      enforceLimit(request, "reset-password", 8);
      const token = request.body?.token ?? request.body?.resetToken ?? "";
      const recovered = await resetPasswordWithToken(vaultDirFor(request), token, request.body?.newPassword ?? "");
      if (!recovered) {
        reply.code(400);
        return { error: "Unable to reset password" };
      }
      clearLimit(request, "reset-password");
      reply.header("Set-Cookie", expiredCookie());
      return { ok: true };
    } catch (error: any) {
      if (error.retryAfter) reply.header("Retry-After", String(error.retryAfter));
      reply.code(error.statusCode ?? 500);
      return { error: error.statusCode ? error.message : "Unable to reset password" };
    }
  });

  server.post<{ Body: { email?: string; recoveryCode?: string; resetToken?: string; newPassword?: string } }>(
    "/api/auth/recover",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        enforceLimit(request, "recover", 8);
        const recovered = request.body?.resetToken
          ? await resetPasswordWithToken(
              vaultDirFor(request),
              request.body.resetToken,
              request.body?.newPassword ?? ""
            )
          : await recoverUserPassword(
              vaultDirFor(request),
              request.body?.email ?? "",
              request.body?.recoveryCode ?? "",
              request.body?.newPassword ?? ""
            );
        if (!recovered) {
          reply.code(400);
          return { error: "Unable to recover account" };
        }
        clearLimit(request, "recover");
        return { ok: true };
      } catch (error: any) {
        if (error.retryAfter) reply.header("Retry-After", String(error.retryAfter));
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to recover account" };
      }
    }
  );

  server.post<{ Params: { userId: string } }>(
    "/api/admin/users/:userId/password-reset",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        const admin = await requireUser(request);
        if (admin.vaultRole !== "admin") {
          reply.code(403);
          return { error: "Administrator access required" };
        }
        const resetToken = await issuePasswordResetToken(vaultDirFor(request), request.params.userId);
        if (!resetToken) {
          reply.code(404);
          return { error: "Unable to issue password reset" };
        }
        return { resetToken, expiresInSeconds: 1800 };
      } catch (error: any) {
        reply.code(error.statusCode ?? 500);
        return { error: error.statusCode ? error.message : "Unable to issue password reset" };
      }
    }
  );

  server.post<{ Params: { campaignId: string }; Body: { accessCode?: string; playerId?: string } }>(
    "/api/campaigns/:campaignId/join",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        enforceLimit(request, `join:${request.params.campaignId}`, 8);
        if (request.body?.playerId !== undefined) {
          reply.code(400);
          return { error: "playerId cannot be selected during join" };
        }
        const user = await requireUser(request);
        const campaignId = getValidatedCampaignId(request.params.campaignId);
        const repo = repositoryFor(request);
        let state = await repo.getCampaignState(campaignId);
        const accessCode = request.body?.accessCode ?? "";
        const pepper = await getVaultAccessCodePepper(vaultDirFor(request));
        const valid =
          Boolean(state.campaign?.settings?.localAccessCodeHash) &&
          verifyCampaignAccessCode(
            campaignId,
            accessCode,
            state.campaign.settings.localAccessCodeHash,
            pepper
          );
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
        clearLimit(request, `join:${request.params.campaignId}`);
        reply.code(201);
        return { membership, campaign: { campaignId, title: state.campaign?.title } };
      } catch (error: any) {
        reply.code(error.statusCode ?? 404);
        return { error: error.statusCode ? error.message : "Unable to join campaign" };
      }
    }
  );

  server.post<{ Params: { inviteToken: string }; Body: { campaignId?: string; playerId?: string } }>(
    "/api/invitations/:inviteToken/claim",
    async (request, reply) => {
      try {
        assertSameOrigin(request);
        enforceLimit(request, "invitation-claim", 8);
        if (request.body?.playerId !== undefined) {
          reply.code(400);
          return { error: "playerId cannot be selected when claiming an invitation" };
        }
        const user = await requireUser(request);
        const campaignId = getValidatedCampaignId(request.body?.campaignId ?? "");
        const repo = repositoryFor(request);
        const state = await repo.getCampaignState(campaignId);
        const tokenHash = hashPlayerToken(request.params.inviteToken);
        const invitation = Array.from(state.invitations?.values?.() ?? []).find(
          (candidate: any) =>
            candidate.inviteTokenHash === tokenHash &&
            candidate.status === "pending" &&
            (!candidate.expiresAt || Date.parse(candidate.expiresAt) > Date.now())
        ) as any;
        if (!invitation) {
          reply.code(404);
          return { error: "Unable to claim invitation" };
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
        await repo.executeCommand(campaignId, {
          type: "ConsumePlayerInvitation",
          campaignId,
          actorId: user.userId,
          inviteId: invitation.inviteId,
          playerId,
          emailHash: user.emailHash,
          consumedAt: new Date().toISOString(),
        });
        const membership = await addCampaignMembership(vaultDirFor(request), {
          campaignId,
          userId: user.userId,
          role: "player",
          playerId,
        });
        clearLimit(request, "invitation-claim");
        reply.code(201);
        return { membership, campaign: { campaignId, title: state.campaign?.title } };
      } catch (error: any) {
        reply.code(error.statusCode ?? 404);
        return { error: error.statusCode ? error.message : "Unable to claim invitation" };
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
