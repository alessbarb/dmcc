import React from "react";
import "../../../shared/styles/features/relation-edge-label.css";

export interface RelationEdgeLabelProps {
  label: string;
  style?: React.CSSProperties;
}

export function RelationEdgeLabel({ label, style = {} }: RelationEdgeLabelProps) {
  return (
    <div
      className="relation-edge-label"
      style={style}
    >
      {label}
    </div>
  );
}
