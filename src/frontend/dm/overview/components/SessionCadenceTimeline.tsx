export interface SessionCadenceItem {
  sessionId: string;
  title: string;
  status: string;
  playedDate?: string | null;
  plannedDate?: string | null;
}

interface SessionCadenceTimelineProps {
  sessions: Array<SessionCadenceItem | null>;
  emptyMessage: string;
}

export function SessionCadenceTimeline({ sessions, emptyMessage }: SessionCadenceTimelineProps) {
  const visible = sessions.filter((session): session is SessionCadenceItem => Boolean(session));
  return (
    <ol className="dashboard-session-timeline">
      {visible.length === 0 ? <li className="dashboard-empty-message">{emptyMessage}</li> : visible.map((session) => (
        <li key={session.sessionId} className={`dashboard-session-timeline__item dashboard-session-timeline__item--${session.status}`}>
          <span className="dashboard-session-timeline__dot" aria-hidden="true" />
          <span><strong>{session.title}</strong><small>{session.playedDate ?? session.plannedDate ?? session.status}</small></span>
        </li>
      ))}
    </ol>
  );
}
