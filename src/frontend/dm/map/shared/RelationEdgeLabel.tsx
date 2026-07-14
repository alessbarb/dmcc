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
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(4px)",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "600",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        ...style
      }}
    >
      {label}
    </div>
  );
}
export default RelationEdgeLabel;
