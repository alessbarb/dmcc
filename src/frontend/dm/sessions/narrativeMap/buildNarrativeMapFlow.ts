import type { Edge, Node } from "@xyflow/react";
import { computeCanvasLayout } from "../../canvas/services/computeCanvasLayout.js";
import type { SessionProjection } from "@core/domain/session/projection/sessionProjectionTypes.js";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 96;

export interface NarrativeMapFlow {
  nodes: Node[];
  edges: Edge[];
}

/** ELK vertical (top-to-bottom) per §28.1/Sprint 3 — a narrative map reads top-down like the session itself. */
export async function buildNarrativeMapFlow(
  projection: SessionProjection,
  viewportWidth: number,
  viewportHeight: number,
): Promise<NarrativeMapFlow> {
  if (projection.nodes.length === 0) return { nodes: [], edges: [] };

  const layout = await computeCanvasLayout({
    nodes: projection.nodes.map((node) => ({ id: node.id, width: NODE_WIDTH, height: NODE_HEIGHT, x: 0, y: 0 })),
    edges: projection.edges.map((edge) => ({ id: edge.id, sourceNodeId: edge.sourceId, targetNodeId: edge.targetId })),
    groups: [],
    preset: "vertical",
    viewportWidth,
    viewportHeight,
  });

  const positionByNodeId = new Map(layout.nodeUpdates.map((update) => [update.nodeId, { x: update.x, y: update.y }]));

  const nodes: Node[] = projection.nodes.map((node) => ({
    id: node.id,
    type: "narrative",
    position: positionByNodeId.get(node.id) ?? { x: 0, y: 0 },
    data: { node },
  }));

  const edges: Edge[] = projection.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.label,
    data: { kind: edge.kind },
  }));

  return { nodes, edges };
}
