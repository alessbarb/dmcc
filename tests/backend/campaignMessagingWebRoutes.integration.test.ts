import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../../src/backend/db/messagingSchema.js";
import * as schema from "../../src/backend/db/schema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

const ORIGIN = "http://localhost:4877";
const CAMPAIGN_ID = "cmp_messaging_integration";
const OTHER_CAMPAIGN_ID = "cmp_messaging_other";
const WORKSPACE_ID = "wks_messaging_integration";
const users = { dm: "usr_messaging_dm", playerA: "usr_messaging_player_a", playerB: "usr_messaging_player_b" };
const players = { a: "ply_messaging_a", b: "ply_messaging_b" };
const server = createServer();

async function seedUser(userId: string, suffix: string) {
  await db.insert(schema.users).values({ userId, emailNormalized: `${suffix}@example.test`, emailHash: `hash_${suffix}`, displayName: suffix, passwordHash: "test-password-hash" });
}
async function authenticatedHeaders(userId: string) {
  const { token } = await createWebSession(userId);
  return { cookie: `${WEB_SESSION_COOKIE}=${token}`, origin: ORIGIN };
}
async function seedCampaignFixture() {
  await seedUser(users.dm, "dm"); await seedUser(users.playerA, "player-a"); await seedUser(users.playerB, "player-b");
  await db.insert(schema.workspaces).values({ workspaceId: WORKSPACE_ID, name: "Messaging integration workspace", ownerId: users.dm });
  await db.insert(schema.workspaceMemberships).values({ workspaceId: WORKSPACE_ID, userId: users.dm, role: "owner" });
  await db.insert(schema.campaigns).values([
    { campaignId: CAMPAIGN_ID, title: "Messaging integration campaign", workspaceId: WORKSPACE_ID, ownerId: users.dm },
    { campaignId: OTHER_CAMPAIGN_ID, title: "Other messaging campaign", workspaceId: WORKSPACE_ID, ownerId: users.dm },
  ]);
  await db.insert(schema.playerProfiles).values([
    { profileId: players.a, campaignId: CAMPAIGN_ID, userId: users.playerA, displayName: "Player A" },
    { profileId: players.b, campaignId: CAMPAIGN_ID, userId: users.playerB, displayName: "Player B" },
  ]);
  await db.insert(schema.campaignMemberships).values([
    { campaignId: CAMPAIGN_ID, userId: users.dm, role: "dm", playerId: null },
    { campaignId: CAMPAIGN_ID, userId: users.playerA, role: "player", playerId: players.a },
    { campaignId: CAMPAIGN_ID, userId: users.playerB, role: "player", playerId: players.b },
  ]);
}

beforeAll(async () => { await server.ready(); });
afterAll(async () => { await server.close(); });

