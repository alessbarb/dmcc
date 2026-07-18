import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { buildSessionNarrativeProjection } from "../../src/core/domain/session/projection/buildSessionNarrativeProjection.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";

function fixtureWithPlan() {
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
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_clue",
    entityType: "clue",
    title: "Bloody sigil",
    metadata: { content: "" },
  }).state;
  state = handleCommand(state, {
    type: "CreatePreparedSession",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    sessionId: "sess_one",
    title: "Session 1",
  }).state;

  const plan = {
    ...createEmptySessionPlan(),
    openingPrompt: "The party arrives at the cave mouth at dusk.",
    flowItems: [
      { id: "spi_scene1", kind: "scene" as const, sceneEntityId: "ent_cave", order: 0 },
      { id: "spi_decision1", kind: "decision_point" as const, title: "Sneak or storm the gate?", order: 1 },
    ],
    transitions: [
      { id: "sptr_1", sourceItemId: "spi_scene1", targetItemId: "spi_decision1", kind: "next" as const, order: 0 },
    ],
    contentLinks: [
      { id: "spcl_anchored", entityId: "ent_clue", role: "available_clue" as const, anchorFlowItemId: "spi_scene1", order: 0 },
      { id: "spcl_global", entityId: "ent_clue", role: "involved_entity" as const, order: 1 },
    ],
  };

  state = handleCommand(state, {
    type: "ReviseSessionPlan",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    sessionId: "sess_one",
    expectedRevision: 0,
    title: "Session 1",
    plan,
  }).state;

  const session = state.sessions.get("sess_one");
  if (!session) throw new Error("fixture setup failed");
  return { state, session };
}

describe("buildSessionNarrativeProjection", () => {
  it("builds the opening node from the plan's openingPrompt", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const opening = projection.nodes.find((node) => node.kind === "opening");
    expect(opening?.label).toBe("The party arrives at the cave mouth at dusk.");
    expect(opening?.provenance.basis).toBe("explicit");
  });

  it("builds a scene node labeled from the linked entity's title", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const scene = projection.nodes.find((node) => node.id === "spi_scene1");
    expect(scene).toMatchObject({ kind: "scene", label: "Cragmaw Cave", reference: { type: "entity", entityId: "ent_cave" } });
  });

  it("builds a decision_point node from a decision flow item", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const decision = projection.nodes.find((node) => node.id === "spi_decision1");
    expect(decision).toMatchObject({ kind: "decision_point", label: "Sneak or storm the gate?" });
  });

  it("builds a transition edge with the plan's kind", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const edge = projection.edges.find((e) => e.id === "sptr_1");
    expect(edge).toMatchObject({ sourceId: "spi_scene1", targetId: "spi_decision1", kind: "next" });
  });

  it("builds an anchored content link as a clue node plus an appears_in edge", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const clueNode = projection.nodes.find((node) => node.id === "spcl_anchored");
    expect(clueNode).toMatchObject({ kind: "clue", label: "Bloody sigil" });
    const anchorEdge = projection.edges.find((e) => e.id === "spi_scene1->spcl_anchored");
    expect(anchorEdge).toMatchObject({ sourceId: "spi_scene1", targetId: "spcl_anchored", kind: "appears_in" });
  });

  it("builds an unanchored content link as a floating node with no edge", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionNarrativeProjection(session, state);
    const globalNode = projection.nodes.find((node) => node.id === "spcl_global");
    expect(globalNode).toMatchObject({ kind: "context_entity", label: "Bloody sigil" });
    expect(projection.edges.some((e) => e.targetId === "spcl_global")).toBe(false);
  });

  it("uses basis planned/live/closed matching the session's status", () => {
    const { state, session } = fixtureWithPlan();
    expect(buildSessionNarrativeProjection(session, state).basis).toBe("planned");

    const activated = handleCommand(state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
    }).state;
    const activeSession = activated.sessions.get("sess_one");
    if (!activeSession) throw new Error("activation failed");
    expect(buildSessionNarrativeProjection(activeSession, activated).basis).toBe("live");
  });

  it("falls back to the raw entityId as label when the entity can't be found", () => {
    const { state, session } = fixtureWithPlan();
    const stateWithoutEntity = { ...state, entities: new Map(state.entities) };
    stateWithoutEntity.entities.delete("ent_cave");
    const projection = buildSessionNarrativeProjection(session, stateWithoutEntity);
    const scene = projection.nodes.find((node) => node.id === "spi_scene1");
    expect(scene?.label).toBe("ent_cave");
  });

  it("builds an open_thread node and appears_in edge from an anchored story-step binding", () => {
    const { state, session } = fixtureWithPlan();
    const stateWithStep = { ...state, storySteps: new Map(state.storySteps) };
    stateWithStep.storySteps.set("stp_one", {
      id: "stp_one",
      threadId: "sth_one",
      campaignId: "cmp_one",
      title: "Rescue Gundren",
      sortOrder: 0,
      status: "active",
    } as never);

    const plan = session.plan;
    if (!plan) throw new Error("fixture setup failed");
    const revised = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      expectedRevision: plan.revision,
      title: "Session 1",
      plan: {
        ...plan,
        bindings: [{ id: "spbd_one", kind: "story_step" as const, storyStepId: "stp_one", anchorFlowItemId: "spi_scene1", order: 0 }],
      },
    }).state;
    const revisedWithStep = { ...revised, storySteps: stateWithStep.storySteps };
    const revisedSession = revisedWithStep.sessions.get("sess_one");
    if (!revisedSession) throw new Error("fixture setup failed");

    const projection = buildSessionNarrativeProjection(revisedSession, revisedWithStep);
    const threadNode = projection.nodes.find((node) => node.id === "spbd_one");
    expect(threadNode).toMatchObject({ kind: "open_thread", label: "Rescue Gundren", reference: { type: "story_step", storyStepId: "stp_one" } });
    const edge = projection.edges.find((e) => e.id === "spi_scene1->spbd_one");
    expect(edge).toMatchObject({ sourceId: "spi_scene1", targetId: "spbd_one", kind: "appears_in" });
  });
});
