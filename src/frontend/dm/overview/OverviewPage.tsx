import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  GitFork,
  Play,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react";
import { getCommandCenter, getLiveTable, type CommandCenterResponse, type LiveTableSummary } from "../../shared/api/webProductClient.js";
import { useCampaignStore, type Entity } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { CampaignStarterHub } from "../onboarding/CampaignStarterHub.js";
import { LiveTableModal } from "../components/LiveTableModal.js";
import { ShortcutsPanel } from "../shortcuts/ShortcutsPanel.js";
import { CampaignWorkspace } from "../workspaces/CampaignWorkspace.js";
import { CampaignStatusStrip } from "./components/CampaignStatusStrip.js";
import { DashboardCommandBar } from "./components/DashboardCommandBar.js";
import { AttentionQueue } from "./components/AttentionQueue.js";
import { NarrativeStateChart } from "./components/NarrativeStateChart.js";
import { RecentActivityTimeline } from "./components/RecentActivityTimeline.js";
import { SessionCadenceTimeline } from "./components/SessionCadenceTimeline.js";
import { SessionControlPanel } from "./components/SessionControlPanel.js";
import { Pill } from "../../shared/components/Pill.js";
import "../../shared/styles/features/dashboard-overview.css";
import "../../shared/styles/features/dm-dashboard.css";

type CardOrnament = "full" | "standard" | "primary" | "accent";

const CARD_ORNAMENT_CLASS: Record<CardOrnament, string> = {
  full: "dm-panel--ornamented",
  standard: "dm-panel--ornamented-standard",
  primary: "dm-panel--ornamented-primary",
  accent: "dm-panel--ornamented-accent",
};