describe("campaign messaging web routes", () => {
  it("rejects writes from a non-member of the campaign", async () => {
    await seedCampaignFixture();
    const outsider = "usr_messaging_outsider";
    await seedUser(outsider, "outsider");
    const response = await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers: await authenticatedHeaders(outsider), payload: { content: "Outsider cannot write", audience: "party", clientMessageId: "outsider-write" } });
    expect(response.statusCode).toBe(403);
  });

  it("validates message size, idempotency key and private recipients", async () => {
    await seedCampaignFixture(); const headers = await authenticatedHeaders(users.playerA);
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload: { content: "x".repeat(4_001), audience: "party", clientMessageId: "oversized" } })).statusCode).toBe(400);
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload: { content: "Missing key", audience: "party" } })).statusCode).toBe(400);
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload: { content: "Private", audience: "player", clientMessageId: "missing-recipient" } })).statusCode).toBe(400);
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload: { content: "Private", audience: "player", recipientPlayerId: "ply_unknown", clientMessageId: "unknown-recipient" } })).statusCode).toBe(404);
  });

  it("keeps player-private messages hidden from direction and other players", async () => {
    await seedCampaignFixture();
    const send = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers: await authenticatedHeaders(users.playerA),
      payload: { content: "Only A and B", audience: "player", recipientPlayerId: players.b, clientMessageId: "private-a-b" },
    });
    expect(send.statusCode).toBe(201);

    const dmMessages = (await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers: await authenticatedHeaders(users.dm) })).json().messages;
    const recipientMessages = (await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers: await authenticatedHeaders(users.playerB) })).json().messages;
    const senderMessages = (await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers: await authenticatedHeaders(users.playerA) })).json().messages;

    expect(dmMessages).toHaveLength(0);
    expect(recipientMessages).toHaveLength(1);
    expect(senderMessages).toHaveLength(1);
    expect(recipientMessages[0].senderName).toBe("Player A");
    expect(recipientMessages[0].senderColorIndex).toBe(senderMessages[0].senderColorIndex);
  });

  it("replays the same client message without creating a duplicate", async () => {
    await seedCampaignFixture(); const headers = await authenticatedHeaders(users.playerA);
    const payload = { content: "Exactly once", audience: "party", clientMessageId: "client-once" };
    const first = await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload });
    const second = await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload });
    expect(first.statusCode).toBe(201); expect(second.statusCode).toBe(200);
    expect(second.json().messageId).toBe(first.json().messageId); expect(second.json().replayed).toBe(true);
    const rows = await db.select().from(campaignMessages).where(eq(campaignMessages.clientMessageId, "client-once"));
    expect(rows).toHaveLength(1); expect(rows[0]?.senderDisplayName).toBe("Player A");
    const conflict = await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers, payload: { ...payload, content: "Different" } });
    expect(conflict.statusCode).toBe(409);
  });

  it("paginates visible messages without gaps or duplicates", async () => {
    await seedCampaignFixture(); const createdAt = new Date("2026-07-13T12:00:00.000Z");
    await db.insert(campaignMessages).values(Array.from({ length: 51 }, (_, index) => ({ messageId: `msg_page_${String(index).padStart(3, "0")}`, campaignId: CAMPAIGN_ID, senderUserId: users.dm, senderPlayerId: null, senderDisplayName: "DM", audience: "party", recipientPlayerId: null, content: `Message ${index}`, createdAt })));
    const headers = await authenticatedHeaders(users.playerA);
    const first = (await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages`, headers })).json();
    expect(first.messages).toHaveLength(50); expect(first.pageInfo.nextCursor).toBe("msg_page_001");
    const second = (await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages?before=${first.pageInfo.nextCursor}`, headers })).json();
    const allIds = [...first.messages, ...second.messages].map((message: { messageId: string }) => message.messageId);
    expect(new Set(allIds).size).toBe(51);
  });

  it("rejects invisible and cross-campaign cursors", async () => {
    await seedCampaignFixture();
    await db.insert(campaignMessages).values([
      { messageId: "msg_private_b", campaignId: CAMPAIGN_ID, senderUserId: users.playerB, senderPlayerId: players.b, senderDisplayName: "Player B", audience: "player", recipientPlayerId: players.b, content: "Only player B" },
      { messageId: "msg_other_campaign", campaignId: OTHER_CAMPAIGN_ID, senderUserId: users.dm, senderDisplayName: "DM", audience: "party", content: "Other campaign" },
    ]);
    const headers = await authenticatedHeaders(users.playerA);
    for (const cursor of ["msg_private_b", "msg_other_campaign"]) expect((await server.inject({ method: "GET", url: `/api/campaigns/${CAMPAIGN_ID}/messages?before=${cursor}`, headers })).statusCode).toBe(400);
  });

  it("records only visible reads and remains idempotent", async () => {
    await seedCampaignFixture();
    await db.insert(campaignMessages).values([
      { messageId: "msg_party_visible", campaignId: CAMPAIGN_ID, senderUserId: users.dm, senderDisplayName: "DM", audience: "party", content: "Visible party message" },
      { messageId: "msg_private_visible", campaignId: CAMPAIGN_ID, senderUserId: users.playerB, senderPlayerId: players.b, senderDisplayName: "Player B", audience: "player", recipientPlayerId: players.a, content: "Visible private message" },
      { messageId: "msg_private_hidden", campaignId: CAMPAIGN_ID, senderUserId: users.playerA, senderPlayerId: players.a, senderDisplayName: "Player A", audience: "player", recipientPlayerId: players.b, content: "Hidden private message" },
    ]);
    const headers = await authenticatedHeaders(users.playerA); const payload = { messageIds: ["msg_party_visible", "msg_private_visible", "msg_private_hidden"] };
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages/read`, headers, payload })).statusCode).toBe(204);
    expect((await server.inject({ method: "POST", url: `/api/campaigns/${CAMPAIGN_ID}/messages/read`, headers, payload })).statusCode).toBe(204);
    const reads = await db.select().from(campaignMessageReads).where(and(eq(campaignMessageReads.userId, users.playerA), inArray(campaignMessageReads.messageId, payload.messageIds)));
    expect(reads.map((read) => read.messageId).sort()).toEqual(["msg_party_visible", "msg_private_hidden", "msg_private_visible"]);
  });

  it("keeps campaign access isolated", async () => {
    await seedCampaignFixture();
    expect((await server.inject({ method: "GET", url: `/api/campaigns/${OTHER_CAMPAIGN_ID}/messages`, headers: await authenticatedHeaders(users.playerA) })).statusCode).toBe(403);
  });
});
