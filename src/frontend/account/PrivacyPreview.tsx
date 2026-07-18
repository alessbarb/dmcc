import { useMemo, useState } from "react";
import { useTranslation } from "../shared/i18n/useTranslation.js";

const AUDIENCES = ["owner", "dm", "table", "global"] as const;

type AudienceKey = typeof AUDIENCES[number];

type PreviewValue = Record<string, unknown> | null;

function isAudienceKey(value: string): value is AudienceKey {
  return (AUDIENCES as readonly string[]).includes(value);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function PrivacyPreview({
  previews,
}: {
  previews: Record<AudienceKey, PreviewValue>;
}) {
  const { t } = useTranslation();
  const [audience, setAudience] = useState<AudienceKey>("owner");

  const entries = useMemo(() => Object.entries(previews[audience] ?? {}), [audience, previews]);

  return (
    <section aria-labelledby="privacy-title" className="account-section-stack">
      <div className="account-split-hero">
        <div className="account-helper-card">
          <h2 id="privacy-title">{t("account.privacy.title")}</h2>
          <p>Inspect the actual surface area of your profile instead of raw visibility rules.</p>
        </div>
        <label className="account-inline-field">
          {t("account.privacy.viewAs")}
          <select
            value={audience}
            onChange={(event) => {
              const value = event.target.value;
              if (isAudienceKey(value)) {
                setAudience(value);
              }
            }}
          >
            <option value="owner">{t("account.privacy.audiences.owner")}</option>
            <option value="dm">{t("account.privacy.audiences.dm")}</option>
            <option value="table">{t("account.privacy.audiences.table")}</option>
            <option value="global">{t("account.privacy.audiences.global")}</option>
          </select>
        </label>
      </div>

      <div className="account-audience-tabs" role="tablist" aria-label="Privacy audiences">
        {AUDIENCES.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={audience === key}
            className={audience === key ? "is-active" : undefined}
            onClick={() => setAudience(key)}
          >
            {t(`account.privacy.audiences.${key}`)}
          </button>
        ))}
      </div>

      <div className="account-panel-card">
        {entries.length ? (
          <dl className="account-preview-grid">
            {entries.map(([key, value]) => (
              <div key={key} className="account-preview-item">
                <dt>{key}</dt>
                <dd>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="account-empty-state compact">
            <p>No visible fields for this audience yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
