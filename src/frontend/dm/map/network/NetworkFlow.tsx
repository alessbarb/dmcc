import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Layers, LoaderCircle, Maximize2, Plus, Search, X } from "lucide-react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { GuidedEmptyState } from "../../onboarding/CampaignStarterHub.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { getRelationVisual } from "../../entities/entityVisuals.js";
import { formatRelationType } from "@shared/i18n/index.js";
import { NetworkEntityNode } from "./NetworkEntityNode.js";
import { NetworkFactNode } from "./NetworkFactNode.js";
import { NetworkFilterBar } from "./NetworkFilterBar.js";
import { NetworkInspector } from "./NetworkInspector.js";
import { buildNetworkModel, resolveNetworkFocus } from "./buildNetworkModel.js";
import type { NetworkLayoutPreset } from "./computeNetworkLayout.js";
import { computeNetworkLayout } from "./computeNetworkLayout.js";
import { findNetworkPath } from "./findNetworkPath.js";
import { NetworkRelationEdge } from "./NetworkRelationEdge.js";

const nodeTypes = {
  entity: NetworkEntityNode,
  fact: NetworkFactNode,
};

const edgeTypes = {
  relation: NetworkRelationEdge,
};

function NetworkFlowInner() {
  const store = useCampaignStore();
  const campaignState = store.campaignState;
  const { t } = useTranslation();
  const { fitView } = useReactFlow();

  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [layoutPreset, setLayoutPreset] = useState<NetworkLayoutPreset>("compact");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [pathModeArmed, setPathModeArmed] = useState(false);
  const [showFullOverride, setShowFullOverride] = useState(false);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewportSize({ w: width || 900, h: height || 600 });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const entities = campaignState?.entities ?? [];
  const relations = campaignState?.relations ?? [];
  const facts = campaignState?.facts ?? [];

  const entitiesById = useMemo(() => new Map(entities.map((entity) => [entity.entityId, entity])), [entities]);

  const filteredEntityIds = useMemo(() => {
    return entities
      .filter((entity) => !entity.archived)
      .filter((entity) => typeFilter.length === 0 || typeFilter.includes(entity.entityType))
      .map((entity) => entity.entityId);
  }, [entities, typeFilter]);

  const focus = useMemo(() => {
    if (showFullOverride) return { mode: "full" as const };
    return resolveNetworkFocus({
      entityIds: filteredEntityIds,
      relations,
      selectedEntityId,
      currentQuestId: campaignState?.campaign?.currentQuestId ?? null,
      currentLocationId: campaignState?.campaign?.currentLocationId ?? null,
      nextSessionCriticalEntityId:
        (campaignState?.entities ?? []).find(
          (entity) => entity.entityType === "quest" && entity.status === "active" && !entity.archived,
        )?.entityId ?? null,
    });
  }, [showFullOverride, filteredEntityIds, relations, selectedEntityId, campaignState]);

  const includedEntityIds = useMemo(() => {
    if (focus.mode === "neighborhood") return new Set(focus.entityIds);
    if (focus.mode === "full") return new Set(filteredEntityIds);
    return null;
  }, [focus, filteredEntityIds]);

  const model = useMemo(
    () =>
      buildNetworkModel({
        entities,
        relations,
        facts,
        entityTypeFilter: typeFilter.length > 0 ? typeFilter : null,
        includedEntityIds,
      }),
    [entities, relations, facts, typeFilter, includedEntityIds],
  );

  useEffect(() => {
    setPositions(new Map());
    setLayoutError(null);
    if (focus.mode === "search-required" || model.nodes.length === 0) return;

    let cancelled = false;
    void computeNetworkLayout({
      nodes: model.nodes,
      edges: model.edges,
      preset: layoutPreset,
      viewportWidth: viewportSize.w,
      viewportHeight: viewportSize.h,
    })
      .then((result) => {
        if (!cancelled) setPositions(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLayoutError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [model, layoutPreset, viewportSize, focus.mode]);

  useEffect(() => {
    if (positions.size > 0) {
      window.setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 60);
    }
  }, [positions, fitView]);

  const narrativePath = useMemo(() => {
    if (!selectedEntityId || !pathTargetId || selectedEntityId === pathTargetId) return null;
    return findNetworkPath(
      model.nodes.map((node) => node.id),
      model.edges,
      selectedEntityId,
      pathTargetId,
    );
  }, [model, selectedEntityId, pathTargetId]);

  const flowNodes: Node[] = useMemo(() => {
    return model.nodes
      .filter((node) => positions.has(node.id))
      .map((node) => {
        const position = positions.get(node.id)!;
        const isOnPath = !!narrativePath?.includes(node.id);
        if (node.kind === "entity") {
          return {
            id: node.id,
            type: "entity",
            position,
            selected: node.id === selectedEntityId,
            data: { entityId: node.entityId },
            style: isOnPath ? { filter: "drop-shadow(0 0 8px #10b981)" } : undefined,
          };
        }
        const fact = facts.find((candidate) => candidate.factId === node.factId);
        return {
          id: node.id,
          type: "fact",
          position,
          data: {
            fact,
            relatedCount: fact?.relatedEntityIds.length ?? 0,
          },
        };
      });
  }, [model.nodes, positions, selectedEntityId, narrativePath, facts]);

  const flowEdges: Edge[] = useMemo(() => {
    return model.edges
      .filter((edge) => positions.has(edge.source) && positions.has(edge.target))
      .map((edge) => {
        const visual = edge.relationType ? getRelationVisual(edge.relationType) : null;
        const isOnPath = !!(
          narrativePath &&
          narrativePath.includes(edge.source) &&
          narrativePath.includes(edge.target) &&
          Math.abs(narrativePath.indexOf(edge.source) - narrativePath.indexOf(edge.target)) === 1
        );
        return {
          id: edge.id,
          type: "relation",
          source: edge.source,
          target: edge.target,
          data: {
            label: edge.relationType ? formatRelationType(edge.relationType) : undefined,
            emphasized: isOnPath,
          },
          style: {
            stroke: isOnPath ? "#10b981" : visual?.color ?? "rgba(148,163,184,0.5)",
            strokeWidth: isOnPath ? 3 : 1.5,
            strokeDasharray: visual?.line === "dashed" ? "5 5" : undefined,
          },
        } satisfies Edge;
      });
  }, [model.edges, positions, narrativePath]);

  const selectedEntity = selectedEntityId ? entitiesById.get(selectedEntityId) ?? null : null;

  const selectedEntityRelations = useMemo(() => {
    if (!selectedEntity) return [];
    return relations.filter(
      (relation) =>
        !relation.archived &&
        (relation.sourceEntityId === selectedEntity.entityId || relation.targetEntityId === selectedEntity.entityId),
    );
  }, [relations, selectedEntity]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type !== "entity" || typeof node.data.entityId !== "string") return;
    const entityId = node.data.entityId;
    if (pathModeArmed && selectedEntityId && entityId !== selectedEntityId) {
      setPathTargetId(entityId);
      setPathModeArmed(false);
      return;
    }
    setSelectedEntityId(entityId);
  }, [pathModeArmed, selectedEntityId]);

  const selectEntityFromSearch = useCallback((entityId: string) => {
    if (pathModeArmed && selectedEntityId && entityId !== selectedEntityId) {
      setPathTargetId(entityId);
      setPathModeArmed(false);
      return;
    }
    setSelectedEntityId(entityId);
  }, [pathModeArmed, selectedEntityId]);

  if (!campaignState) return null;

  if (focus.mode === "search-required") {
    return (
      <div className="network-flow-workspace">
        <NetworkFilterBar
          entities={entities}
          typeFilter={typeFilter}
          onChangeTypeFilter={setTypeFilter}
          onSelectEntity={setSelectedEntityId}
        />
        <div className="network-flow-state">
          <GuidedEmptyState
            icon={<Search size={30} />}
            title={t("network.searchRequiredTitle")}
            description={t("network.searchRequiredDescription")}
            actions={[
              {
                label: t("network.showFullNetwork"),
                icon: <Layers size={14} />,
                onClick: () => setShowFullOverride(true),
              },
            ]}
          />
        </div>
      </div>
    );
  }

  const layoutPending = model.nodes.length > 0 && positions.size === 0 && !layoutError;

  return (
    <div className="network-flow-workspace">
      <header className="network-flow-header">
        <div>
          <h2>{t("network.title")}</h2>
          <p>
            {focus.mode === "neighborhood"
              ? t("network.neighborhoodOf", { title: entitiesById.get(focus.anchorEntityId)?.title ?? focus.anchorEntityId })
              : `${model.nodes.length} · ${model.edges.length}`}
          </p>
        </div>
        <div className="network-flow-layout-controls">
          <span>{t("network.layoutLabel")}</span>
          <button
            type="button"
            className={`btn btn-sm ${layoutPreset === "compact" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setLayoutPreset("compact")}
          >
            {t("network.layoutCompact")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${layoutPreset === "hierarchical" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setLayoutPreset("hierarchical")}
          >
            {t("network.layoutHierarchical")}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={flowNodes.length === 0}
            onClick={() => fitView({ duration: 350, padding: 0.15 })}
            aria-label={t("network.title")}
            title={t("network.title")}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </header>

      <NetworkFilterBar
        entities={entities}
        typeFilter={typeFilter}
        onChangeTypeFilter={setTypeFilter}
        onSelectEntity={selectEntityFromSearch}
      />

      {narrativePath && (
        <div className="network-flow-path">
          {t("network.pathTo", { title: entitiesById.get(pathTargetId ?? "")?.title ?? "" })}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPathTargetId(null)}>
            <X size={12} /> {t("network.clearPath")}
          </button>
        </div>
      )}

      <div className="network-flow-stage">
        <div ref={containerRef} className="network-flow-canvas">
          {model.nodes.length === 0 ? (
            <div className="network-flow-state">
              <GuidedEmptyState
                icon={<Layers size={30} />}
                title={t("network.emptyTitle")}
                description={t("network.emptyDescription")}
                actions={
                  typeFilter.length > 0
                    ? [
                        {
                          label: t("network.filterAllTypes"),
                          icon: <Plus size={14} />,
                          onClick: () => setTypeFilter([]),
                        },
                      ]
                    : []
                }
              />
            </div>
          ) : layoutError ? (
            <div className="network-flow-state network-flow-state--error" role="alert">
              <Layers size={30} />
              <strong>{t("network.emptyTitle")}</strong>
              <span>{layoutError}</span>
            </div>
          ) : layoutPending ? (
            <div className="network-flow-state" aria-live="polite">
              <LoaderCircle className="animate-spin" size={32} />
              <span>{t("common.loading")}</span>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={handleNodeClick}
              onPaneClick={() => setSelectedEntityId(null)}
              proOptions={{ hideAttribution: true }}
              fitView
            >
              <Background />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable />
            </ReactFlow>
          )}
        </div>

        {selectedEntity && (
          <NetworkInspector
            entity={selectedEntity}
            relations={selectedEntityRelations}
            entitiesById={entitiesById}
            onClose={() => setSelectedEntityId(null)}
            onSelectEntity={setSelectedEntityId}
            onOpenDetail={() => setDetailOpen(true)}
            onFindPathTo={() => setPathModeArmed(true)}
          />
        )}
      </div>

      {detailOpen && selectedEntity && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setDetailOpen(false)}
          onEdit={async (entityId, updates) => {
            await store.updateEntity(entityId, updates);
          }}
          onArchive={async (entityId) => {
            await store.archiveEntity(entityId);
            setDetailOpen(false);
            setSelectedEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await store.updateEntity(entityId, { visibility });
          }}
          addToast={() => {}}
        />
      )}
    </div>
  );
}

export function NetworkFlow() {
  return (
    <ReactFlowProvider>
      <NetworkFlowInner />
    </ReactFlowProvider>
  );
}
