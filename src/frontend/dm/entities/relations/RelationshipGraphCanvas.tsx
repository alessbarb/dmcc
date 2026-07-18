import React, { useEffect, useMemo } from "react";
import { Background, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import { getRelationVisual } from "../entityVisuals.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import { computeRadialRelationshipLayout, type RelationshipLayoutNode } from "./computeRadialRelationshipLayout.js";
import { relationshipLayoutToFlowPositions, type FlowPosition } from "./relationshipLayoutToFlowPositions.js";
import { oppositeRelationshipHandleSide, pickRelationshipHandleSide } from "./pickRelationshipHandleSide.js";
import { RelationshipEntityNode, type RelationshipNodeData } from "./RelationshipEntityNode.js";
import { RelationshipGroupNode, type RelationshipGroupNodeData } from "./RelationshipGroupNode.js";
import { RelationshipEdge, type RelationshipEdgeData } from "./RelationshipEdge.js";
import { groupRelationshipNeighbors, type RelationshipRingItem } from "./groupRelationshipNeighbors.js";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion.js";
import "./relationshipGraph.css";

const NODE_WIDTH = 176;
const NODE_HEIGHT = 104;
/** Dense-enough graphs benefit from an overview of the whole ring while zoomed in on one arc. */
const MINIMAP_NEIGHBOR_THRESHOLD = 13;

const nodeTypes = { relationshipEntity: RelationshipEntityNode, relationshipGroup: RelationshipGroupNode };
const edgeTypes = { relationship: RelationshipEdge };

export interface RelationshipGraphCanvasProps {
  neighborhood: EntityRelationshipNeighborhood;
  selectedConnectionId: string | null;
  onSelectConnection: (connectionId: string | null) => void;
  onNavigateEntity: (entityId: string) => void;
  /** Fullscreen already provides its own sized container — skip the embedded height wrapper. */
  bare?: boolean;
  /** Bump this (e.g. isExpanded/isFullscreen) whenever the container is resized without
   *  remounting, so the graph re-fits to the new visible bounds. */
  resizeSignal?: unknown;
  /** Collapse same-type neighbors into `RelationshipGroupNode` placeholders (density Fase 4). */
  groupingEnabled: boolean;
  /** Entity types the user expanded back out of their group, showing individual members again. */
  expandedGroupTypes: ReadonlySet<string>;
  onToggleGroupExpand: (entityType: string) => void;
}

function edgeEndpoints(connection: EntityRelationshipNeighborhood["connections"][number]) {
  // A grouped connection can bundle relations in both directions; a single
  // relation draws its real domain direction, a bundle falls back to the
  // canonical (sorted) pair order used to build the connection id.
  if (connection.relations.length === 1) {
    const relation = connection.relations[0];
    return { sourceId: relation.sourceEntityId, targetId: relation.targetEntityId };
  }
  return { sourceId: connection.entityAId, targetId: connection.entityBId };
}

function RelationshipGraphCanvasInner({
  neighborhood,
  selectedConnectionId,
  onSelectConnection,
  onNavigateEntity,
  bare,
  resizeSignal,
  groupingEnabled,
  expandedGroupTypes,
  onToggleGroupExpand,
}: RelationshipGraphCanvasProps) {
  const { t, locale } = useTranslation();
  const { fitView } = useReactFlow();
  const prefersReducedMotion = usePrefersReducedMotion();

  const ringItems: RelationshipRingItem[] = useMemo(
    () => groupRelationshipNeighbors(neighborhood.neighbors, groupingEnabled, expandedGroupTypes),
    [neighborhood.neighbors, groupingEnabled, expandedGroupTypes],
  );

  // A group's synthetic id/type stand in for its members when positioning the
  // ring — computeRadialRelationshipLayout only needs identity + sort keys.
  const ringLayoutNodes: RelationshipLayoutNode[] = useMemo(
    () =>
      ringItems.map((item) =>
        item.kind === "entity"
          ? item.entity
          : { entityId: item.group.groupId, title: item.group.entityType, entityType: item.group.entityType },
      ),
    [ringItems],
  );

  const positions = useMemo(() => {
    const layout = computeRadialRelationshipLayout({
      centerNode: neighborhood.center,
      neighborNodes: ringLayoutNodes,
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
    });
    return relationshipLayoutToFlowPositions(layout, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }, [neighborhood.center, ringLayoutNodes]);

  const nodes: Node<RelationshipNodeData | RelationshipGroupNodeData>[] = useMemo(() => {
    const centerNode: Node<RelationshipNodeData> = {
      id: neighborhood.center.entityId,
      type: "relationshipEntity",
      position: positions.get(neighborhood.center.entityId) ?? { x: 0, y: 0 },
      data: { entity: neighborhood.center.entity, role: "center" },
      draggable: false,
      selectable: false,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };

    const ringNodes = ringItems.map((item): Node<RelationshipNodeData | RelationshipGroupNodeData> => {
      if (item.kind === "entity") {
        return {
          id: item.entity.entityId,
          type: "relationshipEntity",
          position: positions.get(item.entity.entityId) ?? { x: 0, y: 0 },
          data: {
            entity: item.entity.entity,
            role: "neighbor",
            onActivate: () => onNavigateEntity(item.entity.entityId),
          },
          draggable: false,
          selectable: false,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        };
      }
      return {
        id: item.group.groupId,
        type: "relationshipGroup",
        position: positions.get(item.group.groupId) ?? { x: 0, y: 0 },
        data: { group: item.group, onActivate: () => onToggleGroupExpand(item.group.entityType) },
        draggable: false,
        selectable: false,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };
    });

    return [centerNode, ...ringNodes];
  }, [neighborhood.center, ringItems, positions, onNavigateEntity, onToggleGroupExpand]);

  const edges: Edge<RelationshipEdgeData>[] = useMemo(() => {
    const delta = (a: FlowPosition, b: FlowPosition) => ({ dx: b.x - a.x, dy: b.y - a.y });
    const centerId = neighborhood.center.entityId;

    const buildEdge = (
      id: string,
      neighborId: string,
      label: string,
      color: string | undefined,
      dashed: boolean,
      isSelected: boolean,
    ): Edge<RelationshipEdgeData> => {
      const centerPos = positions.get(centerId);
      const neighborPos = positions.get(neighborId);
      const { dx, dy } = centerPos && neighborPos ? delta(centerPos, neighborPos) : { dx: 0, dy: 1 };
      const sourceSide = pickRelationshipHandleSide(dx, dy);
      const targetSide = oppositeRelationshipHandleSide(pickRelationshipHandleSide(-dx, -dy));

      return {
        id,
        type: "relationship",
        source: centerId,
        target: neighborId,
        sourceHandle: sourceSide,
        targetHandle: targetSide,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color ?? "color-mix(in srgb, var(--theme-graph-edge) 80%, transparent)",
          width: 16,
          height: 16,
        },
        data: { label, color, selected: isSelected, sourceIsCenter: true },
        style: {
          stroke: color ?? "color-mix(in srgb, var(--theme-graph-edge) 60%, transparent)",
          strokeWidth: isSelected ? 2.6 : 1.4,
          strokeDasharray: dashed ? "5 5" : undefined,
          opacity: selectedConnectionId && !isSelected ? 0.35 : 1,
        },
      };
    };

    // Entity items keep their real per-connection edge (label, color, click-to-select).
    const visibleEntityIds = new Set(ringItems.filter((item) => item.kind === "entity").map((item) => item.entity.entityId));
    const entityEdges = neighborhood.connections
      .filter((connection) => {
        const { sourceId, targetId } = edgeEndpoints(connection);
        const neighborId = sourceId === centerId ? targetId : sourceId;
        return visibleEntityIds.has(neighborId);
      })
      .map((connection) => {
        const isSelected = connection.connectionId === selectedConnectionId;
        const first = connection.relations[0];
        const visual = getRelationVisual(first.relationType);
        const label =
          connection.relations.length > 1
            ? t("entityDetail.relationsGraph.relationsCountLabel", { count: connection.relations.length })
            : formatRelationType(first.relationType, locale);
        const { sourceId, targetId } = edgeEndpoints(connection);
        const neighborId = sourceId === centerId ? targetId : sourceId;
        return buildEdge(connection.connectionId, neighborId, label, visual?.color, visual?.line === "dashed", isSelected);
      });

    // Group items get one aggregate edge summing every relation to a member of the group.
    const connectionByNeighborId = new Map(
      neighborhood.connections.map((connection) => {
        const { sourceId, targetId } = edgeEndpoints(connection);
        const neighborId = sourceId === centerId ? targetId : sourceId;
        return [neighborId, connection] as const;
      }),
    );
    const groupEdges = ringItems
      .filter((item): item is Extract<RelationshipRingItem, { kind: "group" }> => item.kind === "group")
      .map((item) => {
        const relationCount = item.group.entities.reduce((total, entity) => {
          const connection = connectionByNeighborId.get(entity.entityId);
          return total + (connection?.relations.length ?? 0);
        }, 0);
        const label = t("entityDetail.relationsGraph.relationsCountLabel", { count: relationCount });
        return buildEdge(item.group.groupId, item.group.groupId, label, undefined, false, false);
      });

    return [...entityEdges, ...groupEdges];
  }, [neighborhood.connections, neighborhood.center.entityId, ringItems, selectedConnectionId, locale, positions, t]);

  const fitViewDuration = prefersReducedMotion ? 0 : 200;

  useEffect(() => {
    void fitView({ padding: 0.3, duration: fitViewDuration });
  }, [neighborhood.center.entityId, fitView, fitViewDuration]);

  useEffect(() => {
    // The container was resized in place (expand/reduce toggle) rather than
    // remounted, so React Flow's own ResizeObserver measurement can lag one
    // frame behind the CSS transition; defer the re-fit past that frame.
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.3, duration: fitViewDuration });
    });
    return () => cancelAnimationFrame(frame);
  }, [resizeSignal, fitView, fitViewDuration]);

  const flow = (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onEdgeClick={(_event, edge) => onSelectConnection(edge.id === selectedConnectionId ? null : edge.id)}
      onPaneClick={() => onSelectConnection(null)}
      proOptions={{ hideAttribution: true }}
      minZoom={0.4}
      maxZoom={1.5}
      panOnScroll
      zoomOnScroll={false}
    >
      <Background gap={24} size={1} />
      {neighborhood.neighbors.length > MINIMAP_NEIGHBOR_THRESHOLD && (
        <MiniMap pannable zoomable style={{ width: 96, height: 72 }} />
      )}
    </ReactFlow>
  );

  if (bare) return flow;
  return <div className="entity-relations-graph">{flow}</div>;
}

export function RelationshipGraphCanvas(props: RelationshipGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <RelationshipGraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
