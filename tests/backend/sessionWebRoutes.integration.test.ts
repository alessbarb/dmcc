import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createId } from "@shared/ids.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";
import { PostgresCampaignRepository } from "../../src/backend/server/web/postgresCampaignRepository.js";

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

  it("upcasts legacy prep-only sessions to a plan on read, without a ReviseSessionPlan write", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const sessionId = createId("sess");
    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/planned`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        sessionId,
        title: "La guarida Cragmaw",
        prep: { state: "ready", goals: ["Foreshadow the Red Cloaks"], sceneIds: ["ent_cave"] },
      },
    });

    const fetched = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}`,
      headers,
    });
    expect(fetched.statusCode).toBe(200);
    const body = fetched.json() as {
      session: { plan?: { state: string; goals: Array<{ text: string }>; flowItems: unknown[] } };
    };
    expect(body.session.plan?.state).toBe("ready");
    expect(body.session.plan?.goals[0]?.text).toBe("Foreshadow the Red Cloaks");
    expect(body.session.plan?.flowItems).toHaveLength(1);

    const listed = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/sessions`, headers });
    const listedBody = listed.json() as { sessions: Array<{ sessionId: string; plan?: { state: string } }> };
    const listedSession = listedBody.sessions.find((s) => s.sessionId === sessionId);
    expect(listedSession?.plan?.state).toBe("ready");
  });

  it("persists the session_live narrativeContext on a recorded session event, round-tripped through the DB", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const sessionId = createId("sess");

    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/ad-hoc`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { sessionId, title: "La emboscada" },
    });

    const recorded = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/events`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { eventType: "note_recorded", title: "Klarg flees", metadata: { observationKind: "world" } },
    });
    expect(recorded.statusCode).toBe(200);

    const events = await new PostgresCampaignRepository().loadEvents(campaignId);
    const sessionEventRecorded = events.find((event) => event.type === "SessionEventRecorded");
    expect(sessionEventRecorded?.context).toEqual({ origin: "session_live", sessionId });
  });

  it("builds a narrative map with an opening node and a scene node from the plan", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const sessionId = createId("sess");
    const sceneEntityId = createId("ent");

    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { entityId: sceneEntityId, entityType: "scene", title: "Cragmaw Cave" },
    });
    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/sessions/planned`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { sessionId, title: "La emboscada" },
    });
    await server.inject({
      method: "PUT",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/plan`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        expectedRevision: 0,
        title: "La emboscada",
        plan: {
          version: 2,
          state: "ready",
          openingPrompt: "The party arrives at dusk.",
          goals: [],
          checklist: [],
          flowItems: [{ id: "spi_scene1", kind: "scene", sceneEntityId, order: 0 }],
          contentLinks: [],
          transitions: [],
          bindings: [],
        },
      },
    });

    const response = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/${sessionId}/narrative-map`,
      headers,
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { narrativeMap: { nodes: Array<{ id: string; kind: string; label: string }>; basis: string } };
    expect(body.narrativeMap.basis).toBe("planned");
    expect(body.narrativeMap.nodes.find((node) => node.kind === "opening")?.label).toBe("The party arrives at dusk.");
    expect(body.narrativeMap.nodes.find((node) => node.id === "spi_scene1")).toMatchObject({ kind: "scene", label: "Cragmaw Cave" });
  });

  it("returns 404 for a narrative map of a session that doesn't exist", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const response = await server.inject({
      method: "GET",
      url: `/api/campaigns/${campaignId}/sessions/sess_missing/narrative-map`,
      headers,
    });
    expect(response.statusCode).toBe(404);
  });
});
