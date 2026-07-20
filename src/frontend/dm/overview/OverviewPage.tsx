import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  EyeOff,
  Flag,
  Flame,
  GitFork,
  Lightbulb,
  MapPin,
  Play,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Users,
} from "lucide-react";
import { getCommandCenter, getLiveTable, type CommandCenterResponse, type LiveTableSummary } from "../../shared/api/webProductClient.js";
import { useCampaignStore, type Entity } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { CampaignStarterHub } from "../onboarding/CampaignStarterHub.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { resolveActiveEntity } from "../entities/relations/resolveActiveEntity.js";
import { LiveTableModal } from "../components/LiveTableModal.js";
import { ShortcutsPanel } from "../shortcuts/ShortcutsPanel.js";
import "../../shared/styles/features/dashboard-overview.css";
import "../../shared/styles/features/dm-dashboard.css";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`card dashboard-card ${className}`}>
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

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "warning" | "good";
}) {
  return (
    <span
      className={`dashboard-pill dashboard-pill--${tone}`}
    >
      {children}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      {icon}
      <p className="dashboard-metric-label">{label}</p>
      <strong className="dashboard-metric-value">{value}</strong>
    </Card>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <p className="dashboard-empty-message">{children}</p>;
}

function EntityList({
  items,
  empty,
  onSelect,
}: {
  items: Entity[];
  empty: string;
  onSelect: (entity: Entity) => void;
}) {
  if (items.length === 0) return <EmptyMessage>{empty}</EmptyMessage>;

  return (
    <div className="dashboard-entity-list">
      {items.slice(0, 6).map((entity) => (
        <button
          key={entity.entityId}
          type="button"
          className="dashboard-entity-row"
          onClick={() => onSelect(entity)}
        >
          <span className="dashboard-entity-row__title">{entity.title}</span>
          {entity.importance && <span className="badge badge-default">{entity.importance}</span>}
        </button>
      ))}
    </div>
  );
}

export function OverviewPage() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t, locale } = useTranslation();
  const {
    campaignState,
    updateCampaignSettings,
    updateEntity,
    archiveEntity,
    exportMarkdown,
    setIsEntityModalOpen,
  } = useCampaignStore();

  const [commandCenter, setCommandCenter] = useState<CommandCenterResponse | null>(null);
  const [liveTable, setLiveTable] = useState<LiveTableSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [liveTableModalOpen, setLiveTableModalOpen] = useState(false);
  const [exportingMarkdown, setExportingMarkdown] = useState(false);

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
  const selectedEntity = selectedEntityId ? resolveActiveEntity(entities, selectedEntityId) : null;
  const sessions = campaignState?.sessions ?? [];
  const activeSession = sessions.find((session) => session.status === "active") ?? null;
  const nextPreparedSession = sessions
    .filter((session) => session.status === "planned")
    .sort(
      (left, right) =>
        new Date(left.scheduledAt ?? 0).getTime() - new Date(right.scheduledAt ?? 0).getTime(),
    )[0] ?? null;

  const currentLocation = campaign?.currentLocationId
    ? entities.find((entity) => entity.entityId === campaign.currentLocationId) ?? null
    : null;
  const currentQuest = campaign?.currentQuestId
    ? entities.find((entity) => entity.entityId === campaign.currentQuestId) ?? null
    : (entities.find((e) => e.entityType === "quest" && e.status === "active" && !e.archived) ?? null);

  const npcWarnings: Entity[] = [];
  const blockedQuests: Entity[] = entities.filter(
    (e) => e.entityType === "quest" && e.status === "active" && !e.archived,
  );
  const criticalHiddenClues: Entity[] = entities.filter(
    (e) => e.entityType === "secret" && e.importance === "critical" && !e.archived,
  );
  const preparedClues: Entity[] = entities.filter(
    (e) => e.entityType === "clue" && (e.status === "prepared" || e.status === "hidden") && !e.archived,
  );
  const pendingConsequences: Entity[] = entities.filter(
    (e) => e.entityType === "consequence" && e.status === "pending" && !e.archived,
  );
  const partialKnowledgeAlerts: Array<{ clueId?: string; message: string }> = [];
  const preparationChecklist: Array<{ task: string; priority?: string; done?: boolean }> = [];
  const campaignSettings = campaign && typeof campaign === "object" && "settings" in campaign ? campaign.settings : undefined;
  const rawCompletedTasks =
    campaignSettings && typeof campaignSettings === "object" && "completedChecklistTasks" in campaignSettings
      ? campaignSettings.completedChecklistTasks
      : undefined;
  const completedTasks: string[] = Array.isArray(rawCompletedTasks) ? rawCompletedTasks.filter((task): task is string => typeof task === "string") : [];

  // last session summary for the session prep card
  const lastClosedSession = [...sessions]
    .filter((s) => s.status === "closed" || s.status === "archived")
    .sort((a, b) => new Date(b.endedAt ?? "0").getTime() - new Date(a.endedAt ?? "0").getTime())[0] ?? null;

  const attentionCount =
    npcWarnings.length +
    blockedQuests.length +
    criticalHiddenClues.length +
    pendingConsequences.length +
    partialKnowledgeAlerts.length;

  const attentionTone = useMemo<"danger" | "warning" | "good">(() => {
    if (attentionCount > 8) return "danger";
    if (attentionCount > 0) return "warning";
    return "good";
  }, [attentionCount]);

  const toggleChecklistTask = async (task: string) => {
    const nextTasks = completedTasks.includes(task)
      ? completedTasks.filter((item) => item !== task)
      : [...completedTasks, task];
    await updateCampaignSettings({ completedChecklistTasks: nextTasks });
  };

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

  if (loading && !commandCenter) {
    return <div className="card dashboard-card dashboard-card--loading">{t("common.loading")}</div>;
  }

  if (error && !commandCenter) {
    return (
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
    );
  }

  return (
    <>
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__eyebrow">
              {t("campaignShell.meta.dashboardEyebrow")}
            </p>
            <h1 className="dashboard-header__title">
              {campaign?.title ?? t("campaignShell.defaultTitle")}
            </h1>
            <p className="dashboard-header__description">
              {campaign?.summary ?? t("campaignShell.meta.dashboardDescription")}
            </p>
          </div>

          <div className="dashboard-header__actions">
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
          </div>
        </header>

        <div className="card dashboard-shortcuts">
          <ShortcutsPanel campaignId={campaignId} />
        </div>

        {campaignState && (
          <CampaignStarterHub
            campaignId={campaignId}
            campaignState={campaignState}
            setCurrentPage={navigateToCampaignPage}
          />
        )}

        <section aria-labelledby="command-center-state-title">
          <h2 id="command-center-state-title" className="dashboard-section-label">
            <span>{t("dashboard.currentState")}</span>
            <span aria-hidden="true" />
          </h2>

          <div className="dashboard-metrics-grid">
            <MetricCard
              icon={<BookOpen size={18} />}
              label={t("dashboard.metricPlayersDetail")}
              value={commandCenter?.counts?.entities ?? entities.length}
            />
            <MetricCard
              icon={<EyeOff size={18} />}
              label={t("dashboard.unrevealedCriticalClues")}
              value={criticalHiddenClues.length}
            />
            <MetricCard
              icon={<Lightbulb size={18} />}
              label={t("dashboard.cluesReady")}
              value={preparedClues.length}
            />
            <MetricCard
              icon={<Flag size={18} />}
              label={t("dashboard.metricQuests")}
              value={commandCenter?.openObjectives?.length ?? entities.filter((e) => e.entityType === "quest" && e.status === "active" && !e.archived).length}
            />
          </div>

          <div className="dashboard-state-grid">
            <Card>
              <h3 className="dashboard-card__heading">
                <MapPin size={18} /> {t("dashboard.currentLocation")}
              </h3>
              {currentLocation ? (
                <button
                  className="dashboard-entity-row"
                  type="button"
                  onClick={() => setSelectedEntityId(currentLocation.entityId)}
                >
                  <span className="dashboard-entity-row__title">{currentLocation.title}</span>
                </button>
              ) : (
                <EmptyMessage>{t("dashboard.notSet")}</EmptyMessage>
              )}
            </Card>

            <Card>
              <h3 className="dashboard-card__heading">
                <Flag size={18} /> {t("dashboard.mainQuest")}
              </h3>
              {currentQuest ? (
                <button
                  className="dashboard-entity-row"
                  type="button"
                  onClick={() => setSelectedEntityId(currentQuest.entityId)}
                >
                  <span className="dashboard-entity-row__title">{currentQuest.title}</span>
                </button>
              ) : (
                <EmptyMessage>{t("dashboard.noActiveQuest")}</EmptyMessage>
              )}
            </Card>

            <Card>
              <h3 className="dashboard-card__heading">
                <CalendarDays size={18} /> {t("dashboard.lastSession")}
              </h3>
              {lastClosedSession ? (
                <div className="dashboard-session-summary">
                  <strong>{lastClosedSession.title}</strong>
                  {lastClosedSession.endedAt && (
                    <span className="dashboard-muted-text">
                      {new Date(lastClosedSession.endedAt).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                  {lastClosedSession.summary && (
                    <span className="dashboard-muted-text">
                      {lastClosedSession.summary}
                    </span>
                  )}
                </div>
              ) : (
                <EmptyMessage>{t("dashboard.noPreviousSessions")}</EmptyMessage>
              )}
            </Card>
          </div>
        </section>

        <Card className={`dashboard-attention dashboard-attention--${attentionTone}`}>
          <div className="dashboard-attention__header">
            {attentionCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <h2 className="dashboard-attention__title">{t("dashboard.needsAttention")}</h2>
            <Pill tone={attentionTone}>{attentionCount}</Pill>
          </div>
          {attentionCount === 0 ? (
            <EmptyMessage>{t("dashboard.allClear")}</EmptyMessage>
          ) : (
            <div className="dashboard-attention__items">
              {npcWarnings.length > 0 && (
                <Pill tone="warning">{t("dashboard.forgottenNpcs")}: {npcWarnings.length}</Pill>
              )}
              {blockedQuests.length > 0 && (
                <Pill tone="danger">{t("dashboard.blockedQuests")}: {blockedQuests.length}</Pill>
              )}
              {criticalHiddenClues.length > 0 && (
                <Pill tone="danger">{t("dashboard.unrevealedCriticalClues")}: {criticalHiddenClues.length}</Pill>
              )}
              {pendingConsequences.length > 0 && (
                <Pill tone="warning">{t("dashboard.pendingConsequences")}: {pendingConsequences.length}</Pill>
              )}
              {partialKnowledgeAlerts.length > 0 && (
                <Pill tone="warning">{t("whatNowPage.partialKnowledge")}: {partialKnowledgeAlerts.length}</Pill>
              )}
            </div>
          )}
        </Card>

        <div className="dashboard-prep-grid">
          <Card>
            <h2 className="dashboard-card__heading">
              <CheckCircle2 size={18} /> {t("whatNowPage.prepTitle")}
            </h2>
            {preparationChecklist.length === 0 ? (
              <EmptyMessage>{t("dashboard.noPreparedClues")}</EmptyMessage>
            ) : (
              <div className="dashboard-checklist">
                {preparationChecklist.map((item) => {
                  const checked = item.done === true || completedTasks.includes(item.task);
                  return (
                    <label
                      key={item.task}
                      className="dashboard-checklist__item"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          runCommandCenterAction(toggleChecklistTask(item.task), "No se pudo actualizar la tarea de preparación.");
                        }}
                      />
                      <span
                        className={`dashboard-checklist__label ${checked ? "is-complete" : ""}`}
                      >
                        {item.task}
                      </span>
                      {item.priority && <span className="badge badge-default">{item.priority}</span>}
                    </label>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="dashboard-card__heading">
              <Share2 size={18} /> {t("whatNowPage.confusionRisks")}
            </h2>
            {partialKnowledgeAlerts.length === 0 ? (
              <EmptyMessage>{t("whatNowPage.noConfusionRisks")}</EmptyMessage>
            ) : (
              <div className="dashboard-risk-list">
                {partialKnowledgeAlerts.map((alert, index) => (
                  <div
                    key={alert.clueId ?? alert.message ?? index}
                    className="dashboard-risk-item"
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="dashboard-entity-grids">
          <Card>
            <h2 className="dashboard-card__heading">
              <Users size={18} /> {t("dashboard.forgottenNpcs")}
            </h2>
            <EntityList
              items={npcWarnings}
              empty={t("dashboard.noneMasculine")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 className="dashboard-card__heading">
              <Flag size={18} /> {t("dashboard.blockedQuests")}
            </h2>
            <EntityList
              items={blockedQuests}
              empty={t("dashboard.noneFeminine")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 className="dashboard-card__heading">
              <EyeOff size={18} /> {t("whatNowPage.criticalClues")}
            </h2>
            <EntityList
              items={[...criticalHiddenClues, ...preparedClues]}
              empty={t("whatNowPage.noCriticalClues")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 className="dashboard-card__heading">
              <Flame size={18} /> {t("whatNowPage.readyConsequences")}
            </h2>
            <EntityList
              items={pendingConsequences}
              empty={t("whatNowPage.noPendingConsequences")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>
        </div>

        <div className="dashboard-session-grid">
          <Card>
            <h2 className="dashboard-card__heading">
              <CalendarDays size={18} /> {t("dashboard.nextSessionPrep")}
            </h2>
            <p className="dashboard-recap">
              {commandCenter?.recap ?? lastClosedSession?.summary ?? t("dashboard.noPreviousSessions")}
            </p>
            {activeSession ? (
              <Pill tone="good">{t("dashboard.runningSessionTitle", { title: activeSession.title })}</Pill>
            ) : nextPreparedSession ? (
              <Pill tone="good">{t("dashboard.nextPreparedSessionTitle", { title: nextPreparedSession.title })}</Pill>
            ) : (
              <Pill>{t("dashboard.noPreparedSessionTitle")}</Pill>
            )}
            {liveTable && <div className="dashboard-live-table"><Pill tone="good">{liveTable.shortCode}</Pill></div>}
          </Card>

          <Card>
            <h2 className="dashboard-card__heading">
              <Activity size={18} /> {t("dashboard.recentlyUpdated")}
            </h2>
            <div className="dashboard-activity-list">
              {(commandCenter?.recentActivity ?? []).slice(0, 6).map((item) => (
                <div
                  key={item.activityId}
                  className="dashboard-activity-item"
                >
                  <strong>{item.type}</strong>
                  <br />
                  {new Date(item.occurredAt).toLocaleString(locale)}
                </div>
              ))}
              {!(commandCenter?.recentActivity ?? []).length && (
                <EmptyMessage>{t("dashboard.noRecentChanges")}</EmptyMessage>
              )}
            </div>
          </Card>
        </div>

        <section aria-labelledby="command-center-actions-title">
          <h2 id="command-center-actions-title" className="dashboard-section-label">
            <span>{t("dashboard.quickActions")}</span>
            <span aria-hidden="true" />
          </h2>
          <div className="dashboard-quick-actions">
            <button
              className="btn btn-primary dashboard-quick-action dashboard-quick-action--theme-accents-primary-foreground"
              type="button"
              onClick={() => navigateToCampaignPage("sessions")}
            >
              <Play size={20} /> <span>{t("dashboard.startSession")}</span>
            </button>
            <button
              className="btn btn-secondary dashboard-quick-action"
              type="button"
              onClick={() => setIsEntityModalOpen(true)}
            >
              <Plus size={20} /> <span>{t("campaignShell.newEntity")}</span>
            </button>
            <button
              className="btn btn-secondary dashboard-quick-action"
              type="button"
              onClick={() => navigateToCampaignPage("map/network")} // Network tab under map
            >
              <GitFork size={20} /> <span>{t("dashboard.viewGraph")}</span>
            </button>
            <button
              className="btn btn-secondary dashboard-quick-action"
              type="button"
              onClick={() => navigateToCampaignPage("library/list")} // List tab under library
            >
              <Search size={20} /> <span>{t("dashboard.globalSearch")}</span>
            </button>
            <button
              className="btn btn-secondary dashboard-quick-action"
              type="button"
              onClick={() => {
                runCommandCenterAction(
                  navigate({ to: "/player/campaigns/$campaignId/overview", params: { campaignId } }),
                  "No se pudo abrir el portal de jugadores.",
                );
              }}
            >
              <Share2 size={20} /> <span>{t("dashboard.openPlayerPortal")}</span>
            </button>
            <button
              className="btn btn-secondary dashboard-quick-action"
              type="button"
              onClick={() => {
                runCommandCenterAction(handleMarkdownExport(), "No se pudo exportar la campaña en Markdown.");
              }}
              disabled={exportingMarkdown}
            >
              <Download size={20} />
              <span>
                {exportingMarkdown
                  ? t("dashboard.exportingMarkdown")
                  : t("dashboard.exportMarkdown")}
              </span>
            </button>
          </div>
        </section>
      </div>

      {selectedEntity && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setSelectedEntityId(null)}
          onSelectEntity={setSelectedEntityId}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
          }}
          addToast={addToast}
        />
      )}

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
