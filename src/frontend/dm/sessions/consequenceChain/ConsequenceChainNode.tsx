import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { SessionProjectionNode } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getNarrativeNodeVisual } from "../narrativeMap/narrativeNodeVisuals.js";

export interface ConsequenceChainNodeProps {
  data: { node: SessionProjectionNode };
  selected?: boolean;
}

export const ConsequenceChainNode = React.memo(function ConsequenceChainNode({ data, selected }: ConsequenceChainNodeProps) {
  const { t } = useTranslation();
  const { node } = data;
  const visual = getNarrativeNodeVisual(node.kind);
  const Icon = visual.icon;

  return (
    <div
      className={`consequence-chain-node ${selected ? "is-selected" : ""}`}
      style={{ "--consequence-node-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}
    >
      <Handle type="target" position={Position.Left} className="consequence-chain-node-handle" />
      <div className="consequence-chain-node__header">
        <Icon size={14} />
        <span className="consequence-chain-node__kind">{t(`sessionConsequenceChain.nodeKinds.${node.kind}`)}</span>
      </div>
      <div className="consequence-chain-node__label">{node.label}</div>
      <Handle type="source" position={Position.Right} className="consequence-chain-node-handle" />
    </div>
  );
});
