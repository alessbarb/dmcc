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
import "./session-event-feed.css";

const EVENT_TYPE_ICONS: Partial<Record<SessionEventType, React.ReactNode>> = {
  note_recorded: <StickyNote size={13} />,
  npc_met: <UserPlus size={13} />,
  clue_revealed: <Eye size={13} />,
  decision_made: <GitMerge size={13} />,
  consequence_created: <Zap size={13} />,
  custom: <ChevronRight size={13} />,
};

const EVENT_TYPE_CLASSES: Partial<Record<SessionEventType, string>> = {
  note_recorded: "session-event-feed__icon--info",
  npc_met: "session-event-feed__icon--success",
  clue_revealed: "session-event-feed__icon--secondary",
  decision_made: "session-event-feed__icon--primary",
  consequence_created: "session-event-feed__icon--warning",
  custom: "session-event-feed__icon--muted",
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
    .filter((event) => event.sessionId === sessionId)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 20);

  return (
    <section className="session-event-feed">
      <button
        type="button"
        className="session-event-feed__toggle"
        onClick={() => setCollapsed((current) => !current)}
        aria-expanded={!collapsed}
      >
        <span className="session-event-feed__heading">
          <Clock size={13} />
          {t("session.eventFeedTitle")}
          {events.length > 0 && (
            <span className="session-event-feed__count">{events.length}</span>
          )}
        </span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div className="session-event-feed__body">
          {events.length === 0 ? (
            <p className="session-event-feed__empty">{t("session.noEventsYet")}</p>
          ) : (
            <ul className="session-event-feed__list">
              {events.map((event, index) => {
                const iconClass = EVENT_TYPE_CLASSES[event.type] ?? EVENT_TYPE_CLASSES.custom;
                const icon = EVENT_TYPE_ICONS[event.type] ?? EVENT_TYPE_ICONS.custom;
                return (
                  <li className="session-event-feed__item" key={event.id ?? index}>
                    <span
                      className={`session-event-feed__icon ${iconClass ?? ""}`}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span className="session-event-feed__title" title={event.title}>
                      {event.title}
                    </span>
                    <time className="session-event-feed__time" dateTime={event.occurredAt}>
                      {event.occurredAt ? formatRelative(event.occurredAt, t) : ""}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
