import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
import { hashSecret } from "../../src/backend/server/auth.js";
import { hashOpaque, migrateLegacyAuthStore } from "../../src/backend/server/userAuthStore.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

async function cleanDatabase() {
  await db.delete(schema.activityFeed);
  await db.delete(schema.attachments);
  await db.delete(schema.campaignInvitationAcceptances);
  await db.delete(schema.campaignInvitations);
  await db.delete(schema.campaignNotes);
  await db.delete(schema.playerProposals);
  await db.delete(schema.campaignScenes);
  await db.delete(schema.campaignSessions);
  await db.delete(schema.liveTables);
  await db.delete(schema.visibilityGrants);
  await db.delete(schema.campaignRelations);
  await db.delete(schema.campaignFacts);
  await db.delete(schema.campaignEntities);
  await db.delete(schema.campaignSnapshots);
  await db.delete(schema.commandIndex);
  await db.delete(schema.domainEvents);
  await db.delete(schema.playerProfiles);
  await db.delete(schema.dmProfiles);
  await db.delete(schema.campaignMemberships);
  await db.delete(schema.workspaces);
  await db.delete(schema.workspaceMemberships);
  await db.delete(schema.authSessions);
  await db.delete(schema.userPreferences);
  await db.delete(schema.recoveryCodes);
  await db.delete(schema.passwordResetTokens);
  await db.delete(schema.users);
}

async function withServer(run: (server: ReturnType<typeof createServer>, dataDir: string) => Promise<void>) {
  await cleanDatabase();
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-user-auth-"));
  const server = createServer({ dataDir });
  try {
    await run(server, dataDir);
  } finally {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  }
}

function sessionCookie(response: any): string {
  const header = response.headers["set-cookie"];
  expect(header).toContain("dmcc_session=");
  expect(header).toContain("HttpOnly");
  expect(header).toContain("SameSite=Strict");
  return String(header).split(";")[0];
}

