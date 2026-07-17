import React, { useEffect, useState, useTransition } from "react";
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Archive,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Info,
  Layers,
  Link as LinkIcon,
  Link2,
  Mail,
  Map,
  Paperclip,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Trash,
  Tv,
  Unlink,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Wrench,
  XCircle,
} from "lucide-react";
import { getCampaignHistory, type CampaignHistoryResponse } from "../../../shared/api/webProductClient.js";
import { getActivityVisualConfig } from "../../../../core/projections/activity/activityPresentation.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import "./campaignHistory.css";

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
  HelpCircle,
};

const CATEGORIES = [
  { id: "all", labelEs: "Todo", labelEn: "All", icon: Layers },
  { id: "session", labelEs: "Sesiones", labelEn: "Sessions", icon: Calendar },
  { id: "content", labelEs: "Contenido", labelEn: "Content", icon: Plus },
  { id: "knowledge", labelEs: "Conocimiento", labelEn: "Knowledge", icon: Info },
  { id: "story", labelEs: "Narrativa", labelEn: "Story", icon: BookOpen },
  { id: "people", labelEs: "Personas", labelEn: "People", icon: UserCheck },
  { id: "collaboration", labelEs: "Colaboración", labelEn: "Collaboration", icon: Settings },
  { id: "operation", labelEs: "Operativo", labelEn: "Operational", icon: Wrench },
] as const;

export function CampaignHistoryView() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { locale } = useTranslation();
  const isEs = locale === "es";
  const [entries, setEntries] = useState<CampaignHistoryResponse["entries"]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchHistory = async (selectedCategory: string, cursor?: string) => {
    try {
      const response = await getCampaignHistory(campaignId, {
        category: selectedCategory === "all" ? undefined : selectedCategory,
        cursor,
        limit: 25,
      });
      setEntries((current) => cursor ? [...current, ...response.entries] : response.entries);
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (cause) {
      console.error(cause);
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

  const handleCategoryChange = (nextCategory: string) => {
    startTransition(() => setCategory(nextCategory));
  };

  return (
    <div className="campaign-history">
      <header className="campaign-history__header">
        <div>
          <h1>{isEs ? "Crónica de campaña" : "Campaign chronicle"}</h1>
          <p>
            {isEs
              ? "Hitos narrativos y actividad de campaña ordenados cronológicamente. Los datos técnicos permanecen disponibles sin interferir con la lectura principal."
              : "Narrative milestones and campaign activity in chronological order. Technical data remains available without interrupting the main reading flow."}
          </p>
        </div>
      </header>

      <div className="campaign-history__layout">
        <aside className="campaign-history__filters" aria-label={isEs ? "Categorías" : "Categories"}>
          <h2 className="campaign-history__filters-title">{isEs ? "Categorías" : "Categories"}</h2>
          {CATEGORIES.map((candidate) => {
            const CategoryIcon = candidate.icon;
            const selected = category === candidate.id;
            return (
              <button
                key={candidate.id}
                type="button"
                className={`campaign-history__filter ${selected ? "is-active" : ""}`}
                aria-pressed={selected}
                onClick={() => handleCategoryChange(candidate.id)}
              >
                <CategoryIcon size={17} aria-hidden="true" />
                <span>{isEs ? candidate.labelEs : candidate.labelEn}</span>
              </button>
            );
          })}
        </aside>

        <section className="campaign-history__content">
          {error && <div className="campaign-history__error" role="alert">{error}</div>}

          {loading ? (
            <div className="campaign-history__state" aria-live="polite">
              <div className="campaign-history__state-inner"><RefreshCw className="animate-spin" size={30} /></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="campaign-history__state">
              <div className="campaign-history__state-inner">
                <Clock size={42} aria-hidden="true" />
                <h3>{isEs ? "Sin actividades" : "No activities"}</h3>
                <p>{isEs ? "No se han encontrado registros en esta categoría." : "No records were found in this category."}</p>
              </div>
            </div>
          ) : (
            <div className="campaign-history__timeline">
              {entries.map((entry) => {
                const config = getActivityVisualConfig(entry.type, entry.data, locale as any);
                const EntryIcon = IconMap[config.icon] || HelpCircle;
                const sourceLabel = entry.sourceKind === "domain_event" ? "domain_event" : "operation";

                return (
                  <article
                    key={entry.activityId}
                    className="campaign-history-entry"
                    style={{
                      "--history-color": config.color,
                      "--history-bg": config.bgColor,
                    } as React.CSSProperties}
                  >
                    <span className="campaign-history-entry__marker" aria-hidden="true">
                      <EntryIcon size={15} />
                    </span>
                    <div className="campaign-history-entry__card">
                      <div className="campaign-history-entry__meta">
                        <span className="campaign-history-entry__category">{config.label}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={entry.occurredAt}>{new Date(entry.occurredAt).toLocaleString(locale)}</time>
                      </div>
                      <p className="campaign-history-entry__description">{config.description}</p>

                      <details className="campaign-history-entry__technical">
                        <summary>
                          {entry.sourceKind === "domain_event" ? <Shield size={13} /> : <Wrench size={13} />}
                          {isEs ? "Detalles técnicos" : "Technical details"}
                        </summary>
                        <dl>
                          <dt>{isEs ? "Origen" : "Source"}</dt><dd>{sourceLabel}</dd>
                          <dt>{isEs ? "Tipo" : "Type"}</dt><dd>{entry.type}</dd>
                          {entry.actorUserId && <><dt>{isEs ? "Actor" : "Actor"}</dt><dd>{entry.actorUserId}</dd></>}
                          {entry.sessionId && <><dt>{isEs ? "Sesión" : "Session"}</dt><dd>{entry.sessionId}</dd></>}
                          {entry.targetType && <><dt>{isEs ? "Destino" : "Target"}</dt><dd>{entry.targetType}: {entry.targetId}</dd></>}
                        </dl>
                        <pre className="campaign-history-entry__json">{JSON.stringify(entry.data, null, 2)}</pre>
                      </details>
                    </div>
                  </article>
                );
              })}

              {nextCursor && (
                <div className="campaign-history__load-more">
                  <button className="btn btn-secondary" type="button" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? <RefreshCw className="animate-spin" size={16} /> : (isEs ? "Cargar más" : "Load more")}
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
