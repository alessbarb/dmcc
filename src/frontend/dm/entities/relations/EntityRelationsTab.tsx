import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Expand, Layers, Map as MapIcon, Shrink, X } from "lucide-react";
import type { CampaignStateStore, Entity } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import { buildEntityNeighborhood, type EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import { RelationshipGraphCanvas } from "./RelationshipGraphCanvas.js";
import { defaultGroupingEnabled, shouldOfferGrouping } from "./groupRelationshipNeighbors.js";
import "./relationshipGraph.css";

type CampaignState = NonNullable<CampaignStateStore["campaignState"]>;

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
  const { locale } = useTranslation();
  const selectedConnection = neighborhood.connections.find((c) => c.connectionId === selectedConnectionId) ?? null;

  if (!selectedConnection) {
    return (
      <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.82rem", margin: 0 }}>
        Pulsa una arista para ver el detalle de la relación.
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
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [groupingOverride, setGroupingOverride] = useState<boolean | null>(null);
  const [expandedGroupTypes, setExpandedGroupTypes] = useState<Set<string>>(new Set());

  useEscapeToClose(isFullscreen, () => setIsFullscreen(false));

  const neighborhood = useMemo(
    () => buildEntityNeighborhood(entity, campaignState?.entities ?? [], campaignState?.relations ?? []),
    [entity, campaignState?.entities, campaignState?.relations],
  );

  // A fresh entity means a fresh ring — carrying over expand/override state
  // from a previous, differently-sized neighborhood would misrepresent it.
  useEffect(() => {
    setGroupingOverride(null);
    setExpandedGroupTypes(new Set());
  }, [entity.entityId]);

  const neighborCount = neighborhood.neighbors.length;
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

  const toolbar = (fullscreenActive: boolean) => (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "space-between" }}>
      {canGoBack && onBack ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ChevronLeft size={14} /> Volver
        </button>
      ) : (
        <span />
      )}
      <div style={{ display: "flex", gap: "6px" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={openInMap} title="Ver en el mapa">
          <MapIcon size={14} /> Ver en el mapa
        </button>
        {offerGrouping && (
          <button
            type="button"
            className={`btn btn-sm ${groupingEnabled ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setGroupingOverride(!groupingEnabled)}
            title={groupingEnabled ? "Desagrupar por tipo" : "Agrupar por tipo"}
          >
            <Layers size={14} /> {groupingEnabled ? "Desagrupar" : "Agrupar"}
          </button>
        )}
        {!fullscreenActive && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setExpanded(!isExpanded)}
            title={isExpanded ? "Reducir" : "Ampliar"}
          >
            {isExpanded ? <Shrink size={14} /> : <Expand size={14} />} {isExpanded ? "Reducir" : "Ampliar"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsFullscreen(!fullscreenActive)}
          title={fullscreenActive ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {fullscreenActive ? <X size={14} /> : <Expand size={14} />}
        </button>
      </div>
    </div>
  );

  // Compact, icon-only variant for the modal's tab-actions row. Rendered as
  // siblings (not wrapped) so they pick up that row's `> button` sizing rule
  // and land in front of the close button in natural DOM order — see
  // EntityDetailModal's `relationsToolbarSlot`.
  const compactToolbar = (
    <>
      {canGoBack && onBack && (
        <button type="button" className="btn btn-secondary btn-icon" onClick={onBack} title="Volver">
          <ChevronLeft size={16} />
        </button>
      )}
      <button type="button" className="btn btn-secondary btn-icon" onClick={openInMap} title="Ver en el mapa">
        <MapIcon size={16} />
      </button>
      {offerGrouping && (
        <button
          type="button"
          className={`btn btn-icon ${groupingEnabled ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setGroupingOverride(!groupingEnabled)}
          title={groupingEnabled ? "Desagrupar por tipo" : "Agrupar por tipo"}
        >
          <Layers size={16} />
        </button>
      )}
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => setExpanded(!isExpanded)}
        title={isExpanded ? "Reducir" : "Ampliar"}
      >
        {isExpanded ? <Shrink size={16} /> : <Expand size={16} />}
      </button>
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => setIsFullscreen(!isFullscreen)}
        title="Pantalla completa"
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
  }, [isExpanded, isFullscreen, canGoBack, onBack, campaignId, offerGrouping, groupingEnabled, onToolbarSlotChange]);

  const graphContent = (fullscreenActive: boolean) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "10px", height: fullscreenActive ? "100%" : undefined }}
    >
      {/* In expanded (non-fullscreen) mode the toolbar is reported to the
          modal via onToolbarSlotChange and rendered in its tab-actions row
          instead of floating here. */}
      {(fullscreenActive || !isExpanded) && toolbar(fullscreenActive)}

      {neighborhood.neighbors.length === 0 ? (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.9rem", padding: "8px 0" }}>
          Esta entidad no tiene relaciones registradas.
        </p>
      ) : (
        <>
          <div
            className={fullscreenActive ? "entity-relations-graph entity-relations-graph--fullscreen" : undefined}
            style={fullscreenActive ? { flex: 1, minHeight: 0 } : undefined}
          >
            <RelationshipGraphCanvas
              neighborhood={neighborhood}
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
          <ConnectionDetail neighborhood={neighborhood} selectedConnectionId={selectedConnectionId} />
        </>
      )}

      {neighborhood.missingEntityRelations.length > 0 && (
        <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.78rem", margin: 0 }}>
          {neighborhood.missingEntityRelations.length === 1
            ? "1 relación apunta a una entidad no disponible."
            : `${neighborhood.missingEntityRelations.length} relaciones apuntan a entidades no disponibles.`}
        </p>
      )}
    </div>
  );

  return (
    <>
      {graphContent(false)}
      {isFullscreen &&
        createPortal(
          <div className="entity-relations-fullscreen" role="dialog" aria-modal="true" aria-label="Grafo de relaciones">
            <div className="entity-relations-fullscreen__header">
              <div>
                <strong>{entity.title}</strong> · Relaciones
              </div>
              <button type="button" className="btn btn-secondary btn-icon" onClick={() => setIsFullscreen(false)} aria-label="Cerrar">
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
