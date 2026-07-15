import React, { useState } from "react";
import { Play, StickyNote, Archive, HelpCircle, MapPin, UserPlus, X } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { SupportedLocale } from "@shared/i18n/types.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { MaybeCampaignState, SessionPrep } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";
import { GuidedEmptyState } from "../../onboarding/CampaignStarterHub.js";
import { SessionPrepEditor } from "./SessionPrepEditor.js";

export function NoActiveSessionView({
  campaignState,
  locale,
  hasNoSessions,
  preparedSessions,
  recentSessions,
  nextNumber,
  createPreparedSession,
  updateSessionPrep,
  cancelSession,
  archiveSession,
  activateSession,
  startSession,
  addToast,
}: {
  campaignState: MaybeCampaignState;
  locale: SupportedLocale;
  hasNoSessions: boolean;
  preparedSessions: Session[];
  recentSessions: Session[];
  nextNumber: number;
  createPreparedSession: CampaignStateStore["createPreparedSession"];
  updateSessionPrep: CampaignStateStore["updateSessionPrep"];
  cancelSession: CampaignStateStore["cancelSession"];
  archiveSession: CampaignStateStore["archiveSession"];
  activateSession: CampaignStateStore["activateSession"];
  startSession: CampaignStateStore["startSession"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState("");
  const [editingPrepSessionId, setEditingPrepSessionId] = useState<string | null>(null);

  const handlePrepare = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
    try {
      await createPreparedSession(title, {
        state: "draft",
        summary: "",
        goals: [],
        sceneIds: [],
        involvedEntityIds: [],
        availableClueIds: [],
        secretsAtRiskIds: [],
        expectedConsequenceIds: [],
        checklist: [],
        notes: "",
      });
      addToast(t("toasts.sessionPrepared", { title }), "success");
      setNewTitle("");
    } catch (err) {
      addToast(t("toasts.sessionPrepareError", { error: errorMessage(err) }), "error");
    }
  };

  const handleStartAdHoc = async () => {
    const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
    try {
      await startSession(title);
      addToast(t("toasts.sessionStarted", { title }), "success");
      setNewTitle("");
    } catch (err) {
      addToast(t("toasts.sessionStartError", { error: errorMessage(err) }), "error");
    }
  };

  const handleActivate = async (sessionId: string, title: string) => {
    try {
      await activateSession(sessionId);
      addToast(t("toasts.sessionActivated", { title }), "success");
    } catch (err) {
      addToast(t("toasts.sessionActivateError", { error: errorMessage(err) }), "error");
    }
  };

  const handleSavePrep = async (sessionId: string, title: string, prep: SessionPrep, scheduledAt?: string) => {
    try {
      await updateSessionPrep(sessionId, { title, scheduledAt, prep });
      addToast(t("toasts.sessionPrepUpdated", { title }), "success");
      setEditingPrepSessionId(null);
    } catch (err) {
      addToast(t("toasts.sessionPrepUpdateError", { error: errorMessage(err) }), "error");
    }
  };

  const handleCancelPrepared = async (sessionId: string, title: string) => {
    if (!window.confirm(t("sessionPage.cancelPreparedConfirm", { title }))) return;
    try {
      await cancelSession(sessionId);
      addToast(t("toasts.sessionCancelled", { title }), "info");
      if (editingPrepSessionId === sessionId) setEditingPrepSessionId(null);
    } catch (err) {
      addToast(t("toasts.sessionCancelError", { error: errorMessage(err) }), "error");
    }
  };

  const handleArchivePrepared = async (sessionId: string, title: string) => {
    if (!window.confirm(t("sessionPage.archivePreparedConfirm", { title }))) return;
    try {
      await archiveSession(sessionId);
      addToast(t("toasts.sessionArchived", { title }), "info");
      if (editingPrepSessionId === sessionId) setEditingPrepSessionId(null);
    } catch (err) {
      addToast(t("toasts.sessionArchiveError", { error: errorMessage(err) }), "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <section
        className="card"
        style={{
          maxWidth: "620px",
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
          padding: "44px 40px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--primary-light)",
            border: "1px solid hsla(255, 85%, 65%, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <StickyNote size={28} style={{ color: "var(--primary)" }} />
        </div>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          {t("sessionPage.prepareNextSessionTitle")}
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "28px",
            fontSize: "0.93rem",
          }}
        >
          {t("sessionPage.prepareSessionDescription")}
        </p>
        <form onSubmit={(event) => {
          runSessionAction(handlePrepare(event), "No se pudo preparar la sesión.");
        }}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label" htmlFor="session-title-input">
              {t("sessionPage.sessionTitleLabel")}
            </label>
            <input
              id="session-title-input"
              type="text"
              className="form-input"
              placeholder={t("session.sessionNumber", { number: nextNumber })}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "14px", fontSize: "1rem" }}
            >
              <StickyNote size={16} /> {t("sessionPage.prepareSessionButton", { number: nextNumber })}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                runSessionAction(handleStartAdHoc(), "No se pudo iniciar una sesión ad hoc.");
              }}
              style={{ padding: "14px", fontSize: "1rem" }}
            >
              <Play size={16} /> {t("sessionPage.startAdHocButton")}
            </button>
          </div>
        </form>
      </section>

      {hasNoSessions && (
        <section style={{ maxWidth: "720px", margin: "0 auto", width: "100%" }}>
          <GuidedEmptyState
            icon={<HelpCircle size={30} />}
            title={t("guidedStart.empty.session.title")}
            description={t("guidedStart.empty.session.description")}
            actions={[
              {
                label: t("guidedStart.empty.session.createPlace"),
                icon: <MapPin size={14} />,
                onClick: () => window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", { detail: { entityType: "location", content: t("guidedStart.templates.location.content"), metadata: { locationType: "settlement", atmosphere: "" } } })),
              },
              {
                label: t("guidedStart.empty.session.createNpc"),
                icon: <UserPlus size={14} />,
                onClick: () => window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", { detail: { entityType: "npc", content: t("guidedStart.templates.npc.content"), metadata: { role: "", attitudeToParty: "neutral", goal: "" } } })),
              },
              {
                label: t("guidedStart.empty.session.prepare"),
                icon: <StickyNote size={14} />,
                primary: true,
                onClick: () => {
                  // DOM lookup boundary cast: getElementById only returns Element | null.
                  const input = document.getElementById("session-title-input") as HTMLInputElement | null;
                  input?.focus();
                },
              },
            ]}
          />
        </section>
      )}

      {preparedSessions.length > 0 && (
        <section style={{ maxWidth: "720px", margin: "0 auto", width: "100%" }}>
          <h3
            style={{
              fontWeight: "700",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: "14px",
            }}
          >
            {t("sessionPage.preparedSessions")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {preparedSessions.map((session) => {
              const prep: SessionPrep = session.prep ?? {};
              const linkedCount = new Set([
                ...(prep.sceneIds ?? []),
                ...(prep.involvedEntityIds ?? []),
                ...(prep.availableClueIds ?? []),
                ...(prep.secretsAtRiskIds ?? []),
                ...(prep.expectedConsequenceIds ?? []),
              ]).size;
              return (
                <React.Fragment key={session.sessionId}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    padding: "16px 18px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--text-main)", marginBottom: "4px" }}>
                      {session.number ? `#${session.number} ` : ""}{session.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {prep.state === "ready" ? t("sessionPage.readyToPlay") : t("sessionPage.prepDraft")}
                      {linkedCount > 0 ? ` · ${t("sessionPage.linkedElementsCount", { count: linkedCount })}` : ""}
                      {(prep.goals?.length ?? 0) > 0 ? ` · ${t("sessionPage.goalsCount", { count: prep.goals?.length ?? 0 })}` : ""}
                    </div>
                    {prep.summary && (
                      <p style={{ marginTop: "6px", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                        {prep.summary}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingPrepSessionId(editingPrepSessionId === session.sessionId ? null : session.sessionId)}
                    >
                      <StickyNote size={14} /> {t("sessionPage.editPreparationButton")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        runSessionAction(handleActivate(session.sessionId, session.title), "No se pudo activar la sesión preparada.");
                      }}
                    >
                      <Play size={14} /> {t("sessionPage.activatePreparedSessionButton")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        runSessionAction(handleCancelPrepared(session.sessionId, session.title), "No se pudo cancelar la sesión preparada.");
                      }}
                      title={t("sessionPage.cancelPreparedSessionButton")}
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        runSessionAction(handleArchivePrepared(session.sessionId, session.title), "No se pudo archivar la sesión preparada.");
                      }}
                      title={t("sessionPage.archivePreparedSessionButton")}
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>
                {editingPrepSessionId === session.sessionId && (
                  <SessionPrepEditor
                    session={session}
                    campaignState={campaignState}
                    onSave={(title, prep, scheduledAt) => handleSavePrep(session.sessionId, title, prep, scheduledAt)}
                    onCancel={() => setEditingPrepSessionId(null)}
                  />
                )}
              </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      {recentSessions.length > 0 && (
        <section style={{ maxWidth: "720px", margin: "0 auto", width: "100%" }}>
          <h3
            style={{
              fontWeight: "700",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: "14px",
            }}
          >
            {t("sessionPage.previousSessions")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentSessions.map((s) => (
              <div
                key={s.sessionId}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: "700", fontSize: "0.93rem", marginBottom: "4px", color: "var(--text-main)" }}>
                    {s.number ? `#${s.number} ` : ""}{s.title}
                  </div>
                  {s.summary && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {s.summary}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {s.endedAt
                    ? new Date(s.endedAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
