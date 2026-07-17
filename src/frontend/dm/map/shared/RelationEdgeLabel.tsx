import React from "react";

export interface RelationEdgeLabelProps {
  label: string;
  style?: React.CSSProperties;
}

export function RelationEdgeLabel({ label, style = {} }: RelationEdgeLabelProps) {
  return (
    <div
      className="relation-edge-label"
      style={{
        background: "var(--theme-graph-edge-label-background)",
        backdropFilter: "blur(4px)",
        border: "1px solid var(--theme-borders-default)",
        color: "var(--theme-graph-edge-label-text)",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "600",
        boxShadow: "0 2px 6px color-mix(in srgb, var(--theme-surfaces-canvas) 40%, transparent)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        ...style
      }}
    >
      {label}
    </div>
  );
}
