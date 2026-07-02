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

export function SecurityPanel() {
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
    <section aria-labelledby="security-title">
      <h2 id="security-title">Security and sessions</h2>
      <p>Passwords and recovery codes are managed securely for this local vault.</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        void changePassword({ currentPassword, newPassword }).then(() => {
          setStatus("Password changed. Sign in again on every device.");
          window.location.assign("/login");
        }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to change password"));
      }}>
        <h3>Change password</h3>
        <label>
          Current password
          <input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </label>
        <label>
          New password
          <input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </label>
        <button type="submit">Change password</button>
      </form>
      <form onSubmit={(event) => {
        event.preventDefault();
        void regenerateRecoveryCodes(recoveryPassword).then((codes) => {
          setRecoveryCodes(codes);
          setCodesSaved(false);
          setStatus("New recovery codes generated. Previous codes no longer work.");
        }).catch((error) => setStatus(error instanceof Error ? error.message : "Unable to regenerate recovery codes"));
      }}>
        <h3>Recovery codes</h3>
        <label>
          Current password
          <input type="password" autoComplete="current-password" required value={recoveryPassword} onChange={(event) => setRecoveryPassword(event.target.value)} />
        </label>
        <button type="submit">Generate new recovery codes</button>
      </form>
      {recoveryCodes.length ? (
        <div role="region" aria-label="New recovery codes">
          <ul>{recoveryCodes.map((code) => <li key={code}><code>{code}</code></li>)}</ul>
          <label className="account-checkbox">
            <input type="checkbox" checked={codesSaved} onChange={(event) => setCodesSaved(event.target.checked)} />
            I have saved these recovery codes
          </label>
          <button type="button" disabled={!codesSaved} onClick={() => setRecoveryCodes([])}>Hide codes permanently</button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void revokeOtherSessions().then(() => {
          setStatus("Other sessions revoked");
          return reload();
        })}
      >
        Sign out other devices
      </button>
      <button
        type="button"
        onClick={() => {
          if (!window.confirm("Sign out every session, including this device?")) return;
          void revokeAllSessions().then(() => window.location.assign("/login"));
        }}
      >
        Sign out everywhere
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
