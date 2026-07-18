import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { EntityNodeContent } from "../../map/shared/EntityNodeContent.js";

export interface RelationshipNodeData extends Record<string, unknown> {
  entity: Entity;
  role: "center" | "neighbor";
  /** Neighbor nodes only — navigates to this entity. Absent on the (non-navigable) center node. */
  onActivate?: () => void;
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
  const { t } = useTranslation();
  const isCenter = data.role === "center";
  return (
    <div
      className={`entity-relations-node ${isCenter ? "entity-relations-node--center" : "entity-relations-node--neighbor"} ${selected ? "is-selected" : ""}`}
      // Keyboard parity with pointer click: the graph is otherwise a
      // pointer-only surface (React Flow panning/zooming eats native tab
      // order), so each neighbor is made an explicit, focusable activation
      // target instead of relying solely on onNodeClick.
      tabIndex={isCenter ? -1 : 0}
      role={isCenter ? undefined : "button"}
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
      {isCenter && (
        <span className="entity-relations-node__badge">{t("entityDetail.relationsGraph.currentEntityBadge")}</span>
      )}
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
