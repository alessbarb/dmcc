import React from "react";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

export interface PageSubshellProps {
  titleKey?: string;
  description?: string;
  variant?: PageSubshellVariant;
  tabs?: WorkspaceTab[];
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export type PageSubshellVariant =
  | "standard"
  | "operational"
  | "library"
  | "canvas"
  | "narrative"
  | "settings"
  | "content"
  | "master-detail";

/** Shared page-level boundary for title, navigation, and actions. */
export function PageSubshell({
  titleKey,
  description,
  variant = "standard",
  tabs,
  actions,
  toolbar,
  children,
  className = "",
  contentClassName = "",
}: PageSubshellProps) {
  const { t } = useTranslation();
  const rootClassName = ["workspace-shell", "page-subshell", `page-subshell--${variant}`, className].filter(Boolean).join(" ");
  const contentClasses = ["workspace-shell__content", contentClassName].filter(Boolean).join(" ");

  return (
    <section
      className={rootClassName}
      data-subshell-variant={variant}
      aria-labelledby={titleKey ? "workspace-page-title" : undefined}
    >
      {titleKey && (
        <header className="workspace-shell__heading">
          <h1 id="workspace-page-title" className="workspace-shell__title">{t(titleKey)}</h1>
          {description && <p className="workspace-shell__description">{description}</p>}
        </header>
      )}
      {(tabs && tabs.length > 1) || actions ? (
        <div className="workspace-shell__navigation">
          {tabs && tabs.length > 1 && <WorkspaceTabs tabs={tabs} />}
          {actions && <div className="workspace-shell__navigation-actions">{actions}</div>}
        </div>
      ) : null}
      {toolbar && <div className="workspace-shell__toolbar">{toolbar}</div>}
      <div className={contentClasses}>{children}</div>
    </section>
  );
}
