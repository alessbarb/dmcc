import { describe, expect, it } from "vitest";
import {
  buildNetworkModel,
  resolveNetworkFocus,
  FULL_NETWORK_NODE_LIMIT,
} from "../../../../../src/frontend/dm/map/network/buildNetworkModel.js";
import type { Entity, Fact, Relation } from "../../../../../src/frontend/shared/stores/campaignStore.js";

function makeEntity(overrides: Partial<Entity> & { entityId: string }): Entity {
  return {
    campaignId: "cmp_1",
    entityType: "npc",
    title: overrides.entityId,
    status: "active",
    importance: "normal",
    visibility: { kind: "dm_only" },
    metadata: {},
    tagIds: [],
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeRelation(overrides: Partial<Relation> & { relationId: string; sourceEntityId: string; targetEntityId: string }): Relation {
  return {
    campaignId: "cmp_1",
    relationType: "related_to",
    status: "active",
    visibility: { kind: "dm_only" },
    archived: false,
    ...overrides,
  };
}

function makeFact(overrides: Partial<Fact> & { factId: string; relatedEntityIds: string[] }): Fact {
  return {
    campaignId: "cmp_1",
    statement: "A statement",
    kind: "canon",
    confidence: "confirmed",
    visibility: { kind: "dm_only" },
    source: { kind: "manual" } as Fact["source"],
    archived: false,
    ...overrides,
  };
}

describe("buildNetworkModel", () => {
  it("reconstructs nodes and edges from entities and relations", () => {
    const entities = [makeEntity({ entityId: "ent_a" }), makeEntity({ entityId: "ent_b" })];
    const relations = [makeRelation({ relationId: "rel_1", sourceEntityId: "ent_a", targetEntityId: "ent_b" })];

    const model = buildNetworkModel({ entities, relations });

    expect(model.nodes).toHaveLength(2);
    expect(model.edges).toHaveLength(1);
    expect(model.edges[0]).toMatchObject({ source: "ent_a", target: "ent_b", kind: "relation" });
  });

  it("never persists node positions in the derived model", () => {
    const entities = [makeEntity({ entityId: "ent_a" })];
    const model = buildNetworkModel({ entities, relations: [] });
    expect(model.nodes[0]).not.toHaveProperty("x");
    expect(model.nodes[0]).not.toHaveProperty("y");
  });

  it("excludes archived entities and relations touching them", () => {
    const entities = [makeEntity({ entityId: "ent_a" }), makeEntity({ entityId: "ent_b", archived: true })];
    const relations = [makeRelation({ relationId: "rel_1", sourceEntityId: "ent_a", targetEntityId: "ent_b" })];

    const model = buildNetworkModel({ entities, relations });

    expect(model.nodes).toHaveLength(1);
    expect(model.edges).toHaveLength(0);
  });

  it("filters by entity type without mutating the input arrays", () => {
    const entities = [
      makeEntity({ entityId: "ent_npc", entityType: "npc" }),
      makeEntity({ entityId: "ent_loc", entityType: "location" }),
    ];
    const snapshot = JSON.parse(JSON.stringify(entities));

    const model = buildNetworkModel({ entities, relations: [], entityTypeFilter: ["npc"] });

    expect(model.nodes).toHaveLength(1);
    expect(model.nodes[0]).toMatchObject({ entityId: "ent_npc" });
    expect(entities).toEqual(snapshot);
  });

  it("includes fact nodes only when related to a visible entity", () => {
    const entities = [makeEntity({ entityId: "ent_a" })];
    const facts = [
      makeFact({ factId: "fact_1", relatedEntityIds: ["ent_a"] }),
      makeFact({ factId: "fact_orphan", relatedEntityIds: ["ent_missing"] }),
    ];

    const model = buildNetworkModel({ entities, relations: [], facts });

    const factNodeIds = model.nodes.filter((node) => node.kind === "fact").map((node) => node.id);
    expect(factNodeIds).toEqual(["fact_1"]);
    expect(model.edges.some((edge) => edge.kind === "fact" && edge.source === "fact_1" && edge.target === "ent_a")).toBe(true);
  });
});

describe("resolveNetworkFocus", () => {
  const manyIds = Array.from({ length: FULL_NETWORK_NODE_LIMIT + 1 }, (_, i) => `ent_${i}`);

  it("renders everything under the node limit", () => {
    const result = resolveNetworkFocus({ entityIds: ["ent_a", "ent_b"], relations: [] });
    expect(result.mode).toBe("full");
  });

  it("requires search when over the limit with no selection or anchor", () => {
    const result = resolveNetworkFocus({ entityIds: manyIds, relations: [] });
    expect(result.mode).toBe("search-required");
  });

  it("shows a depth-2 neighborhood of the selected entity when over the limit", () => {
    const relations: Relation[] = [
      makeRelation({ relationId: "r1", sourceEntityId: "ent_0", targetEntityId: "ent_1" }),
      makeRelation({ relationId: "r2", sourceEntityId: "ent_1", targetEntityId: "ent_2" }),
      makeRelation({ relationId: "r3", sourceEntityId: "ent_2", targetEntityId: "ent_3" }),
    ];

    const result = resolveNetworkFocus({ entityIds: manyIds, relations, selectedEntityId: "ent_0" });

    expect(result.mode).toBe("neighborhood");
    if (result.mode === "neighborhood") {
      expect(result.anchorEntityId).toBe("ent_0");
      expect(result.entityIds).toEqual(expect.arrayContaining(["ent_0", "ent_1", "ent_2"]));
      expect(result.entityIds).not.toContain("ent_3");
    }
  });

  it("falls back through currentQuestId, then currentLocationId, then next-session anchor", () => {
    const relations: Relation[] = [
      makeRelation({ relationId: "r1", sourceEntityId: "ent_5", targetEntityId: "ent_6" }),
    ];

    const byQuest = resolveNetworkFocus({
      entityIds: manyIds,
      relations,
      currentQuestId: "ent_5",
      currentLocationId: "ent_9",
    });
    expect(byQuest.mode).toBe("neighborhood");
    if (byQuest.mode === "neighborhood") expect(byQuest.anchorEntityId).toBe("ent_5");

    const byLocation = resolveNetworkFocus({
      entityIds: manyIds,
      relations,
      currentQuestId: null,
      currentLocationId: "ent_9",
    });
    expect(byLocation.mode).toBe("neighborhood");
    if (byLocation.mode === "neighborhood") expect(byLocation.anchorEntityId).toBe("ent_9");

    const byNextSession = resolveNetworkFocus({
      entityIds: manyIds,
      relations,
      currentQuestId: null,
      currentLocationId: null,
      nextSessionCriticalEntityId: "ent_9",
    });
    expect(byNextSession.mode).toBe("neighborhood");
    if (byNextSession.mode === "neighborhood") expect(byNextSession.anchorEntityId).toBe("ent_9");
  });
});
