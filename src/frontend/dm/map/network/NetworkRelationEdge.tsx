import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { RelationEdgeLabel } from "../shared/RelationEdgeLabel.js";

export interface NetworkRelationEdgeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  dashed?: boolean;
  emphasized?: boolean;
}

export function NetworkRelationEdge({
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

  const edgeData = (data ?? {}) as NetworkRelationEdgeData;

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
            <RelationEdgeLabel label={edgeData.label} style={{ opacity: edgeData.emphasized ? 1 : 0.85 }} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default NetworkRelationEdge;
