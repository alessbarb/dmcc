import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { rebuildCampaignProjection } from "../../src/core/projections/campaignProjection.js";
import { buildSessionNarrativeProjection } from "../../src/core/domain/session/projection/buildSessionNarrativeProjection.js";
import { buildSessionConsequenceProjection } from "../../src/core/domain/session/projection/buildSessionConsequenceProjection.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";
import type { StoredEvent } from "../../src/core/domain/events.js";

function withSequence(events: StoredEvent<unknown>[], startAt: number): StoredEvent[] {
  return events.map((event, index) => ({ ...event, sequence: startAt + index }) as StoredEvent);
}

function consequenceChainFixture() {
  let state = createCampaignState("cmp_one");
  const create = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_ambush",
    entityType: "consequence",
    title: "Goblin ambush retaliates",
    metadata: { originEntityId: "ent_klarg" },
  });
  state = create.state;
  const createKlarg = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_klarg",
    entityType: "npc",
    title: "Klarg",
  });
  state = createKlarg.state;
  const createSession = handleCommand(state, {
    type: "CreatePreparedSession",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    sessionId: "sess_one",
    title: "Session 1",
  });
  state = createSession.state;
  const revisePlan = handleCommand(state, {
    type: "ReviseSessionPlan",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    sessionId: "sess_one",
    expectedRevision: 0,
    title: "Session 1",
    plan: {
      ...createEmptySessionPlan(),
      contentLinks: [{ id: "spcl_ambush", entityId: "ent_ambush", role: "expected_consequence" as const, order: 0 }],
    },
  });
  state = revisePlan.state;

  return { state, events: [...create.events, ...createKlarg.events, ...createSession.events, ...revisePlan.events] };
}

describe("ReviewSessionInference", () => {
  it("bumps a derived node to user_confirmed after accept, surviving projection replay", () => {
    const fixture = consequenceChainFixture();
    const session = fixture.state.sessions.get("sess_one");
    if (!session) throw new Error("fixture setup failed");

    const before = buildSessionConsequenceProjection(session, fixture.state);
    const originNode = before.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_klarg");
    if (!originNode) throw new Error("origin node not found in fixture projection");
    expect(originNode.provenance.basis).toBe("derived");

    // Echo the node's own provenance verbatim, as the UI must -- reconstructing ruleId/sourceRefs
    // independently would silently fail to match the key the overlay recomputes at read time.
    const review = handleCommand(fixture.state, {
      type: "ReviewSessionInference",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      perspective: "consequence_chain",
      ruleId: originNode.provenance.ruleId,
      sourceRefs: originNode.provenance.sourceRefs,
      targetId: originNode.id,
      decision: "accepted",
    });

    expect(review.events).toHaveLength(1);
    expect(review.events[0].type).toBe("SessionInferenceReviewed");

    const after = buildSessionConsequenceProjection(session, review.state);
    const confirmedNode = after.nodes.find((node) => node.id === originNode.id);
    expect(confirmedNode?.provenance.basis).toBe("user_confirmed");

    // Prove it via full event replay too, not just the in-memory command result.
    const projection = rebuildCampaignProjection(withSequence(fixture.events, 1).concat(withSequence(review.events, fixture.events.length + 1)));
    const replayedSession = projection.sessions.get("sess_one");
    if (!replayedSession) throw new Error("session missing after replay");
    const rebuiltProjectionState = {
      ...fixture.state,
      sessionInferenceReviews: projection.sessionInferenceReviews,
    };
    const afterReplay = buildSessionConsequenceProjection(replayedSession, rebuiltProjectionState);
    expect(afterReplay.nodes.find((node) => node.id === originNode.id)?.provenance.basis).toBe("user_confirmed");
  });

  it("drops a hidden node and its dangling edge from the consequence chain", () => {
    const fixture = consequenceChainFixture();
    const session = fixture.state.sessions.get("sess_one");
    if (!session) throw new Error("fixture setup failed");

    const before = buildSessionConsequenceProjection(session, fixture.state);
    const originNode = before.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_klarg");
    if (!originNode) throw new Error("origin node not found in fixture projection");
    const causesEdge = before.edges.find((edge) => edge.sourceId === originNode.id);
    expect(causesEdge).toBeDefined();

    const review = handleCommand(fixture.state, {
      type: "ReviewSessionInference",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      perspective: "consequence_chain",
      ruleId: originNode.provenance.ruleId,
      sourceRefs: originNode.provenance.sourceRefs,
      targetId: originNode.id,
      decision: "hidden",
    });

    const after = buildSessionConsequenceProjection(session, review.state);
    expect(after.nodes.some((node) => node.id === originNode.id)).toBe(false);
    expect(after.edges.some((edge) => edge.id === causesEdge?.id)).toBe(false);
  });

  it("applies reviews to the narrative_map perspective too, not just consequence_chain", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_cave",
      entityType: "scene",
      title: "Cragmaw Cave",
      metadata: { content: "" },
    }).state;
    state = handleCommand(state, {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      title: "Session 1",
    }).state;
    state = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      expectedRevision: 0,
      title: "Session 1",
      plan: {
        ...createEmptySessionPlan(),
        flowItems: [{ id: "spi_scene1", kind: "scene" as const, sceneEntityId: "ent_cave", order: 0 }],
      },
    }).state;
    const session = state.sessions.get("sess_one");
    if (!session) throw new Error("fixture setup failed");

    const before = buildSessionNarrativeProjection(session, state);
    const sceneNode = before.nodes.find((node) => node.id === "spi_scene1");
    if (!sceneNode) throw new Error("scene node not found");
    expect(sceneNode.provenance.basis).toBe("explicit");

    const review = handleCommand(state, {
      type: "ReviewSessionInference",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      perspective: "narrative_map",
      ruleId: sceneNode.provenance.ruleId,
      sourceRefs: sceneNode.provenance.sourceRefs,
      targetId: sceneNode.id,
      decision: "hidden",
    });

    const after = buildSessionNarrativeProjection(session, review.state);
    expect(after.nodes.some((node) => node.id === "spi_scene1")).toBe(false);
  });

  it("never creates a relation as a side effect -- promotion to the world is a separate, explicit action", () => {
    const fixture = consequenceChainFixture();
    const session = fixture.state.sessions.get("sess_one");
    if (!session) throw new Error("fixture setup failed");
    const before = buildSessionConsequenceProjection(session, fixture.state);
    const originNode = before.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_klarg");
    if (!originNode) throw new Error("origin node not found");

    const review = handleCommand(fixture.state, {
      type: "ReviewSessionInference",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      perspective: "consequence_chain",
      ruleId: originNode.provenance.ruleId,
      sourceRefs: originNode.provenance.sourceRefs,
      targetId: originNode.id,
      decision: "accepted",
    });

    expect(review.events).toHaveLength(1);
    expect(review.events.every((event) => event.type !== "RelationCreated")).toBe(true);
    expect(review.state.relations.size).toBe(fixture.state.relations.size);
  });
});
