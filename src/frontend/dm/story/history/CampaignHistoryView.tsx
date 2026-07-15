import React, { useEffect, useState, useTransition } from "react";
import { useParams } from "@tanstack/react-router";
import {
  BookOpen,
  Settings,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Archive,
  Link as LinkIcon,
  Link2,
  Unlink,
  Info,
  Calendar,
  Play,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Trash,
  Map,
  Tv,
  UserMinus,
  Flag,
  HelpCircle,
  Shield,
  Wrench,
  RefreshCw,
  ChevronDown,
  Clock,
  Layers,
  ChevronUp
} from "lucide-react";
import { getCampaignHistory, type CampaignHistoryResponse } from "../../../shared/api/webProductClient.js";
import { getActivityVisualConfig } from "../../../../core/projections/activity/activityPresentation.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

const IconMap: Record<string, React.ComponentType<any>> = {
  BookOpen,
  Settings,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  CheckCircle,
  XCircle,
  Plus,
  Pencil,
  Archive,
  Link: LinkIcon,
  Link2,
  Unlink,
  Info,
  Calendar,
  Play,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Trash,
  Map,
  Tv,
  UserMinus,
  Flag,
  HelpCircle
};

const CATEGORIES = [
  { id: "all", labelEs: "Todo", labelEn: "All", icon: Layers },
  { id: "session", labelEs: "Sesiones", labelEn: "Sessions", icon: Calendar },
  { id: "content", labelEs: "Contenido", labelEn: "Content", icon: Plus },
  { id: "knowledge", labelEs: "Conocimiento", labelEn: "Knowledge", icon: Info },
  { id: "story", labelEs: "Narrativa", labelEn: "Story", icon: BookOpen },
  { id: "people", labelEs: "Personas", labelEn: "People", icon: UserCheck },
  { id: "collaboration", labelEs: "Colaboración", labelEn: "Collaboration", icon: Settings },
  { id: "operation", labelEs: "Operativo", labelEn: "Operational", icon: Wrench }
];

