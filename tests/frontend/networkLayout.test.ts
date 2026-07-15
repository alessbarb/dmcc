import { describe, expect, it } from "vitest";
import {
  computeNetworkLayout,
  validateNetworkLayout,
} from "../../src/frontend/dm/map/network/computeNetworkLayout.js";
import type {
  NetworkEdgeModel,
  NetworkNodeModel,
} from "../../src/frontend/dm/map/network/buildNetworkModel.js";

function entityNode(id: string): NetworkNodeModel {
  return {
    id,
    kind: "entity",
    entityId: id,
    width: 176,
    height: 104,
  };
}

function largeNetwork(size = 154): { nodes: NetworkNodeModel[]; edges: NetworkEdgeModel[] } {
  const nodes = Array.from({ length: size }, (_, index) => entityNode(`entity-${index}`));
  const edges: NetworkEdgeModel[] = [];

  for (let index = 1; index < size; index += 1) {
    edges.push({
      id: `edge-${index}`,
      source: `entity-${Math.max(0, Math.floor((index - 1) / 2))}`,
      target: `entity-${index}`,
      relationType: "related_to",
    });
  }

  return { nodes, edges };
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

  it("keeps a 154-node compact layout balanced instead of forming a narrow column", async () => {
    const { nodes, edges } = largeNetwork();
    const positions = await computeNetworkLayout({
      nodes,
      edges,
      preset: "compact",
      viewportWidth: 1400,
      viewportHeight: 760,
    });

    const validation = validateNetworkLayout(nodes, positions, "compact");
    expect(validation.valid).toBe(true);
    expect(validation.aspectRatio).toBeGreaterThan(0.45);
    expect(validation.aspectRatio).toBeLessThan(3.8);
  });

  it("keeps a 154-node hierarchical layout vertical but wide enough to inspect", async () => {
    const { nodes, edges } = largeNetwork();
    const positions = await computeNetworkLayout({
      nodes,
      edges,
      preset: "hierarchical",
      viewportWidth: 1400,
      viewportHeight: 760,
    });

    const validation = validateNetworkLayout(nodes, positions, "hierarchical");
    expect(validation.valid).toBe(true);
    expect(validation.aspectRatio).toBeGreaterThan(0.32);
    expect(validation.height).toBeGreaterThan(validation.width * 0.75);
  });
});
