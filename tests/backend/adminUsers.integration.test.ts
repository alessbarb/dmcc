import { afterAll, beforeAll, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { userRoles } from "../../src/backend/db/authSchema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";
import { disableUser, revokePlatformAdmin } from "../../src/backend/operations/users/userAdministration.js";

const ORIGIN = "http://localhost:4877";
const server = createServer();
const PASSWORD = "correct horse battery staple";

const users = {
  admin: "usr_plat_admin",
  regular: "usr_plat_regular",
  bystander: "usr_plat_bystander",
};

async function seedUsers() {
  const passwordHash = await argon2.hash(PASSWORD);
  await db.insert(schema.users).values([
    { userId: users.admin, emailNormalized: "plat-admin@example.test", emailHash: "hash_plat_admin", displayName: "Admin", passwordHash },
    { userId: users.regular, emailNormalized: "plat-regular@example.test", emailHash: "hash_plat_regular", displayName: "Regular", passwordHash },
    { userId: users.bystander, emailNormalized: "plat-bystander@example.test", emailHash: "hash_plat_bystander", displayName: "Bystander", passwordHash },
  ]);
  await db.insert(userRoles).values([
    { userId: users.admin, role: "admin", source: "administration" },
    { userId: users.admin, role: "dm", source: "registration" },
    { userId: users.regular, role: "dm", source: "registration" },
  ]);
}

async function authenticatedHeaders(userId: string) {
  const { token } = await createWebSession(userId);
  return { cookie: `${WEB_SESSION_COOKIE}=${token}`, origin: ORIGIN };
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe("platform roles integration", () => {
  it("assigns dm to every newly registered user", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      headers: { origin: ORIGIN },
      payload: { email: "new-dm@example.test", password: "a-strong-enough-password" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().user.roles).toEqual(["dm"]);
  });

  it("returns platform roles on login", async () => {
    await seedUsers();
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { origin: ORIGIN },
      payload: { email: "plat-admin@example.test", password: PASSWORD },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().user.roles).toEqual(expect.arrayContaining(["admin", "dm"]));
  });

  it("derives isPlatformAdmin from user_roles in the admin user list and detail", async () => {
    await seedUsers();
    const adminHeaders = await authenticatedHeaders(users.admin);

    const listRes = await server.inject({ method: "GET", url: "/api/admin/users", headers: adminHeaders });
    expect(listRes.statusCode).toBe(200);
    const listed = listRes.json().users;
    expect(listed.find((u: { userId: string }) => u.userId === users.admin)?.isPlatformAdmin).toBe(true);
    expect(listed.find((u: { userId: string }) => u.userId === users.regular)?.isPlatformAdmin).toBe(false);

    const detailRes = await server.inject({ method: "GET", url: `/api/admin/users/${users.regular}`, headers: adminHeaders });
    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.json().isPlatformAdmin).toBe(false);
  });

  it("grants and revokes admin over HTTP without touching the dm role", async () => {
    await seedUsers();
    const adminHeaders = await authenticatedHeaders(users.admin);

    const grantRes = await server.inject({
      method: "POST",
      url: `/api/admin/users/${users.regular}/grant-platform-admin`,
      headers: adminHeaders,
      payload: { currentPassword: PASSWORD },
    });
    expect(grantRes.statusCode).toBe(200);
    const afterGrant = await db.select().from(userRoles).where(eq(userRoles.userId, users.regular));
    expect(afterGrant.map((r) => r.role).sort()).toEqual(["admin", "dm"]);

    const revokeRes = await server.inject({
      method: "POST",
      url: `/api/admin/users/${users.regular}/revoke-platform-admin`,
      headers: adminHeaders,
      payload: { currentPassword: PASSWORD },
    });
    expect(revokeRes.statusCode).toBe(200);
    const afterRevoke = await db.select().from(userRoles).where(eq(userRoles.userId, users.regular));
    expect(afterRevoke.map((r) => r.role)).toEqual(["dm"]);
  });

  it("refuses to revoke your own admin privileges over HTTP", async () => {
    await seedUsers();
    const adminHeaders = await authenticatedHeaders(users.admin);
    const res = await server.inject({
      method: "POST",
      url: `/api/admin/users/${users.admin}/revoke-platform-admin`,
      headers: adminHeaders,
      payload: { currentPassword: PASSWORD },
    });
    expect(res.statusCode).toBe(400);
  });

  it("refuses to revoke privileges from the last active administrator", async () => {
    await seedUsers();
    await expect(
      revokePlatformAdmin({ targetUserId: users.admin, actorUserId: users.bystander }),
    ).rejects.toThrow(/last active platform administrator/);
    const rolesAfter = await db.select().from(userRoles).where(eq(userRoles.userId, users.admin));
    expect(rolesAfter.map((r) => r.role)).toContain("admin");
  });

  it("refuses to disable the last active administrator", async () => {
    await seedUsers();
    await expect(
      disableUser({ targetUserId: users.admin, actorUserId: users.bystander }),
    ).rejects.toThrow(/last active platform administrator/);
    const [target] = await db.select().from(schema.users).where(eq(schema.users.userId, users.admin));
    expect(target.disabledAt).toBeNull();
  });
});
