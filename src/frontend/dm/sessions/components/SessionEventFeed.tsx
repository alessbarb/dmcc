import { useState } from "react";
import {
  StickyNote,
  UserPlus,
  Eye,
  GitMerge,
  Zap,
  ChevronRight,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { SessionEvent, SessionEventType } from "@core/domain/session/types.js";
import { formatRelative } from "../sessionTimeFormat.js";

const EVENT_TYPE_ICONS: Partial<Record<SessionEventType, React.ReactNode>> = {
  note_recorded: <StickyNote size={13} />,
  npc_met: <UserPlus size={13} />,
  clue_revealed: <Eye size={13} />,
  decision_made: <GitMerge size={13} />,
  consequence_created: <Zap size={13} />,
  custom: <ChevronRight size={13} />,
};

const EVENT_TYPE_COLORS: Partial<Record<SessionEventType, string>> = {
  note_recorded: "var(--color-info)",
  npc_met: "var(--color-success)",
  clue_revealed: "var(--secondary)",
  decision_made: "var(--primary)",
  consequence_created: "var(--color-warning)",
  custom: "var(--text-muted)",
};

export function SessionEventFeed({
  sessionEvents,
  sessionId,
}: {
  sessionEvents: SessionEvent[];
  sessionId: string;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const events = sessionEvents
    .filter((ev) => ev.sessionId === sessionId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 20);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <Clock size={13} />
          {t("session.eventFeedTitle")}
          {events.length > 0 && (
            <span
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "var(--radius-full)",
                padding: "1px 7px",
                fontSize: "0.72rem",
                fontWeight: "800",
              }}
            >
              {events.length}
            </span>
          )}
        </span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div style={{ borderTop: "1px solid var(--border-color)" }}>
          {events.length === 0 ? (
            <p
              style={{
                padding: "20px 16px",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {t("session.noEventsYet")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {events.map((ev, i: number) => {
                const color = EVENT_TYPE_COLORS[ev.type] ?? EVENT_TYPE_COLORS.custom;
                const icon = EVENT_TYPE_ICONS[ev.type] ?? EVENT_TYPE_ICONS.custom;
                return (
                  <li
                    key={ev.id ?? i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "9px 16px",
                      borderBottom: i < events.length - 1 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <span
                      style={{
                        color,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.85rem",
                        color: "var(--text-main)",
                        lineHeight: 1.35,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={ev.title}
                    >
                      {ev.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.73rem",
                        color: "var(--text-muted)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      {ev.occurredAt ? formatRelative(ev.occurredAt, t) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
