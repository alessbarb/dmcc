import { useEffect, useState } from "react";
import {
  fetchSessions,
  revokeOtherSessions,
  revokeSession,
  type AccountSession,
} from "./accountClient.js";

export function SecurityPanel() {
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [status, setStatus] = useState("");

  const reload = () => fetchSessions().then(setSessions).catch((error) => {
    setStatus(error instanceof Error ? error.message : "Unable to load sessions");
  });

  useEffect(() => { void reload(); }, []);

  return (
    <section aria-labelledby="security-title">
      <h2 id="security-title">Security and sessions</h2>
      <p>Passwords and recovery codes are managed securely for this local vault.</p>
      <button
        type="button"
        onClick={() => void revokeOtherSessions().then(() => {
          setStatus("Other sessions revoked");
          return reload();
        })}
      >
        Sign out other devices
      </button>
      <ul className="account-session-list">
        {sessions.map((session) => (
          <li key={session.sessionRef}>
            <span>
              {session.current ? "Current session" : "Session"} · last used{" "}
              <time dateTime={session.lastSeenAt}>{new Date(session.lastSeenAt).toLocaleString()}</time>
            </span>
            {!session.current ? (
              <button
                type="button"
                onClick={() => void revokeSession(session.sessionRef).then(reload)}
              >
                Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
