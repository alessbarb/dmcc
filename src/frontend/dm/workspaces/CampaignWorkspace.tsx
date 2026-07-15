import React from "react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";
import "./campaignWorkspace.css";

interface CampaignWorkspaceProps {
  titleKey: string;
  descriptionKey: string;
  eyebrowKey?: string;
  tabs?: WorkspaceTab[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function CampaignWorkspace({
  titleKey,
  descriptionKey,
  eyebrowKey,
  tabs,
  actions,
  children,
}: CampaignWorkspaceProps) {
  const { t } = useTranslation();

  return (
    <section className="campaign-workspace">
      <header className="content-header campaign-workspace__header">
        <div className="page-heading campaign-workspace__heading">
          {eyebrowKey && <p className="page-eyebrow">{t(eyebrowKey)}</p>}
          <h1 className="page-title">{t(titleKey)}</h1>
          <p className="page-description">{t(descriptionKey)}</p>
        </div>
        {actions && <div className="header-actions campaign-workspace__actions">{actions}</div>}
      </header>

      {tabs && tabs.length > 1 && <WorkspaceTabs tabs={tabs} />}

      <div className="workspace-content campaign-workspace__content">{children}</div>
    </section>
  );
}
