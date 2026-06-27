import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";

describe("command bus", () => {
  it("creates campaign events", () => {
    const state = createCampaignState("cmp_one");
    const result = handleCommand(state, {
      type: "CreateCampaign",
      campaignId: "cmp_one",
      actorId: "usr_dm",
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
      actorId: "usr_dm",
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
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_a", entityType: "npc", title: "A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_b", entityType: "npc", title: "B" }).state;

    const result = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
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
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_a", entityType: "npc", title: "A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_b", entityType: "npc", title: "B" }).state;
    state = handleCommand(state, { type: "CreateRelation", campaignId: "cmp_one", actorId: "usr_dm", relationId: "rel_one", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "knows" }).state;

    expect(() =>
      handleCommand(state, { type: "CreateRelation", campaignId: "cmp_one", actorId: "usr_dm", relationId: "rel_two", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "knows" }),
    ).toThrow("Duplicate relation requires confirmation");
  });

  it("allows relating one source entity to multiple target entities", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_source", entityType: "faction", title: "Faction A" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_target1", entityType: "npc", title: "NPC 1" }).state;
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_target2", entityType: "npc", title: "NPC 2" }).state;

    // Relate to target 1
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      relationId: "rel_one",
      sourceEntityId: "ent_source",
      targetEntityId: "ent_target1",
      relationType: "relacionado_con",
    }).state;

    // Relate to target 2
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
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
      actorId: "usr_dm",
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

  it("starts and closes a session with a required summary", () => {
    let state = createCampaignState("cmp_one");
    const started = handleCommand(state, {
      type: "StartSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      title: "Session 1",
    });

    expect(started.events[0].type).toBe("SessionStarted");
    state = started.state;

    const closed = handleCommand(state, {
      type: "CloseSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      summary: "The party reached Valleverde.",
    });

    expect(closed.events[0].type).toBe("SessionClosed");
    expect(closed.state.sessions.get("sess_one")?.status).toBe("closed");
  });

  it("reveals clues by changing visibility and recording session context", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, { type: "CreateEntity", campaignId: "cmp_one", actorId: "usr_dm", entityId: "ent_clue", entityType: "clue", title: "Bloody sigil", metadata: { content: "Bloody sigil content" } }).state;
    state = handleCommand(state, { type: "StartSession", campaignId: "cmp_one", actorId: "usr_dm", sessionId: "sess_one", title: "Session 1" }).state;

    const result = handleCommand(state, {
      type: "RevealClue",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      clueEntityId: "ent_clue",
      sessionId: "sess_one",
      audience: { kind: "party" },
      note: "Found in the cellar.",
    });

    expect(result.events[0].type).toBe("VisibilityChanged");
    expect(result.state.entities.get("ent_clue")?.visibility.kind).toBe("party");
    expect(result.events[0].payload).toMatchObject({ targetId: "ent_clue", targetType: "entity", sessionId: "sess_one" });
  });
});
