import type { RelationshipLayoutPoint } from "./computeRadialRelationshipLayout.js";

export interface FlowPosition {
  x: number;
  y: number;
}

export function relationshipLayoutToFlowPositions(
  points: Map<string, RelationshipLayoutPoint>,
  nodeSize: { width: number; height: number },
): Map<string, FlowPosition> {
  const { width, height } = nodeSize;
  return new Map(
    [...points].map(([id, point]) => [id, { x: point.centerX - width / 2, y: point.centerY - height / 2 }]),
  );
}
