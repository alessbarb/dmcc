import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

const ids = {
  owner: "usr_cascade_owner",
  workspace: "wks_cascade",
  campaign: "cmp_cascade",
};

async function seedCampaignWithChildren(): Promise<void> {
  await db.insert(schema.users).values({
    userId: ids.owner,
    emailNormalized: "cascade-owner@example.test",
    emailHash: "cascade-owner",
    displayName: "Owner",
    passwordHash: "hash",
  });
  await db.insert(schema.workspaces).values({ workspaceId: ids.workspace, name: "Cascade workspace", ownerId: ids.owner });
  await db.insert(schema.campaigns).values({ campaignId: ids.campaign, title: "Cascade campaign", workspaceId: ids.workspace, ownerId: ids.owner });

  await db.insert(schema.domainEvents).values({
    campaignId: ids.campaign,
    sequence: 1,
    eventId: "evt_cascade_1",
    type: "CampaignCreated",
    payload: {},
    occurredAt: new Date().toISOString(),
    actorId: ids.owner,
    hash: "hash1",
    schemaVersion: 1,
  });
  await db.insert(schema.campaignEntities).values({
    campaignId: ids.campaign,
    entityId: "ent_cascade_1",
    type: "npc",
    name: "Cascade NPC",
  });
  await db.insert(schema.campaignSessions).values({
    campaignId: ids.campaign,
    sessionId: "sess_cascade_1",
    number: 1,
    title: "Session one",
  });
  await db.insert(schema.campaignObjectives).values({
    campaignId: ids.campaign,
    objectiveId: "obj_cascade_1",
    title: "Cascade objective",
  });
  await db.insert(schema.attachments).values({
    campaignId: ids.campaign,
    attachmentId: "att_cascade_1",
    name: "map.png",
    path: "/attachments/map.png",
    mimeType: "image/png",
    size: 1024,
  });
}

describe("campaign ownership cascade delete", () => {
  it("removes rows from a representative table in each group when the campaign is deleted", async () => {
    // This is a smoke test, not exhaustive proof: it confirms cascade actually
    // fires end-to-end for one table per migration group (domain_events from
    // Group A, campaign_sessions/campaign_objectives from Group B, attachments
    // from Group C, plus campaign_entities). Full coverage across all 16
    // tables — including that every FK specifically uses CASCADE and not some
    // other delete_rule — is asserted by campaignOwnershipFkAudit.integration.test.ts.
    await seedCampaignWithChildren();

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, ids.campaign));

    const [events, entities, sessions, objectives, attachments] = await Promise.all([
      db.select().from(schema.domainEvents).where(eq(schema.domainEvents.campaignId, ids.campaign)),
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, ids.campaign)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, ids.campaign)),
      db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, ids.campaign)),
      db.select().from(schema.attachments).where(eq(schema.attachments.campaignId, ids.campaign)),
    ]);

    expect(events).toHaveLength(0);
    expect(entities).toHaveLength(0);
    expect(sessions).toHaveLength(0);
    expect(objectives).toHaveLength(0);
    expect(attachments).toHaveLength(0);
  });

  it("rejects inserting a campaign-owned row for a campaign that does not exist", async () => {
    await expect(db.insert(schema.campaignEntities).values({
      campaignId: "cmp_does_not_exist",
      entityId: "ent_orphan",
      type: "npc",
      name: "Orphan NPC",
    })).rejects.toThrow();
  });
});
