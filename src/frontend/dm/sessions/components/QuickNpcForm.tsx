import { useState } from "react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

export function QuickNpcForm({
  createEntity,
  activeSession,
  addToast,
  onClose,
}: {
  createEntity: CampaignStateStore["createEntity"];
  activeSession: Session;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    try {
      await createEntity({
        entityType: "npc",
        title: name.trim(),
        subtitle: role.trim(),
        summary: description.trim(),
        status: "known",
        importance: "normal",
        createdInSessionId: activeSession.sessionId,
        metadata: {
          role: role.trim(),
        },
      });
      addToast(t("toasts.npcCreated", { name: name.trim() }), "success");
      onClose();
    } catch (error) {
      addToast(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => runSessionAction(handleSubmit(event), "No se pudo crear el PNJ rápido.") }>
      <div className="session-form-grid session-form-grid--two-columns">
        <div className="form-group">
          <label className="form-label" htmlFor="pnj-name">
            {t("sessionPage.npcNameLabel")}
          </label>
          <input
            id="pnj-name"
            type="text"
            className="form-input"
            placeholder={t("sessionPage.npcNamePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pnj-role">
            {t("sessionPage.npcRoleLabel")}
          </label>
          <input
            id="pnj-role"
            type="text"
            className="form-input"
            placeholder={t("sessionPage.npcRolePlaceholder")}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pnj-desc">
          {t("sessionPage.briefDescription")}
        </label>
        <input
          id="pnj-desc"
          type="text"
          className="form-input"
          placeholder={t("sessionPage.npcDescPlaceholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="session-form-actions">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
          {busy ? t("common.saving") : t("session.createNpc")}
        </button>
      </div>
    </form>
  );
}
