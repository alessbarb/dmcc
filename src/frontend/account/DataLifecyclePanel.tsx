import { useEffect, useState } from "react";
import {
  deletePersonalAccount,
  downloadPersonalExport,
  fetchDeletionImpact,
  type DeletionBlocker,
} from "./accountClient.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";

export function DataLifecyclePanel({ confirmationLabel }: { confirmationLabel: string }) {
  const { t } = useTranslation();
  const [blockers, setBlockers] = useState<DeletionBlocker[]>([]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void fetchDeletionImpact().then(setBlockers).catch(() => setStatus(t("account.data.analyzeError")));
  }, [t]);

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
    <section aria-labelledby="data-title" className="account-section-stack">
      <div className="account-panel-card">
        <h2 id="data-title">{t("account.data.title")}</h2>
        <p>Export your account data before making irreversible decisions.</p>
        <div className="account-form-actions">
          <button type="button" onClick={() => void download()}>{t("account.data.downloadBtn")}</button>
        </div>
      </div>

      <div className="account-danger-zone">
        <h3>{t("account.data.deleteTitle")}</h3>
        <p>This permanently removes your unified account from this workspace.</p>
        {blockers.length ? (
          <ul className="account-bullet-list danger">
            {blockers.map((blocker) => (
              <li key={blocker.campaignId}>
                {t("account.data.transferDmWarning", { campaignId: blocker.campaignId })}
              </li>
            ))}
          </ul>
        ) : null}
        <label>
          {t("account.data.currentPassword")}
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label>
          {t("account.data.confirmPlaceholder", { confirmationLabel })}
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </label>
        <div className="account-form-actions">
          <button
            type="button"
            disabled={blockers.length > 0 || confirmation !== confirmationLabel || !password}
            onClick={() => void deletePersonalAccount({
              currentPassword: password,
              confirmation,
            }).then(() => setStatus(t("account.data.accountDeletedMsg")))}
          >
            {t("account.data.deleteBtn")}
          </button>
        </div>
      </div>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
