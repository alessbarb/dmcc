import React from "react";

export interface ResourceNodeFrameProps {
  selected?: boolean;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function ResourceNodeFrame({
  selected,
  accentColor = "var(--primary)",
  children,
  className = "",
  style = {},
  onClick
}: ResourceNodeFrameProps) {
  return (
    <div
      onClick={onClick}
      className={`resource-node-frame ${selected ? "resource-node-frame--selected" : ""} ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        border: `1px solid ${selected ? accentColor : "rgba(255, 255, 255, 0.1)"}`,
        boxShadow: selected ? `0 0 16px ${accentColor}44` : "0 4px 12px rgba(0, 0, 0, 0.3)",
        transition: "all 0.2s ease",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...style
      }}
    >
      {children}
    </div>
  );
}
