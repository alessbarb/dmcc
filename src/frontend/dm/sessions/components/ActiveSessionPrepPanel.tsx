import { useState } from "react";
import { CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { PrepLinkedList } from "./PrepLinkedList.js";

export function ActiveSessionPrepPanel({ session, campaignState }: { session: Session; campaignState: MaybeCampaignState }) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const prep = session.prep;
  if (!prep) return null;
  const hasContent = Boolean(
    prep.summary ||
    prep.openingPrompt ||
    prep.notes ||
    (prep.goals?.length ?? 0) > 0 ||
    (prep.checklist?.length ?? 0) > 0 ||
    (prep.sceneIds?.length ?? 0) > 0 ||
    (prep.involvedEntityIds?.length ?? 0) > 0 ||
    (prep.availableClueIds?.length ?? 0) > 0 ||
    (prep.secretsAtRiskIds?.length ?? 0) > 0 ||
    (prep.expectedConsequenceIds?.length ?? 0) > 0
  );
  if (!hasContent) return null;

  return (
    <section className="card" style={{ padding: "0", overflow: "hidden", borderLeft: "3px solid var(--theme-accents-primary-foreground)" }}>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          background: "transparent",
          border: "none",
          color: "var(--theme-text-primary)",
          padding: "14px 18px",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
          <CheckSquare size={16} style={{ color: "var(--theme-accents-primary-foreground)" }} />
          {t("sessionPage.activePrepPanelTitle")}
          <span className="badge" style={{ fontSize: "0.7rem" }}>{prep.state === "ready" ? t("sessionPage.readyToPlay") : t("sessionPage.prepDraft")}</span>
        </span>
        {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>
      {!collapsed && (
        <div style={{ borderTop: "1px solid var(--theme-borders-default)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {prep.openingPrompt && (
            <div style={{ padding: "12px", borderRadius: "var(--theme-shapes-radius-medium)", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-secondary)", marginBottom: "6px" }}>{t("sessionPage.openingPromptLabel")}</div>
              <p style={{ whiteSpace: "pre-line", fontSize: "0.9rem", lineHeight: 1.45 }}>{prep.openingPrompt}</p>
            </div>
          )}
          {prep.summary && <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", lineHeight: 1.45 }}>{prep.summary}</p>}
          {(prep.goals?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-secondary)", marginBottom: "6px" }}>{t("sessionPage.goalsLabel")}</div>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--theme-text-primary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                {(prep.goals ?? []).map((goal: string, index: number) => <li key={`${goal}-${index}`}>{goal}</li>)}
              </ul>
            </div>
          )}
          {(prep.checklist?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-secondary)", marginBottom: "6px" }}>{t("sessionPage.checklistLabel")}</div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {(prep.checklist ?? []).map((item) => (
                  <li key={item.id ?? item.label} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.9rem" }}>
                    <span aria-hidden="true">{item.done ? "☑" : "☐"}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
            <PrepLinkedList title={t("sessionPage.prepScenesLabel")} ids={prep.sceneIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepCluesLabel")} ids={prep.availableClueIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepSecretsLabel")} ids={prep.secretsAtRiskIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepConsequencesLabel")} ids={prep.expectedConsequenceIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepInvolvedLabel")} ids={prep.involvedEntityIds} campaignState={campaignState} />
          </div>
          {prep.notes && (
            <div style={{ paddingTop: "12px", borderTop: "1px solid var(--theme-borders-default)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--theme-text-secondary)", marginBottom: "6px" }}>{t("sessionPage.privatePrepNotesLabel")}</div>
              <p style={{ whiteSpace: "pre-line", fontSize: "0.86rem", color: "var(--theme-text-secondary)", lineHeight: 1.45 }}>{prep.notes}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
