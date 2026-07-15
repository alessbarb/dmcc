import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, FileText, Layers, User, X, BookOpen, GitBranch, Milestone } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { campaignResourceLocation } from "../../shared/resources/resourceNavigation.js";
import { useCampaignShortcuts } from "./useCampaignShortcuts.js";
import type { ShortcutTargetType } from "@core/domain/resource/resourceType.js";

const TARGET_ICON: Record<ShortcutTargetType, React.ComponentType<{ size?: number }>> = {
  entity: User,
  session: FileText,
  canvas: Layers,
  notebook: BookOpen,
  story_thread: GitBranch,
  story_step: Milestone,
};

export interface ShortcutsPanelProps {
  campaignId: string;
  collapsed?: boolean;
  emptyHint?: string;
}

export function ShortcutsPanel({ campaignId, collapsed = false, emptyHint }: ShortcutsPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shortcuts, removeShortcut } = useCampaignShortcuts(campaignId);

  if (shortcuts.length === 0) {
    if (collapsed) return null;
    return (
      <div className="shortcuts-panel shortcuts-panel--empty">
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
          {emptyHint ?? t("shortcuts.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="shortcuts-panel">
      {!collapsed && (
        <p className="sidebar-nav__section-label" style={{ margin: "0 0 6px" }}>
          {t("shortcuts.title")}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {shortcuts.map((shortcut) => {
          const Icon = TARGET_ICON[shortcut.targetType] ?? Bookmark;
          const location = campaignResourceLocation(campaignId, { type: shortcut.targetType, resourceId: shortcut.targetId });
          const title = shortcut.resource?.title ?? shortcut.targetId;
          const archived = shortcut.resource?.archived ?? false;

          return (
            <div
              key={shortcut.shortcutId}
              className="shortcuts-panel__item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 6,
                cursor: location ? "pointer" : "default",
                opacity: archived ? 0.6 : 1,
              }}
              onClick={() => {
                if (!location) return;
                void navigate({ to: location.pathname, search: location.search });
              }}
              title={archived ? t("shortcuts.archivedHint") : title}
            >
              <Icon size={14} />
              {!collapsed && (
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.82rem",
                  }}
                >
                  {title}
                  {archived && ` (${t("shortcuts.archivedBadge")})`}
                </span>
              )}
              {!collapsed && (
                <button
                  type="button"
                  aria-label={t("shortcuts.remove")}
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeShortcut(shortcut.shortcutId).catch((error: unknown) => {
                      console.error("Could not remove campaign shortcut", error);
                    });
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
