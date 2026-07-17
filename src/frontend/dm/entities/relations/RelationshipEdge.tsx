import React from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { RelationEdgeLabel } from "../../map/shared/RelationEdgeLabel.js";

export interface RelationshipEdgeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  dashed?: boolean;
  selected?: boolean;
  /** True when this edge's React Flow `source` is the graph's center node
   *  (domain relation direction, not layout position) — used to bias the
   *  label toward the neighbor end regardless of which end that is. */
  sourceIsCenter?: boolean;
}

export const RelationshipEdge = React.memo(function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data,
  markerEnd,
}: EdgeProps) {
  // Every edge here is a direct hub-and-spoke connection (center <-> one
  // neighbor), never a multi-hop path — a straight line is both the
  // clearest reading and structurally incapable of the bezier overshoot
  // that made long, near-vertical edges visually "loop" around nodes
  // stacked on the same axis.
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const edgeData = (data ?? {}) as RelationshipEdgeData;

  // Every edge in this view radiates from the same center node, so the path
  // midpoint (t=0.5) is where every label converges — right on top of the
  // center card. Bias toward whichever end is the neighbor (not necessarily
  // "target": domain relation direction can point either way) so labels
  // spread out across the already-spaced ring instead.
  const t = edgeData.sourceIsCenter ? 0.72 : 0.28;
  const labelX = sourceX + (targetX - sourceX) * t;
  const labelY = sourceY + (targetY - sourceY) * t;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
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
