import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { EntityNodeContent } from "../shared/EntityNodeContent.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";

export interface NetworkEntityNodeProps {
  id: string;
  data: {
    entityId: string;
    dimmed?: boolean;
  };
  selected?: boolean;
}

export const NetworkEntityNode = React.memo(function NetworkEntityNode({ data, selected }: NetworkEntityNodeProps) {
  const campaignState = useCampaignStore((state) => state.campaignState);
  const entity = campaignState?.entities?.find((candidate: Entity) => candidate.entityId === data.entityId);

  if (!entity) return null;

  const config = getEntityVisual(entity.entityType);

  return (
    <div
      className={`network-entity-node ${selected ? "is-selected" : ""} ${data.dimmed ? "is-dimmed" : ""}`}
      style={{ "--network-node-accent": config.accent } as React.CSSProperties & Record<`--${string}`, string>}
    >
      <Handle type="target" position={Position.Top} className="network-node-handle" />
      <EntityNodeContent entity={entity} density="compact" />
      <Handle type="source" position={Position.Bottom} className="network-node-handle" />
    </div>
  );
});
