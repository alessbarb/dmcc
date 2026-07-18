import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Expand, Filter, Layers, List, Map as MapIcon, Network, Shrink, X } from "lucide-react";
import type { CampaignStateStore, Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import { buildEntityNeighborhood, type EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import { filterEntityNeighborhood, type EntityRelationshipFilters } from "./filterEntityNeighborhood.js";
import { EntityRelationsFilters } from "./EntityRelationsFilters.js";
import { EntityRelationsList } from "./EntityRelationsList.js";
import { RelationshipGraphCanvas } from "./RelationshipGraphCanvas.js";
import { defaultGroupingEnabled, shouldOfferGrouping } from "./groupRelationshipNeighbors.js";
import "./relationshipGraph.css";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;
type ViewMode = "graph" | "list";

const NO_FILTERS: EntityRelationshipFilters = { direction: "all", entityTypes: [] };

export interface EntityRelationsTabProps {
  entity: Entity;
  campaignState: CampaignState;
  onNavigateEntity?: (entityId: string) => void;
  canGoBack?: boolean;
  onBack?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  /** In expanded (non-fullscreen) mode, the graph's compact toolbar is reported
   *  up so the modal can render it in its own tab-actions row — next to its
   *  close button and sized to match — instead of floating over the canvas. */
  onToolbarSlotChange?: (slot: ReactNode) => void;
}

function ConnectionDetail({
  neighborhood,
  selectedConnectionId,
}: {
  neighborhood: EntityRelationshipNeighborhood;
  selectedConnectionId: string | null;
}) {
  const { t, locale } = useTranslation();
  const selectedConnection = neighborhood.connections.find((c) => c.connectionId === selectedConnectionId) ?? null;

  if (!selectedConnection) {
    return (
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
        {t("entityDetail.relationsGraph.selectEdgeHint")}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {selectedConnection.relations.map((relation) => (
        <div
          key={relation.relationId}
          style={{
            fontSize: "0.85rem",
            padding: "10px 12px",
            backgroundColor: "var(--theme-surfaces-interactive)",
            borderRadius: "var(--theme-shapes-radius-small)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <strong>{formatRelationType(relation.relationType, locale)}</strong>
          {relation.description && (
            <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
              {relation.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function useEscapeToClose(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Capture phase, ahead of the modal's own document-level Escape
      // listener, so exiting fullscreen doesn't also close the modal.
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [active, onClose]);
}

export function EntityRelationsTab({
  entity,
  campaignState,
  onNavigateEntity,
  canGoBack,
  onBack,
  onExpandedChange,
  onToolbarSlotChange,
}: EntityRelationsTabProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [groupingOverride, setGroupingOverride] = useState<boolean | null>(null);
  const [expandedGroupTypes, setExpandedGroupTypes] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<EntityRelationshipFilters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("graph");

  useEscapeToClose(isFullscreen, () => setIsFullscreen(false));

  const neighborhood = useMemo(
    () => buildEntityNeighborhood(entity, campaignState?.entities ?? [], campaignState?.relations ?? []),
    [entity, campaignState?.entities, campaignState?.relations],
  );

  const filteredNeighborhood = useMemo(
    () => filterEntityNeighborhood(neighborhood, filters),
    [neighborhood, filters],
  );

  const availableEntityTypes = useMemo(
    () => Array.from(new Set(neighborhood.neighbors.map((neighbor) => neighbor.entityType))).sort(),
    [neighborhood.neighbors],
  );

  const filtersActive = filters.direction !== "all" || filters.entityTypes.length > 0;

  // A fresh entity means a fresh ring/filter set — carrying over state sized
  // for a previous, differently-shaped neighborhood would misrepresent it.
  useEffect(() => {
    setGroupingOverride(null);
    setExpandedGroupTypes(new Set());
    setFilters(NO_FILTERS);
    setFiltersOpen(false);
  }, [entity.entityId]);

  const neighborCount = filteredNeighborhood.neighbors.length;
  const offerGrouping = shouldOfferGrouping(neighborCount);
  const groupingEnabled = groupingOverride ?? defaultGroupingEnabled(neighborCount);

  const toggleGroupExpand = (entityType: string) => {
    setExpandedGroupTypes((prev) => {
      const next = new Set(prev);
      if (next.has(entityType)) next.delete(entityType);
      else next.add(entityType);
      return next;
    });
  };

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandedChange?.(expanded);
  };

  const campaignId = campaignState?.campaign?.campaignId;
  const openInMap = () => {
    if (!campaignId) return;
    const params = new URLSearchParams({ entityId: entity.entityId, mode: "focus" });
    void navigate({ to: `/campaigns/${campaignId}/map/network?${params.toString()}` });
  };

  const handleNavigateEntity = (entityId: string) => {
    setSelectedConnectionId(null);
    onNavigateEntity?.(entityId);
  };

  // Filter toggle, list/graph toggle, and the "N of M" counter — shared
  // between the full toolbar (embedded/fullscreen) and the expanded-mode
  // inline block below it (the compact tab-actions row can't fit these).
  const filtersAndViewToggle = (
    <>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn btn-sm ${filtersActive ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-pressed={filtersOpen}
          title={t("entityDetail.relationsGraph.filtersLabel")}
        >
          <Filter size={14} /> {t("entityDetail.relationsGraph.filtersLabel")}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setViewMode(viewMode === "graph" ? "list" : "graph")}
          title={viewMode === "graph" ? t("entityDetail.relationsGraph.viewList") : t("entityDetail.relationsGraph.viewGraph")}
        >
          {viewMode === "graph" ? <List size={14} /> : <Network size={14} />}
        </button>
      </div>
      {filtersOpen && (
        <EntityRelationsFilters filters={filters} onChange={setFilters} availableEntityTypes={availableEntityTypes} />
      )}
      {neighborhood.neighbors.length > 0 && (
        <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--theme-text-secondary)" }}>
          {t("entityDetail.relationsGraph.neighborCount", {
            visible: filteredNeighborhood.neighbors.length,
            total: neighborhood.neighbors.length,
          })}
        </p>
      )}
    </>
  );

  const toolbar = (fullscreenActive: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "space-between" }}>
        {canGoBack && onBack ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
            <ChevronLeft size={14} /> {t("entityDetail.relationsGraph.back")}
          </button>
        ) : (
          <span />
        )}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openInMap} title={t("entityDetail.relationsGraph.viewOnMap")}>
            <MapIcon size={14} /> {t("entityDetail.relationsGraph.viewOnMap")}
          </button>
          {viewMode === "graph" && offerGrouping && (
            <button
              type="button"
              className={`btn btn-sm ${groupingEnabled ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setGroupingOverride(!groupingEnabled)}
              title={groupingEnabled ? t("entityDetail.relationsGraph.ungroupTooltip") : t("entityDetail.relationsGraph.groupTooltip")}
            >
              <Layers size={14} /> {groupingEnabled ? t("entityDetail.relationsGraph.ungroup") : t("entityDetail.relationsGraph.group")}
            </button>
          )}
          {!fullscreenActive && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(!isExpanded)}
              title={isExpanded ? t("entityDetail.relationsGraph.collapse") : t("entityDetail.relationsGraph.expand")}
            >
              {isExpanded ? <Shrink size={14} /> : <Expand size={14} />}{" "}
              {isExpanded ? t("entityDetail.relationsGraph.collapse") : t("entityDetail.relationsGraph.expand")}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFullscreen(!fullscreenActive)}
            title={fullscreenActive ? t("entityDetail.relationsGraph.exitFullscreen") : t("entityDetail.relationsGraph.enterFullscreen")}
          >
            {fullscreenActive ? <X size={14} /> : <Expand size={14} />}
          </button>
        </div>
      </div>
      {filtersAndViewToggle}
    </div>
  );

  // Compact, icon-only variant for the modal's tab-actions row. Rendered as
  // siblings (not wrapped) so they pick up that row's `> button` sizing rule
  // and land in front of the close button in natural DOM order — see
  // EntityDetailModal's `relationsToolbarSlot`. Filters/view-mode stay in the
  // full toolbar only (rendered inline below the graph even when expanded) —
  // this row is deliberately kept to the highest-frequency actions.
  const compactToolbar = (
    <>
      {canGoBack && onBack && (
        <button type="button" className="btn btn-secondary btn-icon" onClick={onBack} title={t("entityDetail.relationsGraph.back")}>
          <ChevronLeft size={16} />
        </button>
      )}
      <button type="button" className="btn btn-secondary btn-icon" onClick={openInMap} title={t("entityDetail.relationsGraph.viewOnMap")}>
        <MapIcon size={16} />
      </button>
      {viewMode === "graph" && offerGrouping && (
        <button
          type="button"
          className={`btn btn-icon ${groupingEnabled ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setGroupingOverride(!groupingEnabled)}
          title={groupingEnabled ? t("entityDetail.relationsGraph.ungroupTooltip") : t("entityDetail.relationsGraph.groupTooltip")}
        >
          <Layers size={16} />
        </button>
      )}
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => setExpanded(!isExpanded)}
        title={isExpanded ? t("entityDetail.relationsGraph.collapse") : t("entityDetail.relationsGraph.expand")}
      >
        {isExpanded ? <Shrink size={16} /> : <Expand size={16} />}
      </button>
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => setIsFullscreen(!isFullscreen)}
        title={t("entityDetail.relationsGraph.enterFullscreen")}
      >
        <Expand size={16} />
      </button>
    </>
  );

  useEffect(() => {
    onToolbarSlotChange?.(isExpanded && !isFullscreen ? compactToolbar : null);
    // compactToolbar is intentionally excluded: it's a fresh JSX object every
    // render, and it's fully derived from the primitive deps already listed
    // below, so including it would set new (but equivalent) parent state on
    // every render and loop forever.
  }, [isExpanded, isFullscreen, canGoBack, onBack, campaignId, offerGrouping, groupingEnabled, viewMode, onToolbarSlotChange]);

  const graphContent = (fullscreenActive: boolean) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "10px", height: fullscreenActive ? "100%" : undefined }}
    >
      {/* In expanded (non-fullscreen) mode the compact toolbar is reported to
          the modal via onToolbarSlotChange, but filters/view-mode/counter
          still render here (they don't fit the compact icon row). */}
      {(fullscreenActive || !isExpanded) && toolbar(fullscreenActive)}
      {!fullscreenActive && isExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{filtersAndViewToggle}</div>
      )}

      {neighborhood.neighbors.length === 0 ? (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
          {t("entityDetail.relationsGraph.noRelations")}
        </p>
      ) : viewMode === "list" ? (
        <EntityRelationsList neighborhood={filteredNeighborhood} onNavigateEntity={handleNavigateEntity} />
      ) : (
        <>
          <div
            className={fullscreenActive ? "entity-relations-graph entity-relations-graph--fullscreen" : undefined}
            style={fullscreenActive ? { flex: 1, minHeight: 0 } : undefined}
          >
            <RelationshipGraphCanvas
              neighborhood={filteredNeighborhood}
              selectedConnectionId={selectedConnectionId}
              onSelectConnection={setSelectedConnectionId}
              onNavigateEntity={handleNavigateEntity}
              bare={fullscreenActive}
              resizeSignal={`${isExpanded}:${isFullscreen}`}
              groupingEnabled={groupingEnabled}
              expandedGroupTypes={expandedGroupTypes}
              onToggleGroupExpand={toggleGroupExpand}
            />
          </div>
          <ConnectionDetail neighborhood={filteredNeighborhood} selectedConnectionId={selectedConnectionId} />
        </>
      )}

      {neighborhood.missingEntityRelations.length > 0 && (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.78rem", margin: 0 }}>
          {neighborhood.missingEntityRelations.length === 1
            ? t("entityDetail.relationsGraph.missingRelationsOne")
            : t("entityDetail.relationsGraph.missingRelationsMany", { count: neighborhood.missingEntityRelations.length })}
        </p>
      )}
    </div>
  );

  return (
    <>
      {graphContent(false)}
      {isFullscreen &&
        createPortal(
          <div className="entity-relations-fullscreen" role="dialog" aria-modal="true" aria-label={t("entityDetail.tabsRelations")}>
            <div className="entity-relations-fullscreen__header">
              <div>
                <strong>{entity.title}</strong> · {t("entityDetail.tabsRelations")}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsFullscreen(false)}
                aria-label={t("entityDetail.relationsGraph.close")}
              >
                <X size={18} />
              </button>
            </div>
            <div className="entity-relations-fullscreen__body">{graphContent(true)}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
