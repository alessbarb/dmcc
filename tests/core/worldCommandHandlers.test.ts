import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { rebuildCampaignProjection } from "../../src/core/projections/campaignProjection.js";
import type { StoredEvent } from "../../src/core/domain/events.js";

/**
 * These tests exercise the full execute -> replay -> project round trip.
 * A handler that mutates CampaignState correctly but lacks a matching
 * applyEvent case in campaignProjection.ts would pass a handler-only test
 * yet silently fail to ever show up in the rebuilt projection - the same
 * class of bug that dropped SessionPlanRevised in an earlier sprint.
 */
function withSequence(events: StoredEvent<unknown>[], startAt: number): StoredEvent[] {
  return events.map((event, index) => ({ ...event, sequence: startAt + index }) as StoredEvent);
}

describe("world command handlers", () => {
  it("advances a clock and the change survives projection replay", () => {
    let state = createCampaignState("cmp_one");
    const create = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_clock",
      entityType: "clock",
      title: "Control de Phandalin",
      metadata: { maxSegments: 6, currentSegments: 2, meaning: "Town control" },
    });
    state = create.state;

    const result = handleCommand(state, {
      type: "AdvanceClock",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_clock",
      delta: 1,
    });

    expect(result.events[0].type).toBe("ClockAdvanced");
    expect(result.state.entities.get("ent_clock")?.metadata.currentSegments).toBe(3);

    const projection = rebuildCampaignProjection(withSequence([...create.events, ...result.events], 1));
    expect(projection.entities.get("ent_clock")?.metadata.currentSegments).toBe(3);
  });

  it("clamps clock segments to [0, maxSegments]", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_clock",
      entityType: "clock",
      title: "Doom Clock",
      metadata: { maxSegments: 4, currentSegments: 4, meaning: "Doom" },
    }).state;

    const result = handleCommand(state, {
      type: "AdvanceClock",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_clock",
      delta: 5,
    });

    expect(result.state.entities.get("ent_clock")?.metadata.currentSegments).toBe(4);
  });

  it("triggers and resolves a consequence, reflected after replay", () => {
    let state = createCampaignState("cmp_one");
    const create = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_cons",
      entityType: "consequence",
      title: "Goblin ambush retaliates",
      status: "pending",
    });
    state = create.state;

    const triggered = handleCommand(state, {
      type: "TriggerConsequence",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_cons",
    });
    expect(triggered.events[0].type).toBe("ConsequenceTriggered");
    expect(triggered.state.entities.get("ent_cons")?.status).toBe("triggered");

    const resolved = handleCommand(triggered.state, {
      type: "ResolveConsequence",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_cons",
      resolutionNote: "Party negotiated a truce",
    });
    expect(resolved.events[0].type).toBe("ConsequenceResolved");
    expect(resolved.state.entities.get("ent_cons")?.status).toBe("resolved");

    const projection = rebuildCampaignProjection(
      withSequence([...create.events, ...triggered.events, ...resolved.events], 1),
    );
    expect(projection.entities.get("ent_cons")?.status).toBe("resolved");
  });

  it("activates and resolves a front, reflected after replay", () => {
    let state = createCampaignState("cmp_one");
    const create = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_front",
      entityType: "front",
      title: "Red Caps",
      metadata: { goal: "Terrorize Phandalin" },
    });
    state = create.state;

    const activated = handleCommand(state, {
      type: "ActivateFront",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_front",
    });
    expect(activated.events[0].type).toBe("FrontActivated");
    expect(activated.state.entities.get("ent_front")?.status).toBe("active");

    const resolved = handleCommand(activated.state, {
      type: "ResolveFront",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_front",
    });
    expect(resolved.events[0].type).toBe("FrontResolved");

    const projection = rebuildCampaignProjection(
      withSequence([...create.events, ...activated.events, ...resolved.events], 1),
    );
    expect(projection.entities.get("ent_front")?.status).toBe("resolved");
  });

  it("hints a secret, reflected after replay", () => {
    let state = createCampaignState("cmp_one");
    const create = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_secret",
      entityType: "secret",
      title: "Gundren's true plan",
      metadata: { truth: "He knows about the black spider" },
    });
    state = create.state;

    const hinted = handleCommand(state, {
      type: "HintSecret",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_secret",
      note: "Dropped via an NPC aside",
    });
    expect(hinted.events[0].type).toBe("SecretHinted");
    expect(hinted.state.entities.get("ent_secret")?.status).toBe("hinted");

    const projection = rebuildCampaignProjection(withSequence([...create.events, ...hinted.events], 1));
    expect(projection.entities.get("ent_secret")?.status).toBe("hinted");
  });

  it("updates objective progress, reflected after replay", () => {
    let state = createCampaignState("cmp_one");
    const create = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_quest",
      entityType: "quest",
      title: "Liberar Phandalin",
      status: "active",
    });
    state = create.state;

    const advanced = handleCommand(state, {
      type: "UpdateObjectiveProgress",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_quest",
      progress: "advanced",
    });
    expect(advanced.events[0].type).toBe("ObjectiveProgressUpdated");
    expect(advanced.state.entities.get("ent_quest")?.status).toBe("active");

    const completed = handleCommand(advanced.state, {
      type: "UpdateObjectiveProgress",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_quest",
      progress: "completed",
    });
    expect(completed.state.entities.get("ent_quest")?.status).toBe("completed");

    const projection = rebuildCampaignProjection(
      withSequence([...create.events, ...advanced.events, ...completed.events], 1),
    );
    expect(projection.entities.get("ent_quest")?.status).toBe("completed");
  });

  it("rejects world commands targeting the wrong entity type", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_npc",
      entityType: "npc",
      title: "Sildar",
    }).state;

    expect(() =>
      handleCommand(state, {
        type: "AdvanceClock",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        entityId: "ent_npc",
        delta: 1,
      }),
    ).toThrow(/Expected entity/);
  });

  it("stamps session_live narrativeContext onto world command events", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_clock",
      entityType: "clock",
      title: "Control de Phandalin",
      metadata: { maxSegments: 6, currentSegments: 2, meaning: "Town control" },
    }).state;

    const result = handleCommand(
      state,
      { type: "AdvanceClock", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_clock", delta: 1 },
      { origin: "session_live", sessionId: "sess_one" },
    );

    expect(result.events[0].context).toEqual({ origin: "session_live", sessionId: "sess_one" });
  });
});
