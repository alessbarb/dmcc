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

export interface NetworkLayoutValidation {
  valid: boolean;
  issues: string[];
  width: number;
  height: number;
  aspectRatio: number;
}

const LARGE_NETWORK_THRESHOLD = 72;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 112;
const HORIZONTAL_GAP = 42;
const VERTICAL_GAP = 48;
const OUTER_PADDING = 48;

function isFinitePosition(position: NetworkLayoutPosition | undefined): position is NetworkLayoutPosition {
  return Boolean(position && Number.isFinite(position.x) && Number.isFinite(position.y));
}

function degreeByNode(nodes: NetworkNodeModel[], edges: NetworkEdgeModel[]): Map<string, number> {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  return degree;
}

function orderedByRelevance(nodes: NetworkNodeModel[], edges: NetworkEdgeModel[]): NetworkNodeModel[] {
  const degree = degreeByNode(nodes, edges);
  return [...nodes].sort((left, right) => {
    const degreeDifference = (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0);
    return degreeDifference || left.id.localeCompare(right.id);
  });
}

function targetCompactColumns(nodeCount: number, viewportWidth: number, viewportHeight: number): number {
  const viewportRatio = Math.max(0.6, Math.min(2.4, viewportWidth / Math.max(viewportHeight, 1)));
  const nodeRatio = (NODE_WIDTH + HORIZONTAL_GAP) / (NODE_HEIGHT + VERTICAL_GAP);
  return Math.max(2, Math.ceil(Math.sqrt(nodeCount * viewportRatio / nodeRatio)));
}

function computeCompactLayout(
  nodes: NetworkNodeModel[],
  edges: NetworkEdgeModel[],
  viewportWidth: number,
  viewportHeight: number,
): Map<string, NetworkLayoutPosition> {
  const ordered = orderedByRelevance(nodes, edges);
  const columns = Math.min(ordered.length, targetCompactColumns(ordered.length, viewportWidth, viewportHeight));
  const positions = new Map<string, NetworkLayoutPosition>();

  ordered.forEach((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    positions.set(node.id, {
      nodeId: node.id,
      x: OUTER_PADDING + column * (NODE_WIDTH + HORIZONTAL_GAP),
      y: OUTER_PADDING + row * (NODE_HEIGHT + VERTICAL_GAP),
    });
  });

  return positions;
}

function computeVerticalLayers(nodes: NetworkNodeModel[], edges: NetworkEdgeModel[]): string[][] {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    outgoing.set(node.id, []);
    indegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || edge.source === edge.target) continue;
    outgoing.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  const degree = degreeByNode(nodes, edges);
  const remaining = new Set(nodeIds);
  const layers: string[][] = [];
  let frontier = [...remaining]
    .filter((nodeId) => (indegree.get(nodeId) ?? 0) === 0)
    .sort((left, right) => (degree.get(right) ?? 0) - (degree.get(left) ?? 0) || left.localeCompare(right));

  while (remaining.size > 0) {
    if (frontier.length === 0) {
      const cycleAnchor = [...remaining].sort(
        (left, right) => (degree.get(right) ?? 0) - (degree.get(left) ?? 0) || left.localeCompare(right),
      )[0];
      frontier = cycleAnchor ? [cycleAnchor] : [];
    }

    const layer = frontier.filter((nodeId) => remaining.has(nodeId));
    if (layer.length === 0) break;
    layers.push(layer);

    const next = new Set<string>();
    for (const nodeId of layer) {
      remaining.delete(nodeId);
      for (const targetId of outgoing.get(nodeId) ?? []) {
        indegree.set(targetId, Math.max(0, (indegree.get(targetId) ?? 0) - 1));
        if (remaining.has(targetId) && (indegree.get(targetId) ?? 0) === 0) next.add(targetId);
      }
    }

    frontier = [...next].sort(
      (left, right) => (degree.get(right) ?? 0) - (degree.get(left) ?? 0) || left.localeCompare(right),
    );
  }

  return layers;
}