export function CampaignHistoryView() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { locale } = useTranslation();
  const isEs = locale === "es";

  const [entries, setEntries] = useState<CampaignHistoryResponse["entries"]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedJson, setExpandedJson] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const fetchHistory = async (cat: string, cursor?: string) => {
    try {
      const filters = {
        category: cat === "all" ? undefined : cat,
        cursor,
        limit: 25
      };
      const res = await getCampaignHistory(campaignId, filters);
      if (cursor) {
        setEntries((prev) => [...prev, ...res.entries]);
      } else {
        setEntries(res.entries);
      }
      setNextCursor(res.nextCursor);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(isEs ? "No se pudo cargar el historial de la campaña" : "Could not load campaign history");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setEntries([]);
    setNextCursor(undefined);
    void fetchHistory(category);
  }, [campaignId, category]);

  const handleLoadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    void fetchHistory(category, nextCursor);
  };

  const handleCategoryChange = (cat: string) => {
    startTransition(() => {
      setCategory(cat);
    });
  };

  const toggleJson = (id: string) => {
    setExpandedJson((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "8px" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "16px"
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
          {isEs ? "Crónica de Campaña" : "Campaign Chronicle"}
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.5 }}>
          {isEs
            ? "Registro cronológico de eventos e hitos narrativos de tu campaña de rol. Integra eventos inmutables del ledger y actividades operativas."
            : "Chronological log of events and narrative milestones of your roleplaying campaign. Integrates immutable ledger events and operational activities."}
        </p>
      </header>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Sidebar Filters */}
        <aside
          style={{
            position: "sticky",
            top: "80px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(8px)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)"
          }}
        >
          <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px 0", color: "var(--text-muted)" }}>
            {isEs ? "Categorías" : "Categories"}
          </h3>
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: isSelected ? "var(--primary-dark, #2a2d48)" : "transparent",
                  color: isSelected ? "var(--primary, #6366f1)" : "var(--text-muted)",
                  fontWeight: isSelected ? "600" : "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <CatIcon size={18} />
                <span>{isEs ? cat.labelEs : cat.labelEn}</span>
              </button>
            );
          })}
        </aside>

        {/* Timeline Content */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "16px",
                borderRadius: "8px"
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <RefreshCw className="animate-spin" size={32} style={{ color: "var(--text-muted)" }} />
            </div>
          ) : entries.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "64px 32px",
                borderRadius: "12px",
                border: "2px dashed var(--border-color)",
                color: "var(--text-muted)"
              }}
            >
              <Clock size={48} style={{ marginBottom: "16px", strokeWidth: 1.5 }} />
              <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main)" }}>
                {isEs ? "Sin actividades" : "No activities"}
              </h3>
              <p style={{ margin: 0 }}>
                {isEs
                  ? "No se han encontrado registros en esta categoría."
                  : "No logs found in this category."}
              </p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Timeline Connector Line */}
              <div
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "12px",
                  bottom: "12px",
                  width: "2px",
                  background: "var(--border-color)"
                }}
              />

              {entries.map((entry) => {
                const config = getActivityVisualConfig(entry.type, entry.data, locale as any);
                const EntryIcon = IconMap[config.icon] || HelpCircle;
                const isLedger = entry.sourceKind === "domain_event";
                const isExpanded = !!expandedJson[entry.activityId];

                return (
                  <div key={entry.activityId} style={{ position: "relative" }}>
                    {/* Circle Node Icon */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-32px",
                        top: "4px",
                        marginLeft: "-16px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: config.bgColor,
                        border: `2px solid ${config.color}`,
                        color: config.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1
                      }}
                    >
                      <EntryIcon size={16} />
                    </div>

                    {/* Card container */}
                    <div
                      className="card"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        cursor: "default"
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <span
                              style={{
                                color: config.color,
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                              }}
                            >
                              {config.label}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                              {new Date(entry.occurredAt).toLocaleString(locale)}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "var(--text-main)" }}>
                            {config.description}
                          </p>
                        </div>

                        {/* Source Badge */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {isLedger ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                background: "rgba(99, 102, 241, 0.1)",
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                                color: "var(--primary, #6366f1)",
                                fontSize: "0.75rem",
                                fontWeight: "600"
                              }}
                            >
                              <Shield size={12} />
                              Ledger
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                background: "rgba(245, 158, 11, 0.1)",
                                border: "1px solid rgba(245, 158, 11, 0.2)",
                                color: "#fbbf24",
                                fontSize: "0.75rem",
                                fontWeight: "600"
                              }}
                            >
                              <Wrench size={12} />
                              Ops
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer / Details */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderTop: "1px solid var(--border-color)",
                          paddingTop: "12px",
                          fontSize: "0.85rem",
                          color: "var(--text-muted)"
                        }}
                      >
                        <div>
                          {entry.actorUserId && (
                            <span>
                              {isEs ? "Por: " : "By: "}
                              <strong style={{ color: "var(--text-main)" }}>{entry.actorUserId}</strong>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleJson(entry.activityId)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.8rem",
                            padding: "4px"
                          }}
                        >
                          <span>{isExpanded ? (isEs ? "Ocultar JSON" : "Hide JSON") : (isEs ? "Ver JSON" : "Show JSON")}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* JSON Collapsible details */}
                      {isExpanded && (
                        <pre
                          style={{
                            background: "rgba(0, 0, 0, 0.2)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            padding: "12px",
                            fontSize: "0.8rem",
                            overflowX: "auto",
                            color: "#818cf8",
                            margin: 0
                          }}
                        >
                          {JSON.stringify(entry, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {nextCursor && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 24px"
                    }}
                  >
                    {loadingMore ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <span>{isEs ? "Cargar más" : "Load more"}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
export default CampaignHistoryView;
