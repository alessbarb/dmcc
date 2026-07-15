import { describe, expect, it } from "vitest";
import { computeNetworkLayout } from "../../src/frontend/dm/map/network/computeNetworkLayout.js";
import type { NetworkNodeModel } from "../../src/frontend/dm/map/network/buildNetworkModel.js";

function entityNode(id: string): NetworkNodeModel {
  return {
    id,
    kind: "entity",
    entityId: id,
    width: 220,
    height: 230,
  };
}

describe("computeNetworkLayout", () => {
  it("returns one finite position for every node, including disconnected nodes", async () => {
    const nodes = [entityNode("entity-a"), entityNode("entity-b"), entityNode("entity-c")];

    const positions = await computeNetworkLayout({
      nodes,
      edges: [],
      preset: "compact",
      viewportWidth: 1200,
      viewportHeight: 700,
    });

    expect(positions.size).toBe(nodes.length);
    for (const node of nodes) {
      const position = positions.get(node.id);
      expect(position).toBeDefined();
      expect(Number.isFinite(position?.x)).toBe(true);
      expect(Number.isFinite(position?.y)).toBe(true);
    }
  });
});
