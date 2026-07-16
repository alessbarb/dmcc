import { useEffect, useState } from "react";
import {
  fetchSessions,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSession,
  type AccountSession,
} from "./accountClient.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";

export function SecurityPanel() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [status, setStatus] = useState("");

  const reload = () => fetchSessions().then(setSessions).catch((error) => {
    setStatus(error instanceof Error ? error.message : "Unable to load sessions");
  });

  useEffect(() => { void reload(); }, []);

  return (
    <section aria-labelledby="security-title" className="account-section-stack">
      <div className="account-split-hero">
        <div className="account-helper-card">
          <h2 id="security-title">{t("account.security.title")}</h2>
          <p>{t("account.security.subtitle")}</p>
        </div>
        <div className="account-helper-card muted">
          <h3>Active sessions</h3>
          <p>{sessions.length} session(s) currently linked to this account.</p>
        </div>
      </div>

      <div className="account-panel-card">
        <div className="account-form-actions split">
          <button
            type="button"
            onClick={() => void revokeOtherSessions().then(() => {
              setStatus(t("account.security.otherSessionsRevokedMsg"));
              return reload();
            }).catch((error) => {
              setStatus(error instanceof Error ? error.message : "Unable to revoke other sessions");
            })}
          >
            {t("account.security.signOutOtherBtn")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!window.confirm(t("account.security.confirmSignOutAll"))) return;
              void revokeAllSessions()
                .then(() => window.location.assign("/auth/login"))
                .catch((error) => {
                  setStatus(error instanceof Error ? error.message : "Unable to revoke all sessions");
                });
            }}
          >
            {t("account.security.signOutAllBtn")}
          </button>
        </div>
        <ul className="account-session-list cards">
          {sessions.map((session) => (
            <li key={session.sessionRef} className={session.current ? "is-current" : undefined}>
              <div>
                <strong>{session.current ? t("account.security.currentSession") : t("account.security.sessionLabel")}</strong>
                <span>
                  {t("account.security.lastUsed")} <time dateTime={session.lastSeenAt}>{new Date(session.lastSeenAt).toLocaleString()}</time>
                </span>
              </div>
              {!session.current ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void revokeSession(session.sessionRef)
                    .then(reload)
                    .catch((error) => {
                      setStatus(error instanceof Error ? error.message : "Unable to revoke session");
                    })}
                >
                  {t("account.security.revokeBtn")}
                </button>
              ) : <span className="account-card-badge ready">Current device</span>}
            </li>
          ))}
        </ul>
      </div>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
