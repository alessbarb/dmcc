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
  accentColor = "var(--theme-accents-primary-foreground)",
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
        background: "color-mix(in srgb, var(--theme-text-on-media) 3%, transparent)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        border: `1px solid ${selected ? accentColor : "color-mix(in srgb, var(--theme-text-on-media) 10%, transparent)"}`,
        boxShadow: selected ? `0 0 16px ${accentColor}44` : "0 4px 12px color-mix(in srgb, var(--theme-surfaces-canvas) 30%, transparent)",
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
