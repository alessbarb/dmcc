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
  const dmId = `usr_wcr_dm_${suffix}`;
  await db.insert(schema.users).values({
    userId: dmId,
    emailNormalized: `wcr-dm-${suffix}@example.test`,
    emailHash: `hash_wcr_dm_${suffix}`,
    displayName: "DM",
    passwordHash: "test-password-hash",
  });
  const workspaceId = `wks_wcr_${suffix}`;
  await db.insert(schema.workspaces).values({ workspaceId, name: "World commands fixture workspace", ownerId: dmId });
  await db.insert(schema.workspaceMemberships).values({ workspaceId, userId: dmId, role: "owner" });
  const campaignId = `cmp_wcr_${suffix}`;
  await db.insert(schema.campaigns).values({ campaignId, title: "World commands fixture campaign", workspaceId, ownerId: dmId });
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

describe("world command web routes", () => {
  it("advances a clock via the dedicated route and persists the resultant segments", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const entityId = createId("ent");

    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {
        entityId,
        entityType: "clock",
        title: "Control de Phandalin",
        metadata: { maxSegments: 6, currentSegments: 2, meaning: "Town control" },
      },
    });

    const advanced = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities/${entityId}/clock/advance`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { delta: 1 },
    });
    expect(advanced.statusCode).toBe(200);

    const fetched = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}`, headers });
    const body = fetched.json() as { entities: { entityId: string; metadata: { currentSegments: number } }[] };
    const clock = body.entities.find((e) => e.entityId === entityId);
    expect(clock?.metadata.currentSegments).toBe(3);

    const events = await new PostgresCampaignRepository().loadEvents(campaignId);
    const clockAdvanced = events.find((event) => event.type === "ClockAdvanced");
    expect(clockAdvanced?.payload).toMatchObject({ entityId, previousSegments: 2, segments: 3 });
  });

  it("stamps session_live narrativeContext when sessionId is provided in the body", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const entityId = createId("ent");
    const sessionId = createId("sess");

    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { entityId, entityType: "front", title: "Red Caps", metadata: { goal: "Terrorize Phandalin" } },
    });

    const activated = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities/${entityId}/front/activate`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { sessionId },
    });
    expect(activated.statusCode).toBe(200);

    const events = await new PostgresCampaignRepository().loadEvents(campaignId);
    const frontActivated = events.find((event) => event.type === "FrontActivated");
    expect(frontActivated?.context).toEqual({ origin: "session_live", sessionId });
  });

  it("rejects triggering a consequence on a non-consequence entity", async () => {
    const { campaignId, dmId } = await seedFixture();
    const headers = await authenticatedHeaders(dmId);
    const entityId = createId("ent");

    await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: { entityId, entityType: "npc", title: "Sildar" },
    });

    const triggered = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/entities/${entityId}/consequence/trigger`,
      headers: { ...headers, "idempotency-key": createId("cmd") },
      payload: {},
    });
    expect(triggered.statusCode).toBe(500);
    expect(triggered.json()).toMatchObject({ error: expect.stringMatching(/Expected entity/) });
  });
});
