import React, { useState } from "react";
import {
  MapPin,
  ScrollText,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Users,
  Lock,
  Zap,
  Network,
  Plus,
  Play,
  ChevronRight,
  CalendarDays,
  Flame,
  BookOpen,
  ClipboardList,
  Download,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { CampaignStarterHub } from "../onboarding/CampaignStarterHub.js";

export interface DashboardPageProps {
  dashboard?: any;
  campaignState?: any;
  setCurrentPage?: (page: string) => void;
  setSelectedEntity?: (entity: any) => void;
}

// ─── tiny helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background:
            "linear-gradient(to right, var(--border-color), transparent)",
        }}
      />
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.88rem" }}>
      {label}
    </span>
  );
}

function CommandMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--border-color)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-main)" }}>
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "3px" }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function FlowStep({
  icon,
  title,
  description,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "12px",
        borderRadius: "var(--radius-md)",
        backgroundColor: active ? "var(--bg-card-hover)" : "var(--bg-input)",
        border: active ? "1px solid hsla(255, 85%, 65%, 0.45)" : "1px solid var(--border-color)",
      }}
    >
      <span style={{ color: active ? "var(--primary)" : "var(--text-muted)", flexShrink: 0, marginTop: "2px" }}>
        {icon}
      </span>
      <span style={{ minWidth: 0 }}>
        <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--text-main)" }}>{title}</strong>
        <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>{description}</span>
      </span>
    </div>
  );
}

