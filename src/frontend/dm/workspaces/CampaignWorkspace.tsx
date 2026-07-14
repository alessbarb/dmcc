import React from "react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";

interface CampaignWorkspaceProps {
  titleKey: string;
  descriptionKey: string;
  tabs?: WorkspaceTab[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CampaignWorkspace({
  titleKey,
  descriptionKey,
  tabs,
  actions,
  children,
}: CampaignWorkspaceProps) {
  const { t } = useTranslation();

  return (
    <div className="campaign-workspace" style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      <header className="content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", borderBottom: "1px solid var(--border-color)", paddingBottom: 16 }}>
        <div className="page-heading">
          <h1 className="page-title" style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
            {t(titleKey)}
          </h1>
          <p className="page-description" style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {t(descriptionKey)}
          </p>
        </div>
        {actions && (
          <div className="header-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {actions}
          </div>
        )}
      </header>

      {tabs && tabs.length > 1 && (
        <WorkspaceTabs tabs={tabs} />
      )}

      <div className="workspace-content" style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
