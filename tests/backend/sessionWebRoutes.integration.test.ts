import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createId } from "@shared/ids.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

const ORIGIN = "http://localhost:4877";
const server = createServer();

let fixtureCounter = 0;

async function seedFixture() {
  fixtureCounter += 1;
  const suffix = `${Date.now()}_${fixtureCounter}`;
  const dmId = `usr_swr_dm_${suffix}`;
  await db.insert(schema.users).values({
    userId: dmId,
    emailNormalized: `swr-dm-${suffix}@example.test`,
    emailHash: `hash_swr_dm_${suffix}`,
    displayName: "DM",
    passwordHash: "test-password-hash",
  });
  const workspaceId = `wks_swr_${suffix}`;
  await db.insert(schema.workspaces).values({ workspaceId, name: "Session routes fixture workspace", ownerId: dmId });
  await db.insert(schema.workspaceMemberships).values({ workspaceId, userId: dmId, role: "owner" });
  const campaignId = `cmp_swr_${suffix}`;
  await db.insert(schema.campaigns).values({ campaignId, title: "Session routes fixture campaign", workspaceId, ownerId: dmId });
  await db.insert(schema.campaignMemberships).values({ campaignId, userId: dmId, role: "dm", playerId: null });
  return { campaignId, dmId };
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

describe("session web routes", () => {
  it("creates a planned session, revises its plan, and activates it", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const sessionId = createId("sess");

    const created = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/planned`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { sessionId, title: "La emboscada" },
    });
    expect(created.statusCode).toBe(200);

    const revised = await server.inject({
      method: "PUT",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/plan`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        expectedRevision: 0,
        title: "La emboscada",
        plan: {
          version: 2,
          state: "ready",
          goals: [],
          checklist: [],
          flowItems: [],
          contentLinks: [],
          transitions: [],
          bindings: [],
        },
      },
    });
    expect(revised.statusCode).toBe(200);
    const revisedBody = revised.json() as { projection: { sessions: unknown } };
    expect(revisedBody.projection).toBeDefined();

    const midFetch = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}`,
      headers,
    });
    const midBody = midFetch.json() as { session: { plan?: { revision: number; state: string } } };
    expect(midBody.session.plan?.revision).toBe(1);
    expect(midBody.session.plan?.state).toBe("ready");

    const conflict = await server.inject({
      method: "PUT",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/plan`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        expectedRevision: 0,
        title: "La emboscada",
        plan: { version: 2, goals: [], checklist: [], flowItems: [], contentLinks: [], transitions: [], bindings: [] },
      },
    });
    expect(conflict.statusCode).toBe(409);

    const activated = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/activate`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
    });
    expect(activated.statusCode).toBe(200);

    const fetched = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}`,
      headers,
    });
    expect(fetched.statusCode).toBe(200);
    const fetchedBody = fetched.json() as {
      session: { status: string; activatedPlanRevision: number; plan?: { state: string } };
    };
    expect(fetchedBody.session.status).toBe("active");
    expect(fetchedBody.session.activatedPlanRevision).toBe(1);
    expect(fetchedBody.session.plan?.state).toBe("ready");
  });

  it("lists sessions for a campaign", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/planned`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { title: "La guarida" },
    });

    const listed = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/sessions`, headers });
    expect(listed.statusCode).toBe(200);
    const body = listed.json() as { sessions: Array<{ title: string }> };
    expect(body.sessions.some((session) => session.title === "La guarida")).toBe(true);
  });

  it("returns 404 for a session that does not exist", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const response = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/sess_missing`,
      headers,
    });
    expect(response.statusCode).toBe(404);
  });

  it("rejects plan revisions once the session is no longer planned", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const sessionId = createId("sess");
    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/planned`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { sessionId, title: "La emboscada" },
    });
    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/activate`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
    });

    const response = await server.inject({
      method: "PUT",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/plan`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        expectedRevision: 0,
        title: "La emboscada",
        plan: { version: 2, goals: [], checklist: [], flowItems: [], contentLinks: [], transitions: [], bindings: [] },
      },
    });
    expect(response.statusCode).toBe(409);
  });
});
