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
      aria-label={t("common.sectionNavigation")}
      style={{
        display: "flex",
        width: "100%",
        minWidth: 0,
        gap: 8,
        overflowX: "auto",
        overscrollBehaviorX: "contain",
        scrollbarWidth: "thin",
        borderBottom: "1px solid var(--border-color)",
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
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "inline-flex",
              flex: "0 0 auto",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 44,
              padding: "10px 12px",
              color: isActive ? "var(--color-primary, #6366f1)" : "var(--text-muted)",
              borderBottom: isActive ? "2px solid var(--color-primary, #6366f1)" : "2px solid transparent",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.875rem",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              textDecoration: "none",
              cursor: "pointer",
              transition: "color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
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
