import { useState } from "react";
import { createId } from "@shared/ids.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

export function QuickNoteForm({
  createEntity,
  recordSessionEvent,
  activeSession,
  addToast,
  onClose,
}: {
  createEntity: CampaignStateStore["createEntity"];
  recordSessionEvent: CampaignStateStore["recordSessionEvent"];
  activeSession: Session;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const noteEntityId = createId("ent");
      const sessionId = activeSession?.sessionId;

      await createEntity({
        entityId: noteEntityId,
        entityType: "note",
        title: text.substring(0, 40) + (text.length > 40 ? "…" : ""),
        content: text,
        status: "active",
        createdInSessionId: sessionId,
      });

      await recordSessionEvent(sessionId, {
        type: "note_recorded",
        title: t("toasts.noteRecorded"),
        description: text.substring(0, 80) + (text.length > 80 ? "…" : ""),
        relatedEntityIds: [noteEntityId],
      });

      addToast(t("toasts.noteRecorded"), "success");
      setText("");
    } catch (err) {
      addToast(t("toasts.noteSaveError", { error: errorMessage(err) }), "error");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <form
      className="quick-note-form"
      onSubmit={(event) => {
        runSessionAction(handleSubmit(event), "No se pudo guardar la nota rápida.");
      }}
    >
      <div className="form-group">
        <label className="form-label" htmlFor="nota-text">
          {t("sessionPage.noteLabel")}
        </label>
        <textarea
          id="nota-text"
          className="form-textarea quick-note-form__textarea"
          placeholder={t("sessionPage.notePlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className="session-form-actions quick-note-form__actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("common.saving") : t("players.saveNote")}
        </button>
      </div>
    </form>
  );
}
