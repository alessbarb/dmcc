import { useState } from "react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import {
  generateSessionPlanGoalId,
  generateSessionPlanChecklistItemId,
  generateSessionPlanItemId,
  generateSessionPlanTransitionId,
  generateSessionPlanContentLinkId,
} from "@shared/ids.js";
import type {
  Session,
  SessionPlan,
  SessionPlanGoal,
  SessionPlanChecklistItem,
  SessionPlanContentRole,
} from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { runSessionAction } from "../sessionFormSubmit.js";
import { EntityMultiPicker } from "./EntityMultiPicker.js";
import "./session-forms.css";

function emptyPlan(): Omit<SessionPlan, "revision"> {
  return {
    version: 2,
    state: "draft",
    goals: [],
    checklist: [],
    flowItems: [],
    contentLinks: [],
    transitions: [],
    bindings: [],
  };
}

function contentLinkIdsForRole(plan: Omit<SessionPlan, "revision">, role: SessionPlanContentRole): string[] {
  return plan.contentLinks.filter((link) => link.role === role).map((link) => link.entityId);
}

export function SessionPlanEditor({
  session,
  campaignState,
  onSave,
  onCancel,
}: {
  session: Session;
  campaignState: MaybeCampaignState;
  onSave: (title: string, plan: Omit<SessionPlan, "revision">, scheduledAt?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const plan = session.plan ?? emptyPlan();

  const [title, setTitle] = useState(session.title ?? "");
  const [scheduledAt, setScheduledAt] = useState(session.scheduledAt ? String(session.scheduledAt).slice(0, 16) : "");
  const [state, setState] = useState<"draft" | "ready">(plan.state);
  const [summary, setSummary] = useState(plan.summary ?? "");
  const [openingPrompt, setOpeningPrompt] = useState(plan.openingPrompt ?? "");
  const [privateNotes, setPrivateNotes] = useState(plan.privateNotes ?? "");
  const [goals, setGoals] = useState<SessionPlanGoal[]>(plan.goals);
  const [checklist, setChecklist] = useState<SessionPlanChecklistItem[]>(plan.checklist);
  const [sceneIds, setSceneIds] = useState<string[]>(
    plan.flowItems.filter((item) => item.kind === "scene").map((item) => item.sceneEntityId),
  );
  const [availableClueIds, setAvailableClueIds] = useState<string[]>(contentLinkIdsForRole(plan, "available_clue"));
  const [secretsAtRiskIds, setSecretsAtRiskIds] = useState<string[]>(contentLinkIdsForRole(plan, "secret_at_risk"));
  const [expectedConsequenceIds, setExpectedConsequenceIds] = useState<string[]>(
    contentLinkIdsForRole(plan, "expected_consequence"),
  );
  const [involvedEntityIds, setInvolvedEntityIds] = useState<string[]>(contentLinkIdsForRole(plan, "involved_entity"));
  const [busy, setBusy] = useState(false);

  const addGoal = () => setGoals((prev) => [...prev, { id: generateSessionPlanGoalId(), text: "", completed: false, order: prev.length }]);
  const updateGoal = (id: string, patch: Partial<SessionPlanGoal>) =>
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
  const removeGoal = (id: string) => setGoals((prev) => prev.filter((goal) => goal.id !== id));

  const addChecklistItem = () =>
    setChecklist((prev) => [
      ...prev,
      { id: generateSessionPlanChecklistItemId(), text: "", checked: false, priority: "medium", order: prev.length },
    ]);
  const updateChecklistItem = (id: string, patch: Partial<SessionPlanChecklistItem>) =>
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const removeChecklistItem = (id: string) => setChecklist((prev) => prev.filter((item) => item.id !== id));

  const buildContentLinks = (): SessionPlan["contentLinks"] => {
    const groups: Array<{ ids: string[]; role: SessionPlanContentRole }> = [
      { ids: availableClueIds, role: "available_clue" },
      { ids: secretsAtRiskIds, role: "secret_at_risk" },
      { ids: expectedConsequenceIds, role: "expected_consequence" },
      { ids: involvedEntityIds, role: "involved_entity" },
    ];
    return groups.flatMap(({ ids, role }) =>
      ids.map((entityId, index) => ({
        id: generateSessionPlanContentLinkId(),
        entityId,
        role,
        order: index,
      })),
    );
  };

  const buildFlowItemsAndTransitions = () => {
    const flowItems = sceneIds.map((sceneEntityId, order) => ({
      id: generateSessionPlanItemId(),
      kind: "scene" as const,
      sceneEntityId,
      order,
    }));
    const transitions = [];
    for (let index = 0; index < flowItems.length - 1; index++) {
      transitions.push({
        id: generateSessionPlanTransitionId(),
        sourceItemId: flowItems[index]!.id,
        targetItemId: flowItems[index + 1]!.id,
        kind: "next" as const,
        order: index,
      });
    }
    return { flowItems, transitions };
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const { flowItems, transitions } = buildFlowItemsAndTransitions();
      await onSave(
        title.trim(),
        {
          version: 2,
          state,
          summary: summary.trim() || undefined,
          openingPrompt: openingPrompt.trim() || undefined,
          privateNotes: privateNotes.trim() || undefined,
          goals: goals.map((goal, order) => ({ ...goal, order })),
          checklist: checklist.map((item, order) => ({ ...item, order })),
          flowItems,
          transitions,
          contentLinks: buildContentLinks(),
          bindings: plan.bindings,
        },
        scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        runSessionAction(handleSubmit(event), t("sessionPlanEditor.saveError"));
      }}
      className="card session-prep-editor"
    >
      <div className="session-prep-editor__header-grid">
        <div className="form-group">
          <label className="form-label" htmlFor={`plan-title-${session.sessionId}`}>{t("sessionPage.sessionTitleLabel")}</label>
          <input id={`plan-title-${session.sessionId}`} className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`plan-date-${session.sessionId}`}>{t("sessionPage.scheduledAtLabel")}</label>
          <input id={`plan-date-${session.sessionId}`} className="form-input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`plan-state-${session.sessionId}`}>{t("sessionPage.prepStateLabel")}</label>
          <select
            id={`plan-state-${session.sessionId}`}
            className="form-select"
            value={state}
            onChange={(e) => setState(e.target.value === "ready" ? "ready" : "draft")}
          >
            <option value="draft">{t("sessionPage.prepDraft")}</option>
            <option value="ready">{t("sessionPage.readyToPlay")}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`plan-summary-${session.sessionId}`}>{t("common.summary")}</label>
        <textarea id={`plan-summary-${session.sessionId}`} className="form-textarea session-prep-editor__textarea--summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("sessionPage.prepSummaryPlaceholder")} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`plan-opening-${session.sessionId}`}>{t("sessionPage.openingPromptLabel")}</label>
        <textarea id={`plan-opening-${session.sessionId}`} className="form-textarea session-prep-editor__textarea--opening" value={openingPrompt} onChange={(e) => setOpeningPrompt(e.target.value)} placeholder={t("sessionPage.openingPromptPlaceholder")} />
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPlanEditor.goalsLabel")}</label>
        {goals.map((goal) => (
          <div key={goal.id} className="session-plan-editor__row">
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={(e) => updateGoal(goal.id, { completed: e.target.checked })}
              aria-label={t("sessionPlanEditor.goalCompletedLabel")}
            />
            <input
              className="form-input"
              value={goal.text}
              onChange={(e) => updateGoal(goal.id, { text: e.target.value })}
              placeholder={t("sessionPlanEditor.goalPlaceholder")}
            />
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => removeGoal(goal.id)}>
              {t("common.delete")}
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary" onClick={addGoal}>
          {t("sessionPlanEditor.addGoal")}
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.checklistLabel")}</label>
        {checklist.map((item) => (
          <div key={item.id} className="session-plan-editor__row">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => updateChecklistItem(item.id, { checked: e.target.checked })}
              aria-label={t("sessionPlanEditor.checklistCheckedLabel")}
            />
            <input
              className="form-input"
              value={item.text}
              onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
              placeholder={t("sessionPlanEditor.checklistPlaceholder")}
            />
            <select
              className="form-select"
              value={item.priority}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "low" || value === "medium" || value === "high") {
                  updateChecklistItem(item.id, { priority: value });
                }
              }}
            >
              <option value="low">{t("sessionPage.severityLow")}</option>
              <option value="medium">{t("sessionPage.severityMedium")}</option>
              <option value="high">{t("sessionPage.severityHigh")}</option>
            </select>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => removeChecklistItem(item.id)}>
              {t("common.delete")}
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary" onClick={addChecklistItem}>
          {t("sessionPlanEditor.addChecklistItem")}
        </button>
      </div>

      <div className="session-prep-editor__two-columns">
        <EntityMultiPicker label={t("sessionPlanEditor.scenesLabel")} help={t("sessionPlanEditor.scenesHelp")} campaignState={campaignState} ids={sceneIds} onChange={setSceneIds} typeFilter="scene" />
        <EntityMultiPicker label={t("sessionPage.prepCluesLabel")} campaignState={campaignState} ids={availableClueIds} onChange={setAvailableClueIds} typeFilter="clue" />
        <EntityMultiPicker label={t("sessionPage.prepSecretsLabel")} campaignState={campaignState} ids={secretsAtRiskIds} onChange={setSecretsAtRiskIds} typeFilter="secret" />
        <EntityMultiPicker label={t("sessionPage.prepConsequencesLabel")} campaignState={campaignState} ids={expectedConsequenceIds} onChange={setExpectedConsequenceIds} typeFilter={["consequence", "front"]} />
      </div>

      <EntityMultiPicker label={t("sessionPage.prepInvolvedLabel")} help={t("sessionPage.prepInvolvedHelp")} campaignState={campaignState} ids={involvedEntityIds} onChange={setInvolvedEntityIds} />

      <div className="form-group">
        <label className="form-label" htmlFor={`plan-notes-${session.sessionId}`}>{t("sessionPage.privatePrepNotesLabel")}</label>
        <textarea id={`plan-notes-${session.sessionId}`} className="form-textarea session-prep-editor__textarea--notes" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder={t("sessionPage.privatePrepNotesPlaceholder")} />
      </div>

      <div className="session-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>{busy ? t("common.saving") : t("common.saveChanges")}</button>
      </div>
    </form>
  );
}
