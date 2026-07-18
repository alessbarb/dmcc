import React, { useState } from "react";
import { Archive, CalendarClock, HelpCircle, MapPin, Play, StickyNote, UserPlus, X } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import type { SupportedLocale } from "@shared/i18n/types.js";
import type { CampaignStateStore, Session } from "../../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../../shared/hooks/useToast.js";
import type { MaybeCampaignState, SessionPrep } from "../sessionTypes.js";
import { errorMessage, runSessionAction } from "../sessionFormSubmit.js";
import { GuidedEmptyState } from "../../onboarding/CampaignStarterHub.js";
import { SessionPrepEditor } from "./SessionPrepEditor.js";
import { SessionPlanEditor } from "./SessionPlanEditor.js";

export function NoActiveSessionView({
  campaignState,
  locale,
  preparedSessions,
  recentSessions,
  nextNumber,
  createPreparedSession,
  updateSessionPrep,
  reviseSessionPlan,
  cancelSession,
  archiveSession,
  activateSession,
  startSession,
  addToast,
}: {
  campaignState: MaybeCampaignState;
  locale: SupportedLocale;
  preparedSessions: Session[];
  recentSessions: Session[];
  nextNumber: number;
  createPreparedSession: CampaignStateStore["createPreparedSession"];
  updateSessionPrep: CampaignStateStore["updateSessionPrep"];
  reviseSessionPlan: CampaignStateStore["reviseSessionPlan"];
  cancelSession: CampaignStateStore["cancelSession"];
  archiveSession: CampaignStateStore["archiveSession"];
  activateSession: CampaignStateStore["activateSession"];
  startSession: CampaignStateStore["startSession"];
  addToast: (msg: string, kind?: ToastKind) => void;
}) {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState("");
  const [editingPrepSessionId, setEditingPrepSessionId] = useState<string | null>(null);
  const [editingPlanSessionId, setEditingPlanSessionId] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handlePrepare = async (event: React.SubmitEvent) => {
    event.preventDefault();
    const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
    setIsPreparing(true);
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
    } catch (error) {
      addToast(t("toasts.sessionPrepareError", { error: errorMessage(error) }), "error");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleStartAdHoc = async () => {
    const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
    setIsStarting(true);
    try {
      await startSession(title);
      addToast(t("toasts.sessionStarted", { title }), "success");
      setNewTitle("");
    } catch (error) {
      addToast(t("toasts.sessionStartError", { error: errorMessage(error) }), "error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleActivate = async (sessionId: string, title: string) => {
    try {
      await activateSession(sessionId);
      addToast(t("toasts.sessionActivated", { title }), "success");
    } catch (error) {
      addToast(t("toasts.sessionActivateError", { error: errorMessage(error) }), "error");
    }
  };

  const handleSavePrep = async (sessionId: string, title: string, prep: SessionPrep, scheduledAt?: string) => {
    try {
      await updateSessionPrep(sessionId, { title, scheduledAt, prep });
      addToast(t("toasts.sessionPrepUpdated", { title }), "success");
      setEditingPrepSessionId(null);
    } catch (error) {
      addToast(t("toasts.sessionPrepUpdateError", { error: errorMessage(error) }), "error");
    }
  };

  const handleSavePlan = async (
    session: Session,
    title: string,
    plan: Omit<NonNullable<Session["plan"]>, "revision">,
    scheduledAt?: string,
  ) => {
    try {
      await reviseSessionPlan(session.sessionId, {
        title,
        scheduledAt,
        expectedRevision: session.plan?.revision ?? 0,
        plan,
      });
      addToast(t("toasts.sessionPrepUpdated", { title }), "success");
      setEditingPlanSessionId(null);
    } catch (error) {
      addToast(t("toasts.sessionPrepUpdateError", { error: errorMessage(error) }), "error");
    }
  };

  const handleCancelPrepared = async (sessionId: string, title: string) => {
    if (!window.confirm(t("sessionPage.cancelPreparedConfirm", { title }))) return;
    try {
      await cancelSession(sessionId);
      addToast(t("toasts.sessionCancelled", { title }), "info");
      if (editingPrepSessionId === sessionId) setEditingPrepSessionId(null);
    } catch (error) {
      addToast(t("toasts.sessionCancelError", { error: errorMessage(error) }), "error");
    }
  };

  const handleArchivePrepared = async (sessionId: string, title: string) => {
    if (!window.confirm(t("sessionPage.archivePreparedConfirm", { title }))) return;
    try {
      await archiveSession(sessionId);
      addToast(t("toasts.sessionArchived", { title }), "info");
      if (editingPrepSessionId === sessionId) setEditingPrepSessionId(null);
    } catch (error) {
      addToast(t("toasts.sessionArchiveError", { error: errorMessage(error) }), "error");
    }
  };

  return (
    <div className="session-idle-workspace">
      <section className="session-create-panel surface-panel">
        <div className="session-create-panel__icon" aria-hidden="true">
          <CalendarClock size={28} />
        </div>
        <div className="session-create-panel__copy">
          <p className="session-section-eyebrow">{t("sessionPage.preparedSessions")}</p>
          <h2>{t("sessionPage.prepareNextSessionTitle")}</h2>
          <p>{t("sessionPage.prepareSessionDescription")}</p>
        </div>
        <form className="session-create-form" onSubmit={(event) => runSessionAction(handlePrepare(event), "No se pudo preparar la sesión.") }>
          <div className="form-group">
            <label className="form-label" htmlFor="session-title-input">
              {t("sessionPage.sessionTitleLabel")}
            </label>
            <input
              id="session-title-input"
              type="text"
              className="form-input"
              placeholder={t("session.sessionNumber", { number: nextNumber })}
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </div>
          <div className="session-create-form__actions">
            <button type="submit" className="btn btn-primary" disabled={isPreparing || isStarting}>
              <StickyNote size={16} />
              {isPreparing ? t("common.saving") : t("sessionPage.prepareSessionButton", { number: nextNumber })}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isPreparing || isStarting}
              onClick={() => runSessionAction(handleStartAdHoc(), "No se pudo iniciar una sesión ad hoc.")}
            >
              <Play size={16} />
              {isStarting ? t("common.loading") : t("sessionPage.startAdHocButton")}
            </button>
          </div>
        </form>
      </section>

      <div className="session-idle-grid">
        <main className="session-idle-main">
          {preparedSessions.length > 0 ? (
            <section className="session-list-section" aria-labelledby="prepared-sessions-heading">
              <div className="session-list-section__header">
                <div>
                  <p className="session-section-eyebrow">{preparedSessions.length}</p>
                  <h3 id="prepared-sessions-heading">{t("sessionPage.preparedSessions")}</h3>
                </div>
              </div>
              <div className="session-prepared-list">
                {preparedSessions.map((session) => {
                  const prep: SessionPrep = session.prep ?? {};
                  const linkedCount = new Set([
                    ...(prep.sceneIds ?? []),
                    ...(prep.involvedEntityIds ?? []),
                    ...(prep.availableClueIds ?? []),
                    ...(prep.secretsAtRiskIds ?? []),
                    ...(prep.expectedConsequenceIds ?? []),
                  ]).size;
                  const isEditing = editingPrepSessionId === session.sessionId;
                  const isEditingPlan = editingPlanSessionId === session.sessionId;

                  return (
                    <article key={session.sessionId} className={`prepared-session-card ${isEditing || isEditingPlan ? "is-editing" : ""}`}>
                      <div className="prepared-session-card__summary">
                        <div className="prepared-session-card__title-row">
                          <h4>{session.number ? `#${session.number} ` : ""}{session.title}</h4>
                          <span className={`session-state-badge ${prep.state === "ready" ? "is-ready" : ""}`}>
                            {prep.state === "ready" ? t("sessionPage.readyToPlay") : t("sessionPage.prepDraft")}
                          </span>
                        </div>
                        <div className="prepared-session-card__meta">
                          {linkedCount > 0 && <span>{t("sessionPage.linkedElementsCount", { count: linkedCount })}</span>}
                          {(prep.goals?.length ?? 0) > 0 && <span>{t("sessionPage.goalsCount", { count: prep.goals?.length ?? 0 })}</span>}
                        </div>
                        {prep.summary && <p>{prep.summary}</p>}
                      </div>
                      <div className="prepared-session-card__actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingPrepSessionId(isEditing ? null : session.sessionId)}
                        >
                          <StickyNote size={14} /> {t("sessionPage.editPreparationButton")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingPlanSessionId(isEditingPlan ? null : session.sessionId)}
                        >
                          <StickyNote size={14} /> {t("sessionPlanEditor.editPlanButton")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => runSessionAction(handleActivate(session.sessionId, session.title), "No se pudo activar la sesión preparada.")}
                        >
                          <Play size={14} /> {t("sessionPage.activatePreparedSessionButton")}
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary btn-sm"
                          onClick={() => runSessionAction(handleCancelPrepared(session.sessionId, session.title), "No se pudo cancelar la sesión preparada.")}
                          title={t("sessionPage.cancelPreparedSessionButton")}
                          aria-label={t("sessionPage.cancelPreparedSessionButton")}
                        >
                          <X size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary btn-sm"
                          onClick={() => runSessionAction(handleArchivePrepared(session.sessionId, session.title), "No se pudo archivar la sesión preparada.")}
                          title={t("sessionPage.archivePreparedSessionButton")}
                          aria-label={t("sessionPage.archivePreparedSessionButton")}
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                      {isEditing && (
                        <div className="prepared-session-card__editor">
                          <SessionPrepEditor
                            session={session}
                            campaignState={campaignState}
                            onSave={(title, prep, scheduledAt) => handleSavePrep(session.sessionId, title, prep, scheduledAt)}
                            onCancel={() => setEditingPrepSessionId(null)}
                          />
                        </div>
                      )}
                      {isEditingPlan && (
                        <div className="prepared-session-card__editor">
                          <SessionPlanEditor
                            session={session}
                            campaignState={campaignState}
                            onSave={(title, plan, scheduledAt) => handleSavePlan(session, title, plan, scheduledAt)}
                            onCancel={() => setEditingPlanSessionId(null)}
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="session-empty-prepared surface-panel">
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
                    onClick: () => document.getElementById("session-title-input")?.focus(),
                  },
                ]}
              />
            </section>
          )}
        </main>

        <aside className="session-history-panel surface-panel" aria-labelledby="recent-sessions-heading">
          <div className="session-list-section__header">
            <div>
              <p className="session-section-eyebrow">{recentSessions.length}</p>
              <h3 id="recent-sessions-heading">{t("sessionPage.previousSessions")}</h3>
            </div>
          </div>
          {recentSessions.length > 0 ? (
            <div className="session-history-list">
              {recentSessions.map((session) => (
                <article key={session.sessionId} className="session-history-item">
                  <div>
                    <h4>{session.number ? `#${session.number} ` : ""}{session.title}</h4>
                    {session.summary && <p>{session.summary}</p>}
                  </div>
                  <time dateTime={session.endedAt ?? undefined}>
                    {session.endedAt
                      ? new Date(session.endedAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <p className="session-history-panel__empty">{t("sessionPage.previousSessions")}: 0</p>
          )}
        </aside>
      </div>
    </div>
  );
}
