import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

const ids = {
  owner: "usr_integrity_owner",
  workspace: "wks_integrity",
  campaignA: "cmp_integrity_a",
  campaignB: "cmp_integrity_b",
  playerA: "ply_integrity_a",
  entityA: "ent_integrity_a",
};

async function seedCampaigns(): Promise<void> {
  await db.insert(schema.users).values({
    userId: ids.owner,
    emailNormalized: "integrity-owner@example.test",
    emailHash: "integrity-owner",
    displayName: "Owner",
    passwordHash: "hash",
    passwordSalt: "salt",
  });
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
}

async function seedCampaignAContent(): Promise<void> {
  await db.insert(schema.playerProfiles).values({
    profileId: ids.playerA,
    campaignId: ids.campaignA,
    displayName: "Player A",
  });
  await db.insert(schema.campaignEntities).values({
    campaignId: ids.campaignA,
    entityId: ids.entityA,
    type: "character",
    name: "Entity A",
  });
}

describe("campaign referential integrity", () => {
  it("deletes campaign-owned records with their campaign", async () => {
    await seedCampaigns();
    await seedCampaignAContent();
    await db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaignA,
      targetType: "entity",
      targetId: ids.entityA,
      scope: "specific_player",
      userId: null,
      playerId: ids.playerA,
    });
    await db.insert(schema.domainEvents).values({
      campaignId: ids.campaignA,
      sequence: 1,
      eventId: "evt_integrity_a",
      type: "CampaignCreated",
      payload: {},
      occurredAt: "2026-07-13T00:00:00.000Z",
      actorId: ids.owner,
      hash: "hash_integrity_a",
      schemaVersion: 1,
    });

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, ids.campaignA));

    const [profiles, entities, grants, events] = await Promise.all([
      db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, ids.campaignA)),
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, ids.campaignA)),
      db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, ids.campaignA)),
      db.select().from(schema.domainEvents).where(eq(schema.domainEvents.campaignId, ids.campaignA)),
    ]);

    expect(profiles).toHaveLength(0);
    expect(entities).toHaveLength(0);
    expect(grants).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it("rejects a player reference from another campaign", async () => {
    await seedCampaigns();
    await seedCampaignAContent();

    await expect(db.insert(schema.visibilityGrants).values({
      campaignId: ids.campaignB,
      targetType: "entity",
      targetId: "ent_other_campaign",
      scope: "specific_player",
      userId: null,
      playerId: ids.playerA,
    })).rejects.toThrow();
  });

  it("rejects an entity relationship that crosses campaign boundaries", async () => {
    await seedCampaigns();
    await seedCampaignAContent();

    await expect(db.insert(schema.campaignFacts).values({
      campaignId: ids.campaignB,
      factId: "fact_cross_campaign",
      subjectEntityId: ids.entityA,
      kind: "canon",
      contentPublic: "Cross-campaign fact",
    })).rejects.toThrow();
  });

  it("clears optional entity references when the entity is deleted", async () => {
    await seedCampaigns();
    await seedCampaignAContent();
    await db.insert(schema.campaignClues).values({
      campaignId: ids.campaignA,
      clueId: "clue_integrity_a",
      entityId: ids.entityA,
      title: "Clue A",
    });

    await db.delete(schema.campaignEntities).where(and(
      eq(schema.campaignEntities.campaignId, ids.campaignA),
      eq(schema.campaignEntities.entityId, ids.entityA),
    ));

    const [clue] = await db
      .select()
      .from(schema.campaignClues)
      .where(and(
        eq(schema.campaignClues.campaignId, ids.campaignA),
        eq(schema.campaignClues.clueId, "clue_integrity_a"),
      ));

    expect(clue?.entityId).toBeNull();
  });
});
