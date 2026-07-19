import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { buildSessionConsequenceProjection } from "../../src/core/domain/session/projection/buildSessionConsequenceProjection.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";

function fixtureWithPlan() {
  let state = createCampaignState("cmp_one");
  state = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_ambush",
    entityType: "consequence",
    title: "Goblin ambush retaliates",
    status: "pending",
    metadata: { originEntityId: "ent_klarg", affectedEntityIds: ["ent_sildar"] },
  }).state;
  state = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_klarg",
    entityType: "npc",
    title: "Klarg",
  }).state;
  state = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_sildar",
    entityType: "npc",
    title: "Sildar",
  }).state;
  state = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_front",
    entityType: "front",
    title: "Red Caps",
    metadata: { goal: "Terrorize Phandalin", clockEntityId: "ent_clock" },
  }).state;
  state = handleCommand(state, {
    type: "CreateEntity",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    entityId: "ent_clock",
    entityType: "clock",
    title: "Doom Clock",
    metadata: { maxSegments: 6, currentSegments: 2, meaning: "Town falls" },
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
    contentLinks: [
      { id: "spcl_ambush", entityId: "ent_ambush", role: "expected_consequence" as const, order: 0 },
      { id: "spcl_front", entityId: "ent_front", role: "front_in_play" as const, order: 1 },
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

describe("buildSessionConsequenceProjection", () => {
  it("adds an origin node and a causes edge from the consequence's originEntityId", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionConsequenceProjection(session, state);
    const originNode = projection.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_klarg");
    expect(originNode).toMatchObject({ kind: "context_entity", label: "Klarg" });
    expect(originNode?.provenance.basis).toBe("derived");

    const edge = projection.edges.find((e) => e.targetId === "spcl_ambush" && e.kind === "causes");
    expect(edge?.sourceId).toBe(originNode?.id);
  });

  it("adds an affected node and an affects edge from the consequence's affectedEntityIds", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionConsequenceProjection(session, state);
    const affectedNode = projection.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_sildar");
    expect(affectedNode).toMatchObject({ kind: "context_entity", label: "Sildar" });

    const edge = projection.edges.find((e) => e.sourceId === "spcl_ambush" && e.kind === "affects");
    expect(edge?.targetId).toBe(affectedNode?.id);
  });

  it("adds a clock node and an advances edge from the front's clockEntityId", () => {
    const { state, session } = fixtureWithPlan();
    const projection = buildSessionConsequenceProjection(session, state);
    const clockNode = projection.nodes.find((node) => node.reference.type === "entity" && node.reference.entityId === "ent_clock");
    expect(clockNode).toMatchObject({ kind: "clock", label: "Doom Clock" });

    const edge = projection.edges.find((e) => e.sourceId === "spcl_front" && e.kind === "advances");
    expect(edge?.targetId).toBe(clockNode?.id);
  });

  it("adds a causes edge from a direct causes relation between two content-linked entities", () => {
    let { state } = fixtureWithPlan();
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      relationId: "rel_one",
      sourceEntityId: "ent_front",
      targetEntityId: "ent_ambush",
      relationType: "causes",
    }).state;
    const refreshed = state.sessions.get("sess_one");
    if (!refreshed) throw new Error("fixture setup failed");

    const projection = buildSessionConsequenceProjection(refreshed, state);
    const relationEdge = projection.edges.find((e) => e.id === "relation:rel_one");
    expect(relationEdge).toMatchObject({ sourceId: "spcl_front", targetId: "spcl_ambush", kind: "causes" });
  });

  it("ignores a direct relation when one endpoint isn't content-linked in this session", () => {
    let { state } = fixtureWithPlan();
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_outsider",
      entityType: "npc",
      title: "Outsider",
    }).state;
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      relationId: "rel_outsider",
      sourceEntityId: "ent_outsider",
      targetEntityId: "ent_ambush",
      relationType: "causes",
    }).state;
    const refreshed = state.sessions.get("sess_one");
    if (!refreshed) throw new Error("fixture setup failed");

    const projection = buildSessionConsequenceProjection(refreshed, state);
    expect(projection.edges.some((e) => e.id === "relation:rel_outsider")).toBe(false);
  });

  it("reuses the explicit content-link node for an origin entity instead of a duplicate derived node", () => {
    // If the origin entity is ALSO separately content-linked in the plan, consequenceOriginRule
    // must attach its "causes" edge to that existing explicit node rather than manufacturing a
    // second, derived-basis node for the same entity -- the engine's basis-priority arbitration
    // (unit-tested directly in sessionProjection.test.ts, from PR #241) is the fallback net, not
    // something this rule set should ever need to lean on for its own entities.
    const fixture = fixtureWithPlan();
    const { session } = fixture;
    let state = fixture.state;
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_klarg",
      entityType: "npc",
      title: "Klarg (explicit)",
    }).state;
    const plan = session.plan;
    if (!plan) throw new Error("fixture setup failed");
    state = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_one",
      expectedRevision: plan.revision,
      title: "Session 1",
      plan: {
        ...plan,
        contentLinks: [...plan.contentLinks, { id: "spcl_klarg", entityId: "ent_klarg", role: "involved_entity" as const, order: 2 }],
      },
    }).state;
    const refreshed = state.sessions.get("sess_one");
    if (!refreshed) throw new Error("fixture setup failed");

    const projection = buildSessionConsequenceProjection(refreshed, state);
    const node = projection.nodes.find((n) => n.id === "spcl_klarg");
    expect(node?.provenance.basis).toBe("explicit");
    expect(node?.label).toBe("Klarg (explicit)");
  });

  it("flags a consequence with no origin metadata via missing_consequence_origin", () => {
    let state = createCampaignState("cmp_one");
    state = handleCommand(state, {
      type: "CreateEntity",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      entityId: "ent_bare",
      entityType: "consequence",
      title: "Unexplained collapse",
    }).state;
    state = handleCommand(state, {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_bare",
      title: "Session bare",
    }).state;
    state = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_bare",
      expectedRevision: 0,
      title: "Session bare",
      plan: {
        ...createEmptySessionPlan(),
        contentLinks: [{ id: "spcl_bare", entityId: "ent_bare", role: "expected_consequence" as const, order: 0 }],
      },
    }).state;
    const session = state.sessions.get("sess_bare");
    if (!session) throw new Error("fixture setup failed");

    const projection = buildSessionConsequenceProjection(session, state);
    expect(projection.diagnostics).toContainEqual(
      expect.objectContaining({ code: "missing_consequence_origin", severity: "info" }),
    );
  });

  it("flags a causal cycle between two consequence chain nodes", () => {
    let { state } = fixtureWithPlan();
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      relationId: "rel_a",
      sourceEntityId: "ent_front",
      targetEntityId: "ent_ambush",
      relationType: "causes",
    }).state;
    state = handleCommand(state, {
      type: "CreateRelation",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      relationId: "rel_b",
      sourceEntityId: "ent_ambush",
      targetEntityId: "ent_front",
      relationType: "depends_on",
    }).state;
    const refreshed = state.sessions.get("sess_one");
    if (!refreshed) throw new Error("fixture setup failed");

    const projection = buildSessionConsequenceProjection(refreshed, state);
    expect(projection.diagnostics.some((d) => d.code === "causal_cycle")).toBe(true);
  });
});
