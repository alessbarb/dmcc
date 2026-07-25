import React from "react";
import "../../shared/styles/primitives/compact-empty-state.css";

export interface CompactEmptyStateAction {
  label: string;
  onClick: () => void | Promise<void>;
}

export interface CompactEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: CompactEmptyStateAction;
  secondaryAction?: CompactEmptyStateAction;
  tone?: "neutral" | "positive" | "warning";
  size?: "compact" | "standard";
}

export function CompactEmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tone = "neutral",
  size = "standard",
}: CompactEmptyStateProps) {
  const isActionable = Boolean(primaryAction || secondaryAction);
  const toneClass = tone !== "neutral" ? `compact-empty-state--${tone}` : "";
  const sizeClass = `compact-empty-state--${size}`;
  const actionableClass = isActionable ? "compact-empty-state--actionable" : "";

  return (
    <div className={`compact-empty-state ${toneClass} ${sizeClass} ${actionableClass}`}>
      {icon && <div className="compact-empty-state__icon">{icon}</div>}
      <h3 className="compact-empty-state__title">{title}</h3>
      {description && <p className="compact-empty-state__description">{description}</p>}
      {isActionable && (
        <div className="compact-empty-state__actions">
          {primaryAction && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void primaryAction.onClick()}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => void secondaryAction.onClick()}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
