import { useEffect, useMemo, useState } from "react";
import type { AccountPreferences } from "./accountTypes.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { isDirty } from "./accountState.js";

// Object.keys always returns string[]; TS has no way to prove the keys of a
// concrete object literal type without an unsafe assertion here.
function objectKeys<T extends object>(obj: T): Array<keyof T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return Object.keys(obj) as Array<keyof T>;
}

export function NotificationsPanel({
  preferences,
  memberships,
  onSave,
}: {
  preferences: AccountPreferences;
  memberships: Array<{ campaignId: string; role: string; campaignTitle?: string; revokedAt?: string }>;
  onSave(value: AccountPreferences): Promise<void>;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(preferences);
  const [status, setStatus] = useState("");

  const isFormDirty = isDirty(preferences, draft);

  useEffect(() => {
    window.__accountCenterDirty = isFormDirty;
    return () => {
      window.__accountCenterDirty = false;
    };
  }, [isFormDirty]);

  const campaignOverrides = useMemo(
    () => memberships.filter((membership) => !membership.revokedAt && Boolean(draft.campaignNotifications[membership.campaignId])),
    [draft.campaignNotifications, memberships]
  );

  return (
    <section aria-labelledby="notifications-title" className="account-section-stack">
      <div className="account-split-hero">
        <div className="account-helper-card">
          <h2 id="notifications-title">{t("account.notifications.title")}</h2>
          <p>Choose the campaign events worth interrupting you for.</p>
        </div>
        <div className="account-helper-card muted">
          <h3>Overrides in use</h3>
          <p>{campaignOverrides.length} campaign-specific override(s) currently configured.</p>
        </div>
      </div>

      <form
        className="account-panel-card"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("Saving...");
          void onSave(draft).then(() => {
            setStatus("Saved");
          }).catch((error) => {
            setStatus(error instanceof Error ? error.message : "Unable to save notifications");
          });
        }}
      >
        <div className="account-checkbox-stack">
          {objectKeys(draft.notifications).map((key) => (
            <label className="account-checkbox-card" key={key}>
              <div>
                <strong>{t(`account.notifications.keys.${key}`)}</strong>
              </div>
              <input
                type="checkbox"
                checked={draft.notifications[key]}
                onChange={(event) => setDraft({
                  ...draft,
                  notifications: { ...draft.notifications, [key]: event.target.checked },
                })}
              />
            </label>
          ))}
        </div>

        <div className="account-subsection">
          <h3>{t("account.notifications.exceptions")}</h3>
          <p>{t("account.notifications.exceptionsDesc")}</p>
          {campaignOverrides.length ? (
            <ul className="account-mini-list surfaced">
              {campaignOverrides.map((membership) => (
                <li key={membership.campaignId}>
                  <span>{membership.campaignTitle || membership.campaignId}</span>
                  <strong>{Object.keys(draft.campaignNotifications[membership.campaignId] ?? {}).length} rules</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="account-form-actions">
          <button type="submit">Save notifications</button>
        </div>
        <p aria-live="polite">{status}</p>
      </form>
    </section>
  );
}
