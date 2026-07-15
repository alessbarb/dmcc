import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Eye, EyeOff, Focus, Layers, LoaderCircle, Maximize2, Plus, Search, X } from "lucide-react";
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

type ExplorerMode = "overview" | "focus";

function buildNeighborhood(entityIds: string[], relations: Array<{ archived?: boolean; sourceEntityId: string; targetEntityId: string }>, anchorId: string, depth = 2): Set<string> {
  const allowedIds = new Set(entityIds);
  const adjacency = new Map<string, string[]>();
  for (const entityId of entityIds) adjacency.set(entityId, []);
  for (const relation of relations) {
    if (relation.archived || !allowedIds.has(relation.sourceEntityId) || !allowedIds.has(relation.targetEntityId)) continue;
    adjacency.get(relation.sourceEntityId)?.push(relation.targetEntityId);
    adjacency.get(relation.targetEntityId)?.push(relation.sourceEntityId);
  }

  const visited = new Set<string>([anchorId]);
  let frontier = [anchorId];
  for (let step = 0; step < depth; step += 1) {
    const next: string[] = [];
    for (const entityId of frontier) {
      for (const neighbor of adjacency.get(entityId) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return visited;
}

function NetworkFlowInner() {
  const store = useCampaignStore();
  const campaignState = store.campaignState;
  const { t } = useTranslation();
  const { fitView, getNode } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [layoutPreset, setLayoutPreset] = useState<NetworkLayoutPreset>("compact");
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>("overview");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [pathModeArmed, setPathModeArmed] = useState(false);
  const [showFullOverride, setShowFullOverride] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const next = { w: Math.max(320, Math.round(rect.width)), h: Math.max(360, Math.round(rect.height)) };
      setViewportSize((current) => current.w === next.w && current.h === next.h ? current : next);
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

  const automaticFocus = useMemo(() => {
    if (showFullOverride) return { mode: "full" as const };
    return resolveNetworkFocus({
      entityIds: filteredEntityIds,
      relations,
      selectedEntityId,
      currentQuestId: campaignState?.campaign?.currentQuestId ?? null,
      currentLocationId: campaignState?.campaign?.currentLocationId ?? null,
      nextSessionCriticalEntityId:
        entities.find((entity) => entity.entityType === "quest" && entity.status === "active" && !entity.archived)?.entityId ?? null,
    });
  }, [showFullOverride, filteredEntityIds, relations, selectedEntityId, campaignState, entities]);

  const includedEntityIds = useMemo(() => {
    if (explorerMode === "focus" && selectedEntityId && filteredEntityIds.includes(selectedEntityId)) {
      return buildNeighborhood(filteredEntityIds, relations, selectedEntityId, 2);
    }
    if (automaticFocus.mode === "neighborhood") return new Set(automaticFocus.entityIds);
    if (automaticFocus.mode === "full") return new Set(filteredEntityIds);
    return null;
  }, [automaticFocus, explorerMode, filteredEntityIds, relations, selectedEntityId]);

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
    if (automaticFocus.mode === "search-required" || model.nodes.length === 0) return;

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
        if (!cancelled) setLayoutError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      cancelled = true;
    };
  }, [automaticFocus.mode, layoutPreset, model, viewportSize.h, viewportSize.w]);

  useEffect(() => {
    if (positions.size === 0 || !nodesInitialized) return;
    const timer = window.setTimeout(() => {
      void fitView({ duration: 500, padding: explorerMode === "focus" ? 0.38 : 0.3, minZoom: 0.015, maxZoom: explorerMode === "focus" ? 0.9 : 0.55 });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [explorerMode, fitView, nodesInitialized, positions]);

  const narrativePath = useMemo(() => {
    if (!selectedEntityId || !pathTargetId || selectedEntityId === pathTargetId) return null;
    return findNetworkPath(model.nodes.map((node) => node.id), model.edges, selectedEntityId, pathTargetId);
  }, [model, selectedEntityId, pathTargetId]);

  const directlyConnectedIds = useMemo(() => {
    if (!selectedEntityId) return new Set<string>();
    const connected = new Set<string>([selectedEntityId]);
    for (const relation of relations) {
      if (relation.archived) continue;
      if (relation.sourceEntityId === selectedEntityId) connected.add(relation.targetEntityId);
      if (relation.targetEntityId === selectedEntityId) connected.add(relation.sourceEntityId);
    }
    return connected;
  }, [relations, selectedEntityId]);

  const flowNodes: Node[] = useMemo(() => {
    return model.nodes.map((node) => {
      const position = positions.get(node.id) ?? { x: 0, y: 0 };
      const isOnPath = !!narrativePath?.includes(node.id);
      const dimmed = explorerMode === "overview" && selectedEntityId !== null && !directlyConnectedIds.has(node.id) && !isOnPath;
      if (node.kind === "entity") {
        return {
          id: node.id,
          type: "entity",
          position,
          selected: node.id === selectedEntityId,
          data: { entityId: node.entityId, dimmed },
          style: isOnPath ? { filter: "drop-shadow(0 0 10px #10b981)" } : undefined,
        };
      }
      const fact = facts.find((candidate) => candidate.factId === node.factId);
      return {
        id: node.id,
        type: "fact",
        position,
        data: { fact, relatedCount: fact?.relatedEntityIds.length ?? 0 },
        style: dimmed ? { opacity: 0.18 } : undefined,
      };
    });
  }, [directlyConnectedIds, explorerMode, facts, model.nodes, narrativePath, positions, selectedEntityId]);

  const flowEdges: Edge[] = useMemo(() => {
    return model.edges.map((edge) => {
      const visual = edge.relationType ? getRelationVisual(edge.relationType) : null;
      const connectedToSelection = selectedEntityId !== null && (edge.source === selectedEntityId || edge.target === selectedEntityId);
      const isOnPath = !!(
        narrativePath && narrativePath.includes(edge.source) && narrativePath.includes(edge.target) &&
        Math.abs(narrativePath.indexOf(edge.source) - narrativePath.indexOf(edge.target)) === 1
      );
      const emphasized = isOnPath || connectedToSelection;
      const dimmed = selectedEntityId !== null && !emphasized;
      return {
        id: edge.id,
        type: "relation",
        source: edge.source,
        target: edge.target,
        data: {
          label: edge.relationType ? formatRelationType(edge.relationType) : undefined,
          emphasized,
        },
        style: {
          opacity: dimmed ? 0.08 : emphasized ? 0.92 : 0.22,
          stroke: isOnPath ? "#10b981" : visual?.color ?? "rgba(148,163,184,0.5)",
          strokeWidth: emphasized ? 2.4 : 1,
          strokeDasharray: visual?.line === "dashed" ? "5 5" : undefined,
        },
      } satisfies Edge;
    });
  }, [model.edges, narrativePath, selectedEntityId]);

  const selectedEntity = selectedEntityId ? entitiesById.get(selectedEntityId) ?? null : null;
  const selectedEntityRelations = useMemo(() => {
    if (!selectedEntity) return [];
    return relations.filter(
      (relation) => !relation.archived &&
        (relation.sourceEntityId === selectedEntity.entityId || relation.targetEntityId === selectedEntity.entityId),
    );
  }, [relations, selectedEntity]);

  const focusSelectedEntity = useCallback((entityId: string) => {
    setSelectedEntityId(entityId);
    setExplorerMode("focus");
    setShowFullOverride(false);
  }, []);

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

  const fitAll = useCallback(() => {
    void fitView({ duration: 450, padding: 0.3, minZoom: 0.015, maxZoom: 0.55 });
  }, [fitView]);

  const fitSelection = useCallback(() => {
    if (!selectedEntityId) return;
    const selectedNode = getNode(selectedEntityId);
    if (!selectedNode) return;
    void fitView({ nodes: [selectedNode], duration: 420, padding: 1.2, minZoom: 0.08, maxZoom: 1.05 });
  }, [fitView, getNode, selectedEntityId]);

  if (!campaignState) return null;

  if (automaticFocus.mode === "search-required") {
    return (
      <div className="network-flow-workspace">
        <NetworkFilterBar entities={entities} typeFilter={typeFilter} onChangeTypeFilter={setTypeFilter} onSelectEntity={focusSelectedEntity} />
        <div className="network-flow-state">
          <GuidedEmptyState
            icon={<Search size={30} />}
            title={t("network.searchRequiredTitle")}
            description={t("network.searchRequiredDescription")}
            actions={[{
              label: t("network.showFullNetwork"),
              icon: <Layers size={14} />,
              onClick: () => {
                setShowFullOverride(true);
                setExplorerMode("overview");
              },
            }]}
          />
        </div>
      </div>
    );
  }

  const layoutPending = model.nodes.length > 0 && positions.size === 0 && !layoutError;

  return (
    <div className="network-flow-workspace">
      <div className="network-explorer-topbar">
        <div className="network-explorer-heading">
          <h2>{t("network.title")}</h2>
          <span>{model.nodes.length} · {model.edges.length}</span>
        </div>

        <div className="network-explorer-modes" role="group" aria-label={t("network.title")}>
          <button
            type="button"
            className={`btn btn-sm ${explorerMode === "overview" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setExplorerMode("overview");
              setShowFullOverride(true);
            }}
          >
            <Layers size={14} />
            {t("network.showFullNetwork")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${explorerMode === "focus" ? "btn-primary" : "btn-secondary"}`}
            disabled={!selectedEntityId}
            onClick={() => setExplorerMode("focus")}
          >
            <Focus size={14} />
            {selectedEntity?.title ?? t("network.searchRequiredTitle")}
          </button>
        </div>

        <div className="network-flow-layout-controls">
          <button type="button" className={`btn btn-sm ${layoutPreset === "compact" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLayoutPreset("compact")}>
            {t("network.layoutCompact")}
          </button>
          <button type="button" className={`btn btn-sm ${layoutPreset === "hierarchical" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLayoutPreset("hierarchical")}>
            {t("network.layoutHierarchical")}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={flowNodes.length === 0} onClick={fitAll} title={t("network.title")}>
            <Maximize2 size={14} />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={!selectedEntityId} onClick={fitSelection} title={selectedEntity?.title}>
            <Focus size={14} />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMiniMap((current) => !current)} title={t("network.title")}>
            {showMiniMap ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div className="network-flow-stage">
        <div ref={containerRef} className="network-flow-canvas">
          <div className="network-flow-overlay network-flow-overlay--filters">
            <NetworkFilterBar entities={entities} typeFilter={typeFilter} onChangeTypeFilter={setTypeFilter} onSelectEntity={focusSelectedEntity} />
          </div>

          {narrativePath && (
            <div className="network-flow-overlay network-flow-path">
              {t("network.pathTo", { title: entitiesById.get(pathTargetId ?? "")?.title ?? "" })}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPathTargetId(null)}>
                <X size={12} /> {t("network.clearPath")}
              </button>
            </div>
          )}

          {model.nodes.length === 0 ? (
            <div className="network-flow-state">
              <GuidedEmptyState
                icon={<Layers size={30} />}
                title={t("network.emptyTitle")}
                description={t("network.emptyDescription")}
                actions={typeFilter.length > 0 ? [{
                  label: t("network.filterAllTypes"),
                  icon: <Plus size={14} />,
                  onClick: () => setTypeFilter([]),
                }] : []}
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
              onNodeDoubleClick={(_event, node) => {
                if (node.type === "entity" && typeof node.data.entityId === "string") focusSelectedEntity(node.data.entityId);
              }}
              onPaneClick={() => setSelectedEntityId(null)}
              proOptions={{ hideAttribution: true }}
              minZoom={0.015}
              maxZoom={1.6}
              fitView
              fitViewOptions={{ padding: 0.3, minZoom: 0.015, maxZoom: 0.55 }}
              nodesDraggable={false}
              elevateEdgesOnSelect
            >
              <Background gap={24} size={1} />
              <Controls showInteractive={false} />
              {showMiniMap && <MiniMap pannable zoomable />}
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
          onEdit={async (entityId, updates) => store.updateEntity(entityId, updates)}
          onArchive={async (entityId) => {
            await store.archiveEntity(entityId);
            setDetailOpen(false);
            setSelectedEntityId(null);
          }}
          onVisibilityChange={async (entityId, visibility) => store.updateEntity(entityId, { visibility })}
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
