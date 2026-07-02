import React, { useState } from "react";
import {
  Activity,
  BookOpen,
  Info,
  Calendar,
  HelpCircle,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
} from "lucide-react";
import {
  getEventVisualConfig,
  renderEventDescription,
} from "../entities/eventVisuals.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

const NARRATIVE_EVENT_TYPES = new Set([
  "SessionStarted",
  "SessionClosed",
  "FactCreated",
  "VisibilityChanged",
  "ClueRevealed",
  "PlayerProfileCreated",
  "EntityArchived",
]);

export interface TimelinePageProps {
  timeline?: any;
  campaignState?: any;
  timelineFilter?: string;
  setTimelineFilter?: (f: string) => void;
  expandedEvents?: Record<string, boolean>;
  toggleEventJson?: (id: string) => void;
  onEntityClick?: (entityId: string) => void;
}

interface EventGroup {
  key: string;
  label: string;
  sublabel?: string;
  isClosed: boolean;
  isActive: boolean;
  events: any[];
}

function getEventText(evt: any): string {
  const p = evt.payload ?? {};
  return [
    p.title, p.name, p.displayName, p.statement, p.summary,
    p.description, p.relationType, p.type, evt.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function eventMatchesEntity(evt: any, entityId: string): boolean {
  if (entityId === "all") return true;
  const p = evt.payload ?? {};
  return [
    p.entityId, p.id, p.sourceEntityId, p.targetEntityId,
    p.targetId, ...(p.relatedEntityIds ?? []),
  ].includes(entityId);
}

export function TimelinePage(props: TimelinePageProps = {}) {
  const store = useCampaignStore();
  const { locale, t } = useTranslation();
  const timeline = props.timeline ?? store.timeline;
  const campaignState = props.campaignState ?? store.campaignState;
  const onEntityClick = props.onEntityClick;
  const [timelineFilterLocal, setTimelineFilterLocal] = useState("narrative");
  const [expandedEventsLocal, setExpandedEventsLocal] = useState<Record<string, boolean>>({});
  const [showTechnical, setShowTechnical] = useState(false);
  const [groupedView, setGroupedView] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilterId, setEntityFilterId] = useState("all");

  const timelineFilter = props.timelineFilter ?? timelineFilterLocal;
  const setTimelineFilter = props.setTimelineFilter ?? setTimelineFilterLocal;
  const expandedEvents = props.expandedEvents ?? expandedEventsLocal;
  const toggleEventJson =
    props.toggleEventJson ??
    ((id: string) => {
      setExpandedEventsLocal((prev) => ({ ...prev, [id]: !prev[id] }));
    });

  function toggleGroup(key: string) {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function isLiveEvent(evt: any): boolean {
    const sessions: any[] = campaignState?.sessions ?? [];
    const ts = new Date(evt.occurredAt).getTime();
    return sessions.some((s: any) => {
      if (!s.startedAt) return false;
      const start = new Date(s.startedAt).getTime();
      const end = s.endedAt ? new Date(s.endedAt).getTime() : Infinity;
      return ts >= start && ts <= end;
    });
  }

  function buildGroups(events: any[]): EventGroup[] {
    const groups: EventGroup[] = [];
    let currentGroup: EventGroup | null = null;
    let prepEvents: any[] = [];

    // events arrive newest-first; re-sort oldest-first for grouping
    const sorted = [...events].reverse();

    for (const evt of sorted) {
      if (evt.type === "SessionStarted") {
        if (prepEvents.length > 0) {
          groups.push({
            key: `prep_${evt.eventId}`,
            label: t("timeline.prepGroup"),
            sublabel: t("timeline.sessionGroupPrep"),
            isClosed: false,
            isActive: false,
            events: prepEvents,
          });
          prepEvents = [];
        }
        currentGroup = {
          key: evt.eventId,
          label: t("timeline.sessionGroupTitle", {
            number: evt.payload?.number ?? "",
            title: evt.payload?.title ?? "",
          }),
          sublabel: "",
          isClosed: false,
          isActive: true,
          events: [evt],
        };
      } else if (evt.type === "SessionClosed" && currentGroup) {
        currentGroup.events.push(evt);
        currentGroup.isClosed = true;
        currentGroup.isActive = false;
        currentGroup.sublabel = evt.payload?.summary ?? "";
        groups.push({ ...currentGroup });
        currentGroup = null;
      } else if (currentGroup) {
        currentGroup.events.push(evt);
      } else {
        prepEvents.push(evt);
      }
    }

    if (currentGroup) {
      currentGroup.sublabel = t("timeline.sessionGroupOpen");
      groups.push({ ...currentGroup });
    }
    if (prepEvents.length > 0) {
      groups.unshift({
        key: "prep_initial",
        label: t("timeline.prepGroup"),
        sublabel: t("timeline.sessionGroupPrep"),
        isClosed: false,
        isActive: false,
        events: prepEvents,
      });
    }

    return groups.reverse();
  }

  if (!timeline)
    return (
      <div style={{ padding: "40px", color: "var(--text-muted)" }}>
        {t("timeline.loading")}
      </div>
    );

  const narrativeEvents = timeline.events.filter((e: any) =>
    NARRATIVE_EVENT_TYPES.has(e.type),
  );
  const visibleEvents = showTechnical ? timeline.events : narrativeEvents;

  const stats = {
    total: narrativeEvents.length,
    sessions: timeline.events.filter((e: any) => e.type === "SessionClosed").length,
    facts: timeline.events.filter((e: any) => e.type === "FactCreated").length,
    revelaciones: timeline.events.filter((e: any) => e.type === "VisibilityChanged" || e.type === "ClueRevealed").length,
    unrevealedSecrets: (() => {
      const entities: any[] = campaignState?.entities ?? [];
      return entities.filter(
        (e: any) =>
          !e.archived &&
          (e.entityType === "secret" || e.entityType === "clue") &&
          e.visibility?.kind === "dm_only",
      ).length;
    })(),
    daysSinceLastSession: (() => {
      const closed = timeline.events
        .filter((e: any) => e.type === "SessionClosed")
        .sort((a: any, b: any) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
      if (closed.length === 0) return null;
      const ms = Date.now() - new Date(closed[0].occurredAt).getTime();
      return Math.floor(ms / 86_400_000);
    })(),
  };

  const filterOptions = [
    { key: "narrative", label: t("timeline.labels.narrative"), count: narrativeEvents.length },
    {
      key: "sessions",
      label: t("timeline.labels.sessions"),
      count: visibleEvents.filter(
        (e: any) => getEventVisualConfig(e.type, locale).category === "sessions",
      ).length,
    },
    {
      key: "facts",
      label: t("timeline.labels.facts"),
      count: visibleEvents.filter(
        (e: any) => getEventVisualConfig(e.type, locale).category === "facts",
      ).length,
    },
    {
      key: "players",
      label: t("timeline.labels.players"),
      count: visibleEvents.filter(
        (e: any) => getEventVisualConfig(e.type, locale).category === "players",
      ).length,
    },
    ...(showTechnical
      ? [
          {
            key: "entities",
            label: t("timeline.labels.entities"),
            count: visibleEvents.filter(
              (e: any) => getEventVisualConfig(e.type, locale).category === "entities",
            ).length,
          },
          {
            key: "relations",
            label: t("timeline.labels.relations"),
            count: visibleEvents.filter(
              (e: any) => getEventVisualConfig(e.type, locale).category === "relations",
            ).length,
          },
          {
            key: "campaigns",
            label: t("timeline.labels.campaigns"),
            count: visibleEvents.filter(
              (e: any) => getEventVisualConfig(e.type, locale).category === "campaigns",
            ).length,
          },
          {
            key: "other",
            label: t("timeline.labels.system"),
            count: visibleEvents.filter(
              (e: any) => getEventVisualConfig(e.type, locale).category === "other",
            ).length,
          },
        ]
      : []),
  ];

  const filteredEvents = visibleEvents
    .slice()
    .reverse()
    .filter((evt: any) => {
      if (timelineFilter === "narrative") return NARRATIVE_EVENT_TYPES.has(evt.type);
      return getEventVisualConfig(evt.type).category === timelineFilter;
    })
    .filter((evt: any) => {
      if (searchQuery.trim() === "") return true;
      return getEventText(evt).includes(searchQuery.trim().toLowerCase());
    })
    .filter((evt: any) => eventMatchesEntity(evt, entityFilterId));

  // ── shared event item renderer ───────────────────────────────────────────────
  const renderEventItem = (evt: any) => {
    const visual = getEventVisualConfig(evt.type, locale);
    const IconComp = visual.IconComponent;
    const live = isLiveEvent(evt);

    return (
      <article
        key={evt.eventId}
        className="timeline-item"
        style={{
          "--timeline-event-color": visual.color,
          "--timeline-event-bg": visual.bgColor,
        } as React.CSSProperties}
      >
        <div
          className="timeline-marker"
          aria-label={visual.label}
        >
          <IconComp size={16} aria-hidden="true" />
        </div>

        <div className="timeline-content">
          <header className="timeline-event-header">
            <div className="timeline-event-badges">
              <span className="badge timeline-event-type">
                {visual.label}
              </span>
              <span className={`badge timeline-event-phase ${live ? "timeline-event-phase--live" : ""}`}>
                {live ? t("timeline.liveBadge") : t("timeline.prepBadge")}
              </span>
            </div>
            <time className="timeline-time" dateTime={evt.occurredAt}>
              <Calendar size={12} />
              {new Date(evt.occurredAt).toLocaleString()}
            </time>
          </header>

          <div className="timeline-event-description">
            {renderEventDescription(evt.type, evt.payload, campaignState, locale, onEntityClick, timeline.events)}
          </div>

          <footer className="timeline-event-footer">
            <p>
              <strong>{t("timeline.actor")}</strong>{" "}
              <code>{evt.actorId}</code>{" "}
              | <strong>{t("timeline.sequence")}</strong> #{evt.sequence}
            </p>
            <button
              className="btn btn-secondary btn-sm timeline-event-json-toggle"
              onClick={() => toggleEventJson(evt.eventId)}
            >
              {expandedEvents[evt.eventId] ? <EyeOff size={12} /> : <Eye size={12} />}
              {expandedEvents[evt.eventId] ? t("timeline.hideJson") : t("timeline.showJson")}
            </button>
          </footer>

          {expandedEvents[evt.eventId] && evt.payload && (
            <pre className="timeline-event-json">
              {JSON.stringify(evt.payload, null, 2)}
            </pre>
          )}
        </div>
      </article>
    );
  };

  // ── empty state ──────────────────────────────────────────────────────────────
  const emptyState = (
    <div
      className="card"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "48px 24px", textAlign: "center",
        border: "1px dashed var(--border-color)", background: "transparent",
        gap: "16px", marginTop: "8px",
      }}
    >
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        <HelpCircle size={32} />
      </div>
      <div>
        <h3 style={{ fontWeight: "600", fontSize: "1.1rem" }}>{t("timeline.noEventsTitle")}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
          {t("timeline.noEventsDescription")}
        </p>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => setTimelineFilter("all")}>
        {t("timeline.showAllEvents")}
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Hero banner */}
      <div
        className="card"
        style={{
          position: "relative", padding: "28px 24px", display: "flex",
          flexDirection: "column", gap: "8px",
          border: "1px solid var(--border-color)",
          background: "linear-gradient(135deg, hsla(255, 85%, 65%, 0.1), hsla(175, 85%, 45%, 0.05))",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.08 }}>
          <BookOpen size={96} style={{ color: "var(--primary)" }} />
        </div>
        <h2 style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.5rem" }}>
          <Activity size={24} style={{ color: "var(--primary)" }} />
          {t("timeline.heroTitle")}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "800px", margin: 0 }}>
          {t("timeline.heroSubtitle")}
        </p>
      </div>

      {/* Stats grid */}
      <div className="timeline-stats-grid">
        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(255, 85%, 65%, 0.15)", color: "hsl(255, 85%, 65%)" }}>
            <Activity size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.total}</span>
            <span className="timeline-stat-label">{t("timeline.statsNarrative")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(10, 95%, 60%, 0.15)", color: "hsl(10, 95%, 60%)" }}>
            <Calendar size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.sessions}</span>
            <span className="timeline-stat-label">{t("timeline.statsSessions")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(38, 95%, 55%, 0.15)", color: "hsl(38, 95%, 55%)" }}>
            <Info size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.facts}</span>
            <span className="timeline-stat-label">{t("timeline.statsFacts")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(195, 95%, 50%, 0.15)", color: "hsl(195, 95%, 50%)" }}>
            <Eye size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.revelaciones}</span>
            <span className="timeline-stat-label">{t("timeline.statsReveals")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(0, 85%, 60%, 0.15)", color: "hsl(0, 85%, 60%)" }}>
            <EyeOff size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.unrevealedSecrets}</span>
            <span className="timeline-stat-label">{t("timeline.statsUnrevealedSecrets")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div className="timeline-stat-icon-wrapper" style={{ backgroundColor: "hsla(142, 70%, 50%, 0.15)", color: "hsl(142, 70%, 50%)" }}>
            <Clock size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">
              {stats.daysSinceLastSession === null
                ? t("timeline.statsDaysSinceSessionNever")
                : t("timeline.statsDaysSinceSessionValue", { days: String(stats.daysSinceLastSession) })}
            </span>
            <span className="timeline-stat-label">{t("timeline.statsDaysSinceSession")}</span>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div style={{ marginTop: "8px" }}>
        {/* Search + entity filter row */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={14}
              style={{
                position: "absolute", left: "10px", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder={t("timeline.searchPlaceholder")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: "32px", paddingRight: "12px",
                paddingTop: "7px", paddingBottom: "7px",
                background: "var(--bg-input)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)", color: "var(--text-main)",
                fontSize: "0.85rem", boxSizing: "border-box",
              }}
            />
          </div>
          {campaignState?.entities?.length > 0 && (
            <select
              value={entityFilterId}
              onChange={e => setEntityFilterId(e.target.value)}
              style={{
                background: "var(--bg-input)", border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)", color: "var(--text-main)",
                fontSize: "0.85rem", padding: "7px 10px", minWidth: "160px",
              }}
            >
              <option value="all">{t("timeline.filterEntityAll")}</option>
              {[...(campaignState.entities as any[])]
                .filter(e => !e.archived)
                .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""))
                .map(e => (
                  <option key={e.entityId ?? e.id} value={e.entityId ?? e.id}>{e.title}</option>
                ))
              }
            </select>
          )}
        </div>

        {/* Category pill-bar + view toggles */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)", margin: 0 }}>
            {t("timeline.filterByCategory")}
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`btn btn-sm ${groupedView ? "btn-primary" : "btn-secondary"}`}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
              onClick={() => setGroupedView(v => !v)}
            >
              <Layers size={13} />
              {groupedView ? t("timeline.flatView") : t("timeline.groupedView")}
            </button>
            <button
              className={`btn btn-sm ${showTechnical ? "btn-primary" : "btn-secondary"}`}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
              onClick={() => {
                setShowTechnical((v) => !v);
                setTimelineFilter("narrative");
              }}
            >
              <SlidersHorizontal size={13} />
              {showTechnical ? t("timeline.hideTechnical") : t("timeline.showTechnical")}
            </button>
          </div>
        </div>

        <div className="timeline-filters">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              className={`filter-chip ${timelineFilter === opt.key ? "active" : ""}`}
              onClick={() => setTimelineFilter(opt.key)}
            >
              {opt.label}
              <span
                style={{
                  backgroundColor: timelineFilter === opt.key ? "hsla(255, 85%, 65%, 0.25)" : "var(--bg-card)",
                  padding: "2px 6px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem",
                  color: timelineFilter === opt.key ? "var(--text-main)" : "var(--text-muted)",
                  marginLeft: "2px", border: "1px solid var(--border-color)",
                }}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Event list — grouped or flat */}
      {groupedView && timelineFilter === "narrative" ? (
        (() => {
          const groups = buildGroups(filteredEvents);
          if (groups.length === 0) return emptyState;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
              {groups.map(group => {
                const isCollapsed = collapsedGroups[group.key];
                return (
                  <div
                    key={group.key}
                    style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}
                  >
                    <button
                      type="button"
                      className={`timeline-group-header ${group.isActive ? "timeline-group-header--active" : ""}`}
                      aria-expanded={!isCollapsed}
                      onClick={() => toggleGroup(group.key)}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{group.label}</span>
                        {group.sublabel && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "600px" }}>
                            {group.sublabel}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {t("timeline.eventsCount", { count: String(group.events.length) })}
                        </span>
                        {group.isActive && (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: "hsla(10,95%,60%,0.2)", color: "hsl(10,95%,60%)",
                              border: "1px solid hsl(10,95%,60%)", fontSize: "0.65rem",
                            }}
                          >
                            {t("timeline.sessionGroupOpen")}
                          </span>
                        )}
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </div>
                    </button>
                    {!isCollapsed && (
                      <div className="timeline-list" style={{ padding: "8px 16px" }}>
                        {group.events.map(renderEventItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      ) : (
        filteredEvents.length === 0
          ? emptyState
          : (
            <div className="timeline-list" style={{ marginTop: "8px" }}>
              {filteredEvents.map(renderEventItem)}
            </div>
          )
      )}
    </div>
  );
}
