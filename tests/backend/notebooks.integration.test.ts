import { afterAll, beforeAll, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

const ORIGIN = "http://localhost:4877";
const PASSWORD = "correct horse battery staple";
const server = createServer();
let fixtureCounter = 0;

async function seedFixture() {
  fixtureCounter += 1;
  const suffix = `${Date.now()}_${fixtureCounter}`;
  const userId = `usr_nbk_${suffix}`;
  const workspaceId = `wks_nbk_${suffix}`;
  const campaignId = `cmp_nbk_${suffix}`;
  const passwordHash = await argon2.hash(PASSWORD);

  await db.insert(schema.users).values({
    userId,
    emailNormalized: `notebooks-${suffix}@example.test`,
    emailHash: `hash_nbk_${suffix}`,
    displayName: "Notebook DM",
    passwordHash,
  });
  await db.insert(schema.workspaces).values({ workspaceId, name: "Notebook workspace", ownerId: userId });
  await db.insert(schema.workspaceMemberships).values({ workspaceId, userId, role: "owner" });
  await db.insert(schema.campaigns).values({ campaignId, title: "Notebook campaign", workspaceId, ownerId: userId });
  await db.insert(schema.campaignMemberships).values({ campaignId, userId, role: "dm", playerId: null });

  const { token } = await createWebSession(userId);
  return {
    campaignId,
    headers: { cookie: `${WEB_SESSION_COOKIE}=${token}`, origin: ORIGIN },
  };
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe("notebook HTTP behavior", () => {
  it("creates a root notebook, creates a child, and exposes both after a fresh read", async () => {
    const { campaignId, headers } = await seedFixture();

    const rootResponse = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/notebooks`,
      headers,
      payload: { title: "  Campaign notes  " },
    });

    expect(rootResponse.statusCode).toBe(200);
    const rootBody = rootResponse.json() as { ok: boolean; notebookId: string };
    expect(rootBody.ok).toBe(true);
    expect(rootBody.notebookId).toMatch(/^nbk_/);

    const childResponse = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/notebooks`,
      headers,
      payload: { title: "NPC leads", parentNotebookId: rootBody.notebookId },
    });

    expect(childResponse.statusCode).toBe(200);
    const childBody = childResponse.json() as { ok: boolean; notebookId: string };
    expect(childBody.ok).toBe(true);
    expect(childBody.notebookId).toMatch(/^nbk_/);

    const listResponse = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/notebooks`,
      headers,
    });

    expect(listResponse.statusCode).toBe(200);
    const listBody = listResponse.json() as {
      notebooks: Array<{ notebookId: string; parentNotebookId: string | null; title: string }>;
    };
    expect(listBody.notebooks).toEqual(expect.arrayContaining([
      expect.objectContaining({ notebookId: rootBody.notebookId, parentNotebookId: null, title: "Campaign notes" }),
      expect.objectContaining({ notebookId: childBody.notebookId, parentNotebookId: rootBody.notebookId, title: "NPC leads" }),
    ]));

    const persistedRows = await db.select().from(schema.campaignNotebooks).where(and(
      eq(schema.campaignNotebooks.campaignId, campaignId),
      eq(schema.campaignNotebooks.parentNotebookId, rootBody.notebookId),
    ));
    expect(persistedRows).toHaveLength(1);
    expect(persistedRows[0]?.notebookId).toBe(childBody.notebookId);
  });

  it("rejects an empty notebook title without appending an event", async () => {
    const { campaignId, headers } = await seedFixture();

    const response = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/notebooks`,
      headers,
      payload: { title: "   " },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Notebook title is required" });

    const rows = await db.select().from(schema.domainEvents).where(eq(schema.domainEvents.campaignId, campaignId));
    expect(rows).toHaveLength(0);
  });
});
