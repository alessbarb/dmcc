import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import { runSessionAction } from "../sessionFormSubmit.js";

export function CloseSessionForm({
  activeSession,
  closeSession,
  setCurrentPage,
  addToast,
  onClose,
}: {
  activeSession: Session;
  closeSession: (id: string, summary: string) => Promise<void>;
  setCurrentPage: (p: string) => void;
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

    return sections
      .map(([title, value]) => `${title}\n${value}`)
      .join("\n\n");
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!sessionSummary.trim()) return;
    setBusy(true);
    await closeSession(activeSession.sessionId, buildStructuredSummary());
    addToast(t("toasts.sessionClosed"), "success");
    setSessionSummary("");
    setDecisions("");
    setOpenThreads("");
    setNextPrep("");
    setBusy(false);
    setCurrentPage("dashboard");
  };

  return (
    <form onSubmit={(event) => {
      runSessionAction(handleSubmit(event), "No se pudo cerrar la sesión.");
    }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 14px",
          backgroundColor: "var(--color-warning-bg)",
          borderRadius: "var(--radius-md)",
          border: "1px solid hsla(38, 95%, 55%, 0.25)",
          marginBottom: "20px",
        }}
      >
        <AlertTriangle size={16} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.87rem", color: "var(--color-warning)" }}>
          {t("sessionPage.closingWarning")}
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="close-summary">
          {t("sessionPage.closingSummaryLabel")}
        </label>
        <textarea
          id="close-summary"
          className="form-textarea"
          placeholder={t("session.exampleSummary")}
          value={sessionSummary}
          onChange={(e) => setSessionSummary(e.target.value)}
          required
          autoFocus
          style={{ minHeight: "110px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="close-decisions">
            {t("sessionPage.closingDecisionsLabel")}
          </label>
          <textarea
            id="close-decisions"
            className="form-textarea"
            placeholder={t("sessionPage.closingDecisionsPlaceholder")}
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
            style={{ minHeight: "82px" }}
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
            onChange={(e) => setOpenThreads(e.target.value)}
            style={{ minHeight: "82px" }}
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
          onChange={(e) => setNextPrep(e.target.value)}
          style={{ minHeight: "74px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-danger" disabled={busy || !sessionSummary.trim()}>
          {busy ? t("sessionPage.closingButton") : t("session.closeAndSave")}
        </button>
      </div>
    </form>
  );
}
