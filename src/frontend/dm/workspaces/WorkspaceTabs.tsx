import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface WorkspaceTab {
  id: string;
  labelKey: string;
  path: string;
  icon?: React.ComponentType<{ size?: number }>;
}

interface WorkspaceTabsProps {
  tabs: WorkspaceTab[];
}

export function WorkspaceTabs({ tabs }: WorkspaceTabsProps) {
  const { t } = useTranslation();
  const routerState = useRouterState();
  const currentPathname = routerState.location.pathname;

  return (
    <nav
      className="workspace-tabs"
      style={{
        display: "flex",
        borderBottom: "1px solid var(--border-color)",
        gap: 24,
        marginBottom: 16,
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentPathname === tab.path || currentPathname.startsWith(tab.path + "/");
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`workspace-tab ${isActive ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 4px",
              color: isActive ? "var(--color-primary, #6366f1)" : "var(--text-muted)",
              borderBottom: isActive ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
              fontWeight: isActive ? 600 : 500,
              fontSize: "0.875rem",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {Icon && <Icon size={16} />}
            <span>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
