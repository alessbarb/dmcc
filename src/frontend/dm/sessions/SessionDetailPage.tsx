import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Archive, GitFork, Play, Waypoints, X } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import type { SessionEvent } from "@core/domain/session/types.js";
import { errorMessage, runSessionAction } from "./sessionFormSubmit.js";
import { SessionPlanEditor } from "./components/SessionPlanEditor.js";
import { SessionStatusBar } from "./components/SessionStatusBar.js";
import { ActiveSessionPrepPanel } from "./components/ActiveSessionPrepPanel.js";
import { QuickCaptureBar } from "./components/QuickCaptureBar.js";
import { SessionEventFeed } from "./components/SessionEventFeed.js";
import { SessionQuickActions, type ActionId } from "./components/SessionQuickActions.js";
import "./session-workspace.css";
import "./components/session-idle.css";
import "./components/prepared-session.css";
import "./components/session-history.css";
import "./components/session-forms.css";

export function SessionDetailPage() {
  const { t, locale } = useTranslation();
  const { campaignId, sessionId } = useParams({ strict: false }) as { campaignId?: string; sessionId?: string };
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { addToast } = useToast();
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);

  const campaignState = store.campaignState;
  const sessions = campaignState?.sessions ?? [];
  const session = sessions.find((candidate) => candidate.sessionId === sessionId);
  // sessionEvents is untyped (unknown[]) in the store; the server only ever populates it with SessionEvent records.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const sessionEvents = (campaignState?.sessionEvents ?? []) as SessionEvent[];

  const setCurrentPage = (page: string) => {
    if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/${page}` }), "No se pudo cambiar de sección de sesión.");
  };

  if (!session) {
    return (
      <div className="session-page">
        <p>{t("sessionPage.sessionNotFound")}</p>
        <Link to="/campaigns/$campaignId/sessions" params={{ campaignId: campaignId ?? "" }} className="btn btn-secondary btn-sm">
          {t("sessionPage.backToSessions")}
        </Link>
      </div>
    );
  }

  if (session.status === "planned") {
    const handleSavePlan = async (title: string, plan: Omit<NonNullable<typeof session.plan>, "revision">, scheduledAt?: string) => {
      try {
        await store.reviseSessionPlan(session.sessionId, {
          title,
          scheduledAt,
          expectedRevision: session.plan?.revision ?? 0,
          plan,
        });
        addToast(t("toasts.sessionPrepUpdated", { title }), "success");
      } catch (error) {
        addToast(t("toasts.sessionPrepUpdateError", { error: errorMessage(error) }), "error");
      }
    };

    const handleActivate = async () => {
      try {
        await store.activateSession(session.sessionId);
        addToast(t("toasts.sessionActivated", { title: session.title }), "success");
      } catch (error) {
        addToast(t("toasts.sessionActivateError", { error: errorMessage(error) }), "error");
      }
    };

    const handleCancel = async () => {
      if (!window.confirm(t("sessionPage.cancelPreparedConfirm", { title: session.title }))) return;
      try {
        await store.cancelSession(session.sessionId);
        addToast(t("toasts.sessionCancelled", { title: session.title }), "info");
        if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/sessions` }), "No se pudo volver a la lista de sesiones.");
      } catch (error) {
        addToast(t("toasts.sessionCancelError", { error: errorMessage(error) }), "error");
      }
    };

    const handleArchive = async () => {
      if (!window.confirm(t("sessionPage.archivePreparedConfirm", { title: session.title }))) return;
      try {
        await store.archiveSession(session.sessionId);
        addToast(t("toasts.sessionArchived", { title: session.title }), "info");
        if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/sessions` }), "No se pudo volver a la lista de sesiones.");
      } catch (error) {
        addToast(t("toasts.sessionArchiveError", { error: errorMessage(error) }), "error");
      }
    };

    return (
      <div className="session-page">
        <div className="prepared-session-card__actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => runSessionAction(handleActivate(), "No se pudo activar la sesión preparada.")}>
            <Play size={14} /> {t("sessionPage.activatePreparedSessionButton")}
          </button>
          <button type="button" className="btn btn-icon btn-secondary btn-sm" onClick={() => runSessionAction(handleCancel(), "No se pudo cancelar la sesión preparada.")} title={t("sessionPage.cancelPreparedSessionButton")}>
            <X size={14} />
          </button>
          <button type="button" className="btn btn-icon btn-secondary btn-sm" onClick={() => runSessionAction(handleArchive(), "No se pudo archivar la sesión preparada.")} title={t("sessionPage.archivePreparedSessionButton")}>
            <Archive size={14} />
          </button>
          <Link to="/campaigns/$campaignId/sessions/$sessionId/map" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
            <Waypoints size={14} /> {t("sessionNarrativeMap.title")}
          </Link>
          <Link to="/campaigns/$campaignId/sessions/$sessionId/consequences" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
            <GitFork size={14} /> {t("sessionConsequenceChain.title")}
          </Link>
        </div>
        <SessionPlanEditor
          session={session}
          campaignState={campaignState}
          onSave={(title, plan, scheduledAt) => handleSavePlan(title, plan, scheduledAt)}
          onCancel={() => {
            if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/sessions` }), "No se pudo volver a la lista de sesiones.");
          }}
        />
      </div>
    );
  }

  if (session.status === "active") {
    return (
      <div className="session-page session-active-workspace">
        <SessionStatusBar activeSession={session} />
        <Link to="/campaigns/$campaignId/sessions/$sessionId/map" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
          <Waypoints size={14} /> {t("sessionNarrativeMap.title")}
        </Link>
        <Link to="/campaigns/$campaignId/sessions/$sessionId/consequences" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
          <GitFork size={14} /> {t("sessionConsequenceChain.title")}
        </Link>
        <ActiveSessionPrepPanel session={session} campaignState={campaignState} />
        <QuickCaptureBar
          campaignState={campaignState}
          activeSession={session}
          createEntity={store.createEntity}
          createRelation={store.createRelation}
          recordSessionEvent={store.recordSessionEvent}
          revealClue={store.revealClue}
          addToast={addToast}
          onOpenCluePanel={() => setActiveAction("pista")}
        />
        <SessionEventFeed sessionEvents={sessionEvents} sessionId={session.sessionId} />
        <SessionQuickActions
          campaignState={campaignState}
          activeSession={session}
          activeAction={activeAction}
          onSelectAction={setActiveAction}
          createEntity={store.createEntity}
          createRelation={store.createRelation}
          recordSessionEvent={store.recordSessionEvent}
          revealClue={store.revealClue}
          closeSession={store.closeSession}
          setCurrentPage={setCurrentPage}
          addToast={addToast}
        />
      </div>
    );
  }

  return (
    <div className="session-page">
      <section className="session-history-item">
        <h2>{session.number ? `#${session.number} ` : ""}{session.title}</h2>
        {session.summary && <p>{session.summary}</p>}
        <time dateTime={session.endedAt ?? undefined}>
          {session.endedAt
            ? new Date(session.endedAt).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </time>
        <Link to="/campaigns/$campaignId/sessions/$sessionId/map" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
          <Waypoints size={14} /> {t("sessionNarrativeMap.title")}
        </Link>
        <Link to="/campaigns/$campaignId/sessions/$sessionId/consequences" params={{ campaignId: campaignId ?? "", sessionId: session.sessionId }} className="btn btn-secondary btn-sm">
          <GitFork size={14} /> {t("sessionConsequenceChain.title")}
        </Link>
      </section>
    </div>
  );
}
