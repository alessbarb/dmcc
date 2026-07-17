import { useState } from "react";
import { CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { PrepLinkedList } from "./PrepLinkedList.js";
import "./active-session-prep.css";

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
    <section className="card active-session-prep">
      <button
        type="button"
        className="active-session-prep__toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
      >
        <span className="active-session-prep__heading">
          <CheckSquare className="active-session-prep__icon" size={16} />
          {t("sessionPage.activePrepPanelTitle")}
          <span className="badge active-session-prep__state">{prep.state === "ready" ? t("sessionPage.readyToPlay") : t("sessionPage.prepDraft")}</span>
        </span>
        {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>
      {!collapsed && (
        <div className="active-session-prep__body">
          {prep.openingPrompt && (
            <section className="active-session-prep__opening">
              <h4 className="active-session-prep__section-title">{t("sessionPage.openingPromptLabel")}</h4>
              <p className="active-session-prep__preformatted">{prep.openingPrompt}</p>
            </section>
          )}
          {prep.summary && <p className="active-session-prep__summary">{prep.summary}</p>}
          {(prep.goals?.length ?? 0) > 0 && (
            <section>
              <h4 className="active-session-prep__section-title">{t("sessionPage.goalsLabel")}</h4>
              <ul className="active-session-prep__goals">
                {(prep.goals ?? []).map((goal: string, index: number) => <li key={`${goal}-${index}`}>{goal}</li>)}
              </ul>
            </section>
          )}
          {(prep.checklist?.length ?? 0) > 0 && (
            <section>
              <h4 className="active-session-prep__section-title">{t("sessionPage.checklistLabel")}</h4>
              <ul className="active-session-prep__checklist">
                {(prep.checklist ?? []).map((item) => (
                  <li key={item.id ?? item.label} className="active-session-prep__checklist-item">
                    <span aria-hidden="true">{item.done ? "☑" : "☐"}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="active-session-prep__linked-grid">
            <PrepLinkedList title={t("sessionPage.prepScenesLabel")} ids={prep.sceneIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepCluesLabel")} ids={prep.availableClueIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepSecretsLabel")} ids={prep.secretsAtRiskIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepConsequencesLabel")} ids={prep.expectedConsequenceIds} campaignState={campaignState} />
            <PrepLinkedList title={t("sessionPage.prepInvolvedLabel")} ids={prep.involvedEntityIds} campaignState={campaignState} />
          </div>
          {prep.notes && (
            <section className="active-session-prep__notes">
              <h4 className="active-session-prep__section-title">{t("sessionPage.privatePrepNotesLabel")}</h4>
              <p className="active-session-prep__preformatted active-session-prep__notes-copy">{prep.notes}</p>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
