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
    <nav className="workspace-tabs" aria-label={t("common.sectionNavigation")}>
      {tabs.map((tab) => {
        const isActive = currentPathname === tab.path || currentPathname.startsWith(`${tab.path}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`workspace-tab ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            <span>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
