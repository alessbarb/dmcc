import { useState } from "react";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { CalendarClock, HelpCircle, MapPin, Play, StickyNote, UserPlus } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { errorMessage, runSessionAction } from "./sessionFormSubmit.js";
import { GuidedEmptyState } from "../onboarding/CampaignStarterHub.js";
import "./session-workspace.css";
import "./components/session-idle.css";
import "./components/prepared-session.css";
import "./components/session-history.css";

export function SessionsIndexPage() {
  const { locale, t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId?: string };
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { addToast } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const sessions = store.campaignState?.sessions ?? [];
  const activeSession = sessions.find((session) => session.status === "active");
  const preparedSessions = [...sessions]
    .filter((session) => session.status === "planned")
    .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime());
  const recentSessions = [...sessions]
    .filter((session) => session.status === "closed" || session.status === "archived")
    .sort((a, b) => new Date(b.endedAt ?? 0).getTime() - new Date(a.endedAt ?? 0).getTime())
    .slice(0, 5);
  const nextNumber = sessions.length + 1;

  const goToDetail = (sessionId: string) => {
    if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/sessions/${sessionId}` }), "No se pudo abrir la sesión.");
  };

  const handlePrepare = async () => {
    const title = newTitle.trim() || t("session.sessionNumber", { number: nextNumber });
    setIsPreparing(true);
    try {
      const sessionId = await store.createPreparedSession(title);
      addToast(t("toasts.sessionPrepared", { title }), "success");
      setNewTitle("");
      if (sessionId) goToDetail(sessionId);
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
      await store.startSession(title);
      addToast(t("toasts.sessionStarted", { title }), "success");
      setNewTitle("");
      if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/sessions` }), "No se pudo abrir la sesión.");
    } catch (error) {
      addToast(t("toasts.sessionStartError", { error: errorMessage(error) }), "error");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="session-page">
      <div className="session-idle-workspace">
        {activeSession && (
          <section className="session-list-section surface-panel">
            <p className="session-section-eyebrow">{t("sessionPage.readyToPlay")}</p>
            <h3>{activeSession.title}</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => goToDetail(activeSession.sessionId)}>
              <Play size={14} /> {activeSession.title}
            </button>
          </section>
        )}

        <section className="session-create-panel surface-panel">
          <div className="session-create-panel__icon" aria-hidden="true">
            <CalendarClock size={28} />
          </div>
          <div className="session-create-panel__copy">
            <p className="session-section-eyebrow">{t("sessionPage.preparedSessions")}</p>
            <h2>{t("sessionPage.prepareNextSessionTitle")}</h2>
            <p>{t("sessionPage.prepareSessionDescription")}</p>
          </div>
          <div className="session-create-form">
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
              <button
                type="button"
                className="btn btn-primary"
                disabled={isPreparing || isStarting}
                onClick={() => runSessionAction(handlePrepare(), "No se pudo preparar la sesión.")}
              >
                <StickyNote size={16} />
                {isPreparing ? t("common.saving") : t("sessionPage.prepareSessionButton", { number: nextNumber })}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isPreparing || isStarting || Boolean(activeSession)}
                onClick={() => runSessionAction(handleStartAdHoc(), "No se pudo iniciar una sesión ad hoc.")}
              >
                <Play size={16} />
                {isStarting ? t("common.loading") : t("sessionPage.startAdHocButton")}
              </button>
            </div>
          </div>
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
                    const plan = session.plan;
                    const linkedCount = (plan?.contentLinks.length ?? 0) + (plan?.flowItems.length ?? 0);
                    return (
                      <Link
                        key={session.sessionId}
                        to="/campaigns/$campaignId/sessions/$sessionId"
                        params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }}
                        className="prepared-session-card prepared-session-card--link"
                      >
                        <div className="prepared-session-card__summary">
                          <div className="prepared-session-card__title-row">
                            <h4>{session.number ? `#${session.number} ` : ""}{session.title}</h4>
                            <span className={`session-state-badge ${plan?.state === "ready" ? "is-ready" : ""}`}>
                              {plan?.state === "ready" ? t("sessionPage.readyToPlay") : t("sessionPage.prepDraft")}
                            </span>
                          </div>
                          <div className="prepared-session-card__meta">
                            {linkedCount > 0 && <span>{t("sessionPage.linkedElementsCount", { count: linkedCount })}</span>}
                            {(plan?.goals.length ?? 0) > 0 && <span>{t("sessionPage.goalsCount", { count: plan?.goals.length ?? 0 })}</span>}
                          </div>
                          {plan?.summary && <p>{plan.summary}</p>}
                        </div>
                      </Link>
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
                  <Link
                    key={session.sessionId}
                    to="/campaigns/$campaignId/sessions/$sessionId"
                    params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }}
                    className="session-history-item"
                  >
                    <div>
                      <h4>{session.number ? `#${session.number} ` : ""}{session.title}</h4>
                      {session.summary && <p>{session.summary}</p>}
                    </div>
                    <time dateTime={session.endedAt ?? undefined}>
                      {session.endedAt
                        ? new Date(session.endedAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </time>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="session-history-panel__empty">{t("sessionPage.previousSessions")}: 0</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
