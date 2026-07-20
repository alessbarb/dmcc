import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
} from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import { RelationEdgeLabel } from "../../map/shared/RelationEdgeLabel.js";

export interface RelationshipEdgePoint {
  x: number;
  y: number;
}

export interface RelationshipEdgeData
  extends Record<string, unknown> {
  label?: string;
  color?: string;
  dashed?: boolean;
  selected?: boolean;

  /**
   * Puntos absolutos devueltos por ELK:
   * inicio, bend points y final.
   */
  routedPoints?: RelationshipEdgePoint[];

  /**
   * Posición calculada sobre la ruta completa para evitar que todas las
   * etiquetas se amontonen alrededor del nodo principal.
   */
  labelPoint?: RelationshipEdgePoint;
}

function buildOrthogonalPath(
  points: RelationshipEdgePoint[],
): string {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");
}

export const RelationshipEdge = React.memo(
  function RelationshipEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style,
    data,
    markerEnd,
  }: EdgeProps) {
    const edgeData =
      (data ?? {}) as RelationshipEdgeData;

    const routedPoints =
      edgeData.routedPoints?.length &&
      edgeData.routedPoints.length >= 2
        ? edgeData.routedPoints
        : null;

    const [fallbackPath, fallbackLabelX, fallbackLabelY] =
      getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });

    const edgePath = routedPoints
      ? buildOrthogonalPath(routedPoints)
      : fallbackPath;

    const labelX =
      edgeData.labelPoint?.x ?? fallbackLabelX;
    const labelY =
      edgeData.labelPoint?.y ?? fallbackLabelY;

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={style}
          markerEnd={markerEnd}
        />

        {edgeData.label && (
          <EdgeLabelRenderer>
            <div
              className="relationship-edge-label"
              style={{
                transform:
                  `translate(-50%, -50%) ` +
                  `translate(${labelX}px, ${labelY}px)`,
              }}
            >
              <RelationEdgeLabel
                label={edgeData.label}
              />
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);
