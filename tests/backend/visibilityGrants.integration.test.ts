import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import {
  buildDmPlayerKnowledgeProjection,
  grantAllowsPlayer,
  refreshKnowledgeVisibilityGrants,
} from "../../src/backend/server/web/playerKnowledgeProjection.js";

const ids = {
  owner: "usr_visibility_owner",
  userA: "usr_visibility_a",
  userB: "usr_visibility_b",
  workspace: "wks_visibility",
  campaign: "cmp_visibility",
  playerA: "ply_visibility_a",
  playerB: "ply_visibility_b",
};

async function seedVisibilityFixture(): Promise<void> {
  await db.insert(schema.users).values([
    { userId: ids.owner, emailNormalized: "visibility-owner@example.test", emailHash: "visibility-owner", displayName: "Owner", passwordHash: "hash", passwordSalt: "salt" },
    { userId: ids.userA, emailNormalized: "visibility-a@example.test", emailHash: "visibility-a", displayName: "Player A", passwordHash: "hash", passwordSalt: "salt" },
    { userId: ids.userB, emailNormalized: "visibility-b@example.test", emailHash: "visibility-b", displayName: "Player B", passwordHash: "hash", passwordSalt: "salt" },
  ]);
  await db.insert(schema.workspaces).values({ workspaceId: ids.workspace, name: "Visibility workspace", ownerId: ids.owner });
  await db.insert(schema.campaigns).values({ campaignId: ids.campaign, title: "Visibility campaign", workspaceId: ids.workspace, ownerId: ids.owner });
  await db.insert(schema.playerProfiles).values([
    { profileId: ids.playerA, campaignId: ids.campaign, userId: ids.userA, displayName: "Player A" },
    { profileId: ids.playerB, campaignId: ids.campaign, userId: ids.userB, displayName: "Player B" },
  ]);
}

describe("visibility grants", () => {
  it("stores independent grants for different users on the same target", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.visibilityGrants).values([
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_shared", scope: "specific_user", userId: ids.userA, playerId: null },
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_shared", scope: "specific_user", userId: ids.userB, playerId: null },
    ]);

    const grants = await db.select().from(schema.visibilityGrants).where(and(
      eq(schema.visibilityGrants.campaignId, ids.campaign),
      eq(schema.visibilityGrants.targetId, "ent_shared"),
    ));

    expect(grants).toHaveLength(2);
    expect(grants.some((grant) => grantAllowsPlayer(grant, ids.userA, ids.playerA))).toBe(true);
    expect(grants.some((grant) => grantAllowsPlayer(grant, ids.userB, ids.playerB))).toBe(true);
  });

  it("removes one user's grant without affecting another user", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.visibilityGrants).values([
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_character", scope: "specific_user", userId: ids.userA, playerId: null },
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_character", scope: "specific_user", userId: ids.userB, playerId: null },
    ]);

    await db.delete(schema.visibilityGrants).where(and(
      eq(schema.visibilityGrants.campaignId, ids.campaign),
      eq(schema.visibilityGrants.targetType, "entity"),
      eq(schema.visibilityGrants.targetId, "ent_character"),
      eq(schema.visibilityGrants.scope, "specific_user"),
      eq(schema.visibilityGrants.userId, ids.userA),
    ));

    const remaining = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.targetId, "ent_character"));
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.userId).toBe(ids.userB);
  });

  it("rejects grants whose scope and principal columns disagree", async () => {
    await seedVisibilityFixture();

    await expect(db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaign,
      targetType: "entity",
      targetId: "ent_invalid",
      scope: "specific_user",
      userId: ids.userA,
      playerId: ids.playerA,
    })).rejects.toThrow();
  });

  it("keeps player grants independent on the same target", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.visibilityGrants).values([
      { campaignId: ids.campaign, targetType: "fact", targetId: "fact_shared", scope: "specific_player", userId: null, playerId: ids.playerA },
      { campaignId: ids.campaign, targetType: "fact", targetId: "fact_shared", scope: "specific_player", userId: null, playerId: ids.playerB },
    ]);

    const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.targetId, "fact_shared"));
    expect(grants).toHaveLength(2);
    expect(grants.some((grant) => grantAllowsPlayer(grant, ids.userA, ids.playerA))).toBe(true);
    expect(grants.some((grant) => grantAllowsPlayer(grant, ids.userB, ids.playerB))).toBe(true);
  });

  it("revokes derived grants that are no longer present in current visibility state", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaign,
      targetType: "entity",
      targetId: "ent_stale",
      scope: "all_players",
      userId: null,
      playerId: null,
    });

    await refreshKnowledgeVisibilityGrants(ids.campaign);

    const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, ids.campaign));
    expect(grants).toHaveLength(0);
  });

  it("preserves explicit user grants while rebuilding derived visibility", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.visibilityGrants).values([
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_explicit", scope: "specific_user", userId: ids.userA, playerId: null },
      { campaignId: ids.campaign, targetType: "entity", targetId: "ent_stale", scope: "all_players", userId: null, playerId: null },
    ]);

    await Promise.all([
      refreshKnowledgeVisibilityGrants(ids.campaign),
      refreshKnowledgeVisibilityGrants(ids.campaign),
    ]);

    const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, ids.campaign));
    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      targetId: "ent_explicit",
      scope: "specific_user",
      userId: ids.userA,
      playerId: null,
    });
  });

  it("derives linked character access directly from the player profile", async () => {
    await seedVisibilityFixture();
    await db.insert(schema.campaignEntities).values({
      campaignId: ids.campaign,
      entityId: "ent_linked",
      type: "player_character",
      name: "Linked character",
    });
    await db.update(schema.playerProfiles)
      .set({ linkedCharacterId: "ent_linked" })
      .where(eq(schema.playerProfiles.profileId, ids.playerA));

    const projection = await buildDmPlayerKnowledgeProjection(ids.campaign);
    const player = projection.players.find((entry) => entry.playerId === ids.playerA);
    const character = player?.knowledge.find((entry) => entry.targetId === "ent_linked");

    expect(character).toMatchObject({ visible: true, reason: "linked_character" });
  });
});