function EntityRow({
  entity,
  badge,
  badgeClass,
  onClick,
  titleFallback,
}: {
  entity: any;
  badge?: string;
  badgeClass?: string;
  onClick?: () => void;
  titleFallback: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--bg-input)",
        cursor: onClick ? "pointer" : "default",
        transition: "var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--bg-card-hover)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "var(--bg-input)";
      }}
    >
      <span
        style={{
          fontWeight: 600,
          fontSize: "0.9rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {entity.title ?? entity.name ?? titleFallback}
      </span>
      {badge && (
        <span className={`badge ${badgeClass ?? "badge-default"}`}>{badge}</span>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function DashboardPage(_props: DashboardPageProps = {}) {
  const { campaignId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const storeData = useCampaignStore();
  const dashboard = _props.dashboard ?? storeData.dashboard;
  const campaignState = _props.campaignState ?? storeData.campaignState;
  const { updateEntity, archiveEntity, exportMarkdown } = storeData;
  const { addToast } = useToast();
  const { t, locale } = useTranslation();
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<any>(null);
  const [exportingMarkdown, setExportingMarkdown] = useState(false);
  const selectedEntity = selectedEntityLocal;
  const setSelectedEntity = _props.setSelectedEntity ?? setSelectedEntityLocal;

  const setCurrentPage = _props.setCurrentPage ?? ((page: string) => {
    if (campaignId) navigate({ to: `/campaigns/${campaignId}/${page}` });
  });

  // ── derived values ──────────────────────────────────────────────────────────
  const campaign = campaignState?.campaign ?? null;
  const sessions: any[] = campaignState?.sessions ?? [];
  const activeSession = sessions.find((s: any) => s.status === "active") ?? null;
  const plannedSessions = sessions
    .filter((s: any) => s.status === "planned")
    .sort(
      (a: any, b: any) =>
        new Date(a.scheduledAt ?? a.createdAt ?? 0).getTime() -
        new Date(b.scheduledAt ?? b.createdAt ?? 0).getTime()
    );
  const nextPreparedSession = plannedSessions[0] ?? null;

  const currentLocationId = campaign?.currentLocationId ?? null;
  const currentLocationEntity =
    currentLocationId && Array.isArray(campaignState?.entities)
      ? campaignState.entities.find((e: any) => e.entityId === currentLocationId)
      : null;

  const firstActiveQuest: any = dashboard?.activeQuests?.[0] ?? null;
  const lastSession: any = dashboard?.lastSession ?? null;

  const npcWarnings: any[] = dashboard?.importantNpcWarnings ?? [];
  const blockedQuests: any[] = dashboard?.blockedQuests ?? [];
  const criticalHiddenClues: any[] = dashboard?.criticalHiddenClues ?? [];
  const pendingConsequences: any[] = dashboard?.pendingConsequences ?? [];

  const preparedClues: any[] = dashboard?.preparedClues ?? [];
  const readyConsequences: any[] = pendingConsequences.filter(
    (c: any) => c.ready === true
  );
  const recentEntities: any[] =
    dashboard?.recentlyUpdatedEntities ??
    dashboard?.recentlyChangedEntities ??
    [];

  const hasWarnings =
    npcWarnings.length > 0 ||
    blockedQuests.length > 0 ||
    criticalHiddenClues.length > 0 ||
    pendingConsequences.length > 0;

  const attentionCount =
    npcWarnings.length +
    blockedQuests.length +
    criticalHiddenClues.length +
    pendingConsequences.length;
  const activeQuestCount = dashboard?.activeQuests?.length ?? 0;
  const playerCount = campaignState?.players?.filter((player: any) => !player.archived).length ?? 0;
  const preparedClueCount = preparedClues.length;

  const handleMarkdownExport = async () => {
    setExportingMarkdown(true);
    try {
      const result = await exportMarkdown();
      const path = result?.path ?? result?.primaryFile ?? "";
      if (path && navigator.clipboard) {
        await navigator.clipboard.writeText(path);
      }
      addToast(
        path
          ? t("dashboard.markdownExportedWithPath")
          : t("dashboard.markdownExported"),
        "success"
      );
    } catch (err: any) {
      addToast(t("dashboard.markdownExportError", { error: err?.message ?? String(err) }), "error");
    } finally {
      setExportingMarkdown(false);
    }
  };

  const importanceBadge = (importance: string | undefined) => {
    if (!importance) return { label: t("dashboard.importanceNormal"), cls: "badge-default" };
    const map: Record<string, { label: string; cls: string }> = {
      critical: { label: t("dashboard.importanceCritical"), cls: "badge-critical" },
      high: { label: t("dashboard.importanceHigh"), cls: "badge-warning" },
      medium: { label: t("dashboard.importanceMedium"), cls: "badge-primary" },
      low: { label: t("dashboard.importanceLow"), cls: "badge-default" },
    };
    return map[importance.toLowerCase()] ?? { label: importance, cls: "badge-default" };
  };

  const quickActionsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(138px, 100%), 1fr))",
    gap: "12px",
  };

  const quickActionButtonStyle: React.CSSProperties = {
    minWidth: 0,
    minHeight: "76px",
    height: "auto",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "16px 10px",
    fontSize: "0.82rem",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    borderRadius: "var(--radius-lg)",
    textAlign: "center",
    whiteSpace: "normal",
  };

  // ── layout ──────────────────────────────────────────────────────────────────
  return (<>
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — ESTADO ACTUAL
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t("dashboard.currentState")}</SectionLabel>

        {/* Campaign header strip */}
        <div
          className="card"
          style={{
            background: `linear-gradient(135deg,
              hsla(255, 85%, 12%, 0.9) 0%,
              hsla(230, 35%, 11%, 1) 60%,
              hsla(175, 40%, 10%, 0.9) 100%)`,
            borderColor: "hsla(255, 85%, 65%, 0.25)",
            marginBottom: "20px",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px",
                }}
              >
                <h1
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-main)",
                  }}
                >
                  {campaign?.title ?? t("dashboard.noActiveCampaign")}
                </h1>
                {campaign?.system && (
                  <span className="badge badge-primary">{campaign.system}</span>
                )}
              </div>
              {(campaign?.summary || campaign?.description) && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    maxWidth: "620px",
                  }}
                >
                  {campaign.summary || campaign.description}
                </p>
              )}
              {campaign?.metadata?.createdFromTemplateTitle && (
                <p style={{ marginTop: "8px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {t("dashboard.createdFromTemplate", {
                    title: String(campaign.metadata.createdFromTemplateTitle),
                    version: String(campaign.metadata.createdFromTemplateVersion ?? ""),
                  })}
                </p>
              )}
            </div>

            {activeSession ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-success-bg)",
                  border: "1px solid hsla(142, 70%, 50%, 0.3)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-success)",
                    boxShadow: "0 0 6px var(--color-success)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--color-success)",
                  }}
                >
                  {t("dashboard.activeSession")}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {campaignId && campaignState ? (
          <CampaignStarterHub
            campaignId={campaignId}
            campaignState={campaignState}
            setCurrentPage={setCurrentPage}
          />
        ) : null}

        <div
          className="card"
          style={{
            padding: "20px",
            marginBottom: "20px",
            borderColor: "hsla(255, 85%, 65%, 0.22)",
            background:
              "linear-gradient(135deg, hsla(255, 85%, 14%, 0.55), hsla(224, 36%, 10%, 0.92))",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 1.2fr) minmax(280px, 1fr)",
              gap: "18px",
              alignItems: "stretch",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--primary)",
                    fontSize: "0.76rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: "6px",
                  }}
                >
                  <Sparkles size={14} /> {t("dashboard.commandCenter")}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: "var(--text-main)",
                  }}
                >
                  {nextPreparedSession
                    ? t("dashboard.nextPreparedSessionTitle", { title: nextPreparedSession.title })
                    : activeSession
                      ? t("dashboard.runningSessionTitle", { title: activeSession.title })
                      : t("dashboard.noPreparedSessionTitle")}
                </h2>
                <p style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.45 }}>
                  {nextPreparedSession?.prep?.summary ||
                    activeSession?.prep?.summary ||
                    t("dashboard.commandCenterDescription")}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
                <CommandMetric label={t("dashboard.metricAttention")} value={attentionCount} detail={t("dashboard.metricAttentionDetail")} />
                <CommandMetric label={t("dashboard.metricQuests")} value={activeQuestCount} detail={t("dashboard.metricQuestsDetail")} />
                <CommandMetric label={t("dashboard.metricClues")} value={preparedClueCount} detail={t("dashboard.metricCluesDetail")} />
                <CommandMetric label={t("dashboard.metricPlayers")} value={playerCount} detail={t("dashboard.metricPlayersDetail")} />
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage("session")}>
                  <Play size={14} /> {activeSession ? t("dashboard.runSession") : t("dashboard.prepareOrStart")}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage("what-now")}>
                  <ClipboardList size={14} /> {t("dashboard.reviewWhatNow")}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage("knowledge")}>
                  <Share2 size={14} /> {t("dashboard.reviewPlayerKnowledge")}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <FlowStep
                icon={<ClipboardList size={16} />}
                title={t("dashboard.flowPrepareTitle")}
                description={t("dashboard.flowPrepareDescription")}
                active={!activeSession}
              />
              <FlowStep
                icon={<Play size={16} />}
                title={t("dashboard.flowRunTitle")}
                description={t("dashboard.flowRunDescription")}
                active={Boolean(activeSession)}
              />
              <FlowStep
                icon={<CheckCircle2 size={16} />}
                title={t("dashboard.flowCloseTitle")}
                description={t("dashboard.flowCloseDescription")}
              />
              <FlowStep
                icon={<Share2 size={16} />}
                title={t("dashboard.flowShareTitle")}
                description={t("dashboard.flowShareDescription")}
              />
            </div>
          </div>
        </div>

        {/* Three-column status row */}
        <div className="grid grid-cols-3">
          {/* Ubicación actual */}
          <div
            className="card"
            style={{ padding: "18px 20px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <MapPin
                size={14}
                style={{ color: "var(--secondary)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {t("dashboard.currentLocation")}
              </span>
            </div>
            {currentLocationEntity ? (
              <button
                className="btn btn-secondary btn-sm"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: "8px",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setSelectedEntity(currentLocationEntity)}
              >
                <MapPin size={13} />
                {currentLocationEntity.title ?? currentLocationEntity.name}
              </button>
            ) : (
              <EmptySlot label={t("dashboard.notSet")} />
            )}
          </div>

          {/* Misión activa */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <ScrollText
                size={14}
                style={{ color: "var(--color-warning)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {t("dashboard.mainQuest")}
              </span>
            </div>
            {firstActiveQuest ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                  }}
                  onClick={() => setSelectedEntity(firstActiveQuest)}
                >
                  {firstActiveQuest.title}
                </button>
                <span
                  className={`badge ${importanceBadge(firstActiveQuest.importance).cls}`}
                  style={{ alignSelf: "flex-start" }}
                >
                  {importanceBadge(firstActiveQuest.importance).label}
                </span>
              </div>
            ) : (
              <EmptySlot label={t("dashboard.noActiveQuest")} />
            )}
          </div>

          {/* Última sesión */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <CalendarDays
                size={14}
                style={{ color: "var(--color-info)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {t("dashboard.lastSession")}
              </span>
            </div>
            {lastSession ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {lastSession.title ?? t("dashboard.sessionNumber", { number: lastSession.number ?? "" })}
                </span>
                {lastSession.date && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(lastSession.date).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                )}
                {lastSession.summary && (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {lastSession.summary}
                  </p>
                )}
              </div>
            ) : (
              <EmptySlot label={t("dashboard.noPreviousSessions")} />
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — QUÉ REQUIERE ATENCIÓN
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t("dashboard.needsAttention")}</SectionLabel>

        {!hasWarnings ? (
          <div
            className="card"
            style={{
              borderColor: "hsla(142, 70%, 50%, 0.3)",
              backgroundColor: "var(--color-success-bg)",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <CheckCircle2 size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />
            <span style={{ fontWeight: 700, color: "var(--color-success)" }}>
              {t("dashboard.allClear")}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {/* PNJs olvidados */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  npcWarnings.length > 0
                    ? "hsla(38, 95%, 55%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  npcWarnings.length > 0
                    ? "hsla(38, 95%, 55%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Users
                  size={15}
                  style={{
                    color:
                      npcWarnings.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      npcWarnings.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                >
                  {t("dashboard.forgottenNpcs")}
                </span>
                {npcWarnings.length > 0 && (
                  <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                    {npcWarnings.length}
                  </span>
                )}
              </div>
              {npcWarnings.length === 0 ? (
                <EmptySlot label={t("dashboard.noneMasculine")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {npcWarnings.slice(0, 4).map((w: any, i: number) => (
                    <EntityRow
                      key={w.entityId ?? i}
                      entity={w}
                      badge={w.importance}
                      badgeClass={importanceBadge(w.importance).cls}
                      onClick={w.entityId ? () => setSelectedEntity(w) : undefined}
                      titleFallback={t("dashboard.untitled")}
                    />
                  ))}
                  {npcWarnings.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      {t("dashboard.moreCount", { count: npcWarnings.length - 4 })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Misiones bloqueadas */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  blockedQuests.length > 0
                    ? "hsla(0, 85%, 60%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  blockedQuests.length > 0
                    ? "hsla(0, 85%, 60%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Lock
                  size={15}
                  style={{
                    color:
                      blockedQuests.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      blockedQuests.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                >
                  {t("dashboard.blockedQuests")}
                </span>
                {blockedQuests.length > 0 && (
                  <span className="badge badge-critical" style={{ marginLeft: "auto" }}>
                    {blockedQuests.length}
                  </span>
                )}
              </div>
              {blockedQuests.length === 0 ? (
                <EmptySlot label={t("dashboard.noneFeminine")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {blockedQuests.slice(0, 4).map((q: any, i: number) => (
                    <EntityRow
                      key={q.entityId ?? i}
                      entity={q}
                      badge={t("dashboard.blocked")}
                      badgeClass="badge-critical"
                      onClick={q.entityId ? () => setSelectedEntity(q) : undefined}
                      titleFallback={t("dashboard.untitled")}
                    />
                  ))}
                  {blockedQuests.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      {t("dashboard.moreCount", { count: blockedQuests.length - 4 })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pistas críticas sin revelar */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  criticalHiddenClues.length > 0
                    ? "hsla(0, 85%, 60%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  criticalHiddenClues.length > 0
                    ? "hsla(0, 85%, 60%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <EyeOff
                  size={15}
                  style={{
                    color:
                      criticalHiddenClues.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      criticalHiddenClues.length > 0
                        ? "var(--color-critical)"
                        : "var(--text-muted)",
                  }}
                >
                  {t("dashboard.unrevealedCriticalClues")}
                </span>
                {criticalHiddenClues.length > 0 && (
                  <span className="badge badge-critical" style={{ marginLeft: "auto" }}>
                    {criticalHiddenClues.length}
                  </span>
                )}
              </div>
              {criticalHiddenClues.length === 0 ? (
                <EmptySlot label={t("dashboard.noneFeminine")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {criticalHiddenClues.slice(0, 4).map((c: any, i: number) => (
                    <EntityRow
                      key={c.entityId ?? i}
                      entity={c}
                      badge={t("dashboard.hidden")}
                      badgeClass="badge-critical"
                      onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                      titleFallback={t("dashboard.untitled")}
                    />
                  ))}
                  {criticalHiddenClues.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      {t("dashboard.moreCount", { count: criticalHiddenClues.length - 4 })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Consecuencias pendientes */}
            <div
              className="card"
              style={{
                padding: "18px 20px",
                borderColor:
                  pendingConsequences.length > 0
                    ? "hsla(38, 95%, 55%, 0.35)"
                    : "var(--border-color)",
                backgroundColor:
                  pendingConsequences.length > 0
                    ? "hsla(38, 95%, 55%, 0.06)"
                    : undefined,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <Flame
                  size={15}
                  style={{
                    color:
                      pendingConsequences.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color:
                      pendingConsequences.length > 0
                        ? "var(--color-warning)"
                        : "var(--text-muted)",
                  }}
                >
                  {t("dashboard.pendingConsequences")}
                </span>
                {pendingConsequences.length > 0 && (
                  <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                    {pendingConsequences.length}
                  </span>
                )}
              </div>
              {pendingConsequences.length === 0 ? (
                <EmptySlot label={t("dashboard.noneFeminine")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {pendingConsequences.slice(0, 4).map((c: any, i: number) => (
                    <EntityRow
                      key={c.entityId ?? i}
                      entity={c}
                      badge={c.ready ? t("dashboard.ready") : t("dashboard.pending")}
                      badgeClass={c.ready ? "badge-success" : "badge-warning"}
                      onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                      titleFallback={t("dashboard.untitled")}
                    />
                  ))}
                  {pendingConsequences.length > 4 && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      {t("dashboard.moreCount", { count: pendingConsequences.length - 4 })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — PREPARACIÓN
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t("dashboard.nextSessionPrep")}</SectionLabel>

        <div className="grid grid-cols-3">
          {/* Pistas listas para revelar */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Eye size={14} style={{ color: "var(--secondary)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                {t("dashboard.cluesReady")}
              </span>
              {preparedClues.length > 0 && (
                <span className="badge badge-success" style={{ marginLeft: "auto" }}>
                  {preparedClues.length}
                </span>
              )}
            </div>
            {preparedClues.length === 0 ? (
              <EmptySlot label={t("dashboard.noPreparedClues")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {preparedClues.slice(0, 5).map((c: any, i: number) => (
                  <EntityRow
                    key={c.entityId ?? i}
                    entity={c}
                    onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                    titleFallback={t("dashboard.untitled")}
                  />
                ))}
                {preparedClues.length > 5 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                    {t("dashboard.moreCount", { count: preparedClues.length - 5 })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Consecuencias listas */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Zap size={14} style={{ color: "var(--color-warning)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                {t("dashboard.readyConsequences")}
              </span>
              {readyConsequences.length > 0 && (
                <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
                  {readyConsequences.length}
                </span>
              )}
            </div>
            {readyConsequences.length === 0 ? (
              <EmptySlot label={t("dashboard.noneReadyYet")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {readyConsequences.slice(0, 5).map((c: any, i: number) => (
                  <EntityRow
                    key={c.entityId ?? i}
                    entity={c}
                    badge={t("dashboard.ready")}
                    badgeClass="badge-success"
                    onClick={c.entityId ? () => setSelectedEntity(c) : undefined}
                    titleFallback={t("dashboard.untitled")}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actualizado recientemente */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Clock size={14} style={{ color: "var(--color-info)" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                {t("dashboard.recentlyUpdated")}
              </span>
            </div>
            {recentEntities.length === 0 ? (
              <EmptySlot label={t("dashboard.noRecentChanges")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {recentEntities.slice(0, 5).map((e: any, i: number) => (
                  <div
                    key={e.entityId ?? i}
                    onClick={() => setSelectedEntity(e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-input)",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(ev) => {
                      (ev.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(ev) => {
                      (ev.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--bg-input)";
                    }}
                  >
                    <BookOpen size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {e.title ?? e.name}
                    </span>
                    {e.entityType && (
                      <span
                        className="badge badge-default"
                        style={{ fontSize: "0.6rem", padding: "2px 6px" }}
                      >
                        {e.entityType}
                      </span>
                    )}
                  </div>
                ))}
                {recentEntities.length > 5 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                    {t("dashboard.moreCount", { count: recentEntities.length - 5 })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — ACCIONES RÁPIDAS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>{t("dashboard.quickActions")}</SectionLabel>

        <div style={quickActionsGridStyle}>
          {/* Iniciar sesión */}
          <button
            className="btn btn-primary"
            style={{
              ...quickActionButtonStyle,
              boxShadow:
                "var(--shadow-primary), inset 0 1px 0 hsla(255, 100%, 90%, 0.15)",
            }}
            onClick={() => setCurrentPage("session")}
          >
            <Play size={20} />
            <span>{t("dashboard.startSession")}</span>
          </button>

          {/* Nueva pista */}
          <button
            className="btn btn-secondary"
            style={{
              ...quickActionButtonStyle,
              borderColor: "hsla(175, 85%, 45%, 0.3)",
            }}
            onClick={() => setCurrentPage("entities")}
          >
            <Plus size={20} style={{ color: "var(--secondary)" }} />
            <span>{t("dashboard.newClue")}</span>
          </button>

          {/* Nuevo PNJ */}
          <button
            className="btn btn-secondary"
            style={quickActionButtonStyle}
            onClick={() => setCurrentPage("entities")}
          >
            <Users size={20} style={{ color: "var(--text-muted)" }} />
            <span>{t("dashboard.newNpc")}</span>
          </button>

          {/* Ver grafo */}
          <button
            className="btn btn-secondary"
            style={{
              ...quickActionButtonStyle,
              position: "relative",
              paddingRight: "26px",
            }}
            onClick={() => setCurrentPage("graph")}
          >
            <Network size={20} style={{ color: "var(--text-muted)" }} />
            <span>{t("dashboard.viewGraph")}</span>

            <ChevronRight
              size={14}
              aria-hidden="true"
              style={{
                color: "var(--text-muted)",
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </button>

          <button
            className="btn btn-secondary"
            style={quickActionButtonStyle}
            onClick={() => setCurrentPage("search")}
          >
            <Search size={20} style={{ color: "var(--text-muted)" }} />
            <span>{t("dashboard.globalSearch")}</span>
          </button>

          <button
            className="btn btn-secondary"
            style={quickActionButtonStyle}
            onClick={() => campaignId && navigate({ to: `/campaigns/${campaignId}/player-portal` })}
          >
            <Share2 size={20} style={{ color: "var(--text-muted)" }} />
            <span>{t("dashboard.openPlayerPortal")}</span>
          </button>

          <button
            className="btn btn-secondary"
            style={quickActionButtonStyle}
            onClick={() => void handleMarkdownExport()}
            disabled={exportingMarkdown}
          >
            <Download size={20} style={{ color: "var(--text-muted)" }} />
            <span>{exportingMarkdown ? t("dashboard.exportingMarkdown") : t("dashboard.exportMarkdown")}</span>
          </button>
        </div>
      </section>
    </div>
    {selectedEntity && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntity}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal({ ...selectedEntity, ...updates });
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal({ ...selectedEntity, visibility });
        }}
        addToast={addToast}
      />
    )}
  </>);
}
