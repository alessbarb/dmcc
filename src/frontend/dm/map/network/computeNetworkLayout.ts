import { computeCanvasLayout } from "../../canvas/services/computeCanvasLayout.js";
import type { NetworkNodeModel, NetworkEdgeModel } from "./buildNetworkModel.js";

export type NetworkLayoutPreset = "compact" | "hierarchical";

export interface NetworkLayoutPosition {
  nodeId: string;
  x: number;
  y: number;
}

export interface ComputeNetworkLayoutInput {
  nodes: NetworkNodeModel[];
  edges: NetworkEdgeModel[];
  preset: NetworkLayoutPreset;
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Red 2D has no persisted node positions: this recomputes a fresh layout
 * every time from the current entity/relation/fact set, reusing the
 * Canvas ELK pipeline instead of building a second layout engine.
 */
export async function computeNetworkLayout(
  input: ComputeNetworkLayoutInput,
): Promise<Map<string, NetworkLayoutPosition>> {
  const { nodes, edges, preset, viewportWidth, viewportHeight } = input;

  const result = await computeCanvasLayout({
    nodes: nodes.map((node) => ({
      id: node.id,
      width: node.width,
      height: node.height,
      x: 0,
      y: 0,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
    })),
    groups: [],
    preset: preset === "hierarchical" ? "vertical" : "compact",
    viewportWidth,
    viewportHeight,
  });

  const positions = new Map<string, NetworkLayoutPosition>();
  for (const update of result.nodeUpdates) {
    positions.set(update.nodeId, { nodeId: update.nodeId, x: update.x, y: update.y });
  }
  return positions;
}
