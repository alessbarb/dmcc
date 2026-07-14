import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { Entity } from "../../../shared/stores/campaignStore.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { ResourceNodeFrame } from "../shared/ResourceNodeFrame.js";
import { EntityNodeContent } from "../shared/EntityNodeContent.js";
import { getEntityVisual } from "../../entities/entityVisuals.js";

export interface NetworkEntityNodeProps {
  id: string;
  data: {
    entityId: string;
  };
  selected?: boolean;
}

export function NetworkEntityNode({ id: _id, data, selected }: NetworkEntityNodeProps) {
  const campaignState = useCampaignStore((s) => s.campaignState);
  const entity = campaignState?.entities?.find((e: Entity) => e.entityId === data.entityId);

  if (!entity) return null;

  const cfg = getEntityVisual(entity.entityType);

  return (
    <ResourceNodeFrame selected={selected} accentColor={cfg.accent} style={{ width: "200px", height: "auto" }}>
      <Handle type="target" position={Position.Top} style={{ background: cfg.accent }} />
      <EntityNodeContent entity={entity} density="normal" />
      <Handle type="source" position={Position.Bottom} style={{ background: cfg.accent }} />
    </ResourceNodeFrame>
  );
}
export default NetworkEntityNode;
