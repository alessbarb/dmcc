import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";
import { PostgresCampaignRepository } from "../../src/backend/server/web/postgresCampaignRepository.js";
import { revokeCampaignMembership } from "../../src/backend/server/campaignMembership/revokeCampaignMembership.js";
import { resolveManyCampaignResources } from "../../src/backend/server/resources/CampaignResourceResolver.js";

const ORIGIN = "http://localhost:4877";
const server = createServer();
const PASSWORD = "correct horse battery staple";

const users = {
  dm: "usr_sht_dm",
  coDm: "usr_sht_co_dm",
  outsider: "usr_sht_outsider",
};

let fixtureCounter = 0;

async function seedFixture() {
  fixtureCounter += 1;
  const suffix = `${Date.now()}_${fixtureCounter}`;
  const passwordHash = await argon2.hash(PASSWORD);
  const dmId = `${users.dm}_${suffix}`;
  const coDmId = `${users.coDm}_${suffix}`;
  const outsiderId = `${users.outsider}_${suffix}`;

  await db.insert(schema.users).values([
    { userId: dmId, emailNormalized: `sht-dm-${suffix}@example.test`, emailHash: `hash_sht_dm_${suffix}`, displayName: "DM", passwordHash },
    { userId: coDmId, emailNormalized: `sht-codm-${suffix}@example.test`, emailHash: `hash_sht_codm_${suffix}`, displayName: "Co-DM", passwordHash },
    { userId: outsiderId, emailNormalized: `sht-out-${suffix}@example.test`, emailHash: `hash_sht_out_${suffix}`, displayName: "Outsider", passwordHash },
  ]);
  const workspaceId = `wks_sht_${suffix}`;
  await db.insert(schema.workspaces).values({ workspaceId, name: "Shortcuts fixture workspace", ownerId: dmId });
  await db.insert(schema.workspaceMemberships).values({ workspaceId, userId: dmId, role: "owner" });
  const campaignId = `cmp_sht_${suffix}`;
  await db.insert(schema.campaigns).values({ campaignId, title: "Shortcuts fixture campaign", workspaceId, ownerId: dmId });
  await db.insert(schema.campaignMemberships).values({ campaignId, userId: dmId, role: "dm", playerId: null });
  await db.insert(schema.campaignMemberships).values({ campaignId, userId: coDmId, role: "co_dm", playerId: null });

  return { campaignId, dmId, coDmId, outsiderId };
}

async function authenticatedHeaders(userId: string) {
  const { token } = await createWebSession(userId);
  return { cookie: `${WEB_SESSION_COOKIE}=${token}`, origin: ORIGIN };
}

// executeDmCommand/executeCanvasCommand respond with { ok, sequence, projection }
// where `projection` is a Map-bearing CampaignProjection (doesn't round-trip
// through JSON), so the created id is read back from a fresh aggregate load
// by exact title match rather than parsed off the HTTP response.
async function createEntity(campaignId: string, actorHeaders: Record<string, string>, overrides: Partial<{ title: string; entityType: string }> = {}) {
  const title = overrides.title ?? "Glasstaff";
  const res = await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/entities`,
    headers: actorHeaders,
    payload: { entityType: overrides.entityType ?? "npc", title },
  });
  expect(res.statusCode).toBe(200);
  const projection = await new PostgresCampaignRepository().getCampaignState(campaignId);
  const entity = Array.from(projection.entities.values()).find((candidate) => candidate.title === title);
  if (!entity) throw new Error(`Entity "${title}" not found after creation`);
  return entity.entityId;
}

async function createCanvas(campaignId: string, actorHeaders: Record<string, string>, title = "Session board") {
  const res = await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/canvases`,
    headers: actorHeaders,
    payload: { title, kind: "custom" },
  });
  expect(res.statusCode).toBe(200);
  const projection = await new PostgresCampaignRepository().getCampaignState(campaignId);
  const canvas = Array.from(projection.canvases.values()).find((candidate) => candidate.title === title);
  if (!canvas) throw new Error(`Canvas "${title}" not found after creation`);
  return canvas.id;
}

async function createSession(campaignId: string, actorId: string, title = "Session One") {
  const repository = new PostgresCampaignRepository();
  await repository.executeCommand(
    campaignId,
    { type: "CreatePreparedSession", campaignId, actorId, title },
    { commandId: createId("cmd"), actorUserId: actorId },
  );
  const projection = await repository.getCampaignState(campaignId);
  const [session] = Array.from(projection.sessions.values());
  return session.sessionId;
}

