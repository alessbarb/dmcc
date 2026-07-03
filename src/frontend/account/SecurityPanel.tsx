import { useEffect, useState } from "react";
import {
  changePassword,
  fetchSessions,
  regenerateRecoveryCodes,
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesSaved, setCodesSaved] = useState(false);

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

      <div className="account-security-grid">
        <form className="account-panel-card" onSubmit={(event) => {
          event.preventDefault();
          void changePassword({ currentPassword, newPassword }).then(() => {
            setStatus(t("account.security.passwordChangedMsg"));
            window.location.assign("/login");
          }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to change password"));
        }}>
          <h3>{t("account.security.changePasswordTitle")}</h3>
          <label>
            {t("account.security.currentPassword")}
            <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label>
            {t("account.security.newPassword")}
            <input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
          <div className="account-form-actions">
            <button type="submit">{t("account.security.changePasswordBtn")}</button>
          </div>
        </form>

        <form className="account-panel-card" onSubmit={(event) => {
          event.preventDefault();
          void regenerateRecoveryCodes(recoveryPassword).then((codes) => {
            setRecoveryCodes(codes);
            setCodesSaved(false);
            setStatus(t("account.security.codesGeneratedMsg"));
          }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to regenerate recovery codes"));
        }}>
          <h3>{t("account.security.recoveryCodesTitle")}</h3>
          <label>
            {t("account.security.currentPassword")}
            <input type="password" autoComplete="current-password" required value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} />
          </label>
          <div className="account-form-actions">
            <button type="submit">{t("account.security.generateCodesBtn")}</button>
          </div>
          {recoveryCodes.length ? (
            <div role="region" aria-label="New recovery codes" className="account-recovery-codes">
              <ul>{recoveryCodes.map((code) => <li key={code}><code>{code}</code></li>)}</ul>
              <label className="account-checkbox">
                <input type="checkbox" checked={codesSaved} onChange={(event) => setCodesSaved(event.target.checked)} />
                {t("account.security.codesSavedLabel")}
              </label>
              <button type="button" disabled={!codesSaved} onClick={() => setRecoveryCodes([])}>{t("account.security.hideCodesBtn")}</button>
            </div>
          ) : null}
        </form>
      </div>

      <div className="account-panel-card">
        <div className="account-form-actions split">
          <button
            type="button"
            onClick={() => void revokeOtherSessions().then(() => {
              setStatus(t("account.security.otherSessionsRevokedMsg"));
              return reload();
            })}
          >
            {t("account.security.signOutOtherBtn")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!window.confirm(t("account.security.confirmSignOutAll"))) return;
              void revokeAllSessions().then(() => window.location.assign("/login"));
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
                  onClick={() => void revokeSession(session.sessionRef).then(reload)}
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
