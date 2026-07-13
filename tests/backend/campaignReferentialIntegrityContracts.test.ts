import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import { playerPortalResources, playerPortalStates } from "../../src/backend/db/playerPortalSchema.js";
import * as schema from "../../src/backend/db/schema.js";

const ids = {
  owner: "usr_integrity_owner",
  viewer: "usr_integrity_viewer",
  workspace: "wks_integrity",
  campaignA: "cmp_integrity_a",
  campaignB: "cmp_integrity_b",
  playerA: "ply_integrity_a",
};

async function seedCampaigns(): Promise<void> {
  await db.insert(schema.users).values([
    {
      userId: ids.owner,
      emailNormalized: "integrity-owner@example.test",
      emailHash: "integrity-owner",
      displayName: "Owner",
      passwordHash: "hash",
      passwordSalt: "salt",
    },
    {
      userId: ids.viewer,
      emailNormalized: "integrity-viewer@example.test",
      emailHash: "integrity-viewer",
      displayName: "Viewer",
      passwordHash: "hash",
      passwordSalt: "salt",
    },
  ]);
  await db.insert(schema.workspaces).values({
    workspaceId: ids.workspace,
    name: "Integrity workspace",
    ownerId: ids.owner,
  });
  await db.insert(schema.campaigns).values([
    {
      campaignId: ids.campaignA,
      title: "Campaign A",
      workspaceId: ids.workspace,
      ownerId: ids.owner,
    },
    {
      campaignId: ids.campaignB,
      title: "Campaign B",
      workspaceId: ids.workspace,
      ownerId: ids.owner,
    },
  ]);
  await db.insert(schema.playerProfiles).values({
    profileId: ids.playerA,
    campaignId: ids.campaignA,
    userId: ids.viewer,
    displayName: "Player A",
  });
}

describe("player visibility referential integrity", () => {
  it("deletes player-owned records with their campaign", async () => {
    await seedCampaigns();
    await db.insert(schema.campaignMemberships).values({
      campaignId: ids.campaignA,
      userId: ids.viewer,
      role: "player",
      playerId: ids.playerA,
    });
    await db.insert(schema.playerProposals).values({
      campaignId: ids.campaignA,
      proposalId: "proposal_integrity_a",
      userId: ids.viewer,
      playerId: ids.playerA,
      type: "character_link",
      content: {},
    });
    await db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaignA,
      targetType: "entity",
      targetId: "entity_integrity_a",
      scope: "specific_player",
      source: "visibility",
      userId: null,
      playerId: ids.playerA,
    });
    await db.insert(playerPortalStates).values({
      campaignId: ids.campaignA,
      playerId: ids.playerA,
      status: {},
    });
    await db.insert(playerPortalResources).values({
      campaignId: ids.campaignA,
      resourceId: "resource_integrity_a",
      playerId: ids.playerA,
      data: {},
    });

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, ids.campaignA));

    const [memberships, profiles, proposals, grants, states, resources] = await Promise.all([
      db.select().from(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, ids.campaignA)),
      db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, ids.campaignA)),
      db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, ids.campaignA)),
      db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, ids.campaignA)),
      db.select().from(playerPortalStates).where(eq(playerPortalStates.campaignId, ids.campaignA)),
      db.select().from(playerPortalResources).where(eq(playerPortalResources.campaignId, ids.campaignA)),
    ]);

    expect(memberships).toHaveLength(0);
    expect(profiles).toHaveLength(0);
    expect(proposals).toHaveLength(0);
    expect(grants).toHaveLength(0);
    expect(states).toHaveLength(0);
    expect(resources).toHaveLength(0);
  });

  it("rejects a membership linked to a player from another campaign", async () => {
    await seedCampaigns();

    await expect(db.insert(schema.campaignMemberships).values({
      campaignId: ids.campaignB,
      userId: ids.viewer,
      role: "player",
      playerId: ids.playerA,
    })).rejects.toThrow();
  });

  it("rejects a player grant from another campaign", async () => {
    await seedCampaigns();

    await expect(db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaignB,
      targetType: "entity",
      targetId: "entity_other_campaign",
      scope: "specific_player",
      source: "visibility",
      userId: null,
      playerId: ids.playerA,
    })).rejects.toThrow();
  });

  it("rejects portal state for a player from another campaign", async () => {
    await seedCampaigns();

    await expect(db.insert(playerPortalStates).values({
      campaignId: ids.campaignB,
      playerId: ids.playerA,
      status: {},
    })).rejects.toThrow();
  });

  it("deletes user-specific grants when the user is deleted", async () => {
    await seedCampaigns();
    await db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaignA,
      targetType: "entity",
      targetId: "entity_for_viewer",
      scope: "specific_user",
      source: "manual",
      userId: ids.viewer,
      playerId: null,
    });

    await db.delete(schema.users).where(eq(schema.users.userId, ids.viewer));

    const grants = await db
      .select()
      .from(schema.visibilityGrants)
      .where(eq(schema.visibilityGrants.targetId, "entity_for_viewer"));

    expect(grants).toHaveLength(0);
  });
});