function Card({
  children,
  className = "",
  ornament,
}: {
  children: React.ReactNode;
  className?: string;
  ornament?: CardOrnament;
}) {
  const ornamentClass = ornament ? CARD_ORNAMENT_CLASS[ornament] : "";

  return (
    <section className={`card dashboard-card dm-panel ${ornamentClass} ${className}`.trim()}>
      {children}
    </section>
  );
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function runCommandCenterAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function OverviewPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t, locale } = useTranslation();
  const {
    campaignState,
    exportMarkdown,
    setIsEntityModalOpen,
  } = useCampaignStore();

  const [commandCenter, setCommandCenter] = useState<CommandCenterResponse | null>(null);
  const [liveTable, setLiveTable] = useState<LiveTableSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveTableModalOpen, setLiveTableModalOpen] = useState(false);
  const [exportingMarkdown, setExportingMarkdown] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const navigateToCampaignPage = (page: string) => {
    runCommandCenterAction(
      navigate({ to: `/campaigns/${campaignId}/${page}` }),
      "No se pudo abrir la sección de campaña.",
    );
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [center, live] = await Promise.all([
        getCommandCenter(campaignId),
        getLiveTable(campaignId).catch(() => ({ liveTable: null })),
      ]);
      setCommandCenter(center);
      setLiveTable(live.liveTable ?? null);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCommandCenterAction(load(), "No se pudo cargar el centro de mando.");
  }, [campaignId]);

  const campaign = campaignState?.campaign ?? commandCenter?.campaign ?? null;
  const entities: Entity[] = campaignState?.entities ?? [];
  const sessions = campaignState?.sessions ?? [];
  const activeSession = sessions.find((session) => session.status === "active") ?? null;
  const nextPreparedSession = sessions
    .filter((session) => session.status === "planned")
    .sort(
      (left, right) =>
        new Date(left.scheduledAt ?? 0).getTime() - new Date(right.scheduledAt ?? 0).getTime(),
    )[0] ?? null;

  const npcWarnings: Entity[] = useMemo(() => {
    return entities.filter((e) => {
      if (e.entityType !== "npc" || e.archived) return false;
      const isHighOrCritical = e.importance === "high" || e.importance === "critical";
      if (!isHighOrCritical) return false;
      if (e.status === "warning" || e.status === "stale") return true;
      const hasRelations = (campaignState?.relations ?? []).some(
        (r) => r.sourceEntityId === e.entityId || r.targetEntityId === e.entityId
      );
      return !hasRelations;
    });
  }, [entities, campaignState?.relations]);

  const blockedQuests: Entity[] = useMemo(() => {
    return entities.filter(
      (e) => e.entityType === "quest" && e.status === "blocked" && !e.archived
    );
  }, [entities]);

  const criticalHiddenClues: Entity[] = useMemo(() => {
    return entities.filter(
      (e) => e.entityType === "clue" && e.importance === "critical" && e.status === "hidden" && !e.archived
    );
  }, [entities]);

  const criticalHiddenSecrets: Entity[] = useMemo(() => {
    return entities.filter(
      (e) => e.entityType === "secret" && e.importance === "critical" && e.status === "hidden" && !e.archived
    );
  }, [entities]);

  const preparedClues: Entity[] = useMemo(() => {
    return entities.filter(
      (e) => e.entityType === "clue" && (e.status === "prepared" || e.status === "hidden") && !e.archived
    );
  }, [entities]);

  const pendingConsequences: Entity[] = useMemo(() => {
    return entities.filter(
      (e) => e.entityType === "consequence" && e.status === "pending" && !e.archived
    );
  }, [entities]);

  const partialKnowledgeAlerts = useMemo(() => {
    return (commandCenter?.unresolvedClues ?? []).slice(0, 6).map((clue: Record<string, unknown>) => {
      const entityId = typeof clue.entityId === "string" ? clue.entityId : undefined;
      const id = typeof clue.id === "string" ? clue.id : undefined;
      const title = typeof clue.title === "string" ? clue.title : undefined;
      return {
        clueId: entityId || id,
        message: title || t("dashboard.unresolvedClueAlertFallback"),
      };
    });
  }, [commandCenter?.unresolvedClues]);

  const preparationChecklist = useMemo(() => {
    const list: Array<{ id: string; label: string; priority: "normal" | "high" }> = [];
    for (const clue of preparedClues.slice(0, 3)) {
      list.push({ id: `clue:${clue.entityId}`, label: t("whatNowPage.checklistRevealClue", { title: clue.title }), priority: "normal" });
    }
    for (const quest of blockedQuests.slice(0, 3)) {
      list.push({ id: `quest:${quest.entityId}`, label: t("whatNowPage.checklistUnblockQuest", { title: quest.title }), priority: "high" });
    }
    for (const consequence of pendingConsequences.slice(0, 3)) {
      list.push({ id: `consequence:${consequence.entityId}`, label: t("whatNowPage.checklistResolveConsequence", { title: consequence.title }), priority: "high" });
    }
    for (const npc of npcWarnings.slice(0, 3)) {
      list.push({ id: `npc:${npc.entityId}`, label: t("whatNowPage.checklistUpdateNpc", { title: npc.title }), priority: "normal" });
    }
    return list.slice(0, 6);
  }, [preparedClues, blockedQuests, pendingConsequences, npcWarnings, t]);

  // last session summary for the session prep card
  const lastClosedSession = [...sessions]
    .filter((s) => s.status === "closed" || s.status === "archived")
    .sort((a, b) => new Date(b.endedAt ?? "0").getTime() - new Date(a.endedAt ?? "0").getTime())[0] ?? null;

  const pendingProposalsCount =
    commandCenter?.attention.find((item) => item.type === "player_proposals")?.count ?? 0;

  const attentionCount =
    npcWarnings.length +
    blockedQuests.length +
    criticalHiddenClues.length +
    criticalHiddenSecrets.length +
    pendingConsequences.length +
    partialKnowledgeAlerts.length +
    pendingProposalsCount;

  const attentionTone = useMemo<"danger" | "warning" | "good">(() => {
    if (attentionCount > 8) return "danger";
    if (attentionCount > 0) return "warning";
    return "good";
  }, [attentionCount]);

  const attentionChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; count: number; tone: "danger" | "warning" }> = [
      { key: "criticalClues", label: t("dashboard.unrevealedCriticalClues"), count: criticalHiddenClues.length, tone: "danger" },
      { key: "criticalSecrets", label: t("dashboard.unrevealedCriticalSecrets"), count: criticalHiddenSecrets.length, tone: "danger" },
      { key: "blockedQuests", label: t("dashboard.blockedQuests"), count: blockedQuests.length, tone: "danger" },
      { key: "pendingProposals", label: t("players.pendingProposals"), count: pendingProposalsCount, tone: "warning" },
      { key: "pendingConsequences", label: t("dashboard.pendingConsequences"), count: pendingConsequences.length, tone: "warning" },
      { key: "forgottenNpcs", label: t("dashboard.forgottenNpcs"), count: npcWarnings.length, tone: "warning" },
      { key: "partialKnowledge", label: t("whatNowPage.partialKnowledge"), count: partialKnowledgeAlerts.length, tone: "warning" },
    ];
    return chips.filter((chip) => chip.count > 0).slice(0, 4);
  }, [
    criticalHiddenClues.length,
    criticalHiddenSecrets.length,
    blockedQuests.length,
    pendingProposalsCount,
    pendingConsequences.length,
    npcWarnings.length,
    partialKnowledgeAlerts.length,
    t,
  ]);

  const toggleChecklistTask = (task: string) => {
    setCompletedTasks((prev) =>
      prev.includes(task) ? prev.filter((entry) => entry !== task) : [...prev, task],
    );
  };

  const groupedActivity = useMemo(() => {
    const items = commandCenter?.recentActivity ?? [];
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      value !== null && typeof value === "object" && !Array.isArray(value);
    const asRecord = (content: unknown): Record<string, unknown> | undefined =>
      isRecord(content) ? content : undefined;
    const groups: Array<{ key: string; type: string; count: number; latestOccurredAt: string; data?: Record<string, unknown> }> = [];
    for (const item of items) {
      const existing = groups.find((g) => g.type === item.type);
      if (existing) {
        existing.count += 1;
        if (item.occurredAt > existing.latestOccurredAt) {
          existing.latestOccurredAt = item.occurredAt;
          existing.data = asRecord(item.content);
        }
      } else {
        groups.push({
          key: item.activityId,
          type: item.type,
          count: 1,
          latestOccurredAt: item.occurredAt,
          data: asRecord(item.content),
        });
      }
    }
    return groups
      .sort((a, b) => (a.latestOccurredAt < b.latestOccurredAt ? 1 : -1))
      .slice(0, 5);
  }, [commandCenter?.recentActivity]);

  const handleMarkdownExport = async () => {
    setExportingMarkdown(true);
    try {
      const result = await exportMarkdown();
      addToast(
        result.path
          ? t("dashboard.markdownExportedWithPath")
          : t("dashboard.markdownExported"),
        "success",
      );
    } catch (exportError) {
      addToast(
        t("dashboard.markdownExportError", {
          error: toErrorMessage(exportError),
        }),
        "error",
      );
    } finally {
      setExportingMarkdown(false);
    }
  };

  const rawSummary = campaign?.summary ?? t("campaignShell.meta.dashboardDescription");
  const displaySummary = rawSummary.length > 70 ? rawSummary.slice(0, 67) + "..." : rawSummary;

  const workspaceActions = (
    <>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => {
          runCommandCenterAction(load(), "No se pudo recargar el centro de mando.");
        }}
      >
        <RefreshCw size={16} /> {t("campaignShell.loading.retry")}
      </button>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => navigateToCampaignPage("library/list")}
      >
        <Search size={16} /> {t("campaignShell.nav.search")}
      </button>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => setLiveTableModalOpen(true)}
      >
        <Play size={16} /> {t("dashboard.runSession")}
      </button>
    </>
  );

  if (loading && !commandCenter) {
    return (
      <CampaignWorkspace
        titleKey="campaignShell.meta.dashboardEyebrow"
        description={displaySummary}
        size="wide"
        variant="operational"
        actions={workspaceActions}
      >
        <div className="dashboard-page">
          <div className="card dashboard-card dashboard-card--loading">{t("common.loading")}</div>
        </div>
      </CampaignWorkspace>
    );
  }

  if (error && !commandCenter) {
    return (
      <CampaignWorkspace
        titleKey="campaignShell.meta.dashboardEyebrow"
        description={displaySummary}
        size="wide"
        variant="operational"
        actions={workspaceActions}
      >
        <div className="dashboard-page">
          <div className="card dashboard-card dashboard-card--error">
            <p className="dashboard-error-message">{error}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                runCommandCenterAction(load(), "No se pudo recargar el centro de mando.");
              }}
            >
              <RefreshCw size={16} /> {t("campaignShell.loading.retry")}
            </button>
          </div>
        </div>
      </CampaignWorkspace>
    );
  }

  return (
    <>
      <CampaignWorkspace
        titleKey="campaignShell.meta.dashboardEyebrow"
        description={displaySummary}
      size="wide"
      variant="operational"
      actions={workspaceActions}
    >
      <div className="dashboard-page">

        <DashboardCommandBar
          label={t("dashboard.quickActions")}
          commands={[
            { key: "new-entity", label: t("campaignShell.newEntity"), icon: <Plus size={15} />, onClick: () => setIsEntityModalOpen(true) },
            { key: "view-graph", label: t("dashboard.viewGraph"), icon: <GitFork size={15} />, onClick: () => navigateToCampaignPage("map/network") },
            {
              key: "player-portal",
              label: t("dashboard.openPlayerPortal"),
              icon: <Share2 size={15} />,
              onClick: () => {
                runCommandCenterAction(
                  navigate({ to: "/player/campaigns/$campaignId/overview", params: { campaignId } }),
                  "No se pudo abrir el portal de jugadores.",
                );
              },
            },
            {
              key: "export-markdown",
              label: exportingMarkdown ? t("dashboard.exportingMarkdown") : t("dashboard.exportMarkdown"),
              icon: <Download size={15} />,
              onClick: () => runCommandCenterAction(handleMarkdownExport(), "No se pudo exportar la campaña en Markdown."),
              disabled: exportingMarkdown,
            },
          ]}
        />

        <div className="card dashboard-shortcuts dashboard-section-gap">
          <ShortcutsPanel campaignId={campaignId} />
        </div>

        <CampaignStatusStrip
          label={t("dashboard.metricEntities")}
          metrics={[
            { key: "entities", label: t("dashboard.metricEntities"), value: commandCenter?.counts.entities ?? entities.length, onClick: () => navigateToCampaignPage("library/list") },
            { key: "hidden-secrets", label: t("dashboard.unrevealedCriticalSecrets"), value: commandCenter?.counts.hiddenSecrets ?? criticalHiddenSecrets.length, onClick: () => navigateToCampaignPage("library/list") },
            { key: "quests", label: t("dashboard.quests"), value: commandCenter?.counts.objectives ?? 0, onClick: () => navigateToCampaignPage("library/list") },
            { key: "sessions", label: t("campaignShell.meta.sessionTitle"), value: commandCenter?.counts.sessions ?? sessions.length, onClick: () => navigateToCampaignPage("sessions") },
          ]}
        />

        <div className="dashboard-command-grid">
          <section className="dashboard-command-panel" aria-labelledby="narrative-state-title">
            <div className="dashboard-command-panel__header">
              <h2 id="narrative-state-title">{t("dashboard.currentState")}</h2>
              <button type="button" className="btn btn-link btn-sm" onClick={() => navigateToCampaignPage("library/list")}>{t("dashboard.reviewAttention")}</button>
            </div>
            <NarrativeStateChart state={commandCenter?.narrativeState} label={t("dashboard.currentState")} />
          </section>
          <section className="dashboard-command-panel" aria-labelledby="attention-queue-title">
            <div className="dashboard-command-panel__header">
              <h2 id="attention-queue-title">{t("dashboard.needsAttention")}</h2>
              <Pill tone={attentionTone}>{attentionCount}</Pill>
            </div>
            <AttentionQueue
              items={attentionChips}
              total={attentionCount}
              emptyMessage={t("dashboard.allClear")}
              onSelect={() => navigateToCampaignPage("library/list")}
            />
          </section>
        </div>

        <div className="dashboard-command-grid dashboard-command-grid--secondary">
          <section className="dashboard-command-panel" aria-labelledby="session-cadence-title">
            <div className="dashboard-command-panel__header"><h2 id="session-cadence-title">{t("dashboard.lastSession")}</h2><button type="button" className="btn btn-link btn-sm" onClick={() => navigateToCampaignPage("sessions")}>{t("campaignShell.nav.session")}</button></div>
            <SessionCadenceTimeline sessions={[lastClosedSession, activeSession, nextPreparedSession]} emptyMessage="No sessions yet." />
          </section>
          <section className="dashboard-command-panel" aria-labelledby="recent-activity-title">
            <div className="dashboard-command-panel__header"><h2 id="recent-activity-title">{t("dashboard.recentlyUpdated")}</h2><button type="button" className="btn btn-link btn-sm" onClick={() => navigateToCampaignPage("story/history")}>{t("dashboard.viewHistory")}</button></div>
            <RecentActivityTimeline items={groupedActivity} locale={locale} emptyMessage={t("dashboard.noRecentChanges")} />
          </section>
        </div>

        <SessionControlPanel
          sectionLabel={t("dashboard.nextSessionPrep")}
          sectionId="continuity-section-title"
          title={activeSession ? t("dashboard.runningSessionTitle", { title: activeSession.title }) : nextPreparedSession ? t("dashboard.nextPreparedSessionTitle", { title: nextPreparedSession.title }) : t("dashboard.noPreparedSessionTitle")}
          recapTitle={t("dashboard.lastSession")}
          recap={commandCenter?.recap ?? lastClosedSession?.summary}
          attentionChips={attentionChips}
          primaryAction={activeSession ? (
            <button className="btn btn-primary dashboard-continuity-panel__action" type="button" onClick={() => setLiveTableModalOpen(true)}>
              <Play size={16} /> {t("dashboard.runSession")}
            </button>
          ) : (
            <button className="btn btn-primary dashboard-continuity-panel__action" type="button" onClick={() => navigateToCampaignPage("sessions")}>
              {nextPreparedSession ? <Play size={16} /> : <Plus size={16} />} {t("dashboard.startSession")}
            </button>
          )}
          secondaryAction={(
            <button className="btn btn-secondary dashboard-continuity-panel__action" type="button" onClick={() => navigateToCampaignPage("sessions")}>
              {t("campaignShell.nav.session")}
            </button>
          )}
          liveTableLabel="Portal Live"
          liveTableCode={liveTable?.shortCode}
        />

        {(preparationChecklist.length > 0 || partialKnowledgeAlerts.length > 0) ? (
          <div className="dashboard-prep-grid">
            {preparationChecklist.length > 0 && (
              <Card ornament="accent">
                <h2 className="dashboard-card__heading">
                  <CheckCircle2 size={18} /> {t("whatNowPage.prepTitle")}
                </h2>
                <div className="dashboard-checklist">
                  {preparationChecklist.map((item) => (
                    <label key={item.id} className="dashboard-checklist__item">
                      <input
                        type="checkbox"
                        checked={completedTasks.includes(item.id)}
                        onChange={() => toggleChecklistTask(item.id)}
                      />
                      <span className={`dashboard-checklist__label ${completedTasks.includes(item.id) ? "is-complete" : ""}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {partialKnowledgeAlerts.length > 0 && (
              <Card ornament="accent">
                <h2 className="dashboard-card__heading">
                  <Share2 size={18} /> {t("whatNowPage.confusionRisks")}
                </h2>
                <div className="dashboard-risk-list">
                  {partialKnowledgeAlerts.map((alert, index) => (
                    <div key={index} className="dashboard-risk-item">{alert.message}</div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card ornament="standard" className="dashboard-prep-all-clear">
            <div className="dashboard-prep-all-clear__content">
              <CheckCircle2 size={36} className="dashboard-prep-all-clear__icon" />
              <h2 className="dashboard-prep-all-clear__title">
                {t("dashboard.allClear")}
              </h2>
              <p className="dashboard-prep-all-clear__description">
                {t("dashboard.allPreparedDetail")}
              </p>
            </div>
          </Card>
        )}

        {campaignState && (
          <CampaignStarterHub
            campaignId={campaignId}
            campaignState={campaignState}
            setCurrentPage={navigateToCampaignPage}
          />
        )}

      </div>
    </CampaignWorkspace>

      <LiveTableModal
        campaignId={campaignId}
        isOpen={liveTableModalOpen}
        onClose={() => setLiveTableModalOpen(false)}
        activeSessionId={activeSession?.sessionId ?? nextPreparedSession?.sessionId ?? null}
        initialLiveTable={liveTable}
        onLiveTableChange={setLiveTable}
      />
    </>
  );
}
