import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import type { SessionEvent } from "@core/domain/session/types.js";
import { runSessionAction } from "./sessionFormSubmit.js";
import { NoActiveSessionView } from "./components/NoActiveSessionView.js";
import { SessionStatusBar } from "./components/SessionStatusBar.js";
import { ActiveSessionPrepPanel } from "./components/ActiveSessionPrepPanel.js";
import { QuickCaptureBar } from "./components/QuickCaptureBar.js";
import { SessionEventFeed } from "./components/SessionEventFeed.js";
import { SessionQuickActions, type ActionId } from "./components/SessionQuickActions.js";

export function SessionPage() {
  const { locale } = useTranslation();
  // useParams({ strict: false }) is untyped (any) outside a registered route branch;
  // this narrowing cast matches the established pattern used across other pages (e.g. CommandCenterPage.tsx).
  const { campaignId } = useParams({ strict: false }) as { campaignId?: string };
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { addToast } = useToast();

  const campaignState = store.campaignState;
  // The store types sessionEvents as unknown[]; the server always serializes well-formed SessionEvent records here.
  const sessionEvents = (campaignState?.sessionEvents ?? []) as SessionEvent[];
  const activeSession = (campaignState?.sessions ?? []).find((s) => s.status === "active");

  const setCurrentPage = (page: string) => {
    if (campaignId) runSessionAction(navigate({ to: `/campaigns/${campaignId}/${page}` }), "No se pudo cambiar de sección de sesión.");
  };

  const [activeAction, setActiveAction] = useState<ActionId | null>(null);

  // ── no active session ────────────────────────────────────────────────────

  if (!activeSession) {
    const sessions = campaignState?.sessions ?? [];
    const preparedSessions = [...sessions]
      .filter((session) => session.status === "planned")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt ?? 0).getTime() -
          new Date(b.scheduledAt ?? 0).getTime()
      );
    const recentSessions = [...sessions]
      .filter((s) => s.status === "closed" || s.status === "archived")
      .sort(
        (a, b) =>
          new Date(b.endedAt ?? 0).getTime() -
          new Date(a.endedAt ?? 0).getTime()
      )
      .slice(0, 5);

    const nextNumber = sessions.length + 1;

    return (
      <NoActiveSessionView
        campaignState={campaignState}
        locale={locale}
        hasNoSessions={sessions.length === 0}
        preparedSessions={preparedSessions}
        recentSessions={recentSessions}
        nextNumber={nextNumber}
        createPreparedSession={store.createPreparedSession}
        updateSessionPrep={store.updateSessionPrep}
        cancelSession={store.cancelSession}
        archiveSession={store.archiveSession}
        activateSession={store.activateSession}
        startSession={store.startSession}
        addToast={addToast}
      />
    );
  }

  // ── active session ────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <SessionStatusBar activeSession={activeSession} />

      <ActiveSessionPrepPanel session={activeSession} campaignState={campaignState} />

      <QuickCaptureBar
        campaignState={campaignState}
        activeSession={activeSession}
        createEntity={store.createEntity}
        createRelation={store.createRelation}
        recordSessionEvent={store.recordSessionEvent}
        revealClue={store.revealClue}
        addToast={addToast}
        onOpenCluePanel={() => setActiveAction("pista")}
      />

      <SessionEventFeed
        sessionEvents={sessionEvents}
        sessionId={activeSession.sessionId}
      />

      <SessionQuickActions
        campaignState={campaignState}
        activeSession={activeSession}
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
