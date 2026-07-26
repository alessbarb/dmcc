import React, { useEffect, useMemo, useState, useTransition } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { getCampaignHistory, type CampaignHistoryResponse } from "../../../shared/api/webProductClient.js";
import { getActivityVisualConfig } from "../../../../core/projections/activity/activityPresentation.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelativeTime } from "../../../shared/presentation/formatRelativeTime.js";
import "./campaignHistory.css";

const IconMap: Record<string, LucideIcon> = {
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
  { id: "all", labelKey: "campaignHistory.categories.all", icon: Layers },
  { id: "story", labelKey: "campaignHistory.categories.story", icon: BookOpen },
  { id: "session", labelKey: "campaignHistory.categories.session", icon: Calendar },
  { id: "knowledge", labelKey: "campaignHistory.categories.knowledge", icon: Info },
  { id: "content", labelKey: "campaignHistory.categories.content", icon: Plus },
  { id: "people", labelKey: "campaignHistory.categories.people", icon: UserCheck },
  { id: "collaboration", labelKey: "campaignHistory.categories.collaboration", icon: Settings },
  { id: "operation", labelKey: "campaignHistory.categories.operation", icon: Wrench },
] as const;

export function CampaignHistoryView() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { locale, t } = useTranslation();
  const activityLocale = locale === "es" ? "es" : "en";
  const [entries, setEntries] = useState<CampaignHistoryResponse["entries"]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});
  const [includeTechnical, setIncludeTechnical] = useState(false);

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter((c) => {
      if (!includeTechnical) {
        return c.id !== "operation" && c.id !== "collaboration";
      }
      return true;
    });
  }, [includeTechnical]);

  const handleTechnicalToggle = (checked: boolean) => {
    setIncludeTechnical(checked);
    if (!checked && (category === "operation" || category === "collaboration")) {
      setCategory("all");
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groupedEntries = useMemo(() => {
    const groups: Array<{
      key: string;
      type: string;
      entries: typeof entries;
    }> = [];

    const filtered = entries.filter((entry) => {
      if (!includeTechnical) {
        return entry.category !== "operation" && entry.category !== "collaboration";
      }
      return true;
    });

    for (const entry of filtered) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === entry.type) {
        lastGroup.entries.push(entry);
      } else {
        groups.push({
          key: entry.activityId,
          type: entry.type,
          entries: [entry],
        });
      }
    }
    return groups;
  }, [entries, includeTechnical]);

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
      setError(t("campaignHistory.loadError"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setEntries([]);
    setNextCursor(undefined);
    setExpandedGroupIds({});
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
        <div className="campaign-history__layout">
        <aside className="campaign-history__filters" aria-label={t("campaignHistory.categoriesLabel")}>
          <h2 className="campaign-history__filters-title">{t("campaignHistory.categoriesLabel")}</h2>
          {visibleCategories.map((candidate) => {
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
                <span>{t(candidate.labelKey)}</span>
              </button>
            );
          })}

          <div className="campaign-history__tech-toggle">
            <label className="campaign-history__tech-label">
              <input
                type="checkbox"
                className="campaign-history__tech-checkbox"
                checked={includeTechnical}
                onChange={(e) => handleTechnicalToggle(e.target.checked)}
              />
              <span>{t("campaignHistory.includeTechnical")}</span>
            </label>
          </div>
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
                <h3>{t("campaignHistory.emptyTitle")}</h3>
                <p>{t("campaignHistory.emptyDescription")}</p>
              </div>
            </div>
          ) : (
            <div className="campaign-history__timeline">
              {groupedEntries.map((group) => {
                const latestEntry = group.entries[0];
                const config = getActivityVisualConfig(latestEntry.type, latestEntry.data, activityLocale);
                const EntryIcon = IconMap[config.icon] || HelpCircle;
                const entryStyle: React.CSSProperties & Record<`--${string}`, string | undefined> = {
                  "--history-color": config.color,
                  "--history-bg": config.bgColor,
                };

                if (group.entries.length === 1) {
                  const entry = latestEntry;
                  const sourceLabel = entry.sourceKind === "domain_event" ? "domain_event" : "operation";
                  return (
                    <article
                      key={entry.activityId}
                      className="campaign-history-entry"
                      style={entryStyle}
                    >
                      <span className="campaign-history-entry__marker" aria-hidden="true">
                        <EntryIcon size={15} />
                      </span>
                      <div className="campaign-history-entry__card">
                        <div className="campaign-history-entry__meta">
                          <span className="campaign-history-entry__category">{config.label}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={entry.occurredAt} title={new Date(entry.occurredAt).toLocaleString(locale)}>{formatRelativeTime(entry.occurredAt, locale)}</time>
                        </div>
                        <p className="campaign-history-entry__description">{config.description}</p>

                        <details className="campaign-history-entry__technical">
                          <summary>
                            {entry.sourceKind === "domain_event" ? <Shield size={13} /> : <Wrench size={13} />}
                            {t("campaignHistory.technicalDetails")}
                          </summary>
                          <dl>
                            <dt>{t("campaignHistory.source")}</dt><dd>{sourceLabel}</dd>
                            <dt>{t("campaignHistory.type")}</dt><dd>{entry.type}</dd>
                            {entry.actorUserId && <><dt>{t("campaignHistory.actor")}</dt><dd>{entry.actorUserId}</dd></>}
                            {entry.sessionId && <><dt>{t("campaignHistory.session")}</dt><dd>{entry.sessionId}</dd></>}
                            {entry.targetType && <><dt>{t("campaignHistory.target")}</dt><dd>{entry.targetType}: {entry.targetId}</dd></>}
                          </dl>
                          <pre className="campaign-history-entry__json">{JSON.stringify(entry.data, null, 2)}</pre>
                        </details>
                      </div>
                    </article>
                  );
                }

                const isExpanded = !!expandedGroupIds[group.key];
                return (
                  <article
                    key={group.key}
                    className="campaign-history-entry"
                    style={entryStyle}
                  >
                    <span className="campaign-history-entry__marker" aria-hidden="true">
                      <EntryIcon size={15} />
                    </span>
                    <div className="campaign-history-entry__card campaign-history-entry__card--grouped">
                      <div className="campaign-history-entry__meta">
                        <span className="campaign-history-entry__category">{config.label}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={latestEntry.occurredAt} title={new Date(latestEntry.occurredAt).toLocaleString(locale)}>{formatRelativeTime(latestEntry.occurredAt, locale)}</time>
                        <span aria-hidden="true">·</span>
                        <span className="campaign-history-entry__consecutive-count">
                          {t("campaignHistory.consecutiveEvents", { count: group.entries.length })}
                        </span>
                      </div>
                      <p className="campaign-history-entry__description">
                        {t("campaignHistory.similarActivities", { count: group.entries.length, label: config.label })}
                      </p>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm campaign-history-entry__toggle"
                        onClick={() => toggleGroup(group.key)}
                      >
                        {isExpanded
                          ? t("campaignHistory.hideDetails")
                          : t("campaignHistory.showDetails", { count: group.entries.length })}
                      </button>

                      {isExpanded && (
                        <div className="campaign-history-entry__group-children">
                          {group.entries.map((childEntry) => {
                            const childConfig = getActivityVisualConfig(childEntry.type, childEntry.data, activityLocale);
                            const childSourceLabel = childEntry.sourceKind === "domain_event" ? "domain_event" : "operation";
                            return (
                              <div key={childEntry.activityId} className="campaign-history-entry__child-item">
                                <div className="campaign-history-entry__meta campaign-history-entry__meta--child">
                                  <time dateTime={childEntry.occurredAt} title={new Date(childEntry.occurredAt).toLocaleString(locale)}>{formatRelativeTime(childEntry.occurredAt, locale)}</time>
                                  {childEntry.actorUserId && <><span>·</span><span>{t("campaignHistory.actor")}: {childEntry.actorUserId}</span></>}
                                </div>
                                <p className="campaign-history-entry__description campaign-history-entry__description--child">{childConfig.description}</p>
                                <details className="campaign-history-entry__technical">
                                  <summary className="campaign-history-entry__technical-summary--child">
                                    {childEntry.sourceKind === "domain_event" ? <Shield size={11} /> : <Wrench size={11} />}
                                    {t("campaignHistory.technicalDetails")}
                                  </summary>
                                  <dl className="campaign-history-entry__technical-list--child">
                                    <dt>{t("campaignHistory.source")}</dt><dd>{childSourceLabel}</dd>
                                    <dt>{t("campaignHistory.type")}</dt><dd>{childEntry.type}</dd>
                                    {childEntry.actorUserId && <><dt>{t("campaignHistory.actor")}</dt><dd>{childEntry.actorUserId}</dd></>}
                                    {childEntry.sessionId && <><dt>{t("campaignHistory.session")}</dt><dd>{childEntry.sessionId}</dd></>}
                                    {childEntry.targetType && <><dt>{t("campaignHistory.target")}</dt><dd>{childEntry.targetType}: {childEntry.targetId}</dd></>}
                                  </dl>
                                  <pre className="campaign-history-entry__json campaign-history-entry__json--child">{JSON.stringify(childEntry.data, null, 2)}</pre>
                                </details>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}

              {nextCursor && (
                <div className="campaign-history__load-more">
                  <button className="btn btn-secondary" type="button" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? <RefreshCw className="animate-spin" size={16} /> : t("campaignHistory.loadMore")}
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
