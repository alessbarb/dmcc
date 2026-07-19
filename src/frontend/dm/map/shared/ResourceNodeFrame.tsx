import React from "react";

export interface ResourceNodeFrameProps {
  selected?: boolean;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResourceNodeFrame({
  selected,
  accentColor = "var(--theme-accents-primary-foreground)",
  children,
  className = "",
  onClick
}: ResourceNodeFrameProps) {
  return (
    <div
      onClick={onClick}
      className={`resource-node-frame ${selected ? "resource-node-frame--selected" : ""} ${className}`}
      style={{ "--resource-node-accent": accentColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
