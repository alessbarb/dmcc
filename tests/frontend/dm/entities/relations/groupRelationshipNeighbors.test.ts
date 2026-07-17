import { describe, expect, it } from "vitest";
import {
  DEFAULT_DENSITY_POLICY,
  defaultGroupingEnabled,
  groupRelationshipNeighbors,
  shouldOfferGrouping,
} from "../../../../../src/frontend/dm/entities/relations/groupRelationshipNeighbors.js";
import type { RelationshipGraphEntity } from "../../../../../src/frontend/dm/entities/relations/entityRelationshipNeighborhood.js";

function makeNeighbor(entityId: string, entityType: string, title = entityId): RelationshipGraphEntity {
  return { entityId, title, entityType, isCenter: false, entity: {} as never };
}

describe("shouldOfferGrouping / defaultGroupingEnabled", () => {
  it("does not offer grouping at or below the suggested threshold", () => {
    expect(shouldOfferGrouping(DEFAULT_DENSITY_POLICY.groupingSuggestedAt)).toBe(false);
    expect(shouldOfferGrouping(DEFAULT_DENSITY_POLICY.groupingSuggestedAt + 1)).toBe(true);
  });

  it("only defaults to grouped past the default threshold", () => {
    expect(defaultGroupingEnabled(DEFAULT_DENSITY_POLICY.groupingDefaultAt)).toBe(false);
    expect(defaultGroupingEnabled(DEFAULT_DENSITY_POLICY.groupingDefaultAt + 1)).toBe(true);
  });
});

describe("groupRelationshipNeighbors", () => {
  it("returns every neighbor as an individual entity item when grouping is disabled", () => {
    const neighbors = [makeNeighbor("a", "npc"), makeNeighbor("b", "location")];
    const items = groupRelationshipNeighbors(neighbors, false);

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.kind === "entity")).toBe(true);
  });

  it("collapses same-type neighbors into one group item when grouping is enabled", () => {
    const neighbors = [
      makeNeighbor("a", "npc"),
      makeNeighbor("b", "npc"),
      makeNeighbor("c", "npc"),
      makeNeighbor("d", "location"),
    ];
    const items = groupRelationshipNeighbors(neighbors, true);

    expect(items).toHaveLength(2);
    const npcGroup = items.find((item) => item.kind === "group" && item.group.entityType === "npc");
    expect(npcGroup).toBeDefined();
    if (npcGroup?.kind === "group") {
      expect(npcGroup.group.entities.map((e) => e.entityId).sort()).toEqual(["a", "b", "c"]);
    }
    const locationItem = items.find((item) => item.kind === "entity" && item.entity.entityId === "d");
    expect(locationItem).toBeDefined();
  });

  it("does not group a type with only one member — nothing to collapse", () => {
    const neighbors = [makeNeighbor("a", "npc"), makeNeighbor("b", "location")];
    const items = groupRelationshipNeighbors(neighbors, true);

    expect(items.every((item) => item.kind === "entity")).toBe(true);
  });

  it("keeps a type ungrouped when its type is in expandedGroupTypes", () => {
    const neighbors = [makeNeighbor("a", "npc"), makeNeighbor("b", "npc"), makeNeighbor("c", "location")];
    const items = groupRelationshipNeighbors(neighbors, true, new Set(["npc"]));

    expect(items.every((item) => item.kind === "entity")).toBe(true);
    // Items sort by entity type ("location" < "npc"); within a type, expanded
    // members keep their original (already type/title-sorted) order.
    expect(items.map((i) => (i.kind === "entity" ? i.entity.entityId : ""))).toEqual(["c", "a", "b"]);
  });

  it("orders groups and standalone entities by entity type", () => {
    const neighbors = [
      makeNeighbor("z1", "location"),
      makeNeighbor("z2", "location"),
      makeNeighbor("a1", "npc"),
      makeNeighbor("a2", "npc"),
    ];
    const items = groupRelationshipNeighbors(neighbors, true);
    const types = items.map((item) => (item.kind === "group" ? item.group.entityType : item.entity.entityType));

    expect(types).toEqual(["location", "npc"]);
  });
});
