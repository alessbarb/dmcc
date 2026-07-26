import React from "react";

export interface PillProps {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "warning" | "good" | "primary";
  className?: string;
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: PillProps) {
  return (
    <span
      className={["ui-pill", `ui-pill--${tone}`, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
