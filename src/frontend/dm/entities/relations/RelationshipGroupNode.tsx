import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Layers } from "lucide-react";
import { formatEntityType } from "@shared/i18n/index.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { RelationshipGroupNode as RelationshipGroupNodeModel } from "./groupRelationshipNeighbors.js";

export interface RelationshipGroupNodeData extends Record<string, unknown> {
  group: RelationshipGroupNodeModel;
  onActivate?: () => void;
}

export interface RelationshipGroupNodeProps {
  data: RelationshipGroupNodeData;
}

const SIDES: { id: string; position: Position }[] = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
];

export const RelationshipGroupNode = React.memo(function RelationshipGroupNode({ data }: RelationshipGroupNodeProps) {
  const { locale } = useTranslation();
  const { group } = data;

  return (
    <div
      className="entity-relations-node entity-relations-node--group"
      tabIndex={0}
      role="button"
      onClick={data.onActivate}
      onKeyDown={(event) => {
        if (!data.onActivate) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          data.onActivate();
        }
      }}
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
      <div className="entity-relations-group-node__content">
        <Layers size={16} />
        <span className="entity-relations-group-node__label">{formatEntityType(group.entityType, locale)}</span>
        <span className="entity-relations-group-node__count">{group.entities.length}</span>
      </div>
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
