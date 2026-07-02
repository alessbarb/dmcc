import { useEffect, useState } from "react";
import {
  deletePersonalAccount,
  downloadPersonalExport,
  fetchDeletionImpact,
  type DeletionBlocker,
} from "./accountClient.js";

export function DataLifecyclePanel({ confirmationLabel }: { confirmationLabel: string }) {
  const [blockers, setBlockers] = useState<DeletionBlocker[]>([]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void fetchDeletionImpact().then(setBlockers).catch(() => setStatus("Unable to analyze deletion"));
  }, []);

  const download = async () => {
    const blob = await downloadPersonalExport();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dmcc-personal-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="data-title">
      <h2 id="data-title">Your data</h2>
      <button type="button" onClick={() => void download()}>Download personal data</button>
      <div className="account-danger-zone">
        <h3>Delete account</h3>
        {blockers.length ? (
          <ul>{blockers.map((blocker) => (
            <li key={blocker.campaignId}>
              Transfer DM responsibility for campaign {blocker.campaignId} first.
            </li>
          ))}</ul>
        ) : null}
        <label>
          Current password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label>
          Type {confirmationLabel} to confirm
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </label>
        <button
          type="button"
          disabled={blockers.length > 0 || confirmation !== confirmationLabel || !password}
          onClick={() => void deletePersonalAccount({
            currentPassword: password,
            confirmation,
          }).then(() => setStatus("Account deleted"))}
        >
          Permanently delete account
        </button>
      </div>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
