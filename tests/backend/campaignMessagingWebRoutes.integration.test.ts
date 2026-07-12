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

const users = {
  dm: "usr_messaging_dm",
  playerA: "usr_messaging_player_a",
  playerB: "usr_messaging_player_b",
  viewer: "usr_messaging_viewer",
};

const players = {
  a: "ply_messaging_a",
  b: "ply_messaging_b",
};

const server = createServer();

async function seedUser(userId: string, suffix: string) {
  await db.insert(schema.users).values({
    userId,
    workspacePartitionId: "default",
    emailNormalized: `${suffix}@example.test`,
    emailHash: `hash_${suffix}`,
    displayName: suffix,
    passwordHash: "test-password-hash",
    passwordSalt: "test-password-salt",
    passwordAlgorithm: "scrypt",
  });
}

async function authenticatedHeaders(userId: string) {
  const { token } = await createWebSession(userId);
  return {
    cookie: `${WEB_SESSION_COOKIE}=${token}`,
    origin: ORIGIN,
  };
}

async function seedCampaignFixture() {
  await seedUser(users.dm, "dm");
  await seedUser(users.playerA, "player-a");
  await seedUser(users.playerB, "player-b");
  await seedUser(users.viewer, "viewer");

  await db.insert(schema.workspaces).values({
    workspaceId: WORKSPACE_ID,
    workspacePartitionId: "default",
    name: "Messaging integration workspace",
    ownerId: users.dm,
  });
  await db.insert(schema.workspaceMemberships).values({
    workspaceId: WORKSPACE_ID,
    userId: users.dm,
    role: "owner",
  });
  await db.insert(schema.campaigns).values([
    {
      campaignId: CAMPAIGN_ID,
      title: "Messaging integration campaign",
      workspaceId: WORKSPACE_ID,
      ownerId: users.dm,
    },
    {
      campaignId: OTHER_CAMPAIGN_ID,
      title: "Other messaging campaign",
      workspaceId: WORKSPACE_ID,
      ownerId: users.dm,
    },
  ]);
  await db.insert(schema.playerProfiles).values([
    {
      profileId: players.a,
      campaignId: CAMPAIGN_ID,
      userId: users.playerA,
      displayName: "Player A",
    },
    {
      profileId: players.b,
      campaignId: CAMPAIGN_ID,
      userId: users.playerB,
      displayName: "Player B",
    },
  ]);
  await db.insert(schema.campaignMemberships).values([
    { campaignId: CAMPAIGN_ID, userId: users.dm, role: "dm", playerId: null },
    { campaignId: CAMPAIGN_ID, userId: users.playerA, role: "player", playerId: players.a },
    { campaignId: CAMPAIGN_ID, userId: users.playerB, role: "player", playerId: players.b },
    { campaignId: CAMPAIGN_ID, userId: users.viewer, role: "viewer", playerId: null },
  ]);
}

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe("campaign messaging web routes", () => {
  it("rejects writes from read-only campaign roles", async () => {
    await seedCampaignFixture();
    const response = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers: await authenticatedHeaders(users.viewer),
      payload: { content: "Viewer cannot write", audience: "party" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ error: "Campaign role cannot send messages" });
  });

  it("validates message size and private recipients", async () => {
    await seedCampaignFixture();
    const headers = await authenticatedHeaders(users.playerA);

    const oversized = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers,
      payload: { content: "x".repeat(4_001), audience: "party" },
    });
    expect(oversized.statusCode).toBe(400);

    const missingRecipient = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers,
      payload: { content: "Private", audience: "player" },
    });
    expect(missingRecipient.statusCode).toBe(400);

    const unknownRecipient = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers,
      payload: { content: "Private", audience: "player", recipientPlayerId: "ply_unknown" },
    });
    expect(unknownRecipient.statusCode).toBe(404);
  });

  it("paginates visible messages without gaps or duplicates", async () => {
    await seedCampaignFixture();
    const createdAt = new Date("2026-07-13T12:00:00.000Z");
    await db.insert(campaignMessages).values(
      Array.from({ length: 51 }, (_, index) => ({
        messageId: `msg_page_${String(index).padStart(3, "0")}`,
        campaignId: CAMPAIGN_ID,
        senderUserId: users.dm,
        senderPlayerId: null,
        audience: "party",
        recipientPlayerId: null,
        content: `Message ${index}`,
        createdAt,
      })),
    );

    const headers = await authenticatedHeaders(users.playerA);
    const firstResponse = await server.inject({
      method: "GET",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages`,
      headers,
    });
    expect(firstResponse.statusCode).toBe(200);
    const firstPage = firstResponse.json();
    expect(firstPage.messages).toHaveLength(50);
    expect(firstPage.pageInfo.hasMore).toBe(true);
    expect(firstPage.pageInfo.nextCursor).toBe("msg_page_001");

    const secondResponse = await server.inject({
      method: "GET",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages?before=${firstPage.pageInfo.nextCursor}`,
      headers,
    });
    expect(secondResponse.statusCode).toBe(200);
    const secondPage = secondResponse.json();
    expect(secondPage.messages.map((message: { messageId: string }) => message.messageId)).toEqual(["msg_page_000"]);
    expect(secondPage.pageInfo.hasMore).toBe(false);

    const allIds = [...firstPage.messages, ...secondPage.messages]
      .map((message: { messageId: string }) => message.messageId);
    expect(new Set(allIds).size).toBe(51);
  });

  it("does not accept a cursor that is invisible or from another campaign", async () => {
    await seedCampaignFixture();
    await db.insert(campaignMessages).values([
      {
        messageId: "msg_private_b",
        campaignId: CAMPAIGN_ID,
        senderUserId: users.dm,
        audience: "player",
        recipientPlayerId: players.b,
        content: "Only player B",
      },
      {
        messageId: "msg_other_campaign",
        campaignId: OTHER_CAMPAIGN_ID,
        senderUserId: users.dm,
        audience: "party",
        content: "Other campaign",
      },
    ]);

    const headers = await authenticatedHeaders(users.playerA);
    for (const cursor of ["msg_private_b", "msg_other_campaign"]) {
      const response = await server.inject({
        method: "GET",
        url: `/api/campaigns/${CAMPAIGN_ID}/messages?before=${cursor}`,
        headers,
      });
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: "Invalid message cursor" });
    }
  });

  it("records reads only for messages visible to the current user and remains idempotent", async () => {
    await seedCampaignFixture();
    await db.insert(campaignMessages).values([
      {
        messageId: "msg_party_visible",
        campaignId: CAMPAIGN_ID,
        senderUserId: users.dm,
        audience: "party",
        content: "Visible party message",
      },
      {
        messageId: "msg_private_visible",
        campaignId: CAMPAIGN_ID,
        senderUserId: users.dm,
        audience: "player",
        recipientPlayerId: players.a,
        content: "Visible private message",
      },
      {
        messageId: "msg_private_hidden",
        campaignId: CAMPAIGN_ID,
        senderUserId: users.dm,
        audience: "player",
        recipientPlayerId: players.b,
        content: "Hidden private message",
      },
    ]);

    const headers = await authenticatedHeaders(users.playerA);
    const payload = {
      messageIds: ["msg_party_visible", "msg_private_visible", "msg_private_hidden"],
    };
    const first = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages/read`,
      headers,
      payload,
    });
    const second = await server.inject({
      method: "POST",
      url: `/api/campaigns/${CAMPAIGN_ID}/messages/read`,
      headers,
      payload,
    });
    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(204);

    const reads = await db.select().from(campaignMessageReads).where(and(
      eq(campaignMessageReads.userId, users.playerA),
      inArray(campaignMessageReads.messageId, payload.messageIds),
    ));
    expect(reads.map((read) => read.messageId).sort()).toEqual([
      "msg_party_visible",
      "msg_private_visible",
    ]);
  });

  it("keeps campaign access isolated", async () => {
    await seedCampaignFixture();
    const headers = await authenticatedHeaders(users.playerA);
    const response = await server.inject({
      method: "GET",
      url: `/api/campaigns/${OTHER_CAMPAIGN_ID}/messages`,
      headers,
    });
    expect(response.statusCode).toBe(403);
  });
});
