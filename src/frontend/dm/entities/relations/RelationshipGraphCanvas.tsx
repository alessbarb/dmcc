import React, { useEffect, useMemo, useState } from "react";
import { Background, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import { getRelationVisual } from "../entityVisuals.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import {
  computeRelationshipFlowLayout,
  type RelationshipFlowEdgeRoute,
} from "./computeRelationshipFlowLayout.js";
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
  if (connection.relations.length === 1) {
    const relation = connection.relations[0];

    return {
      sourceId: relation.sourceEntityId,
      targetId: relation.targetEntityId,
    };
  }

  return {
    sourceId: connection.entityAId,
    targetId: connection.entityBId,
  };
}

type RelationshipDirectionFromCenter =
  | "incoming"
  | "outgoing"
  | "bidirectional"
  | "self";

/**
 * Clasifica una conexión desde la perspectiva de la entidad actual.
 *
 * incoming:
 *   vecino -> centro
 *
 * outgoing:
 *   centro -> vecino
 *
 * bidirectional:
 *   existen relaciones en ambos sentidos
 *
 * self:
 *   la relación empieza y termina en la entidad actual
 */
function relationshipDirectionFromCenter(
  connection: EntityRelationshipNeighborhood["connections"][number],
  centerId: string,
): RelationshipDirectionFromCenter {
  let hasIncoming = false;
  let hasOutgoing = false;

  for (const relation of connection.relations) {
    const isSelf =
      relation.sourceEntityId === centerId &&
      relation.targetEntityId === centerId;

    if (isSelf) {
      return "self";
    }

    if (
      relation.sourceEntityId === centerId &&
      relation.targetEntityId !== centerId
    ) {
      hasOutgoing = true;
    }

    if (
      relation.targetEntityId === centerId &&
      relation.sourceEntityId !== centerId
    ) {
      hasIncoming = true;
    }
  }

  if (hasIncoming && hasOutgoing) {
    return "bidirectional";
  }

  if (hasIncoming) {
    return "incoming";
  }

  return "outgoing";
}

function neighborIdForConnection(
  connection: EntityRelationshipNeighborhood["connections"][number],
  centerId: string,
): string {
  const relation = connection.relations[0];

  if (relation) {
    if (relation.sourceEntityId === centerId) {
      return relation.targetEntityId;
    }

    if (relation.targetEntityId === centerId) {
      return relation.sourceEntityId;
    }
  }

  return connection.entityAId === centerId
    ? connection.entityBId
    : connection.entityAId;
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

  const [positions, setPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());

  const [edgeRoutes, setEdgeRoutes] = useState<
    Map<string, RelationshipFlowEdgeRoute>
  >(new Map());

  useEffect(() => {
    let cancelled = false;

    const centerId = neighborhood.center.entityId;

    const visibleIds = new Set(
      ringItems.map((item) =>
        item.kind === "entity"
          ? item.entity.entityId
          : item.group.groupId,
      ),
    );

    const layoutNodes = [
      {
        id: centerId,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        role: "center" as const,
      },
      ...ringItems.map((item) => ({
        id:
          item.kind === "entity"
            ? item.entity.entityId
            : item.group.groupId,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        role: "neighbor" as const,
      })),
    ];

    let incomingCount = 0;
    let outgoingCount = 0;

    const entityEdges = neighborhood.connections
      .map((connection) => {
        const neighborId = neighborIdForConnection(
          connection,
          centerId,
        );

        if (!visibleIds.has(neighborId)) {
          return null;
        }

        const direction =
          relationshipDirectionFromCenter(
            connection,
            centerId,
          );

        if (direction === "self") {
          return null;
        }

        if (direction === "incoming") {
          incomingCount += 1;

          return {
            id: connection.connectionId,
            sourceId: neighborId,
            targetId: centerId,
          };
        }

        if (direction === "outgoing") {
          outgoingCount += 1;

          return {
            id: connection.connectionId,
            sourceId: centerId,
            targetId: neighborId,
          };
        }

        // Una conexión bidireccional no debe duplicar la tarjeta.
        // La colocamos en el lado menos cargado, manteniendo una
        // distribución visual equilibrada.
        if (incomingCount <= outgoingCount) {
          incomingCount += 1;

          return {
            id: connection.connectionId,
            sourceId: neighborId,
            targetId: centerId,
          };
        }

        outgoingCount += 1;

        return {
          id: connection.connectionId,
          sourceId: centerId,
          targetId: neighborId,
        };
      })
      .filter(
        (
          edge,
        ): edge is {
          id: string;
          sourceId: string;
          targetId: string;
        } => edge !== null,
      );

    const groupEdges = ringItems
      .filter(
        (
          item,
        ): item is Extract<
          RelationshipRingItem,
          { kind: "group" }
        > => item.kind === "group",
      )
      .map((item) => ({
        id: item.group.groupId,
        sourceId: centerId,
        targetId: item.group.groupId,
      }));

    void computeRelationshipFlowLayout(
      layoutNodes,
      [...entityEdges, ...groupEdges],
    ).then((layout) => {
      if (cancelled) return;

      setPositions(layout.positions);
      setEdgeRoutes(layout.edgeRoutes);
    });

    return () => {
      cancelled = true;
    };
  }, [
    neighborhood.center.entityId,
    neighborhood.connections,
    ringItems,
  ]);

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
    const centerId = neighborhood.center.entityId;

    const buildEdge = (
      id: string,
      neighborId: string,
      direction: RelationshipDirectionFromCenter,
      label: string,
      color: string | undefined,
      dashed: boolean,
      isSelected: boolean,
    ): Edge<RelationshipEdgeData> => {
      const route = edgeRoutes.get(id);
const layoutIsIncoming =
        route?.points !== undefined &&
        direction === "incoming";

      const sourceId = layoutIsIncoming
        ? neighborId
        : centerId;

      const targetId = layoutIsIncoming
        ? centerId
        : neighborId;

      const sourceSide =
        route?.sourceSide ??
        (layoutIsIncoming ? "right" : "right");

      const targetSide =
        route?.targetSide ??
        (layoutIsIncoming ? "left" : "left");

      return {
        id,
        type: "relationship",
        source: sourceId,
        target: targetId,
        sourceHandle: sourceSide,
        targetHandle: targetSide,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color ?? "color-mix(in srgb, var(--theme-graph-edge) 80%, transparent)",
          width: 16,
          height: 16,
        },
        data: {
          label,
          color,
          selected: isSelected,
          routedPoints: route?.points,
          labelPoint: route?.labelPoint,
        },
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
        const neighborId = neighborIdForConnection(
          connection,
          centerId,
        );

        const direction =
          relationshipDirectionFromCenter(
            connection,
            centerId,
          );

        return buildEdge(
          connection.connectionId,
          neighborId,
          direction,
          label,
          visual?.color,
          visual?.line === "dashed",
          isSelected,
        );
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
        return buildEdge(
          item.group.groupId,
          item.group.groupId,
          "outgoing",
          label,
          undefined,
          false,
          false,
        );
      });

    return [...entityEdges, ...groupEdges];
  }, [
    neighborhood.connections,
    neighborhood.center.entityId,
    ringItems,
    selectedConnectionId,
    locale,
    edgeRoutes,
    positions,
    t,
  ]);

  const fitViewDuration = prefersReducedMotion ? 0 : 200;

  useEffect(() => {
    if (positions.size === 0) return;

    const frame = requestAnimationFrame(() => {
      void fitView({
        padding: 0.22,
        duration: fitViewDuration,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    neighborhood.center.entityId,
    positions,
    fitView,
    fitViewDuration,
  ]);

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
