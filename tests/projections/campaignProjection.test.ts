import { describe, expect, it } from "vitest";
import { rebuildCampaignProjection } from "../../src/projections/campaignProjection.js";

describe("CampaignProjection", () => {
  it("rebuilds campaign and entities from events", () => {
    const projection = rebuildCampaignProjection([
      {
        sequence: 1,
        eventId: "evt_one",
        campaignId: "cmp_one",
        type: "CampaignCreated",
        occurredAt: "2026-06-25T00:00:00.000Z",
        actorId: "usr_dm",
        payload: { campaignId: "cmp_one", title: "Valleverde", archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "EntityCreated",
        occurredAt: "2026-06-25T00:01:00.000Z",
        actorId: "usr_dm",
        payload: { entityId: "ent_mira", campaignId: "cmp_one", entityType: "npc", title: "Mira", importance: "normal", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false },
        schemaVersion: 1,
      },
    ]);

    expect(projection.campaign?.title).toBe("Valleverde");
    expect(projection.entities.get("ent_mira")?.title).toBe("Mira");
  });

  it("updates entity visibility upon VisibilityChanged event", () => {
    const projection = rebuildCampaignProjection([
      {
        sequence: 1,
        eventId: "evt_one",
        campaignId: "cmp_one",
        type: "CampaignCreated",
        occurredAt: "2026-06-25T00:00:00.000Z",
        actorId: "usr_dm",
        payload: { campaignId: "cmp_one", title: "Valleverde", archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "EntityCreated",
        occurredAt: "2026-06-25T00:01:00.000Z",
        actorId: "usr_dm",
        payload: { entityId: "ent_mira", campaignId: "cmp_one", entityType: "npc", title: "Mira", importance: "normal", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 3,
        eventId: "evt_three",
        campaignId: "cmp_one",
        type: "VisibilityChanged",
        occurredAt: "2026-06-25T00:02:00.000Z",
        actorId: "usr_dm",
        payload: {
          targetId: "ent_mira",
          targetType: "entity",
          visibility: { kind: "party" },
          sessionId: "sess_one",
          note: "Players discovered Mira in the tavern"
        },
        schemaVersion: 1,
      }
    ]);

    expect(projection.entities.get("ent_mira")?.visibility).toEqual({ kind: "party" });
  });
});
