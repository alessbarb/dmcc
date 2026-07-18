import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";

describe("command bus", () => {
  it("creates campaign events", () => {
    const state = createCampaignState("cmp_one");
    const result = handleCommand(state, {
      type: "CreateCampaign",
      campaignId: "cmp_one",
      actorId: "usr_core",
      title: "Valleverde",
    });

    expect(result.events[0].type).toBe("CampaignCreated");
    expect(result.state.campaign?.title).toBe("Valleverde");
  });

  it("creates entities with dm_only visibility", () => {
    const state = createCampaignState("cmp_one");
    const result = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_core",
      entityType: "npc",
      title: "Mira",
    });

    expect(result.events[0].type).toBe("EntityCreated");
    expect([...result.state.entities.values()][0]?.visibility.kind).toBe("dm_only");
  });
});

describe("command bus extended campaign commands", () => {
  it("creates relations between entities in the same campaign", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_a", entityType: "npc", title: "A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_b", entityType: "npc", title: "B" }).state;

    const result = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_core",
      relationId: "rel_one",
      sourceEntityId: "ent_a",
      targetEntityId: "ent_b",
      relationType: "knows",
    });

    expect(result.events[0].type).toBe("RelationCreated");
    expect(result.state.relations.get("rel_one")?.relationType).toBe("knows");
  });

  it("rejects duplicate relations without explicit confirmation", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_a", entityType: "npc", title: "A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_b", entityType: "npc", title: "B" }).state;
    state = handleCommand(state, { type: "CreateRelation", campaignId: "cmp_one", actorId: "usr_core", relationId: "rel_one", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "knows" }).state;

    expect(() =>
      handleCommand(state, { type: "CreateRelation", campaignId: "cmp_one", actorId: "usr_core", relationId: "rel_two", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "knows" }),
    ).toThrow("Duplicate relation requires confirmation");
  });

  it("allows relating one source entity to multiple target entities", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_source", entityType: "faction", title: "Faction A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_target1", entityType: "npc", title: "NPC 1" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_target2", entityType: "npc", title: "NPC 2" }).state;

    // Relate to target 1
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_core",
      relationId: "rel_one",
      sourceEntityId: "ent_source",
      targetEntityId: "ent_target1",
      relationType: "relacionado_con",
    }).state;

    // Relate to target 2
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_core",
      relationId: "rel_two",
      sourceEntityId: "ent_source",
      targetEntityId: "ent_target2",
      relationType: "relacionado_con",
    }).state;

    expect(state.relations.get("rel_one")?.targetEntityId).toBe("ent_target1");
    expect(state.relations.get("rel_two")?.targetEntityId).toBe("ent_target2");
  });

  it("records classified facts", () => {
    const state = createCampaignState("cmp_one");
    const result = handleCommand(state, {
      type: "RecordFact",
      campaignId: "cmp_one",
      actorId: "usr_core",
      factId: "fact_one",
      statement: "Mira saw the cult symbol.",
      kind: "canon",
      confidence: "confirmed",
      relatedEntityIds: [],
      source: { kind: "manual" },
    });

    expect(result.events[0].type).toBe("FactCreated");
    expect(result.state.facts.get("fact_one")?.kind).toBe("canon");
  });

  it("creates a prepared session without activating the table", () => {
    const state = createCampaignState("cmp_one");
    const result = handleCommand(state, {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
      title: "Session prep",
      prep: {
        state: "ready",
        goals: ["Introduce the oracle"],
        availableClueIds: ["ent_clue"],
      },
    });

    expect(result.events[0].type).toBe("SessionCreated");
    expect(result.state.sessions.get("sess_prep")?.status).toBe("planned");
    expect(result.state.sessions.get("sess_prep")?.startedAt).toBeUndefined();
    expect(result.state.sessions.get("sess_prep")?.prep?.state).toBe("ready");
  });

  it("revises the plan and activates a prepared session", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
      title: "Session prep",
      prep: { state: "draft" },
    }).state;

    const updated = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
      expectedRevision: 0,
      title: "Session prep",
      plan: {
        version: 2,
        state: "ready",
        summary: "Ready to play.",
        goals: [],
        checklist: [],
        flowItems: [],
        contentLinks: [],
        transitions: [],
        bindings: [],
      },
    });

    expect(updated.events[0].type).toBe("SessionPlanRevised");
    expect(updated.state.sessions.get("sess_prep")?.plan?.summary).toBe("Ready to play.");

    const activated = handleCommand(updated.state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
    });

    expect(activated.events[0].type).toBe("SessionStarted");
    expect(activated.state.sessions.get("sess_prep")?.status).toBe("active");
    expect(activated.state.sessions.get("sess_prep")?.plan?.state).toBe("ready");
  });

  it("does not close a prepared session before activation", () => {
    const state = handleCommand(createCampaignState("cmp_one"), {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
      title: "Session prep",
    }).state;

    expect(() =>
      handleCommand(state, {
        type: "CloseSession",
        campaignId: "cmp_one",
        actorId: "usr_core",
        sessionId: "sess_prep",
        summary: "Should not close.",
      }),
    ).toThrow("Only active sessions can be closed");
  });


  it("cancels and archives prepared sessions without activating them", () => {
    let state = handleCommand(createCampaignState("cmp_one"), {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
      title: "Session prep",
    }).state;

    const cancelled = handleCommand(state, {
      type: "CancelPreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
    });

    expect(cancelled.events[0].type).toBe("SessionCancelled");
    expect(cancelled.state.sessions.get("sess_prep")?.status).toBe("cancelled");

    state = cancelled.state;
    const archived = handleCommand(state, {
      type: "ArchiveSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_prep",
    });

    expect(archived.events[0].type).toBe("SessionArchived");
    expect(archived.state.sessions.get("sess_prep")?.status).toBe("archived");
  });

  it("starts and closes a session with a required summary", () => {
    let state = createCampaignState("cmp_one");
    const started = handleCommand(state, {
      type: "StartSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_one",
      title: "Session 1",
    });

    expect(started.events[0].type).toBe("SessionStarted");
    state = started.state;

    const closed = handleCommand(state, {
      type: "CloseSession",
      campaignId: "cmp_one",
      actorId: "usr_core",
      sessionId: "sess_one",
      summary: "The party reached Valleverde.",
    });

    expect(closed.events[0].type).toBe("SessionClosed");
    expect(closed.state.sessions.get("sess_one")?.status).toBe("closed");
  });

  it("reveals clues by changing visibility and recording session context", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_core", entityId: "ent_clue", entityType: "clue", title: "Bloody sigil", metadata: { content: "Bloody sigil content" } }).state;
    state = handleCommand(state, { type: "StartSession", campaignId: "cmp_one", actorId: "usr_core", sessionId: "sess_one", title: "Session 1" }).state;

    const result = handleCommand(state, {
      type: "RevealClue",
      campaignId: "cmp_one",
      actorId: "usr_core",
      clueEntityId: "ent_clue",
      sessionId: "sess_one",
      audience: { kind: "party" },
      note: "Found in the cellar.",
    });

    expect(result.events[0].type).toBe("ClueRevealed");
    expect(result.state.entities.get("ent_clue")?.visibility.kind).toBe("party");
    expect(result.state.entities.get("ent_clue")?.status).toBe("revealed");
    expect(result.events[0].payload).toMatchObject({ clueEntityId: "ent_clue", sessionId: "sess_one", visibility: { kind: "party" }, note: "Found in the cellar." });
  });
});
