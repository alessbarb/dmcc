import { describe, expect, it } from "vitest";
import { rebuildCampaignProjection } from "../../src/core/projections/campaignProjection.js";

describe("CampaignProjection", () => {
  it("rebuilds campaign and entities from events", () => {
    const projection = rebuildCampaignProjection([
      {
        sequence: 1,
        eventId: "evt_one",
        campaignId: "cmp_one",
        type: "CampaignCreated",
        occurredAt: "2026-06-25T00:00:00.000Z",
        actorId: "usr_core",
        payload: { campaignId: "cmp_one", title: "Valleverde", archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "EntityCreated",
        occurredAt: "2026-06-25T00:01:00.000Z",
        actorId: "usr_core",
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
        actorId: "usr_core",
        payload: { campaignId: "cmp_one", title: "Valleverde", archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "EntityCreated",
        occurredAt: "2026-06-25T00:01:00.000Z",
        actorId: "usr_core",
        payload: { entityId: "ent_mira", campaignId: "cmp_one", entityType: "npc", title: "Mira", importance: "normal", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false },
        schemaVersion: 1,
      },
      {
        sequence: 3,
        eventId: "evt_three",
        campaignId: "cmp_one",
        type: "VisibilityChanged",
        occurredAt: "2026-06-25T00:02:00.000Z",
        actorId: "usr_core",
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

  it("applies SessionPlanRevised and carries plan/activatedPlanRevision through SessionStarted", () => {
    const plan = {
      version: 2 as const,
      revision: 1,
      state: "ready" as const,
      goals: [],
      checklist: [],
      flowItems: [],
      contentLinks: [],
      transitions: [],
      bindings: [],
    };
    const projection = rebuildCampaignProjection([
      {
        sequence: 1,
        eventId: "evt_one",
        campaignId: "cmp_one",
        type: "SessionCreated",
        occurredAt: "2026-06-25T00:00:00.000Z",
        actorId: "usr_core",
        payload: {
          id: "sess_one",
          sessionId: "sess_one",
          campaignId: "cmp_one",
          number: 1,
          title: "La emboscada",
          status: "planned",
          presentPlayerIds: [],
          presentCharacterIds: [],
          createdAt: "2026-06-25T00:00:00.000Z",
          updatedAt: "2026-06-25T00:00:00.000Z",
        },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "SessionPlanRevised",
        occurredAt: "2026-06-25T00:01:00.000Z",
        actorId: "usr_core",
        payload: {
          sessionId: "sess_one",
          title: "La emboscada",
          previousRevision: 0,
          revision: 1,
          plan,
        },
        schemaVersion: 1,
      },
    ]);

    expect(projection.sessions.get("sess_one")?.plan?.revision).toBe(1);
    expect(projection.sessions.get("sess_one")?.plan?.state).toBe("ready");

    const activated = rebuildCampaignProjection([
      {
        sequence: 3,
        eventId: "evt_three",
        campaignId: "cmp_one",
        type: "SessionStarted" as const,
        occurredAt: "2026-06-25T00:02:00.000Z",
        actorId: "usr_core",
        payload: {
          id: "sess_one",
          sessionId: "sess_one",
          campaignId: "cmp_one",
          status: "active",
          startedAt: "2026-06-25T00:02:00.000Z",
          activatedPlanRevision: 1,
          plan,
        },
        schemaVersion: 1,
      },
    ]);
    // Fresh projection (session doesn't exist yet): exercises the "create on the fly" branch.
    expect(activated.sessions.get("sess_one")?.status).toBe("active");
    expect(activated.sessions.get("sess_one")?.activatedPlanRevision).toBe(1);
    expect(activated.sessions.get("sess_one")?.plan?.revision).toBe(1);

    // Existing session (created via SessionCreated first): exercises the "merge into existing" branch.
    const activatedExisting = rebuildCampaignProjection([
      {
        sequence: 1,
        eventId: "evt_one",
        campaignId: "cmp_one",
        type: "SessionCreated",
        occurredAt: "2026-06-25T00:00:00.000Z",
        actorId: "usr_core",
        payload: {
          id: "sess_two",
          sessionId: "sess_two",
          campaignId: "cmp_one",
          number: 1,
          title: "La guarida",
          status: "planned",
          presentPlayerIds: [],
          presentCharacterIds: [],
          createdAt: "2026-06-25T00:00:00.000Z",
          updatedAt: "2026-06-25T00:00:00.000Z",
        },
        schemaVersion: 1,
      },
      {
        sequence: 2,
        eventId: "evt_two",
        campaignId: "cmp_one",
        type: "SessionStarted",
        occurredAt: "2026-06-25T00:02:00.000Z",
        actorId: "usr_core",
        payload: {
          id: "sess_two",
          sessionId: "sess_two",
          campaignId: "cmp_one",
          status: "active",
          startedAt: "2026-06-25T00:02:00.000Z",
          activatedPlanRevision: 0,
          plan: { ...plan, revision: 0 },
        },
        schemaVersion: 1,
      },
    ]);
    expect(activatedExisting.sessions.get("sess_two")?.status).toBe("active");
    expect(activatedExisting.sessions.get("sess_two")?.activatedPlanRevision).toBe(0);
    expect(activatedExisting.sessions.get("sess_two")?.plan?.state).toBe("ready");
  });
});
