import { useState } from "react";
import { createId } from "@shared/ids.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";
import "./session-forms.css";

export function RecordDecisionForm({
  campaignState,
  createEntity,
  createRelation,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  campaignState: MaybeCampaignState;
  createEntity: CampaignStateStore["createEntity"];
  createRelation: CampaignStateStore["createRelation"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  activeSession: Session;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState("");
  const [affectedIds, setAffectedIds] = useState<string[]>([]);
  const [immediateConsequence, setImmediateConsequence] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [pendingTitle, setPendingTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const entities = (campaignState?.entities ?? []).filter((entity: Entity) => !entity.archived);

  const toggleAffected = (id: string) => {
    setAffectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (!decision.trim()) return;
    setBusy(true);
    try {
      const decisionEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;
      await createEntity({
        entityId: decisionEntityId,
        entityType: "decision",
        title: decision.substring(0, 50) + (decision.length > 50 ? "…" : ""),
        summary: immediateConsequence || undefined,
        content: decision,
        status: "made",
        createdInSessionId: sessionId,
        metadata: { decisionText: decision, sessionId: sessionId || "sess_unknown", madeByCharacterIds: affectedIds, immediateConsequence: immediateConsequence || undefined },
      });
      await recordSessionEvent(sessionId, {
        type: "decision_made",
        title: t("session.decisionMade", { decision: decision.substring(0, 40), suffix: decision.length > 40 ? "…" : "" }),
        description: decision,
        relatedEntityIds: [decisionEntityId, ...affectedIds],
      });
      if (createPending && pendingTitle.trim()) {
        const consequenceEntityId = createId("ent");
        await createEntity({ entityId: consequenceEntityId, entityType: "consequence", title: pendingTitle.trim(), summary: t("session.decisionConsequence"), status: "pending", createdInSessionId: sessionId, metadata: { originEntityId: decisionEntityId } });
        await createRelation({ sourceEntityId: decisionEntityId, targetEntityId: consequenceEntityId, relationType: "causes", description: t("session.decisionCausesConsequence"), visibility: { kind: "dm_only" } });
        await recordSessionEvent(sessionId, { type: "consequence_created", title: t("sessionPage.consequenceCreatedFromDecision", { title: pendingTitle.trim() }), description: t("session.pendingConsequence", { decision: decision.substring(0, 40) }), relatedEntityIds: [consequenceEntityId, decisionEntityId] });
      }
      addToast(t("toasts.decisionRecorded"), "success");
    } catch (err) {
      addToast(t("toasts.decisionError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={(event) => { runSessionAction(handleSubmit(event), "No se pudo registrar la decisión."); }}>
      <div className="form-group">
        <label className="form-label" htmlFor="decision-text">{t("sessionPage.whatDidTheyDecide")}</label>
        <textarea id="decision-text" className="form-textarea session-form-textarea--medium" placeholder={t("sessionPage.decidePlaceholder")} value={decision} onChange={(event) => setDecision(event.target.value)} required autoFocus />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="decision-consequence">{t("sessionPage.immediateConsequence")}</label>
        <input id="decision-consequence" type="text" className="form-input" placeholder={t("sessionPage.immConsequencePlaceholder")} value={immediateConsequence} onChange={(event) => setImmediateConsequence(event.target.value)} />
      </div>
      {entities.length > 0 && (
        <div className="form-group">
          <label className="form-label">{t("sessionPage.affectedEntities")}</label>
          <div className="session-entity-picker">
            {entities.slice(0, 30).map((entity: Entity) => (
              <button key={entity.entityId} type="button" className={`btn btn-sm session-entity-picker__option ${affectedIds.includes(entity.entityId) ? "btn-primary" : "btn-secondary"}`} onClick={() => toggleAffected(entity.entityId)}>
                {entity.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`form-group session-checkbox-row${createPending ? " has-dependent-field" : ""}`}>
        <input id="create-pending" className="session-checkbox-row__control" type="checkbox" checked={createPending} onChange={(event) => setCreatePending(event.target.checked)} />
        <label htmlFor="create-pending" className="form-label session-checkbox-row__label">{t("sessionPage.createPendingConsequence")}</label>
      </div>
      {createPending && (
        <div className="form-group">
          <label className="form-label" htmlFor="pending-title">{t("sessionPage.pendingConsequenceTitle")}</label>
          <input id="pending-title" type="text" className="form-input" placeholder={t("session.exampleConsequence")} value={pendingTitle} onChange={(event) => setPendingTitle(event.target.value)} required autoFocus />
        </div>
      )}
      <div className="session-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>{t("common.cancel")}</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? t("common.saving") : t("session.recordDecision")}</button>
      </div>
    </form>
  );
}
