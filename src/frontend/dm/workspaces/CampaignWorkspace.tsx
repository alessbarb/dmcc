import React from "react";
import type { WorkspaceTab } from "./WorkspaceTabs.js";
import { PageSubshell, type PageSubshellVariant } from "./PageSubshell.js";

export type CampaignWorkspaceVariant = PageSubshellVariant | "immersive";

interface CampaignWorkspaceProps {
  titleKey: string;
  descriptionKey?: string;
  description?: string;
  tabs?: WorkspaceTab[];
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  variant?: CampaignWorkspaceVariant;
  watermark?: "auto" | "hidden";
}

export function CampaignWorkspace({
  titleKey,
  description,
  tabs,
  actions,
  toolbar,
  children,
  variant = "standard",
}: CampaignWorkspaceProps) {
  const className = [
    "campaign-workspace",
    `campaign-workspace--${variant}`,
    "campaign-workspace--fullscreen",
    toolbar ? "campaign-workspace--has-toolbar" : "",
  ].filter(Boolean).join(" ");

  return (
    <PageSubshell
      titleKey={titleKey}
      description={description}
      variant={variant === "immersive" ? "standard" : variant}
      className={className}
      contentClassName="workspace-content campaign-workspace__content"
      tabs={tabs}
      actions={actions}
      toolbar={toolbar}
    >
      {children}
    </PageSubshell>
  );
}
