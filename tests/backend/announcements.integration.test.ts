import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { operationsAuditLog } from "../../src/backend/db/operationsSchema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

const ORIGIN = "http://localhost:4877";
const server = createServer();

const users = {
  admin: "usr_ann_admin",
  regular: "usr_ann_regular",
};

async function seedUsers() {
  await db.insert(schema.users).values([
    {
      userId: users.admin,
      emailNormalized: "ann-admin@example.test",
      emailHash: "hash_ann_admin",
      displayName: "Admin",
      passwordHash: "hash",
      isPlatformAdmin: true,
    },
    {
      userId: users.regular,
      emailNormalized: "ann-regular@example.test",
      emailHash: "hash_ann_regular",
      displayName: "Regular",
      passwordHash: "hash",
      isPlatformAdmin: false,
    },
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

describe("system announcements integration", () => {
  it("authenticates admin route access strictly", async () => {
    await seedUsers();
    const adminHeaders = await authenticatedHeaders(users.admin);
    const regularHeaders = await authenticatedHeaders(users.regular);

    // Regular users are rejected with 403
    const listRes = await server.inject({
      method: "GET",
      url: "/api/admin/announcements",
      headers: regularHeaders,
    });
    expect(listRes.statusCode).toBe(403);

    // Platform admins are allowed
    const listResAdmin = await server.inject({
      method: "GET",
      url: "/api/admin/announcements",
      headers: adminHeaders,
    });
    expect(listResAdmin.statusCode).toBe(200);
    const body = listResAdmin.json();
    expect(body.announcements).toBeDefined();
  });

  it("handles announcement CRUD lifecycle with logging", async () => {
    await seedUsers();
    const adminHeaders = await authenticatedHeaders(users.admin);

    // Create new announcement
    const createRes = await server.inject({
      method: "POST",
      url: "/api/admin/announcements",
      headers: adminHeaders,
      payload: {
        content: { title: "Maintenance", body: "We are updating the servers." },
        kind: "maintenance",
        isEnabled: true,
        priority: 10,
        startsAt: new Date(Date.now() - 60000).toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    });
    expect(createRes.statusCode).toBe(201);
    const { announcementId } = createRes.json();
    expect(announcementId).toBeDefined();

    // Verify audit log has the event
    const audits = await db
      .select()
      .from(operationsAuditLog)
      .where(eq(operationsAuditLog.targetId, announcementId))
      .limit(1);
    expect(audits.length).toBe(1);
    expect(audits[0].action).toBe("announcement.created");

    // Read via public API
    const publicRes = await server.inject({
      method: "GET",
      url: "/api/announcements",
    });
    expect(publicRes.statusCode).toBe(200);
    const publicBody = publicRes.json();
    expect(publicBody.announcements.length).toBeGreaterThanOrEqual(1);
    const announcement = publicBody.announcements.find((a: any) => a.announcementId === announcementId);
    expect(announcement).toBeDefined();
    expect(announcement.content.title).toBe("Maintenance");

    // Update announcement
    const updateRes = await server.inject({
      method: "PUT",
      url: `/api/admin/announcements/${announcementId}`,
      headers: adminHeaders,
      payload: {
        content: { title: "Scheduled Maintenance", body: "Server update in progress." },
        kind: "maintenance",
      },
    });
    expect(updateRes.statusCode).toBe(200);

    // Verify public API returns updated values
    const publicResUpdated = await server.inject({
      method: "GET",
      url: "/api/announcements",
    });
    const updatedAnn = publicResUpdated.json().announcements.find((a: any) => a.announcementId === announcementId);
    expect(updatedAnn.content.title).toBe("Scheduled Maintenance");

    // Soft delete/archive
    const deleteRes = await server.inject({
      method: "DELETE",
      url: `/api/admin/announcements/${announcementId}`,
      headers: adminHeaders,
    });
    expect(deleteRes.statusCode).toBe(200);

    // Verify it is no longer returned in the public API
    const publicResAfterDelete = await server.inject({
      method: "GET",
      url: "/api/announcements",
    });
    const archivedAnn = publicResAfterDelete.json().announcements.find((a: any) => a.announcementId === announcementId);
    expect(archivedAnn).toBeUndefined();
  });
});
