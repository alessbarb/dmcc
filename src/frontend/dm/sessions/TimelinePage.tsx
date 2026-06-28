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

export function TimelinePage(props: TimelinePageProps = {}) {
  const store = useCampaignStore();
  const { locale, t } = useTranslation();
  const timeline = props.timeline ?? store.timeline;
  const campaignState = props.campaignState ?? store.campaignState;
  const onEntityClick = props.onEntityClick;
  const [timelineFilterLocal, setTimelineFilterLocal] = useState("narrative");
  const [expandedEventsLocal, setExpandedEventsLocal] = useState<
    Record<string, boolean>
  >({});
  const [showTechnical, setShowTechnical] = useState(false);
  const timelineFilter = props.timelineFilter ?? timelineFilterLocal;
  const setTimelineFilter = props.setTimelineFilter ?? setTimelineFilterLocal;
  const expandedEvents = props.expandedEvents ?? expandedEventsLocal;
  const toggleEventJson =
    props.toggleEventJson ??
    ((id: string) => {
      setExpandedEventsLocal((prev) => ({ ...prev, [id]: !prev[id] }));
    });

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
    sessions: timeline.events.filter((e: any) => e.type === "SessionClosed")
      .length,
    facts: timeline.events.filter((e: any) => e.type === "FactCreated").length,
    revelaciones: timeline.events.filter(
      (e: any) => e.type === "VisibilityChanged",
    ).length,
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
      if (timelineFilter === "narrative")
        return NARRATIVE_EVENT_TYPES.has(evt.type);
      return getEventVisualConfig(evt.type).category === timelineFilter;
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Chronicles Hero Header Banner */}
      <div
        className="card"
        style={{
          position: "relative",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          border: "1px solid var(--border-color)",
          background:
            "linear-gradient(135deg, hsla(255, 85%, 65%, 0.1), hsla(175, 85%, 45%, 0.05))",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.08,
          }}
        >
          <BookOpen size={96} style={{ color: "var(--primary)" }} />
        </div>
        <h2
          style={{
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "1.5rem",
          }}
        >
          <Activity size={24} style={{ color: "var(--primary)" }} />
          {t("timeline.heroTitle")}
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            maxWidth: "800px",
            margin: 0,
          }}
        >
          {t("timeline.heroSubtitle")}
        </p>
      </div>

      {/* Timeline Stats Grid */}
      <div className="timeline-stats-grid">
        <div className="timeline-stat-card">
          <div
            className="timeline-stat-icon-wrapper"
            style={{
              backgroundColor: "hsla(255, 85%, 65%, 0.15)",
              color: "hsl(255, 85%, 65%)",
            }}
          >
            <Activity size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.total}</span>
            <span className="timeline-stat-label">{t("timeline.statsNarrative")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div
            className="timeline-stat-icon-wrapper"
            style={{
              backgroundColor: "hsla(10, 95%, 60%, 0.15)",
              color: "hsl(10, 95%, 60%)",
            }}
          >
            <Calendar size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.sessions}</span>
            <span className="timeline-stat-label">{t("timeline.statsSessions")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div
            className="timeline-stat-icon-wrapper"
            style={{
              backgroundColor: "hsla(38, 95%, 55%, 0.15)",
              color: "hsl(38, 95%, 55%)",
            }}
          >
            <Info size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.facts}</span>
            <span className="timeline-stat-label">{t("timeline.statsFacts")}</span>
          </div>
        </div>

        <div className="timeline-stat-card">
          <div
            className="timeline-stat-icon-wrapper"
            style={{
              backgroundColor: "hsla(195, 95%, 50%, 0.15)",
              color: "hsl(195, 95%, 50%)",
            }}
          >
            <Eye size={20} />
          </div>
          <div className="timeline-stat-info">
            <span className="timeline-stat-value">{stats.revelaciones}</span>
            <span className="timeline-stat-label">{t("timeline.statsReveals")}</span>
          </div>
        </div>
      </div>

      {/* Filter pill-bar */}
      <div style={{ marginTop: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-main)",
              margin: 0,
            }}
          >
            {t("timeline.filterByCategory")}
          </p>
          <button
            className={`btn btn-sm ${showTechnical ? "btn-primary" : "btn-secondary"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
            }}
            onClick={() => {
              setShowTechnical((v) => !v);
              setTimelineFilter("narrative");
            }}
          >
            <SlidersHorizontal size={13} />
            {showTechnical
              ? t("timeline.hideTechnical")
              : t("timeline.showTechnical")}
          </button>
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
                  backgroundColor:
                    timelineFilter === opt.key
                      ? "hsla(255, 85%, 65%, 0.25)"
                      : "var(--bg-card)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  color:
                    timelineFilter === opt.key
                      ? "var(--text-main)"
                      : "var(--text-muted)",
                  marginLeft: "2px",
                  border: "1px solid var(--border-color)",
                }}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      {filteredEvents.length === 0 ? (
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            textAlign: "center",
            border: "1px dashed var(--border-color)",
            background: "transparent",
            gap: "16px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-input)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <HelpCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontWeight: "600", fontSize: "1.1rem" }}>
              {t("timeline.noEventsTitle")}
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                marginTop: "4px",
              }}
            >
              {t("timeline.noEventsDescription")}
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setTimelineFilter("all")}
          >
            {t("timeline.showAllEvents")}
          </button>
        </div>
      ) : (
        <div className="timeline-list" style={{ marginTop: "8px" }}>
          {filteredEvents.map((evt: any) => {
            const visual = getEventVisualConfig(evt.type, locale);
            const IconComp = visual.IconComponent;

            return (
              <div key={evt.eventId} className="timeline-item">
                <div
                  className="timeline-marker"
                  style={{
                    backgroundColor: visual.bgColor,
                    borderColor: visual.color,
                    boxShadow: `0 0 8px ${visual.bgColor}`,
                  }}
                >
                  <IconComp size={16} style={{ color: visual.color }} />
                </div>

                <div
                  className="timeline-content"
                  style={{
                    borderLeft: `4px solid ${visual.color}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        backgroundColor: visual.bgColor,
                        color: visual.color,
                        border: `1px solid ${visual.color}`,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {visual.label}
                    </span>
                    <span
                      className="timeline-time"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={12} />
                      {new Date(evt.occurredAt).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ marginTop: "12px", padding: "4px 0" }}>
                    {renderEventDescription(
                      evt.type,
                      evt.payload,
                      campaignState,
                      locale,
                      onEntityClick,
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "12px",
                      borderTop: "1px solid var(--border-color)",
                      paddingTop: "10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      <strong>{t("timeline.actor")}</strong>{" "}
                      <code
                        style={{
                          backgroundColor: "#1e2230",
                          padding: "2px 4px",
                          borderRadius: "4px",
                        }}
                      >
                        {evt.actorId}
                      </code>{" "}
                      | <strong>{t("timeline.sequence")}</strong> #{evt.sequence}
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      onClick={() => toggleEventJson(evt.eventId)}
                    >
                      {expandedEvents[evt.eventId] ? (
                        <EyeOff size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                      {expandedEvents[evt.eventId]
                        ? t("timeline.hideJson")
                        : t("timeline.showJson")}
                    </button>
                  </div>

                  {expandedEvents[evt.eventId] && evt.payload && (
                    <pre
                      style={{
                        backgroundColor: "#06070e",
                        padding: "12px",
                        borderRadius: "var(--radius-sm)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "hsl(120, 70%, 65%)",
                        overflowX: "auto",
                        border: "1px solid var(--border-color)",
                        marginTop: "10px",
                      }}
                    >
                      {JSON.stringify(evt.payload, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
