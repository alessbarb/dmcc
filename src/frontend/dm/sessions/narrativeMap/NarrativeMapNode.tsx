import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getNarrativeNodeVisual } from "./narrativeNodeVisuals.js";

export interface NarrativeMapNodeProps {
  data: { node: SessionProjectionNode };
  selected?: boolean;
}

export const NarrativeMapNode = React.memo(function NarrativeMapNode({ data, selected }: NarrativeMapNodeProps) {
  const { t } = useTranslation();
  const { node } = data;
  const visual = getNarrativeNodeVisual(node.kind);
  const Icon = visual.icon;

  return (
    <div
      className={`narrative-map-node ${selected ? "is-selected" : ""}`}
      style={{ "--narrative-node-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}
    >
      <Handle type="target" position={Position.Top} className="narrative-map-node-handle" />
      <div className="narrative-map-node__header">
        <Icon size={14} />
        <span className="narrative-map-node__kind">{t(`sessionNarrativeMap.nodeKinds.${node.kind}`)}</span>
      </div>
      <div className="narrative-map-node__label">{node.label}</div>
      <Handle type="source" position={Position.Bottom} className="narrative-map-node-handle" />
    </div>
  );
});
