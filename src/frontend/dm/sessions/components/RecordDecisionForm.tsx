import { useState } from "react";
import { createId } from "@shared/ids.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

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

  const entities = (campaignState?.entities ?? []).filter(
    (e: Entity) => !e.archived
  );

  const toggleAffected = (id: string) => {
    setAffectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;
    setBusy(true);

    try {
      const decisionEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      // 1. Create Decision Entity
      await createEntity({
        entityId: decisionEntityId,
        entityType: "decision",
        title: decision.substring(0, 50) + (decision.length > 50 ? "…" : ""),
        summary: immediateConsequence || undefined,
        content: decision,
        status: "made",
        createdInSessionId: sessionId,
        metadata: {
          decisionText: decision,
          sessionId: sessionId || "sess_unknown",
          madeByCharacterIds: affectedIds,
          immediateConsequence: immediateConsequence || undefined,
        },
      });

      // 2. Record Session Event for the decision
      await recordSessionEvent(sessionId, {
        type: "decision_made",
        title: t("session.decisionMade", { decision: decision.substring(0, 40), suffix: decision.length > 40 ? "…" : "" }),
        description: decision,
        relatedEntityIds: [decisionEntityId, ...affectedIds],
      });

      // 3. Create Consequence if checked
      if (createPending && pendingTitle.trim()) {
        const consequenceEntityId = createId("ent");
        await createEntity({
          entityId: consequenceEntityId,
          entityType: "consequence",
          title: pendingTitle.trim(),
          summary: t("session.decisionConsequence"),
          status: "pending",
          createdInSessionId: sessionId,
          metadata: {
            originEntityId: decisionEntityId,
          },
        });

        // 3.1. Create relation "causes" connecting decision to consequence
        await createRelation({
          sourceEntityId: decisionEntityId,
          targetEntityId: consequenceEntityId,
          relationType: "causes",
          // status defaults to "active" server-side (same value this used to pass explicitly)
          description: t("session.decisionCausesConsequence"),
          visibility: { kind: "dm_only" },
        });

        // 3.2. Record Session Event for the consequence
        await recordSessionEvent(sessionId, {
          type: "consequence_created",
          title: t("sessionPage.consequenceCreatedFromDecision", { title: pendingTitle.trim() }),
          description: t("session.pendingConsequence", { decision: decision.substring(0, 40) }),
          relatedEntityIds: [consequenceEntityId, decisionEntityId],
        });
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
    <form onSubmit={(event) => {
      runSessionAction(handleSubmit(event), "No se pudo registrar la decisión.");
    }}>
      <div className="form-group">
        <label className="form-label" htmlFor="decision-text">
          {t("sessionPage.whatDidTheyDecide")}
        </label>
        <textarea
          id="decision-text"
          className="form-textarea"
          placeholder={t("sessionPage.decidePlaceholder")}
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "80px" }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="decision-consequence">
          {t("sessionPage.immediateConsequence")}
        </label>
        <input
          id="decision-consequence"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.immConsequencePlaceholder")}
          value={immediateConsequence}
          onChange={(e) => setImmediateConsequence(e.target.value)}
        />
      </div>

      {entities.length > 0 && (
        <div className="form-group">
          <label className="form-label">{t("sessionPage.affectedEntities")}</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              maxHeight: "120px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {entities.slice(0, 30).map((e: Entity) => (
              <button
                key={e.entityId}
                type="button"
                className={`btn btn-sm ${affectedIds.includes(e.entityId) ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleAffected(e.entityId)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="form-group"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: createPending ? "12px" : "20px",
        }}
      >
        <input
          id="create-pending"
          type="checkbox"
          checked={createPending}
          onChange={(e) => setCreatePending(e.target.checked)}
          style={{ width: "16px", height: "16px", accentColor: "var(--primary)", cursor: "pointer" }}
        />
        <label
          htmlFor="create-pending"
          className="form-label"
          style={{ marginBottom: 0, cursor: "pointer" }}
        >
          {t("sessionPage.createPendingConsequence")}
        </label>
      </div>

      {createPending && (
        <div className="form-group">
          <label className="form-label" htmlFor="pending-title">
            {t("sessionPage.pendingConsequenceTitle")}
          </label>
          <input
            id="pending-title"
            type="text"
            className="form-input"
            placeholder={t("session.exampleConsequence")}
            value={pendingTitle}
            onChange={(e) => setPendingTitle(e.target.value)}
            required={createPending}
            autoFocus={createPending}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("session.recordDecision")}
        </button>
      </div>
    </form>
  );
}
