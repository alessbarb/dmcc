import { useState } from "react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState, SessionPrep } from "../sessionTypes.js";
import { runSessionAction } from "../sessionFormSubmit.js";
import { splitLines, joinLines, uniqueIds, isPrepState, mergeChecklist } from "../prep/sessionPrepUtils.js";
import { EntityMultiPicker } from "./EntityMultiPicker.js";

export function SessionPrepEditor({
  session,
  campaignState,
  onSave,
  onCancel,
}: {
  session: Session;
  campaignState: MaybeCampaignState;
  onSave: (title: string, prep: SessionPrep, scheduledAt?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const prep: SessionPrep = session.prep ?? { state: "draft" };
  const [title, setTitle] = useState(session.title ?? "");
  const [scheduledAt, setScheduledAt] = useState(session.scheduledAt ? String(session.scheduledAt).slice(0, 16) : "");
  const [state, setState] = useState<"draft" | "ready">(prep.state ?? "draft");
  const [summary, setSummary] = useState(prep.summary ?? "");
  const [openingPrompt, setOpeningPrompt] = useState(prep.openingPrompt ?? "");
  const [goalsText, setGoalsText] = useState(joinLines(prep.goals));
  const [notes, setNotes] = useState(prep.notes ?? "");
  const [checklistText, setChecklistText] = useState(joinLines((prep.checklist ?? []).map((item) => item.label)));
  const [sceneIds, setSceneIds] = useState<string[]>(prep.sceneIds ?? []);
  const [involvedEntityIds, setInvolvedEntityIds] = useState<string[]>(prep.involvedEntityIds ?? []);
  const [availableClueIds, setAvailableClueIds] = useState<string[]>(prep.availableClueIds ?? []);
  const [secretsAtRiskIds, setSecretsAtRiskIds] = useState<string[]>(prep.secretsAtRiskIds ?? []);
  const [expectedConsequenceIds, setExpectedConsequenceIds] = useState<string[]>(prep.expectedConsequenceIds ?? []);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSave(title.trim(), {
        state,
        summary: summary.trim() || undefined,
        openingPrompt: openingPrompt.trim() || undefined,
        goals: splitLines(goalsText),
        sceneIds: uniqueIds(sceneIds),
        involvedEntityIds: uniqueIds(involvedEntityIds),
        availableClueIds: uniqueIds(availableClueIds),
        secretsAtRiskIds: uniqueIds(secretsAtRiskIds),
        expectedConsequenceIds: uniqueIds(expectedConsequenceIds),
        checklist: mergeChecklist(prep.checklist, splitLines(checklistText)),
        notes: notes.trim() || undefined,
      }, scheduledAt ? new Date(scheduledAt).toISOString() : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        runSessionAction(handleSubmit(event), "No se pudo guardar la preparación de sesión.");
      }}
      className="card"
      style={{ marginTop: "10px", padding: "18px", borderLeft: "3px solid var(--primary)" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
        <div className="form-group">
          <label className="form-label" htmlFor={`prep-title-${session.sessionId}`}>{t("sessionPage.sessionTitleLabel")}</label>
          <input id={`prep-title-${session.sessionId}`} className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`prep-date-${session.sessionId}`}>{t("sessionPage.scheduledAtLabel")}</label>
          <input id={`prep-date-${session.sessionId}`} className="form-input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`prep-state-${session.sessionId}`}>{t("sessionPage.prepStateLabel")}</label>
          <select id={`prep-state-${session.sessionId}`} className="form-select" value={state} onChange={(e) => { if (isPrepState(e.target.value)) setState(e.target.value); }}>
            <option value="draft">{t("sessionPage.prepDraft")}</option>
            <option value="ready">{t("sessionPage.readyToPlay")}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`prep-summary-${session.sessionId}`}>{t("common.summary")}</label>
        <textarea id={`prep-summary-${session.sessionId}`} className="form-textarea" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("sessionPage.prepSummaryPlaceholder")} style={{ minHeight: "70px" }} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`prep-opening-${session.sessionId}`}>{t("sessionPage.openingPromptLabel")}</label>
        <textarea id={`prep-opening-${session.sessionId}`} className="form-textarea" value={openingPrompt} onChange={(e) => setOpeningPrompt(e.target.value)} placeholder={t("sessionPage.openingPromptPlaceholder")} style={{ minHeight: "80px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="form-group">
          <label className="form-label" htmlFor={`prep-goals-${session.sessionId}`}>{t("sessionPage.goalsLabel")}</label>
          <textarea id={`prep-goals-${session.sessionId}`} className="form-textarea" value={goalsText} onChange={(e) => setGoalsText(e.target.value)} placeholder={t("sessionPage.onePerLinePlaceholder")} style={{ minHeight: "110px" }} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`prep-checklist-${session.sessionId}`}>{t("sessionPage.checklistLabel")}</label>
          <textarea id={`prep-checklist-${session.sessionId}`} className="form-textarea" value={checklistText} onChange={(e) => setChecklistText(e.target.value)} placeholder={t("sessionPage.onePerLinePlaceholder")} style={{ minHeight: "110px" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <EntityMultiPicker label={t("sessionPage.prepScenesLabel")} campaignState={campaignState} ids={sceneIds} onChange={setSceneIds} typeFilter="scene" />
        <EntityMultiPicker label={t("sessionPage.prepCluesLabel")} campaignState={campaignState} ids={availableClueIds} onChange={setAvailableClueIds} typeFilter="clue" />
        <EntityMultiPicker label={t("sessionPage.prepSecretsLabel")} campaignState={campaignState} ids={secretsAtRiskIds} onChange={setSecretsAtRiskIds} typeFilter="secret" />
        <EntityMultiPicker label={t("sessionPage.prepConsequencesLabel")} campaignState={campaignState} ids={expectedConsequenceIds} onChange={setExpectedConsequenceIds} typeFilter={["consequence", "front"]} />
      </div>

      <EntityMultiPicker label={t("sessionPage.prepInvolvedLabel")} help={t("sessionPage.prepInvolvedHelp")} campaignState={campaignState} ids={involvedEntityIds} onChange={setInvolvedEntityIds} />

      <div className="form-group">
        <label className="form-label" htmlFor={`prep-notes-${session.sessionId}`}>{t("sessionPage.privatePrepNotesLabel")}</label>
        <textarea id={`prep-notes-${session.sessionId}`} className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("sessionPage.privatePrepNotesPlaceholder")} style={{ minHeight: "90px" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>{busy ? t("common.saving") : t("common.saveChanges")}</button>
      </div>
    </form>
  );
}
