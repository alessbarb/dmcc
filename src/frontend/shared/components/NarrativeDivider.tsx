import type { HTMLAttributes } from "react";

type NarrativeDividerProps = HTMLAttributes<HTMLDivElement> & {
  decorative?: boolean;
};

export function NarrativeDivider({
  decorative = true,
  className = "",
  ...props
}: NarrativeDividerProps) {
  return (
    <div
      className={`narrative-divider ${className}`.trim()}
      role={decorative ? undefined : "separator"}
      aria-orientation={decorative ? undefined : "horizontal"}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    />
  );
}