function computeVerticalLayout(
  nodes: NetworkNodeModel[],
  edges: NetworkEdgeModel[],
  viewportWidth: number,
): Map<string, NetworkLayoutPosition> {
  const rawLayers = computeVerticalLayers(nodes, edges);
  // The canvas is pannable/zoomable, so large networks aren't bound to the initial
  // viewport width: without this, a deep near-binary tree collapses into a tall,
  // narrow column (columns capped by viewport alone) that validateNetworkLayout
  // rejects as too narrow, and the caller's fallback recomputes this same function
  // with the same inputs, producing an identical result.
  const viewportColumns = Math.floor(Math.max(viewportWidth - 2 * OUTER_PADDING, NODE_WIDTH) / (NODE_WIDTH + HORIZONTAL_GAP));
  const nodeCountColumns = Math.ceil(Math.sqrt(nodes.length));
  const maxColumns = Math.max(3, Math.min(20, Math.max(viewportColumns, nodeCountColumns)));
  const visualRows: string[][] = [];

  for (const layer of rawLayers) {
    for (let offset = 0; offset < layer.length; offset += maxColumns) {
      visualRows.push(layer.slice(offset, offset + maxColumns));
    }
  }

  const positions = new Map<string, NetworkLayoutPosition>();
  visualRows.forEach((row, rowIndex) => {
    const rowWidth = row.length * NODE_WIDTH + Math.max(0, row.length - 1) * HORIZONTAL_GAP;
    const startX = Math.max(OUTER_PADDING, (viewportWidth - rowWidth) / 2);
    row.forEach((nodeId, columnIndex) => {
      positions.set(nodeId, {
        nodeId,
        x: startX + columnIndex * (NODE_WIDTH + HORIZONTAL_GAP),
        y: OUTER_PADDING + rowIndex * (NODE_HEIGHT + VERTICAL_GAP + 28),
      });
    });
  });

  return positions;
}

function computeLargeNetworkLayout(input: ComputeNetworkLayoutInput): Map<string, NetworkLayoutPosition> {
  return input.preset === "hierarchical"
    ? computeVerticalLayout(input.nodes, input.edges, input.viewportWidth)
    : computeCompactLayout(input.nodes, input.edges, input.viewportWidth, input.viewportHeight);
}

export function validateNetworkLayout(
  nodes: NetworkNodeModel[],
  positions: Map<string, NetworkLayoutPosition>,
  preset: NetworkLayoutPreset,
): NetworkLayoutValidation {
  const issues: string[] = [];
  if (positions.size !== nodes.length) issues.push("incomplete-position-map");

  const values = nodes.map((node) => positions.get(node.id));
  if (values.some((position) => !isFinitePosition(position))) issues.push("non-finite-position");

  const finiteValues = values.filter(isFinitePosition);
  const minX = finiteValues.length > 0 ? Math.min(...finiteValues.map((position) => position.x)) : 0;
  const maxX = finiteValues.length > 0 ? Math.max(...finiteValues.map((position) => position.x + NODE_WIDTH)) : 0;
  const minY = finiteValues.length > 0 ? Math.min(...finiteValues.map((position) => position.y)) : 0;
  const maxY = finiteValues.length > 0 ? Math.max(...finiteValues.map((position) => position.y + NODE_HEIGHT)) : 0;
  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);
  const aspectRatio = height > 0 ? width / height : 1;

  if (nodes.length >= 24 && preset === "compact" && (aspectRatio < 0.45 || aspectRatio > 3.8)) {
    issues.push("compact-layout-extreme-aspect-ratio");
  }
  if (nodes.length >= 24 && preset === "hierarchical" && aspectRatio < 0.32) {
    issues.push("hierarchical-layout-too-narrow");
  }

  return { valid: issues.length === 0, issues, width, height, aspectRatio };
}

/**
 * Focused networks use the same ELK presets as Canvas: compact and vertical.
 * Large networks use deterministic equivalents with bounded geometry so the UI
 * remains responsive while preserving the visual intent of those presets.
 */
export async function computeNetworkLayout(
  input: ComputeNetworkLayoutInput,
): Promise<Map<string, NetworkLayoutPosition>> {
  const { nodes, edges, preset, viewportWidth, viewportHeight } = input;

  let positions: Map<string, NetworkLayoutPosition>;
  if (nodes.length > LARGE_NETWORK_THRESHOLD) {
    positions = computeLargeNetworkLayout(input);
  } else {
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

    positions = new Map<string, NetworkLayoutPosition>();
    const fallback = computeCompactLayout(nodes, edges, viewportWidth, viewportHeight);
    for (const node of nodes) {
      positions.set(node.id, computedPositions.get(node.id) ?? fallback.get(node.id)!);
    }
  }

  const validation = validateNetworkLayout(nodes, positions, preset);
  if (!validation.valid) {
    return preset === "hierarchical"
      ? computeVerticalLayout(nodes, edges, viewportWidth)
      : computeCompactLayout(nodes, edges, viewportWidth, viewportHeight);
  }

  return positions;
}
