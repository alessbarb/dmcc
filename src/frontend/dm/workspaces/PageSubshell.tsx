import React from "react";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs.js";
import { WorkspaceFullscreenButton } from "../../shared/components/WorkspaceFullscreenButton.js";
import { useWorkspaceFullscreen } from "../../shared/hooks/useWorkspaceFullscreen.js";
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
  showFullscreenButton?: boolean;
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

/** Shared page-level boundary for title, navigation, actions and workspace fullscreen. */
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
  showFullscreenButton = true,
}: PageSubshellProps) {
  const { t } = useTranslation();
  const { workspaceRef, isFullscreen, toggleFullscreen } = useWorkspaceFullscreen<HTMLElement>();
  const rootClassName = ["workspace-shell", "page-subshell", `page-subshell--${variant}`, className].filter(Boolean).join(" ");
  const contentClasses = ["workspace-shell__content", contentClassName].filter(Boolean).join(" ");

  return (
    <section
      ref={workspaceRef}
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
      {(tabs && tabs.length > 1) || actions || showFullscreenButton ? (
        <div className="workspace-shell__navigation">
          {tabs && tabs.length > 1 && <WorkspaceTabs tabs={tabs} />}
          <div className="workspace-shell__navigation-actions">
            {actions}
            {showFullscreenButton && (
              <WorkspaceFullscreenButton
                isFullscreen={isFullscreen}
                onToggle={() => void toggleFullscreen()}
              />
            )}
          </div>
        </div>
      ) : null}
      {toolbar && <div className="workspace-shell__toolbar">{toolbar}</div>}
      <div className={contentClasses}>{children}</div>
    </section>
  );
}
