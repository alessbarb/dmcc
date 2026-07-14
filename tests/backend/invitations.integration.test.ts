import { afterAll, beforeAll, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { userRoles } from "../../src/backend/db/authSchema.js";
import { createServer } from "../../src/backend/server/createServer.js";
import { createWebSession, WEB_SESSION_COOKIE } from "../../src/backend/server/web/webSession.js";

const ORIGIN = "http://localhost:4877";
const server = createServer();
const PASSWORD = "correct horse battery staple";

const users = {
  owner: "usr_inv_owner",
  player: "usr_inv_player",
  coDm: "usr_inv_co_dm",
  outsider: "usr_inv_outsider",
};

async function seedFixture() {
  const passwordHash = await argon2.hash(PASSWORD);
  await db.insert(schema.users).values([
    { userId: users.owner, emailNormalized: "inv-owner@example.test", emailHash: "hash_inv_owner", displayName: "Owner", passwordHash },
    { userId: users.player, emailNormalized: "inv-player@example.test", emailHash: "hash_inv_player", displayName: "Player", passwordHash },
    { userId: users.coDm, emailNormalized: "inv-co-dm@example.test", emailHash: "hash_inv_co_dm", displayName: "Co-DM", passwordHash },
    { userId: users.outsider, emailNormalized: "inv-outsider@example.test", emailHash: "hash_inv_outsider", displayName: "Outsider", passwordHash },
  ]);
  const workspaceId = "wks_inv_fixture";
  await db.insert(schema.workspaces).values({ workspaceId, name: "Invitation fixture workspace", ownerId: users.owner });
  await db.insert(schema.workspaceMemberships).values({ workspaceId, userId: users.owner, role: "owner" });
  const campaignId = "cmp_inv_fixture";
  await db.insert(schema.campaigns).values({ campaignId, title: "Invitation fixture campaign", workspaceId, ownerId: users.owner });
  return { campaignId };
}

async function authenticatedHeaders(userId: string) {
  const { token } = await createWebSession(userId);
  return { cookie: `${WEB_SESSION_COOKIE}=${token}`, origin: ORIGIN };
}

async function createInvitation(campaignId: string, role: "player" | "co_dm") {
  const res = await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/invitations`,
    headers: await authenticatedHeaders(users.owner),
    payload: { role },
  });
  expect(res.statusCode).toBe(201);
  return res.json().invitation.token as string;
}

beforeAll(async () => { await server.ready(); });
afterAll(async () => { await server.close(); });

describe("invitations integration", () => {
  it("accepting a player invitation creates a profile, membership, and the player role", async () => {
    const { campaignId } = await seedFixture();
    // Owner needs a real dm membership - creating a campaign directly via fixture bypasses the command bus.
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const token = await createInvitation(campaignId, "player");

    const acceptRes = await server.inject({
      method: "POST",
      url: `/api/invitations/${token}/accept`,
      headers: await authenticatedHeaders(users.player),
    });
    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.json().portal).toBe("player");

    const [membership] = await db.select().from(schema.campaignMemberships).where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, users.player),
    ));
    expect(membership.role).toBe("player");
    expect(membership.playerId).toEqual(expect.any(String));

    const [profile] = await db.select().from(schema.playerProfiles).where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.userId, users.player),
    ));
    expect(profile).toBeDefined();

    const roles = await db.select().from(userRoles).where(eq(userRoles.userId, users.player));
    expect(roles.map((r) => r.role)).toEqual(["player"]);

    const [invitation] = await db.select().from(schema.campaignInvitations).where(eq(schema.campaignInvitations.campaignId, campaignId));
    expect(invitation.usesCount).toBe(1);
  });

  it("accepting a co_dm invitation creates a membership without a player profile and grants dm", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const token = await createInvitation(campaignId, "co_dm");

    const acceptRes = await server.inject({
      method: "POST",
      url: `/api/invitations/${token}/accept`,
      headers: await authenticatedHeaders(users.coDm),
    });
    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.json().portal).toBe("dm");

    const [membership] = await db.select().from(schema.campaignMemberships).where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, users.coDm),
    ));
    expect(membership.role).toBe("co_dm");
    expect(membership.playerId).toBeNull();

    const profiles = await db.select().from(schema.playerProfiles).where(and(
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.userId, users.coDm),
    ));
    expect(profiles).toHaveLength(0);

    const roles = await db.select().from(userRoles).where(eq(userRoles.userId, users.coDm));
    expect(roles.map((r) => r.role)).toContain("dm");
  });

  it("accepting without a session is rejected", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const token = await createInvitation(campaignId, "player");
    const res = await server.inject({ method: "POST", url: `/api/invitations/${token}/accept` });
    expect(res.statusCode).toBe(401);
  });

  it("refuses to create an invitation with a viewer role", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const res = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/invitations`,
      headers: await authenticatedHeaders(users.owner),
      payload: { role: "viewer" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("refuses to create a dm invitation", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const res = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/invitations`,
      headers: await authenticatedHeaders(users.owner),
      payload: { role: "dm" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("a campaign owner without a real membership row cannot create invitations", async () => {
    const { campaignId } = await seedFixture();
    // Deliberately no campaign_memberships row for the owner - no virtual DM fallback allowed.
    const res = await server.inject({
      method: "POST",
      url: `/api/campaigns/${campaignId}/invitations`,
      headers: await authenticatedHeaders(users.owner),
      payload: { role: "player" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("rejects an exhausted invitation", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const token = await createInvitation(campaignId, "player");
    await server.inject({ method: "POST", url: `/api/invitations/${token}/accept`, headers: await authenticatedHeaders(users.player) });
    const secondAttempt = await server.inject({ method: "POST", url: `/api/invitations/${token}/accept`, headers: await authenticatedHeaders(users.outsider) });
    expect(secondAttempt.statusCode).toBe(409);
  });

  it("is idempotent for the same user accepting twice", async () => {
    const { campaignId } = await seedFixture();
    await db.insert(schema.campaignMemberships).values({ campaignId, userId: users.owner, role: "dm", playerId: null });
    const token = await createInvitation(campaignId, "player");
    const first = await server.inject({ method: "POST", url: `/api/invitations/${token}/accept`, headers: await authenticatedHeaders(users.player) });
    const second = await server.inject({ method: "POST", url: `/api/invitations/${token}/accept`, headers: await authenticatedHeaders(users.player) });
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    const memberships = await db.select().from(schema.campaignMemberships).where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, users.player),
    ));
    expect(memberships).toHaveLength(1);
  });
});

describe("users.is_platform_admin column removal", () => {
  it("no longer exists on the users table", async () => {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_platform_admin'`,
    );
    expect(result.rows).toHaveLength(0);
  });
});
