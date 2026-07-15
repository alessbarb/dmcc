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

const LARGE_NETWORK_THRESHOLD = 72;

function isFinitePosition(position: NetworkLayoutPosition | undefined): position is NetworkLayoutPosition {
  return Boolean(position && Number.isFinite(position.x) && Number.isFinite(position.y));
}

function fallbackPosition(index: number, viewportWidth: number): Pick<NetworkLayoutPosition, "x" | "y"> {
  const nodeWidth = 180;
  const nodeHeight = 112;
  const horizontalGap = 38;
  const verticalGap = 42;
  const usableWidth = Math.max(viewportWidth - 80, nodeWidth);
  const columns = Math.max(1, Math.floor(usableWidth / (nodeWidth + horizontalGap)));

  return {
    x: 40 + (index % columns) * (nodeWidth + horizontalGap),
    y: 40 + Math.floor(index / columns) * (nodeHeight + verticalGap),
  };
}

function computeLightweightLayout(
  nodes: NetworkNodeModel[],
  edges: NetworkEdgeModel[],
  preset: NetworkLayoutPreset,
  viewportWidth: number,
): Map<string, NetworkLayoutPosition> {
  const degree = new Map<string, number>();
  for (const node of nodes) degree.set(node.id, 0);
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const ordered = [...nodes].sort((left, right) => {
    const degreeDifference = (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0);
    return degreeDifference || left.id.localeCompare(right.id);
  });

  const nodeWidth = 180;
  const nodeHeight = 112;
  const horizontalGap = preset === "hierarchical" ? 64 : 42;
  const verticalGap = preset === "hierarchical" ? 76 : 48;
  const usableWidth = Math.max(viewportWidth - 96, nodeWidth);
  const compactColumns = Math.max(1, Math.floor(usableWidth / (nodeWidth + horizontalGap)));
  const columns = preset === "hierarchical"
    ? Math.max(1, Math.min(6, Math.ceil(Math.sqrt(ordered.length / 1.4))))
    : compactColumns;

  const positions = new Map<string, NetworkLayoutPosition>();
  ordered.forEach((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.set(node.id, {
      nodeId: node.id,
      x: 48 + column * (nodeWidth + horizontalGap),
      y: 48 + row * (nodeHeight + verticalGap),
    });
  });
  return positions;
}

/**
 * Small focused networks use ELK for a richer relationship-aware layout.
 * Large overview networks use an O(n + e) deterministic layout so opening the
 * graph never blocks the main thread with multiple concurrent ELK executions.
 */
export async function computeNetworkLayout(
  input: ComputeNetworkLayoutInput,
): Promise<Map<string, NetworkLayoutPosition>> {
  const { nodes, edges, preset, viewportWidth, viewportHeight } = input;

  if (nodes.length > LARGE_NETWORK_THRESHOLD) {
    return computeLightweightLayout(nodes, edges, preset, viewportWidth);
  }

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
