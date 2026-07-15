import React from "react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";

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
    <section
      className="campaign-workspace"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "clamp(16px, 2vw, 24px)",
        width: "100%",
        height: "100%",
        minHeight: 0,
        maxWidth: "100%",
      }}
    >
      <header
        className="content-header campaign-workspace__header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: 16,
        }}
      >
        <div className="page-heading campaign-workspace__heading" style={{ minWidth: 0, flex: "1 1 320px" }}>
          {eyebrowKey && (
            <p
              className="page-eyebrow"
              style={{
                margin: "0 0 6px",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {t(eyebrowKey)}
            </p>
          )}
          <h1
            className="page-title"
            style={{
              margin: 0,
              fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {t(titleKey)}
          </h1>
          <p
            className="page-description"
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              maxWidth: "72ch",
            }}
          >
            {t(descriptionKey)}
          </p>
        </div>
        {actions && (
          <div
            className="header-actions campaign-workspace__actions"
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
          >
            {actions}
          </div>
        )}
      </header>

      {tabs && tabs.length > 1 && <WorkspaceTabs tabs={tabs} />}

      <div
        className="workspace-content campaign-workspace__content"
        style={{
          display: "flex",
          flex: "1 1 auto",
          minWidth: 0,
          minHeight: 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </section>
  );
}
