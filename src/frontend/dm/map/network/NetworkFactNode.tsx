import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { Fact } from "../../../shared/stores/campaignStore.js";
import { ResourceNodeFrame } from "../shared/ResourceNodeFrame.js";
import { FactNodeContent } from "../shared/FactNodeContent.js";

export interface NetworkFactNodeProps {
  data: {
    fact: Fact;
    relatedCount: number;
  };
  selected?: boolean;
}

export function NetworkFactNode({ data, selected }: NetworkFactNodeProps) {
  const { fact, relatedCount } = data;

  return (
    <ResourceNodeFrame
      selected={selected}
      accentColor="var(--theme-feedback-danger-foreground)"
      className="network-fact-node"
    >
      <Handle type="target" position={Position.Top} />
      <FactNodeContent
        statement={fact.statement}
        kind={fact.kind}
        confidence={fact.confidence}
        relatedCount={relatedCount}
      />
      <Handle type="source" position={Position.Bottom} />
    </ResourceNodeFrame>
  );
}
