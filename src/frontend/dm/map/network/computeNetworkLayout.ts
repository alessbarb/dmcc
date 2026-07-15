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

function isFinitePosition(position: NetworkLayoutPosition | undefined): position is NetworkLayoutPosition {
  return Boolean(position && Number.isFinite(position.x) && Number.isFinite(position.y));
}

function fallbackPosition(index: number, viewportWidth: number): Pick<NetworkLayoutPosition, "x" | "y"> {
  const nodeWidth = 240;
  const nodeHeight = 250;
  const horizontalGap = 48;
  const verticalGap = 56;
  const usableWidth = Math.max(viewportWidth - 80, nodeWidth);
  const columns = Math.max(1, Math.floor(usableWidth / (nodeWidth + horizontalGap)));

  return {
    x: 40 + (index % columns) * (nodeWidth + horizontalGap),
    y: 40 + Math.floor(index / columns) * (nodeHeight + verticalGap),
  };
}

/**
 * Red 2D has no persisted node positions: this recomputes a fresh layout
 * every time from the current entity/relation/fact set, reusing the
 * Canvas ELK pipeline instead of building a second layout engine.
 *
 * The returned map always contains one finite position for every input node.
 * ELK may occasionally omit disconnected or malformed nodes; those nodes use
 * a deterministic compact grid rather than disappearing from React Flow.
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

  const computedPositions = new Map<string, NetworkLayoutPosition>();
  for (const update of result.nodeUpdates) {
    const position = { nodeId: update.nodeId, x: update.x, y: update.y };
    if (isFinitePosition(position)) computedPositions.set(update.nodeId, position);
  }

  const positions = new Map<string, NetworkLayoutPosition>();
  nodes.forEach((node, index) => {
    const computed = computedPositions.get(node.id);
    const fallback = fallbackPosition(index, viewportWidth);
    positions.set(node.id, computed ?? { nodeId: node.id, ...fallback });
  });

  return positions;
}
