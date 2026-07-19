import type { Edge, Node } from "@xyflow/react";
import { computeCanvasLayout } from "../../canvas/services/computeCanvasLayout.js";
import type { SessionProjection } from "@core/domain/session/projection/sessionProjectionTypes.js";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 96;

export interface ConsequenceChainFlow {
  nodes: Node[];
  edges: Edge[];
}

/** ELK horizontal (left-to-right) per §45.2 — origin -> impact -> affected -> front/clock reads left to right. */
export async function buildConsequenceChainFlow(
  projection: SessionProjection,
  viewportWidth: number,
  viewportHeight: number,
): Promise<ConsequenceChainFlow> {
  if (projection.nodes.length === 0) return { nodes: [], edges: [] };

  const layout = await computeCanvasLayout({
    nodes: projection.nodes.map((node) => ({ id: node.id, width: NODE_WIDTH, height: NODE_HEIGHT, x: 0, y: 0 })),
    edges: projection.edges.map((edge) => ({ id: edge.id, sourceNodeId: edge.sourceId, targetNodeId: edge.targetId })),
    groups: [],
    preset: "horizontal",
    viewportWidth,
    viewportHeight,
  });

  const positionByNodeId = new Map(layout.nodeUpdates.map((update) => [update.nodeId, { x: update.x, y: update.y }]));

  const nodes: Node[] = projection.nodes.map((node) => ({
    id: node.id,
    type: "consequence",
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
