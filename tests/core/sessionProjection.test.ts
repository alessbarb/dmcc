import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import {
  sessionProjectionSchema,
  sessionProjectionReferenceSchema,
} from "../../src/core/domain/session/projection/sessionProjectionTypes.js";
import {
  buildSessionProjection,
  evaluateSessionProjectionRules,
  computeSessionProjectionFingerprint,
  type SessionProjectionRule,
} from "../../src/core/domain/session/projection/sessionProjectionEngine.js";

function sessionFixture() {
  let state = createCampaignState("cmp_one");
  state = handleCommand(state, {
    type: "StartSession",
    campaignId: "cmp_one",
    actorId: "usr_core",
    sessionId: "sess_one",
    title: "Session 1",
  }).state;
  const session = state.sessions.get("sess_one");
  if (!session) throw new Error("fixture setup failed");
  return { state, session };
}

describe("sessionProjectionReferenceSchema", () => {
  it("accepts each reference variant", () => {
    expect(() => sessionProjectionReferenceSchema.parse({ type: "entity", entityId: "ent_klarg" })).not.toThrow();
    expect(() => sessionProjectionReferenceSchema.parse({ type: "plan_item", planItemId: "spi_scene1" })).not.toThrow();
  });

  it("rejects an unknown reference type", () => {
    expect(() => sessionProjectionReferenceSchema.parse({ type: "clock", clockId: "x" })).toThrow();
  });
});

describe("evaluateSessionProjectionRules", () => {
  it("returns empty nodes/edges when no rules are registered", () => {
    const { state, session } = sessionFixture();
    const result = evaluateSessionProjectionRules([], { campaignState: state, session }, "narrative_map");
    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("only runs rules registered for the requested perspective", () => {
    const { state, session } = sessionFixture();
    const narrativeRule: SessionProjectionRule = {
      id: "test.narrative-only",
      perspective: "narrative_map",
      evaluate: () => [
        {
          kind: "node",
          node: { id: "n1", kind: "scene", reference: { type: "entity", entityId: "ent_cave" }, label: "Cave" },
          provenance: { basis: "explicit", sourceRefs: [] },
        },
      ],
    };
    const consequenceRule: SessionProjectionRule = {
      id: "test.consequence-only",
      perspective: "consequence_chain",
      evaluate: () => [
        {
          kind: "node",
          node: { id: "n2", kind: "consequence", reference: { type: "entity", entityId: "ent_flood" }, label: "Flood" },
          provenance: { basis: "explicit", sourceRefs: [] },
        },
      ],
    };

    const result = evaluateSessionProjectionRules([narrativeRule, consequenceRule], { campaignState: state, session }, "narrative_map");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]?.id).toBe("n1");
    expect(result.nodes[0]?.provenance.ruleId).toBe("test.narrative-only");
  });

  it("lets a later rule's candidate win when two rules produce the same node id", () => {
    const { state, session } = sessionFixture();
    const first: SessionProjectionRule = {
      id: "test.first",
      perspective: "narrative_map",
      evaluate: () => [{ kind: "node", node: { id: "n1", kind: "scene", reference: { type: "entity", entityId: "ent_cave" }, label: "First" }, provenance: { basis: "derived", sourceRefs: [] } }],
    };
    const second: SessionProjectionRule = {
      id: "test.second",
      perspective: "narrative_map",
      evaluate: () => [{ kind: "node", node: { id: "n1", kind: "scene", reference: { type: "entity", entityId: "ent_cave" }, label: "Second" }, provenance: { basis: "explicit", sourceRefs: [] } }],
    };

    const result = evaluateSessionProjectionRules([first, second], { campaignState: state, session }, "narrative_map");
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]?.label).toBe("Second");
  });
});

describe("computeSessionProjectionFingerprint", () => {
  it("is deterministic for identical inputs", () => {
    const a = computeSessionProjectionFingerprint({ planRevision: 2, lastEventSequence: 5 });
    const b = computeSessionProjectionFingerprint({ planRevision: 2, lastEventSequence: 5 });
    expect(a).toBe(b);
  });

  it("changes when planRevision changes", () => {
    const a = computeSessionProjectionFingerprint({ planRevision: 1 });
    const b = computeSessionProjectionFingerprint({ planRevision: 2 });
    expect(a).not.toBe(b);
  });
});

describe("buildSessionProjection", () => {
  it("produces a projection with no generatedAt field, that passes schema validation", () => {
    const { state, session } = sessionFixture();
    const projection = buildSessionProjection({
      rules: [],
      input: { campaignState: state, session },
      perspective: "narrative_map",
      basis: "live",
      planRevision: 0,
    });

    expect(projection).not.toHaveProperty("generatedAt");
    expect(() => sessionProjectionSchema.parse(projection)).not.toThrow();
  });

  it("is byte-identical across two builds from the same input", () => {
    const { state, session } = sessionFixture();
    const build = () =>
      buildSessionProjection({
        rules: [],
        input: { campaignState: state, session },
        perspective: "narrative_map",
        basis: "live",
        planRevision: 3,
        lastEventSequence: 7,
      });

    expect(JSON.stringify(build())).toBe(JSON.stringify(build()));
  });
});
