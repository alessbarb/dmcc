import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Filter, MapPin, Network, Plus, Search, Users, X, Zap } from "lucide-react";
import { getEntityDefaultImage } from "./entityVisuals.js";
import { useCampaignStore, type Entity } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "./EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { useTranslation } from "../../shared/i18n/useTranslation.js";
import { formatEntityType, formatVisibility } from "@shared/i18n/index.js";
import { GuidedEmptyState } from "../onboarding/CampaignStarterHub.js";

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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section className="card" aria-label={t("entitiesPage.filters")} style={{ padding: 16 }}>
          <div className="entity-filter-grid">
            <label className="entity-filter-grid__search">
              <span className="form-label">{t("common.search")}</span>
              <span style={{ position: "relative", display: "block" }}>
                <Search
                  size={18}
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
                  style={{ paddingLeft: 38 }}
                  value={entitySearchQuery}
                  onChange={(event) => setEntitySearchQuery(event.target.value)}
                />
              </span>
            </label>

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

            <button
              className="btn btn-secondary"
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              aria-label={t("entitiesPage.clearFilters")}
            >
              <X size={16} /> {t("entitiesPage.clearFilters")}
            </button>
          </div>

          <div
            aria-live="polite"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {t("entitiesPage.resultCount", { count: filteredEntities.length })}
            </span>
            <button className="btn btn-primary" type="button" onClick={() => setIsEntityModalOpen(true)}>
              <Plus size={16} /> {t("entitiesPage.createEntity")}
            </button>
          </div>
        </section>

        {filteredEntities.length === 0 ? (
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
        ) : (
          <div className="entity-card-grid">
            {filteredEntities.map((entity) => {
              const visibility = visibilityKind(entity);
              const isDmOnly = visibility === "dm_only";
              const imageUrl = (entity.metadata as any)?.imageUrl || getEntityDefaultImage(entity.entityType);
              return (
                <button
                  key={entity.entityId}
                  type="button"
                  className="card"
                  onClick={() => setSelectedEntity(entity)}
                  style={{
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    textAlign: "left",
                    color: "inherit",
                    border: isDmOnly
                      ? "1px solid hsla(350, 70%, 50%, 0.4)"
                      : "1px solid var(--border-color)",
                    boxShadow: isDmOnly ? "0 0 10px hsla(350, 70%, 50%, 0.1)" : "none",
                  }}
                  aria-label={`${entity.title}. ${formatEntityType(entity.entityType, locale)}. ${formatVisibility(visibility, locale)}`}
                >
                  <span
                    style={{
                      width: "100%",
                      height: 140,
                      overflow: "hidden",
                      position: "relative",
                      display: "block",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isDmOnly ? "grayscale(50%) brightness(45%)" : "none",
                      }}
                    />
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
                        }}
                      >
                        <EyeOff size={11} /> {formatVisibility("dm_only", locale)}
                      </span>
                    )}
                  </span>

                  <span style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
                    <span className="card-header" style={{ marginBottom: 12 }}>
                      <span className={`badge ${entity.entityType === "secret" ? "badge-critical" : entity.entityType === "clue" ? "badge-warning" : "badge-primary"}`}>
                        {formatEntityType(entity.entityType, locale)}
                      </span>
                      {entity.status && <span className="badge badge-default">{entity.status}</span>}
                    </span>
                    <strong className="card-title" style={{ fontSize: "1.05rem" }}>{entity.title}</strong>
                    {entity.subtitle && <span className="card-subtitle">{entity.subtitle}</span>}
                    <span
                      className="card-body"
                      style={{
                        marginTop: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1,
                      }}
                    >
                      {entity.summary || t("entitiesPage.noSummary")}
                    </span>
                    <span className="card-footer" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
                      <span>{entity.importance}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {isDmOnly ? <EyeOff size={12} /> : <Eye size={12} />}
                        {formatVisibility(visibility, locale)}
                      </span>
                    </span>
                  </span>
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
