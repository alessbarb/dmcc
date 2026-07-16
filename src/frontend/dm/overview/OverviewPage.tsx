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

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section className="card" style={{ padding: 18, ...style }}>
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
  const background =
    tone === "danger"
      ? "rgba(239, 68, 68, .12)"
      : tone === "warning"
        ? "rgba(245, 158, 11, .14)"
        : tone === "good"
          ? "rgba(34, 197, 94, .12)"
          : "rgba(148, 163, 184, .12)";
  const border =
    tone === "danger"
      ? "rgba(239, 68, 68, .35)"
      : tone === "warning"
        ? "rgba(245, 158, 11, .35)"
        : tone === "good"
          ? "rgba(34, 197, 94, .3)"
          : "rgba(148, 163, 184, .24)";

  return (
    <span
      style={{
        border: `1px solid ${border}`,
        background,
        borderRadius: 999,
        padding: "4px 9px",
        fontSize: 12,
        color: "var(--theme-text-primary)",
      }}
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
      <p style={{ margin: "8px 0 0", color: "var(--theme-text-secondary)", fontSize: 12 }}>{label}</p>
      <strong style={{ fontSize: 28 }}>{value}</strong>
    </Card>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, color: "var(--theme-text-secondary)", fontSize: 14 }}>{children}</p>;
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
    <div style={{ display: "grid", gap: 8 }}>
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
  const completedTasks: string[] =
    (campaign as unknown as { settings?: { completedChecklistTasks?: string[] } })?.settings?.completedChecklistTasks ?? [];

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
    return <div className="card" style={{ padding: 32 }}>{t("common.loading")}</div>;
  }

  if (error && !commandCenter) {
    return (
      <div className="card" style={{ padding: 32, display: "grid", gap: 16 }}>
        <p style={{ margin: 0, color: "var(--color-danger)" }}>{error}</p>
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
      <div className="dashboard-page" style={{ display: "grid", gap: 24 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "var(--theme-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                fontSize: 12,
              }}
            >
              {t("campaignShell.meta.dashboardEyebrow")}
            </p>
            <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
              {campaign?.title ?? t("campaignShell.defaultTitle")}
            </h1>
            <p style={{ margin: "8px 0 0", color: "var(--theme-text-secondary)", maxWidth: 760 }}>
              {campaign?.summary ?? t("campaignShell.meta.dashboardDescription")}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

        <div className="card" style={{ padding: 16 }}>
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
            }}
          >
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            <Card>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
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
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
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
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
                <CalendarDays size={18} /> {t("dashboard.lastSession")}
              </h3>
              {lastClosedSession ? (
                <div style={{ display: "grid", gap: 4 }}>
                  <strong>{lastClosedSession.title}</strong>
                  {lastClosedSession.endedAt && (
                    <span style={{ color: "var(--theme-text-secondary)", fontSize: 13 }}>
                      {new Date(lastClosedSession.endedAt).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                  {lastClosedSession.summary && (
                    <span style={{ color: "var(--theme-text-secondary)", fontSize: 13 }}>
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

        <Card
          style={{
            borderColor:
              attentionTone === "danger"
                ? "rgba(239,68,68,.4)"
                : attentionTone === "warning"
                  ? "rgba(245,158,11,.35)"
                  : "rgba(34,197,94,.3)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            {attentionCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            <h2 style={{ margin: 0 }}>{t("dashboard.needsAttention")}</h2>
            <Pill tone={attentionTone}>{attentionCount}</Pill>
          </div>
          {attentionCount === 0 ? (
            <EmptyMessage>{t("dashboard.allClear")}</EmptyMessage>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <CheckCircle2 size={18} /> {t("whatNowPage.prepTitle")}
            </h2>
            {preparationChecklist.length === 0 ? (
              <EmptyMessage>{t("dashboard.noPreparedClues")}</EmptyMessage>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {preparationChecklist.map((item) => {
                  const checked = item.done === true || completedTasks.includes(item.task);
                  return (
                    <label
                      key={item.task}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: "var(--theme-shapes-radius-medium)",
                        background: "var(--theme-surfaces-interactive)",
                        border: "1px solid var(--theme-borders-default)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          runCommandCenterAction(toggleChecklistTask(item.task), "No se pudo actualizar la tarea de preparación.");
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          textDecoration: checked ? "line-through" : "none",
                          color: checked ? "var(--theme-text-secondary)" : "var(--theme-text-primary)",
                        }}
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
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <Share2 size={18} /> {t("whatNowPage.confusionRisks")}
            </h2>
            {partialKnowledgeAlerts.length === 0 ? (
              <EmptyMessage>{t("whatNowPage.noConfusionRisks")}</EmptyMessage>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {partialKnowledgeAlerts.map((alert, index) => (
                  <div
                    key={alert.clueId ?? alert.message ?? index}
                    style={{
                      border: "1px solid var(--theme-borders-default)",
                      borderRadius: "var(--theme-shapes-radius-medium)",
                      padding: 12,
                    }}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <Users size={18} /> {t("dashboard.forgottenNpcs")}
            </h2>
            <EntityList
              items={npcWarnings}
              empty={t("dashboard.noneMasculine")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <Flag size={18} /> {t("dashboard.blockedQuests")}
            </h2>
            <EntityList
              items={blockedQuests}
              empty={t("dashboard.noneFeminine")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <EyeOff size={18} /> {t("whatNowPage.criticalClues")}
            </h2>
            <EntityList
              items={[...criticalHiddenClues, ...preparedClues]}
              empty={t("whatNowPage.noCriticalClues")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>

          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <Flame size={18} /> {t("whatNowPage.readyConsequences")}
            </h2>
            <EntityList
              items={pendingConsequences}
              empty={t("whatNowPage.noPendingConsequences")}
              onSelect={(entity) => setSelectedEntityId(entity.entityId)}
            />
          </Card>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, .75fr)",
            gap: 18,
          }}
        >
          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <CalendarDays size={18} /> {t("dashboard.nextSessionPrep")}
            </h2>
            <p style={{ color: "var(--theme-text-secondary)", lineHeight: 1.6 }}>
              {commandCenter?.recap ?? lastClosedSession?.summary ?? t("dashboard.noPreviousSessions")}
            </p>
            {activeSession ? (
              <Pill tone="good">{t("dashboard.runningSessionTitle", { title: activeSession.title })}</Pill>
            ) : nextPreparedSession ? (
              <Pill tone="good">{t("dashboard.nextPreparedSessionTitle", { title: nextPreparedSession.title })}</Pill>
            ) : (
              <Pill>{t("dashboard.noPreparedSessionTitle")}</Pill>
            )}
            {liveTable && <div style={{ marginTop: 12 }}><Pill tone="good">{liveTable.shortCode}</Pill></div>}
          </Card>

          <Card>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <Activity size={18} /> {t("dashboard.recentlyUpdated")}
            </h2>
            <div style={{ display: "grid", gap: 8 }}>
              {(commandCenter?.recentActivity ?? []).slice(0, 6).map((item) => (
                <div
                  key={item.activityId}
                  style={{
                    fontSize: 13,
                    color: "var(--theme-text-secondary)",
                    borderBottom: "1px solid var(--theme-borders-default)",
                    paddingBottom: 8,
                  }}
                >
                  <strong style={{ color: "var(--theme-text-primary)" }}>{item.type}</strong>
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
              onClick={() => navigateToCampaignPage("session")}
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
