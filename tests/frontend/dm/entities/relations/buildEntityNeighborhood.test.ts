import { describe, expect, it } from "vitest";
import { buildEntityNeighborhood } from "../../../../../src/frontend/dm/entities/relations/entityRelationshipNeighborhood.js";
import type { Entity, Relation } from "../../../../../src/frontend/shared/stores/campaignStore.js";

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
    relationType: "custom:knows",
    status: "active",
    visibility: { kind: "dm_only" },
    archived: false,
    ...overrides,
  };
}

const glasstaff = makeEntity({ entityId: "ent_glasstaff", title: "Glasstaff" });
const redbrands = makeEntity({ entityId: "ent_redbrands", title: "Redbrands", entityType: "faction" });

describe("buildEntityNeighborhood", () => {
  it("returns an empty neighborhood when there are no relations", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands], []);

    expect(neighborhood.center.entityId).toBe("ent_glasstaff");
    expect(neighborhood.center.isCenter).toBe(true);
    expect(neighborhood.neighbors).toEqual([]);
    expect(neighborhood.connections).toEqual([]);
    expect(neighborhood.totalRelations).toBe(0);
  });

  it("orients an outgoing relation from the center's perspective", () => {
    const relation = makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands" });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands], [relation]);

    expect(neighborhood.neighbors.map((n) => n.entityId)).toEqual(["ent_redbrands"]);
    expect(neighborhood.connections[0].relations[0].orientationFromCenter).toBe("outgoing");
  });

  it("orients an incoming relation from the center's perspective", () => {
    const relation = makeRelation({ relationId: "rel_1", sourceEntityId: "ent_redbrands", targetEntityId: "ent_glasstaff" });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands], [relation]);

    expect(neighborhood.connections[0].relations[0].orientationFromCenter).toBe("incoming");
  });

  it("excludes archived relations", () => {
    const relation = makeRelation({
      relationId: "rel_1",
      sourceEntityId: "ent_glasstaff",
      targetEntityId: "ent_redbrands",
      archived: true,
    });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands], [relation]);

    expect(neighborhood.neighbors).toEqual([]);
    expect(neighborhood.totalRelations).toBe(0);
  });

  it("treats a relation to an archived entity as missing, not as a neighbor", () => {
    const archivedTarget = makeEntity({ entityId: "ent_gone", archived: true });
    const relation = makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_gone" });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, archivedTarget], [relation]);

    expect(neighborhood.neighbors).toEqual([]);
    expect(neighborhood.missingEntityRelations).toEqual([relation]);
  });

  it("treats a relation to a nonexistent entity as missing", () => {
    const relation = makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_nowhere" });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff], [relation]);

    expect(neighborhood.neighbors).toEqual([]);
    expect(neighborhood.missingEntityRelations).toEqual([relation]);
  });

  it("groups several relations between the same pair, regardless of direction", () => {
    const relations = [
      makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands", relationType: "leader_of" }),
      makeRelation({ relationId: "rel_2", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands", relationType: "controls" }),
      makeRelation({ relationId: "rel_3", sourceEntityId: "ent_redbrands", targetEntityId: "ent_glasstaff", relationType: "protects" }),
    ];
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands], relations);

    expect(neighborhood.neighbors).toHaveLength(1);
    expect(neighborhood.connections).toHaveLength(1);
    expect(neighborhood.connections[0].relations).toHaveLength(3);
    expect(neighborhood.totalRelations).toBe(3);
  });

  it("produces a canonical connection id independent of relation direction", () => {
    const outgoing = buildEntityNeighborhood(
      glasstaff,
      [glasstaff, redbrands],
      [makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands" })],
    );
    const incoming = buildEntityNeighborhood(
      glasstaff,
      [glasstaff, redbrands],
      [makeRelation({ relationId: "rel_2", sourceEntityId: "ent_redbrands", targetEntityId: "ent_glasstaff" })],
    );

    expect(outgoing.connections[0].connectionId).toBe(incoming.connections[0].connectionId);
  });

  it("marks a self-loop relation without adding the center as its own neighbor", () => {
    const relation = makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_glasstaff" });
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff], [relation]);

    expect(neighborhood.neighbors).toEqual([]);
    expect(neighborhood.connections[0].relations[0].orientationFromCenter).toBe("self");
    expect(neighborhood.totalRelations).toBe(1);
  });

  it("orders neighbors stably by entity type, then title, then id", () => {
    const npcB = makeEntity({ entityId: "ent_npc_b", title: "Bruno", entityType: "npc" });
    const npcA = makeEntity({ entityId: "ent_npc_a", title: "Aldric", entityType: "npc" });
    const relations = [
      makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands" }),
      makeRelation({ relationId: "rel_2", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_npc_b" }),
      makeRelation({ relationId: "rel_3", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_npc_a" }),
    ];
    const neighborhood = buildEntityNeighborhood(glasstaff, [glasstaff, redbrands, npcA, npcB], relations);

    // "faction" sorts before "npc" alphabetically, so redbrands leads.
    expect(neighborhood.neighbors.map((n) => n.entityId)).toEqual(["ent_redbrands", "ent_npc_a", "ent_npc_b"]);
  });

  it("produces the same result for the same input", () => {
    const relations = [
      makeRelation({ relationId: "rel_1", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands" }),
      makeRelation({ relationId: "rel_2", sourceEntityId: "ent_redbrands", targetEntityId: "ent_glasstaff", relationType: "protects" }),
    ];
    const entities = [glasstaff, redbrands];

    expect(buildEntityNeighborhood(glasstaff, entities, relations)).toEqual(
      buildEntityNeighborhood(glasstaff, entities, relations),
    );
  });
});
