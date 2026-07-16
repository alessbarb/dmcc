import { describe, expect, it } from "vitest";
import { buildEntityNeighborhood } from "../../../../../src/frontend/dm/entities/relations/entityRelationshipNeighborhood.js";
import { filterEntityNeighborhood } from "../../../../../src/frontend/dm/entities/relations/filterEntityNeighborhood.js";
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
const phandalin = makeEntity({ entityId: "ent_phandalin", title: "Phandalin", entityType: "location" });

const entities = [glasstaff, redbrands, phandalin];
const relations = [
  makeRelation({ relationId: "rel_out", sourceEntityId: "ent_glasstaff", targetEntityId: "ent_redbrands" }),
  makeRelation({ relationId: "rel_in", sourceEntityId: "ent_phandalin", targetEntityId: "ent_glasstaff" }),
];

describe("filterEntityNeighborhood", () => {
  it("keeps everything when there are no active filters", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, entities, relations);
    const filtered = filterEntityNeighborhood(neighborhood, { direction: "all", entityTypes: [] });

    expect(filtered.neighbors).toHaveLength(2);
    expect(filtered.totalRelations).toBe(2);
  });

  it("keeps only relations matching the direction filter", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, entities, relations);
    const filtered = filterEntityNeighborhood(neighborhood, { direction: "outgoing", entityTypes: [] });

    expect(filtered.neighbors.map((n) => n.entityId)).toEqual(["ent_redbrands"]);
    expect(filtered.totalRelations).toBe(1);
  });

  it("keeps only neighbors matching the entity-type filter", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, entities, relations);
    const filtered = filterEntityNeighborhood(neighborhood, { direction: "all", entityTypes: ["location"] });

    expect(filtered.neighbors.map((n) => n.entityId)).toEqual(["ent_phandalin"]);
    expect(filtered.connections).toHaveLength(1);
  });

  it("drops a connection entirely once all its relations are filtered out", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, entities, relations);
    const filtered = filterEntityNeighborhood(neighborhood, { direction: "incoming", entityTypes: ["faction"] });

    expect(filtered.connections).toEqual([]);
    expect(filtered.neighbors).toEqual([]);
  });

  it("does not mutate the input neighborhood", () => {
    const neighborhood = buildEntityNeighborhood(glasstaff, entities, relations);
    const before = JSON.parse(JSON.stringify(neighborhood));

    filterEntityNeighborhood(neighborhood, { direction: "outgoing", entityTypes: [] });

    expect(neighborhood).toEqual(before);
  });
});