describe("unified user authentication", () => {
  it("migrates legacy DM accounts and ACL memberships once, preserving credentials", async () => {
    await cleanDatabase();
    const dataDir = await mkdtemp(join(tmpdir(), "dmcc-user-auth-migration-"));
    const vaultId = "legacy";
    const vaultDir = join(dataDir, "vaults", vaultId);
    await mkdir(vaultDir, { recursive: true });
    try {
      const password = await hashSecret("legacy secure password");
      const createdAt = "2025-01-02T03:04:05.000Z";
      await writeFile(join(vaultDir, "auth.json"), JSON.stringify({
        schemaVersion: 2,
        dmAccounts: [{
          dmId: "dm_owner",
          emailNormalized: "owner@example.com",
          emailHash: hashOpaque("owner@example.com"),
          displayName: "Owner",
          secretHash: password.hash,
          secretSalt: password.salt,
          secretHashAlgorithm: "scrypt",
          createdAt,
        }],
        createdAt,
        updatedAt: createdAt,
      }));
      await writeFile(join(vaultDir, "campaign-acl.json"), JSON.stringify({
        schemaVersion: 1,
        campaigns: {
          cmp_one: {
            campaignId: "cmp_one",
            ownerDmId: "dm_owner",
            dmIds: ["dm_owner"],
            createdAt,
          },
        },
        createdAt,
        updatedAt: createdAt,
      }));

      const first = await migrateLegacyAuthStore(dataDir, vaultId);
      const second = await migrateLegacyAuthStore(dataDir, vaultId);

      expect(first.users).toEqual([
        expect.objectContaining({
          userId: "dm_owner",
          emailNormalized: "owner@example.com",
          passwordHash: password.hash,
          passwordSalt: password.salt,
          vaultRole: "admin",
        }),
      ]);
      expect(second.memberships).toEqual([expect.objectContaining({
        campaignId: "cmp_one",
        userId: "dm_owner",
        role: "dm",
      })]);
      expect(second.migration).toMatchObject({ fromSchemaVersion: 2 });
      expect(JSON.parse(await readFile(join(vaultDir, "auth.json.v2.bak"), "utf8")).schemaVersion).toBe(2);

      const server = createServer({ dataDir });
      try {
        const login = await server.inject({
          method: "POST",
          url: "/api/auth/login",
          headers: { "x-vault-id": vaultId },
          payload: { email: "owner@example.com", password: "legacy secure password" },
        });
        expect(login.statusCode).toBe(200);
        const campaigns = await server.inject({
          method: "GET",
          url: "/api/me/campaigns",
          headers: { "x-vault-id": vaultId, cookie: sessionCookie(login) },
        });
        expect(campaigns.statusCode).toBe(200);
      } finally {
        await server.close();
      }
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });

  it("reconciles missing ACL memberships in an existing schema v3 store", async () => {
    await cleanDatabase();
    const dataDir = await mkdtemp(join(tmpdir(), "dmcc-user-auth-reconcile-"));
    const vaultId = "default";
    const vaultDir = join(dataDir, "vaults", vaultId);
    await mkdir(vaultDir, { recursive: true });
    try {
      const password = await hashSecret("existing secure password");
      const createdAt = "2025-01-02T03:04:05.000Z";
      await writeFile(join(vaultDir, "auth.json"), JSON.stringify({
        schemaVersion: 3,
        accessCodePepper: "pepper",
        users: [{
          userId: "usr_owner",
          emailNormalized: "owner@example.com",
          emailHash: hashOpaque("owner@example.com"),
          passwordHash: password.hash,
          passwordSalt: password.salt,
          passwordAlgorithm: "scrypt",
          vaultRole: "admin",
          createdAt,
        }],
        memberships: [],
        sessions: [],
        recoveryCodes: [],
        passwordResetTokens: [],
        createdAt,
        updatedAt: createdAt,
      }));
      await writeFile(join(vaultDir, "campaign-acl.json"), JSON.stringify({
        schemaVersion: 1,
        campaigns: {
          cmp_existing: {
            campaignId: "cmp_existing",
            ownerDmId: "usr_owner",
            dmIds: ["usr_owner"],
            createdAt,
          },
        },
        createdAt,
        updatedAt: createdAt,
      }));

      const reconciled = await migrateLegacyAuthStore(dataDir, vaultId);
      const persisted = JSON.parse(await readFile(join(vaultDir, "auth.json"), "utf8"));

      expect(reconciled.memberships).toEqual([
        expect.objectContaining({ campaignId: "cmp_existing", userId: "usr_owner", role: "dm" }),
      ]);
      expect(persisted.memberships).toEqual(reconciled.memberships);
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  });

  it("registers the first account as admin without granting campaign memberships", async () => {
    await withServer(async (server, dataDir) => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: " Alice@Example.com ", password: "correct horse battery" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body).toEqual({
        ok: true,
        user: expect.objectContaining({
          email: "alice@example.com",
          vaultRole: "admin",
        }),
      });
      expect(body).not.toHaveProperty("sessionId");
      expect(body.user).not.toHaveProperty("passwordHash");

      const persisted = await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8");
      expect(persisted).not.toContain("correct horse battery");
      expect(JSON.parse(persisted).memberships).toEqual([]);
    });
  });

  it("rejects duplicate registration emails without creating a second account", async () => {
    await withServer(async (server, dataDir) => {
      const request = {
        method: "POST" as const,
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      };
      const created = await server.inject(request);
      const duplicate = await server.inject(request);

      expect(created.statusCode).toBe(201);
      expect(duplicate.statusCode).toBe(409);
      expect(duplicate.json()).toEqual({ error: "Email is already in use" });

      const persisted = JSON.parse(await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8"));
      expect(persisted.users.filter((user: { emailNormalized?: string }) => user.emailNormalized === "alice@example.com")).toHaveLength(1);
    });
  });

  it("uses an opaque HttpOnly cookie and revokes it on logout", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      expect(login.statusCode).toBe(200);
      expect(login.json()).not.toHaveProperty("sessionToken");
      const cookie = sessionCookie(login);

      const current = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(current.statusCode).toBe(200);
      expect(current.json().user.email).toBe("alice@example.com");

      expect((await server.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: { cookie, origin: "http://localhost:4877", host: "localhost:4877" },
      })).statusCode).toBe(200);

      expect((await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      })).statusCode).toBe(401);
    });
  });

  it("lets a vault admin lock the vault and revoke every active session", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "user@example.com", password: "different horse battery" },
      });
      const adminLogin = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      const userLogin = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "user@example.com", password: "different horse battery" },
      });
      const adminCookie = sessionCookie(adminLogin);
      const userCookie = sessionCookie(userLogin);

      const locked = await server.inject({
        method: "POST",
        url: "/api/auth/lock",
        headers: { cookie: adminCookie },
      });
      expect(locked.statusCode).toBe(200);

      for (const cookie of [adminCookie, userCookie]) {
        expect((await server.inject({
          method: "GET",
          url: "/api/auth/session",
          headers: { cookie },
        })).statusCode).toBe(401);
      }
    });
  });

  it("uses the authenticated account as the actor when an admin creates a campaign", async () => {
    await withServer(async (server, dataDir) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      const cookie = sessionCookie(login);
      const created = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { cookie },
        payload: { campaignId: "cmp_cookie", title: "Cookie campaign", actorId: "spoofed_actor" },
      });
      if (created.statusCode !== 201) {
        console.error("CAMPAIGN CREATION FAILED:", created.json());
      }
      expect(created.statusCode).toBe(201);

      const store = JSON.parse(await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8"));
      const admin = store.users.find((user: any) => user.emailNormalized === "admin@example.com");
      expect(store.memberships).toEqual([
        expect.objectContaining({ campaignId: "cmp_cookie", userId: admin.userId, role: "dm" }),
      ]);
      const events = await readFile(
        join(dataDir, "vaults", "default", "campaigns", "cmp_cookie", "events.ndjson"),
        "utf8"
      );
      expect(events).toContain(`"actorId":"${admin.userId}"`);
      expect(events).not.toContain("spoofed_actor");
    });
  });

  it("rejects cross-origin mutations", async () => {
    await withServer(async (server) => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        headers: { origin: "https://evil.example", host: "localhost:4877" },
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      expect(response.statusCode).toBe(403);
    });
  });

  it("joins a campaign as the authenticated user without accepting a chosen playerId", async () => {
    await withServer(async (server, dataDir) => {
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { "x-dm-token": (server as any).dmSessionToken },
        payload: { campaignId: "cmp_join", title: "Joinable", actorId: "attacker" },
      });
      const toggle = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/lan/toggle",
        headers: { "x-dm-token": (server as any).dmSessionToken },
        payload: { enabled: true },
      });
      const accessCode = toggle.json().accessCode;
      expect(accessCode).toMatch(/^[A-HJ-NP-Z2-9]{10}$/);
      const authFile = await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8");
      const eventsFile = await readFile(
        join(dataDir, "vaults", "default", "campaigns", "cmp_join", "events.ndjson"),
        "utf8"
      );
      expect(JSON.parse(authFile).accessCodePepper).toMatch(/^[a-f0-9]{64}$/);
      expect(eventsFile).toContain("hmac-sha256:");
      expect(eventsFile).not.toContain(accessCode);

      const legacySpoof = await server.inject({
        method: "POST",
        url: "/api/join/cmp_join",
        payload: { accessCode, playerId: "ply_victim" },
      });
      expect(legacySpoof.statusCode).toBe(410);

      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "player@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "player@example.com", password: "correct horse battery" },
      });
      const cookie = sessionCookie(login);

      const rejected = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/join",
        headers: { cookie },
        payload: { accessCode, playerId: "ply_victim" },
      });
      expect(rejected.statusCode).toBe(400);

      const joined = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/join",
        headers: { cookie },
        payload: { accessCode },
      });
      expect(joined.statusCode).toBe(201);
      expect(joined.json().membership).toMatchObject({ campaignId: "cmp_join", role: "player" });
      expect(joined.json().membership.playerId).not.toBe("ply_victim");

      const projection = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_join",
        headers: { cookie },
      });
      expect(projection.statusCode).toBe(200);
      expect(projection.json().campaign).not.toHaveProperty("settings");

      const campaigns = await server.inject({
        method: "GET",
        url: "/api/me/campaigns",
        headers: { cookie },
      });
      expect(campaigns.statusCode).toBe(200);
      expect(campaigns.json().campaigns).toEqual([
        expect.objectContaining({ campaignId: "cmp_join", title: "Joinable", role: "player" }),
      ]);
    });
  });

  it("claims an invitation once for the authenticated account", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      const adminLogin = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      const adminCookie = sessionCookie(adminLogin);
      expect((await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { cookie: adminCookie },
        payload: { campaignId: "cmp_invite", title: "Invited" },
      })).statusCode).toBe(201);
      const invitation = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_invite/invitations",
        headers: { cookie: adminCookie },
        payload: { expiresInHours: 1 },
      });
      expect(invitation.statusCode).toBe(200);

      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "player@example.com", password: "different horse battery", displayName: "Player" },
      });
      const playerLogin = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "player@example.com", password: "different horse battery" },
      });
      const claim = await server.inject({
        method: "POST",
        url: `/api/invitations/${invitation.json().inviteToken}/claim`,
        headers: { cookie: sessionCookie(playerLogin) },
        payload: { campaignId: "cmp_invite" },
      });
      expect(claim.statusCode).toBe(201);
      expect(claim.json().membership).toMatchObject({
        campaignId: "cmp_invite",
        role: "player",
      });

      expect((await server.inject({
        method: "POST",
        url: `/api/invitations/${invitation.json().inviteToken}/claim`,
        headers: { cookie: sessionCookie(playerLogin) },
        payload: { campaignId: "cmp_invite" },
      })).statusCode).toBe(404);
    });
  });

  it("rate limits repeated login failures with Retry-After", async () => {
    await withServer(async (server) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await server.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: { email: "missing@example.com", password: "wrong password value" },
        });
        expect(response.statusCode).toBe(401);
      }
      const blocked = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "missing@example.com", password: "wrong password value" },
      });
      expect(blocked.statusCode).toBe(429);
      expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    });
  });

  it("changes a password and revokes every existing session for that user", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const cookie = sessionCookie(login);

      const changed = await server.inject({
        method: "POST",
        url: "/api/auth/password/change",
        headers: { cookie },
        payload: {
          currentPassword: "correct horse battery",
          newPassword: "different horse battery",
        },
      });
      expect(changed.statusCode).toBe(200);
      expect((await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      })).statusCode).toBe(401);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      })).statusCode).toBe(401);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "different horse battery" },
      })).statusCode).toBe(200);
    });
  });

  it("generates recovery codes that are stored hashed and can only be used once", async () => {
    await withServer(async (server, dataDir) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const generated = await server.inject({
        method: "POST",
        url: "/api/auth/recovery-codes/regenerate",
        headers: { cookie: sessionCookie(login) },
        payload: { currentPassword: "correct horse battery" },
      });
      expect(generated.statusCode).toBe(200);
      expect(generated.json().codes).toHaveLength(10);
      const [code] = generated.json().codes;
      const persisted = await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8");
      expect(persisted).not.toContain(code);

      const recovered = await server.inject({
        method: "POST",
        url: "/api/auth/recover",
        payload: {
          email: "alice@example.com",
          recoveryCode: code,
          newPassword: "recovered horse battery",
        },
      });
      expect(recovered.statusCode).toBe(200);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/recover",
        payload: {
          email: "alice@example.com",
          recoveryCode: code,
          newPassword: "another secure password",
        },
      })).statusCode).toBe(400);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "recovered horse battery" },
      })).statusCode).toBe(200);
    });
  });

  it("lets an admin issue a one-use password reset token without choosing the password", async () => {
    await withServer(async (server, dataDir) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "player@example.com", password: "initial horse battery" },
      });
      const store = JSON.parse(await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8"));
      const playerId = store.users.find((user: any) => user.emailNormalized === "player@example.com").userId;
      const adminLogin = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "admin@example.com", password: "correct horse battery" },
      });

      const issued = await server.inject({
        method: "POST",
        url: `/api/admin/users/${playerId}/password-reset`,
        headers: { cookie: sessionCookie(adminLogin) },
      });
      expect(issued.statusCode).toBe(200);
      expect(issued.json()).toHaveProperty("resetToken");
      expect(await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8"))
        .not.toContain(issued.json().resetToken);

      expect((await server.inject({
        method: "POST",
        url: "/api/auth/recover",
        payload: { resetToken: issued.json().resetToken, newPassword: "replacement horse battery" },
      })).statusCode).toBe(200);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/recover",
        payload: { resetToken: issued.json().resetToken, newPassword: "another horse battery" },
      })).statusCode).toBe(400);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "player@example.com", password: "replacement horse battery" },
      })).statusCode).toBe(200);
    });
  });
});
