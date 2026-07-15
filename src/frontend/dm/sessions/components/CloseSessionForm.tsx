import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";

export function CloseSessionForm({
  activeSession,
  closeSession,
  setCurrentPage,
  addToast,
  onClose,
}: {
  activeSession: Session;
  closeSession: (id: string, summary: string) => Promise<void>;
  setCurrentPage: (page: string) => void;
  addToast: (msg: string, kind?: ToastKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [sessionSummary, setSessionSummary] = useState("");
  const [decisions, setDecisions] = useState("");
  const [openThreads, setOpenThreads] = useState("");
  const [nextPrep, setNextPrep] = useState("");

  const buildStructuredSummary = () => {
    const sections = [
      [t("sessionPage.closingSummarySection"), sessionSummary.trim()],
      [t("sessionPage.closingDecisionsSection"), decisions.trim()],
      [t("sessionPage.closingOpenThreadsSection"), openThreads.trim()],
      [t("sessionPage.closingNextPrepSection"), nextPrep.trim()],
    ].filter(([, value]) => value.length > 0);

    return sections.map(([title, value]) => `${title}\n${value}`).join("\n\n");
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (!sessionSummary.trim()) return;

    setBusy(true);
    try {
      await closeSession(activeSession.sessionId, buildStructuredSummary());
      addToast(t("toasts.sessionClosed"), "success");
      setSessionSummary("");
      setDecisions("");
      setOpenThreads("");
      setNextPrep("");
      setCurrentPage("dashboard");
    } catch (error) {
      addToast(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => runSessionAction(handleSubmit(event), "No se pudo cerrar la sesión.") }>
      <div className="session-form-warning">
        <AlertTriangle size={16} aria-hidden="true" />
        <p>{t("sessionPage.closingWarning")}</p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="close-summary">
          {t("sessionPage.closingSummaryLabel")}
        </label>
        <textarea
          id="close-summary"
          className="form-textarea session-form-textarea--large"
          placeholder={t("session.exampleSummary")}
          value={sessionSummary}
          onChange={(event) => setSessionSummary(event.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="session-form-grid session-form-grid--two-columns">
        <div className="form-group">
          <label className="form-label" htmlFor="close-decisions">
            {t("sessionPage.closingDecisionsLabel")}
          </label>
          <textarea
            id="close-decisions"
            className="form-textarea"
            placeholder={t("sessionPage.closingDecisionsPlaceholder")}
            value={decisions}
            onChange={(event) => setDecisions(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="close-open-threads">
            {t("sessionPage.closingOpenThreadsLabel")}
          </label>
          <textarea
            id="close-open-threads"
            className="form-textarea"
            placeholder={t("sessionPage.closingOpenThreadsPlaceholder")}
            value={openThreads}
            onChange={(event) => setOpenThreads(event.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="close-next-prep">
          {t("sessionPage.closingNextPrepLabel")}
        </label>
        <textarea
          id="close-next-prep"
          className="form-textarea"
          placeholder={t("sessionPage.closingNextPrepPlaceholder")}
          value={nextPrep}
          onChange={(event) => setNextPrep(event.target.value)}
        />
      </div>

      <div className="session-form-actions">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-danger" disabled={busy || !sessionSummary.trim()}>
          {busy ? t("sessionPage.closingButton") : t("session.closeAndSave")}
        </button>
      </div>
    </form>
  );
}
