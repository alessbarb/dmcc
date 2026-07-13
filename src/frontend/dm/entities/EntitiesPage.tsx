import "./entities.css";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Filter, MapPin, Network, Plus, Search, Users, X, Zap, LayoutGrid, List } from "lucide-react";
import { getEntityVisual } from "./entityVisuals.js";
import { useCampaignStore, type Entity } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "./EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatEntityType, formatVisibility } from "@shared/i18n/index.js";
import { GuidedEmptyState } from "../onboarding/CampaignStarterHub.js";

function resolveEntityImageUrl(entity: Entity): string | undefined {
  const metadata = entity.metadata && typeof entity.metadata === "object" ? entity.metadata : {};
  const candidates = [
    metadata.imageUrl,
    metadata.avatarUrl,
    metadata.portraitUrl,
    metadata.coverUrl,
  ];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
}

export interface EntitiesPageProps {
  campaignState?: any;
  setIsEntityModalOpen?: (open: boolean) => void;
}

function LayersIconFallback() {
  return <Plus size={30} />;
}

function visibilityKind(entity: Entity): string {
  const visibility = entity.visibility as any;
  if (typeof visibility === "string") return visibility;
  return visibility?.kind ?? "dm_only";
}

function normalized(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

export function EntitiesPage(props: EntitiesPageProps = {}) {
  const store = useCampaignStore();
  const campaignState = props.campaignState ?? store.campaignState;
  const { updateEntity, archiveEntity } = store;
  const { addToast } = useToast();
  const { locale, t } = useTranslation();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const setIsEntityModalOpen = props.setIsEntityModalOpen ?? store.setIsEntityModalOpen;

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<"relevant" | "recent" | "alphabetical">(() => {
    try {
      const stored = localStorage.getItem("dmcc_entities_sort_by");
      if (stored === "relevant" || stored === "recent" || stored === "alphabetical") return stored;
    } catch {
      // Ignored
    }
    return "relevant";
  });
  const [viewMode, setViewMode] = useState<"card" | "compact">(() => {
    try {
      const stored = localStorage.getItem("dmcc_entities_view_mode");
      if (stored === "card" || stored === "compact") return stored;
    } catch {
      // Ignored
    }
    return "card";
  });

  const changeSortBy = (sort: "relevant" | "recent" | "alphabetical") => {
    setSortBy(sort);
    try {
      localStorage.setItem("dmcc_entities_sort_by", sort);
    } catch {
      // Ignored
    }
  };

  const changeViewMode = (mode: "card" | "compact") => {
    setViewMode(mode);
    try {
      localStorage.setItem("dmcc_entities_view_mode", mode);
    } catch {
      // Ignored
    }
  };

  const activeEntities = useMemo<Entity[]>(
    () => (campaignState?.entities ?? []).filter((entity: Entity) => !entity.archived),
    [campaignState?.entities],
  );

  const entityTypes = useMemo<string[]>(
    () => Array.from(new Set(activeEntities.map((entity) => entity.entityType))).sort(),
    [activeEntities],
  );
  const statuses = useMemo<string[]>(
    () => Array.from(new Set(activeEntities.map((entity) => entity.status).filter(Boolean))).sort(),
    [activeEntities],
  );
  const importances = useMemo<string[]>(
    () => Array.from(new Set(activeEntities.map((entity) => entity.importance).filter(Boolean))).sort(),
    [activeEntities],
  );
  const visibilities = useMemo<string[]>(
    () => Array.from(new Set(activeEntities.map(visibilityKind))).sort(),
    [activeEntities],
  );

  const filteredEntities = useMemo(() => {
    const query = normalized(entitySearchQuery);
    return activeEntities.filter((entity) => {
      if (entityTypeFilter !== "all" && entity.entityType !== entityTypeFilter) return false;
      if (statusFilter !== "all" && entity.status !== statusFilter) return false;
      if (importanceFilter !== "all" && entity.importance !== importanceFilter) return false;
      if (visibilityFilter !== "all" && visibilityKind(entity) !== visibilityFilter) return false;
      if (!query) return true;
      return [entity.title, entity.subtitle, entity.summary, entity.content].some((value) =>
        normalized(value).includes(query),
      );
    });
  }, [
    activeEntities,
    entitySearchQuery,
    entityTypeFilter,
    importanceFilter,
    statusFilter,
    visibilityFilter,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (entityTypeFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (importanceFilter !== "all") count++;
    if (visibilityFilter !== "all") count++;
    return count;
  }, [entityTypeFilter, statusFilter, importanceFilter, visibilityFilter]);

  const sortedEntities = useMemo(() => {
    const list = [...filteredEntities];
    const IMPORTANCE_WEIGHTS: Record<string, number> = {
      critical: 4,
      high: 3,
      normal: 2,
      low: 1,
    };

    list.sort((a, b) => {
      if (sortBy === "relevant") {
        const weightA = IMPORTANCE_WEIGHTS[a.importance] ?? 0;
        const weightB = IMPORTANCE_WEIGHTS[b.importance] ?? 0;
        if (weightA !== weightB) {
          return weightB - weightA;
        }
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      }
      if (sortBy === "recent") {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      }
      return a.title.localeCompare(b.title, locale);
    });

    return list;
  }, [filteredEntities, sortBy, locale]);

  const hasFilters =
    entitySearchQuery.trim().length > 0 ||
    entityTypeFilter !== "all" ||
    statusFilter !== "all" ||
    importanceFilter !== "all" ||
    visibilityFilter !== "all";

  const resetFilters = () => {
    setEntitySearchQuery("");
    setEntityTypeFilter("all");
    setStatusFilter("all");
    setImportanceFilter("all");
    setVisibilityFilter("all");
  };

  useEffect(() => {
    if (activeEntities.length === 0) return;
    const parameters = new URLSearchParams(window.location.search);
    const entityId = parameters.get("entityId");
    if (!entityId) return;
    const target = activeEntities.find((entity) => entity.entityId === entityId);
    if (target) setSelectedEntity(target);
    window.history.replaceState(null, "", window.location.pathname);
  }, [activeEntities]);

  return (
    <>
      <div className="entities-page">
        <div className="entities-toolbar">
          <div className="entities-header-bar">
            <div className="entities-header-bar__left">
              <span className="search-input-wrapper" style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                <Search
                  size={16}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="search"
                  className="form-input"
                  placeholder={t("entitiesPage.searchPlaceholder")}
                  style={{ paddingLeft: 36, height: 38 }}
                  value={entitySearchQuery}
                  onChange={(event) => setEntitySearchQuery(event.target.value)}
                />
              </span>
              <button
                type="button"
                className={`btn ${activeFiltersCount > 0 ? "btn-primary" : "btn-secondary"}`}
                style={{ height: 38, display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setIsFiltersExpanded((prev) => !prev)}
                aria-expanded={isFiltersExpanded}
              >
                <Filter size={15} />
                <span>{t("entitiesPage.toggleFilters")}</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-badge" style={{
                    backgroundColor: "var(--primary-foreground, #fff)",
                    color: "var(--primary, #000)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 2
                  }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            <div className="entities-header-bar__right">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", marginBottom: 0 }}>
                <span>{t("entitiesPage.sortBy")}</span>
                <select
                  className="form-select"
                  style={{ height: 38, paddingTop: 4, paddingBottom: 4, width: 140 }}
                  value={sortBy}
                  onChange={(event) => changeSortBy(event.target.value as any)}
                >
                  <option value="relevant">{t("entitiesPage.sortRelevant")}</option>
                  <option value="recent">{t("entitiesPage.sortRecent")}</option>
                  <option value="alphabetical">{t("entitiesPage.sortAlphabetical")}</option>
                </select>
              </label>

              <div className="btn-group" style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    height: 38,
                    padding: "0 12px",
                    background: viewMode === "card" ? "var(--bg-active, hsl(230, 20%, 20%))" : "transparent",
                    color: viewMode === "card" ? "var(--text-color, #fff)" : "var(--text-muted)",
                    borderRadius: 0,
                    border: "none",
                  }}
                  onClick={() => changeViewMode("card")}
                  title={t("entitiesPage.viewCard")}
                  aria-label={t("entitiesPage.viewCard")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    height: 38,
                    padding: "0 12px",
                    background: viewMode === "compact" ? "var(--bg-active, hsl(230, 20%, 20%))" : "transparent",
                    color: viewMode === "compact" ? "var(--text-color, #fff)" : "var(--text-muted)",
                    borderRadius: 0,
                    border: "none",
                  }}
                  onClick={() => changeViewMode("compact")}
                  title={t("entitiesPage.viewCompact")}
                  aria-label={t("entitiesPage.viewCompact")}
                >
                  <List size={16} />
                </button>
              </div>

              <button className="btn btn-primary" style={{ height: 38 }} type="button" onClick={() => setIsEntityModalOpen(true)}>
                <Plus size={16} /> <span className="hide-mobile">{t("entitiesPage.createEntity")}</span>
              </button>
            </div>
          </div>

          {isFiltersExpanded && (
            <div className="entities-filter-panel">
              <label>
                <span className="form-label">{t("entitiesPage.type")}</span>
                <select
                  className="form-select"
                  value={entityTypeFilter}
                  onChange={(event) => setEntityTypeFilter(event.target.value)}
                >
                  <option value="all">{t("entitiesPage.allTypes")}</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>{formatEntityType(type, locale)}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="form-label">{t("entitiesPage.status")}</span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">{t("entitiesPage.allStatuses")}</option>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>

              <label>
                <span className="form-label">{t("entitiesPage.importanceLabel")}</span>
                <select
                  className="form-select"
                  value={importanceFilter}
                  onChange={(event) => setImportanceFilter(event.target.value)}
                >
                  <option value="all">{t("entitiesPage.allImportance")}</option>
                  {importances.map((importance) => (
                    <option key={importance} value={importance}>{importance}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="form-label">{t("entitiesPage.visibility")}</span>
                <select
                  className="form-select"
                  value={visibilityFilter}
                  onChange={(event) => setVisibilityFilter(event.target.value)}
                >
                  <option value="all">{t("entitiesPage.allVisibility")}</option>
                  {visibilities.map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {formatVisibility(visibility, locale)}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", height: 38 }}
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasFilters}
                  aria-label={t("entitiesPage.clearFilters")}
                >
                  <X size={15} /> {t("entitiesPage.clearFilters")}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {t("entitiesPage.resultCount", { count: sortedEntities.length })}
            </span>
          </div>
        </div>

        {sortedEntities.length === 0 ? (
          !hasFilters ? (
            <GuidedEmptyState
              icon={<LayersIconFallback />}
              title={t("guidedStart.empty.entities.title")}
              description={t("guidedStart.empty.entities.description")}
              actions={[
                {
                  label: t("guidedStart.empty.entities.createPlace"),
                  icon: <MapPin size={14} />,
                  primary: true,
                  onClick: () => window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", {
                    detail: {
                      entityType: "location",
                      content: t("guidedStart.templates.location.content"),
                      metadata: { locationType: "settlement", atmosphere: "" },
                    },
                  })),
                },
                {
                  label: t("guidedStart.empty.entities.createNpc"),
                  icon: <Users size={14} />,
                  onClick: () => window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", {
                    detail: {
                      entityType: "npc",
                      content: t("guidedStart.templates.npc.content"),
                      metadata: { role: "", attitudeToParty: "neutral", goal: "" },
                    },
                  })),
                },
                {
                  label: t("guidedStart.empty.entities.createThreat"),
                  icon: <Zap size={14} />,
                  onClick: () => window.dispatchEvent(new CustomEvent("dmcc:open-entity-template", {
                    detail: {
                      entityType: "front",
                      importance: "high",
                      status: "active",
                      content: t("guidedStart.templates.threat.content"),
                      metadata: { stakes: "", countdown: "" },
                    },
                  })),
                },
                {
                  label: t("guidedStart.empty.entities.openGraph"),
                  icon: <Network size={14} />,
                  onClick: () => window.dispatchEvent(new CustomEvent("dmcc:start-campaign-tour")),
                },
              ]}
            />
          ) : (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <Filter size={36} aria-hidden="true" style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>{t("entitiesPage.noResults")}</p>
              <button className="btn btn-secondary" type="button" onClick={resetFilters}>
                {t("entitiesPage.clearFilters")}
              </button>
            </div>
          )
        ) : viewMode === "compact" ? (
          <div className="entity-compact-list">
            {sortedEntities.map((entity) => {
              const visibility = visibilityKind(entity);
              const isDmOnly = visibility === "dm_only";
              const cfg = getEntityVisual(entity.entityType);
              const IconComponent = cfg.icon;
              const isCritical = entity.importance === "critical";

              return (
                <button
                  key={entity.entityId}
                  type="button"
                  className={`entity-compact-row ${isDmOnly ? "entity-compact-row--dm-only" : ""} ${isCritical ? "entity-compact-row--critical" : ""}`}
                  onClick={() => setSelectedEntity(entity)}
                  style={{
                    "--entity-accent": cfg.accent,
                    "--entity-accent-soft": cfg.accentSoft,
                  } as React.CSSProperties}
                >
                  <div className="entity-compact-row__left">
                    <div className="entity-compact-row__icon">
                      <IconComponent size={16} />
                    </div>
                    <div className="entity-compact-row__info">
                      <div className="entity-compact-row__title-group">
                        <span className="entity-compact-row__title">{entity.title}</span>
                        {entity.subtitle && <span className="entity-compact-row__subtitle">({entity.subtitle})</span>}
                      </div>
                      {entity.summary && <span className="entity-compact-row__summary">{entity.summary}</span>}
                    </div>
                  </div>

                  <div className="entity-compact-row__right">
                    <span className="entity-type-badge">
                      {formatEntityType(entity.entityType, locale)}
                    </span>
                    {entity.status && <span className="badge badge-default">{entity.status}</span>}
                    {entity.importance && entity.importance !== "normal" && (
                      <span className={`badge ${isCritical ? "badge-critical" : "badge-warning"}`}>
                        {entity.importance}
                      </span>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {isDmOnly ? <EyeOff size={12} /> : <Eye size={12} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="entity-card-grid">
            {sortedEntities.map((entity) => {
              const visibility = visibilityKind(entity);
              const isDmOnly = visibility === "dm_only";
              const customImageUrl = resolveEntityImageUrl(entity);
              const cfg = getEntityVisual(entity.entityType);
              const IconComponent = cfg.icon;
              const isCritical = entity.importance === "critical";
              const isHigh = entity.importance === "high";

              const cardClasses = [
                "entity-card",
                `entity-card--shape-${cfg.shape}`,
                `entity-card--border-${cfg.borderPattern}`,
                isDmOnly ? "entity-card--dm-only" : "",
                isCritical ? "entity-card--critical" : "",
                isHigh ? "entity-card--high" : "",
              ].filter(Boolean).join(" ");

              return (
                <button
                  key={entity.entityId}
                  type="button"
                  className={cardClasses}
                  onClick={() => setSelectedEntity(entity)}
                  style={{
                    "--entity-accent": cfg.accent,
                    "--entity-accent-soft": cfg.accentSoft,
                  } as React.CSSProperties}
                  aria-label={`${entity.title}. ${formatEntityType(entity.entityType, locale)}. ${formatVisibility(visibility, locale)}`}
                >
                  <div
                    className={[
                      "entity-card__hero",
                      `entity-card__hero--shape-${cfg.shape}`,
                      customImageUrl ? "entity-card__hero--img" : "entity-card__hero--no-img"
                    ].filter(Boolean).join(" ")}
                  >
                    {customImageUrl ? (
                      <img
                        src={customImageUrl}
                        alt=""
                        className="entity-card__hero-img"
                        style={{
                          filter: isDmOnly ? "grayscale(50%) brightness(45%)" : "none",
                        }}
                      />
                    ) : (
                      <div className="entity-card__hero-icon-wrapper">
                        <IconComponent className="entity-card__hero-icon" size={28} />
                      </div>
                    )}
                    {isDmOnly && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 8px",
                          backgroundColor: "hsla(350, 75%, 45%, 0.9)",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          borderRadius: 4,
                          zIndex: 2,
                        }}
                      >
                        <EyeOff size={11} /> {formatVisibility("dm_only", locale)}
                      </span>
                    )}
                  </div>

                  <div className="entity-card__body">
                    <div className="entity-card__header">
                      <span className="entity-type-badge">
                        {formatEntityType(entity.entityType, locale)}
                      </span>
                      {entity.status && <span className="badge badge-default">{entity.status}</span>}
                    </div>
                    <strong className="entity-card__title">{entity.title}</strong>
                    {entity.subtitle && <span className="entity-card__subtitle">{entity.subtitle}</span>}
                    <span className="entity-card__summary">
                      {entity.summary || t("entitiesPage.noSummary")}
                    </span>
                    <div className="entity-card__footer">
                      <span>{t("entitiesPage.importanceLabel")}: {entity.importance}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {isDmOnly ? <EyeOff size={12} /> : <Eye size={12} />}
                        {formatVisibility(visibility, locale)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedEntity && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setSelectedEntity(null)}
          onEdit={async (entityId, updates) => {
            try {
              await updateEntity(entityId, updates);
              setSelectedEntity((current) => current ? { ...current, ...updates } as Entity : null);
            } catch (error: any) {
              addToast(error.message || t("entitiesPage.updateError"), "error");
            }
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntity(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            try {
              await updateEntity(entityId, { visibility });
              setSelectedEntity((current) => current ? { ...current, visibility } : null);
            } catch (error: any) {
              addToast(error.message || t("entitiesPage.updateError"), "error");
            }
          }}
          addToast={addToast}
        />
      )}
    </>
  );
}
