import { useState } from "react";
import { createId } from "@shared/ids.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MaybeCampaignState } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

export function CreateConsequenceForm({
  campaignState,
  createEntity,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  campaignState: MaybeCampaignState;
  createEntity: CampaignStateStore["createEntity"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  activeSession: Session;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [questId, setQuestId] = useState("");
  const [severity, setSeverity] = useState<"high" | "medium" | "low">("medium");
  const [busy, setBusy] = useState(false);

  const quests = (campaignState?.entities ?? []).filter(
    (e: Entity) => e.entityType === "quest" && !e.archived
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const consequenceEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      await createEntity({
        entityId: consequenceEntityId,
        entityType: "consequence",
        title: title.trim(),
        status: "pending",
        importance: severity === "high" ? "high" : severity === "medium" ? "normal" : "low",
        createdInSessionId: sessionId,
        metadata: {
          originEntityId: questId || undefined,
          severity,
        },
      });

      await recordSessionEvent(sessionId, {
        type: "consequence_created",
        title: t("toasts.consequenceCreated"),
        description: `${t("sessionPage.severity")}: ${severity}`,
        relatedEntityIds: [consequenceEntityId, ...(questId ? [questId] : [])],
      });

      addToast(t("toasts.consequenceCreated"), "success");
    } catch (err) {
      addToast(t("toasts.captureError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form onSubmit={(event) => {
      runSessionAction(handleSubmit(event), "No se pudo crear la consecuencia.");
    }}>
      <div className="form-group">
        <label className="form-label" htmlFor="cons-title">
          {t("sessionPage.pendingConsequenceTitle")}
        </label>
        <input
          id="cons-title"
          type="text"
          className="form-input"
          placeholder={t("session.exampleNote")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t("sessionPage.severity")}</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["low", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${severity === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSeverity(s)}
            >
              {s === "low" ? t("sessionPage.severityLow") : s === "medium" ? t("sessionPage.severityMedium") : t("sessionPage.severityHigh")}
            </button>
          ))}
        </div>
      </div>

      {quests.length > 0 && (
        <div className="form-group">
          <label className="form-label" htmlFor="cons-quest">
            {t("sessionPage.questAffected")}
          </label>
          <select
            id="cons-quest"
            className="form-select"
            value={questId}
            onChange={(e) => setQuestId(e.target.value)}
          >
            <option value="">{t("sessionPage.noSpecificQuest")}</option>
            {quests.map((q: Entity) => (
              <option key={q.entityId} value={q.entityId}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("session.createConsequence")}
        </button>
      </div>
    </form>
  );
}
