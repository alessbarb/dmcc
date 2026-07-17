import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { EntityNodeContent } from "../../map/shared/EntityNodeContent.js";

export interface RelationshipNodeData extends Record<string, unknown> {
  entity: Entity;
  role: "center" | "neighbor";
}

export interface RelationshipEntityNodeProps {
  data: RelationshipNodeData;
  selected?: boolean;
}

const SIDES: { id: string; position: Position }[] = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
];

export const RelationshipEntityNode = React.memo(function RelationshipEntityNode({
  data,
  selected,
}: RelationshipEntityNodeProps) {
  const isCenter = data.role === "center";
  return (
    <div
      className={`entity-relations-node ${isCenter ? "entity-relations-node--center" : "entity-relations-node--neighbor"} ${selected ? "is-selected" : ""}`}
    >
      {SIDES.map((side) => (
        <Handle
          key={`target-${side.id}`}
          type="target"
          id={side.id}
          position={side.position}
          className="entity-relations-node__handle"
          isConnectable={false}
        />
      ))}
      {isCenter && <span className="entity-relations-node__badge">Entidad actual</span>}
      <EntityNodeContent entity={data.entity} density="compact" />
      {SIDES.map((side) => (
        <Handle
          key={`source-${side.id}`}
          type="source"
          id={side.id}
          position={side.position}
          className="entity-relations-node__handle"
          isConnectable={false}
        />
      ))}
    </div>
  );
});
