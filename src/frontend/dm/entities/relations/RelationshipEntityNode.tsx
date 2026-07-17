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

export const RelationshipEntityNode = React.memo(function RelationshipEntityNode({
  data,
  selected,
}: RelationshipEntityNodeProps) {
  const isCenter = data.role === "center";
  return (
    <div
      className={`entity-relations-node ${isCenter ? "entity-relations-node--center" : "entity-relations-node--neighbor"} ${selected ? "is-selected" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="entity-relations-node__handle" />
      {isCenter && <span className="entity-relations-node__badge">Entidad actual</span>}
      <EntityNodeContent entity={data.entity} density="compact" />
      <Handle type="source" position={Position.Bottom} className="entity-relations-node__handle" />
    </div>
  );
});
