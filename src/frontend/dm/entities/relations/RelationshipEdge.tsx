import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { RelationEdgeLabel } from "../../map/shared/RelationEdgeLabel.js";

export interface RelationshipEdgeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  dashed?: boolean;
  selected?: boolean;
}

export const RelationshipEdge = React.memo(function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = (data ?? {}) as RelationshipEdgeData;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {edgeData.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
            }}
          >
            <RelationEdgeLabel label={edgeData.label} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