beforeAll(async () => { await server.ready(); });
afterAll(async () => { await server.close(); });
afterEach(() => { vi.restoreAllMocks(); });

describe("shortcuts integration", () => {
  it("creates a personal shortcut to an entity and resolves its title", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityId = await createEntity(campaignId, dmHeaders);

    const createRes = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/shortcuts`,
      headers: dmHeaders,
      payload: { targetType: "entity", targetId: entityId },
    });
    expect(createRes.statusCode).toBe(200);
    expect(createRes.json().ok).toBe(true);

    const listRes = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders });
    expect(listRes.statusCode).toBe(200);
    const { shortcuts } = listRes.json();
    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0].targetType).toBe("entity");
    expect(shortcuts[0].resource.title).toBe("Glasstaff");
    expect(shortcuts[0].resource.archived).toBe(false);
  });

  it("resolves a session and a canvas shortcut too", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const sessionId = await createSession(campaignId, dmId);
    const canvasId = await createCanvas(campaignId, dmHeaders);

    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "session", targetId: sessionId } });
    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "canvas", targetId: canvasId } });

    const listRes = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders });
    const { shortcuts } = listRes.json();
    expect(shortcuts).toHaveLength(2);
    const byType = Object.fromEntries(shortcuts.map((s: { targetType: string; resource: { title: string } }) => [s.targetType, s.resource.title]));
    expect(byType.session).toBe("Session One");
    expect(byType.canvas).toBe("Session board");
  });

  it("rejects a shortcut to a target that doesn't belong to the campaign", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);

    const res = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/shortcuts`,
      headers: dmHeaders,
      payload: { targetType: "entity", targetId: "ent_does_not_exist" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("is personal: shortcuts are not shared between two DMs of the same campaign", async () => {
    const { campaignId, dmId, coDmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const coDmHeaders = await authenticatedHeaders(coDmId);
    const entityId = await createEntity(campaignId, dmHeaders);

    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });

    const coDmList = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: coDmHeaders });
    expect(coDmList.json().shortcuts).toHaveLength(0);
  });

  it("never grants access: an outsider without membership cannot list or create shortcuts", async () => {
    const { campaignId, dmId, outsiderId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const outsiderHeaders = await authenticatedHeaders(outsiderId);
    const entityId = await createEntity(campaignId, dmHeaders);

    const listRes = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: outsiderHeaders });
    expect(listRes.statusCode).toBe(403);

    const createRes = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/shortcuts`,
      headers: outsiderHeaders,
      payload: { targetType: "entity", targetId: entityId },
    });
    expect(createRes.statusCode).toBe(403);
  });

  it("is idempotent: adding the same target twice does not duplicate the shortcut", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityId = await createEntity(campaignId, dmHeaders);

    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });
    const second = await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });
    expect(second.statusCode).toBe(200);

    const rows = await db.select().from(schema.campaignShortcuts).where(and(
      eq(schema.campaignShortcuts.campaignId, campaignId),
      eq(schema.campaignShortcuts.userId, dmId),
    ));
    expect(rows).toHaveLength(1);
  });

  it("identifies an archived target correctly instead of hiding it", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityId = await createEntity(campaignId, dmHeaders);
    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });

    const archiveRes = await server.inject({ method: "DELETE", url: `/api/campaigns/${campaignId}/entities/${entityId}`, headers: dmHeaders });
    expect(archiveRes.statusCode).toBe(200);

    const listRes = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders });
    const { shortcuts } = listRes.json();
    expect(shortcuts).toHaveLength(1);
    expect(shortcuts[0].resource.archived).toBe(true);
  });

  it("reordering rewrites sort_order without touching the campaign aggregate", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityA = await createEntity(campaignId, dmHeaders, { title: "A" });
    const entityB = await createEntity(campaignId, dmHeaders, { title: "B" });
    const first = await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityA } });
    const second = await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityB } });
    const shortcutIdA = first.json().shortcutId as string;
    const shortcutIdB = second.json().shortcutId as string;

    const [entityRowBefore] = await db.select().from(schema.campaignEntities).where(and(
      eq(schema.campaignEntities.campaignId, campaignId),
      eq(schema.campaignEntities.entityId, entityA),
    ));

    const reorderRes = await server.inject({
      method: "PATCH",
      url: `/api/campaigns/${campaignId}/shortcuts/reorder`,
      headers: dmHeaders,
      payload: { shortcutIds: [shortcutIdB, shortcutIdA] },
    });
    expect(reorderRes.statusCode).toBe(200);

    const listRes = await server.inject({ method: "GET", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders });
    const { shortcuts } = listRes.json();
    expect(shortcuts.map((s: { shortcutId: string }) => s.shortcutId)).toEqual([shortcutIdB, shortcutIdA]);

    const [entityRowAfter] = await db.select().from(schema.campaignEntities).where(and(
      eq(schema.campaignEntities.campaignId, campaignId),
      eq(schema.campaignEntities.entityId, entityA),
    ));
    // Reordering only ever writes campaign_shortcuts.sort_order — it must not
    // touch the campaign_entities read model or the event-sourced aggregate.
    expect(entityRowAfter).toEqual(entityRowBefore);
  });

  it("resolveManyCampaignResources loads the aggregate once regardless of ref count (no N+1)", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityIds = await Promise.all([
      createEntity(campaignId, dmHeaders, { title: "One" }),
      createEntity(campaignId, dmHeaders, { title: "Two" }),
      createEntity(campaignId, dmHeaders, { title: "Three" }),
    ]);

    const getCampaignStateSpy = vi.spyOn(PostgresCampaignRepository.prototype, "getCampaignState");

    const refs = entityIds.map((entityId) => ({ type: "entity" as const, resourceId: entityId }));
    const resolved = await resolveManyCampaignResources(campaignId, refs);

    expect(resolved.size).toBe(3);
    expect(getCampaignStateSpy).toHaveBeenCalledTimes(1);
  });

  it("revoking a membership deletes shortcuts and reactivating does not resurrect them", async () => {
    const { campaignId, coDmId } = await seedFixture();
    const coDmHeaders = await authenticatedHeaders(coDmId);
    const entityId = await createEntity(campaignId, coDmHeaders);
    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: coDmHeaders, payload: { targetType: "entity", targetId: entityId } });

    await revokeCampaignMembership(campaignId, coDmId);

    const [membership] = await db.select().from(schema.campaignMemberships).where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, coDmId),
    ));
    expect(membership.revokedAt).not.toBeNull();

    const shortcutsAfterRevoke = await db.select().from(schema.campaignShortcuts).where(and(
      eq(schema.campaignShortcuts.campaignId, campaignId),
      eq(schema.campaignShortcuts.userId, coDmId),
    ));
    expect(shortcutsAfterRevoke).toHaveLength(0);

    // Reactivate the membership directly (there's no UI for this yet) and
    // confirm old shortcuts don't come back on their own.
    await db.update(schema.campaignMemberships).set({ revokedAt: null }).where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, coDmId),
    ));
    const shortcutsAfterReactivate = await db.select().from(schema.campaignShortcuts).where(and(
      eq(schema.campaignShortcuts.campaignId, campaignId),
      eq(schema.campaignShortcuts.userId, coDmId),
    ));
    expect(shortcutsAfterReactivate).toHaveLength(0);
  });

  it("deleting the campaign cascades transitively through campaign_memberships to campaign_shortcuts", async () => {
    const { campaignId, dmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const entityId = await createEntity(campaignId, dmHeaders);
    await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId));

    const shortcuts = await db.select().from(schema.campaignShortcuts).where(eq(schema.campaignShortcuts.campaignId, campaignId));
    expect(shortcuts).toHaveLength(0);
  });

  it("deleting a shortcut removes only that row, and 404s for a shortcut owned by someone else", async () => {
    const { campaignId, dmId, coDmId } = await seedFixture();
    const dmHeaders = await authenticatedHeaders(dmId);
    const coDmHeaders = await authenticatedHeaders(coDmId);
    const entityId = await createEntity(campaignId, dmHeaders);
    const created = await server.inject({ method: "POST", url: `/api/campaigns/${campaignId}/shortcuts`, headers: dmHeaders, payload: { targetType: "entity", targetId: entityId } });
    const shortcutId = created.json().shortcutId as string;

    const crossDeleteRes = await server.inject({ method: "DELETE", url: `/api/campaigns/${campaignId}/shortcuts/${shortcutId}`, headers: coDmHeaders });
    expect(crossDeleteRes.statusCode).toBe(404);

    const deleteRes = await server.inject({ method: "DELETE", url: `/api/campaigns/${campaignId}/shortcuts/${shortcutId}`, headers: dmHeaders });
    expect(deleteRes.statusCode).toBe(200);

    const rows = await db.select().from(schema.campaignShortcuts).where(eq(schema.campaignShortcuts.shortcutId, shortcutId));
    expect(rows).toHaveLength(0);
  });
});
