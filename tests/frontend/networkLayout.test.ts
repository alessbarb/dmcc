import { describe, expect, it } from "vitest";
import { buildNetworkModel } from "../../src/frontend/dm/map/network/buildNetworkModel.js";
import { computeNetworkLayout } from "../../src/frontend/dm/map/network/computeNetworkLayout.js";
import type { Entity, Relation } from "../../src/frontend/shared/stores/campaignStore.js";

function entity(entityId: string, title: string): Entity {
  return {
    entityId,
    campaignId: "cmp_network_test",
    entityType: "npc",
    title,
    status: "active",
    importance: "normal",
    visibility: { kind: "dm_only" },
    metadata: {},
    tagIds: [],
    archived: false,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  };
}

function relation(relationId: string, sourceEntityId: string, targetEntityId: string): Relation {
  return {
    relationId,
    campaignId: "cmp_network_test",
    sourceEntityId,
    targetEntityId,
    relationType: "knows",
    status: "active",
    visibility: { kind: "dm_only" },
    archived: false,
  };
}

describe("2D network layout", () => {
  it("builds visible nodes and gives every node a finite position", async () => {
    const model = buildNetworkModel({
      entities: [entity("ent_a", "A"), entity("ent_b", "B"), entity("ent_c", "C")],
      relations: [relation("rel_ab", "ent_a", "ent_b"), relation("rel_bc", "ent_b", "ent_c")],
      facts: [],
    });

    expect(model.nodes).toHaveLength(3);
    expect(model.edges).toHaveLength(2);

    const positions = await computeNetworkLayout({
      nodes: model.nodes,
      edges: model.edges,
      preset: "compact",
      viewportWidth: 960,
      viewportHeight: 640,
    });

    expect(positions.size).toBe(model.nodes.length);
    for (const node of model.nodes) {
      const position = positions.get(node.id);
      if (!position) throw new Error(`missing layout position for ${node.id}`);
      expect(Number.isFinite(position.x)).toBe(true);
      expect(Number.isFinite(position.y)).toBe(true);
    }
  });

  it("does not render archived entities or dangling relation edges", () => {
    const archived = { ...entity("ent_archived", "Archived"), archived: true };
    const model = buildNetworkModel({
      entities: [entity("ent_visible", "Visible"), archived],
      relations: [relation("rel_dangling", "ent_visible", "ent_archived")],
      facts: [],
    });

    expect(model.nodes.map((node) => node.id)).toEqual(["ent_visible"]);
    expect(model.edges).toEqual([]);
  });
});
