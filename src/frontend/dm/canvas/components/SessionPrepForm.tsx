import React, { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import type { Session } from "../../../shared/stores/campaignStore.js";

export function SessionPrepForm({
  activeSession,
  preparedSessions,
  selectedCount,
  elementNames,
  onSubmit,
  onCancel
}: {
  activeSession: Session | undefined;
  preparedSessions: Session[];
  selectedCount: number;
  elementNames: string[];
  onSubmit: (title: string, mode: "new" | "active" | "prepared", targetSessionId?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [sessionTitle, setSessionTitle] = useState(() => t("canvas.node.typeSession"));
  const [targetMode, setTargetMode] = useState<"new" | "active" | "prepared">(activeSession ? "active" : preparedSessions.length > 0 ? "prepared" : "new");
  const [targetSessionId, setTargetSessionId] = useState(() => preparedSessions[0]?.sessionId ?? "");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    void onSubmit(sessionTitle, targetMode, targetMode === "prepared" ? targetSessionId : undefined).then(
      () => {
        setBusy(false);
      },
      (error: unknown) => {
        console.error("No se pudo preparar la sesión desde el canvas.", error);
        setBusy(false);
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="dialog-form">
      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ fontSize: "0.93rem" }}>
          {t("sessionPage.selectedElementsIntro", { count: selectedCount })}
        </p>
        <div style={{ maxHeight: "100px", overflowY: "auto", padding: "8px", backgroundColor: "var(--theme-surfaces-interactive)", borderRadius: "var(--theme-shapes-radius-small)", fontSize: "0.85rem", color: "var(--theme-text-secondary)", border: "1px solid var(--theme-borders-default)" }}>
          {elementNames.join(", ")}
        </div>

        <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          {activeSession && (
            <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
              <input
                type="radio"
                name="sessionPrepMode"
                checked={targetMode === "active"}
                onChange={() => setTargetMode("active")}
                style={{ marginTop: "3px" }}
              />
              <div>
                <strong>{t("sessionPage.addToActiveSessionLabel", { title: activeSession.title })}</strong>
                <div style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>
                  {t("sessionPage.addToActiveSessionHelp")}
                </div>
              </div>
            </label>
          )}

          {preparedSessions.length > 0 && (
            <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
              <input
                type="radio"
                name="sessionPrepMode"
                checked={targetMode === "prepared"}
                onChange={() => setTargetMode("prepared")}
                style={{ marginTop: "3px" }}
              />
              <div style={{ flex: 1 }}>
                <strong>{t("sessionPage.addToPreparedSessionLabel")}</strong>
                <div style={{ fontSize: "11px", color: "var(--theme-text-secondary)", marginBottom: "8px" }}>
                  {t("sessionPage.addToPreparedSessionHelp")}
                </div>
                {targetMode === "prepared" && (
                  <select className="form-select" value={targetSessionId} onChange={(e) => setTargetSessionId(e.target.value)} required>
                    {preparedSessions.map((session: Session) => (
                      <option key={session.sessionId} value={session.sessionId}>
                        {session.number ? `#${session.number} ` : ""}{session.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>
          )}

          <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
            <input
              type="radio"
              name="sessionPrepMode"
              checked={targetMode === "new"}
              onChange={() => setTargetMode("new")}
              style={{ marginTop: "3px" }}
            />
            <div>
              <strong>{t("sessionPage.createPreparedSessionWithElements")}</strong>
              <div style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>
                {t("sessionPage.createPreparedSessionHelp")}
              </div>
            </div>
          </label>
        </div>

        {targetMode === "new" && (
          <div className="form-group">
            <label>{t("sessionPage.preparedSessionTitleLabel")}</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="form-input"
              required
              placeholder={t("canvas.page.sessionNamePlaceholder")}
            />
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("sessionPage.savingPreparation") : targetMode === "new" ? t("sessionPage.createPreparation") : targetMode === "prepared" ? t("sessionPage.addToPreparationButton") : t("canvas.page.loadIntoSession")}
        </button>
      </div>
    </form>
  );
}
