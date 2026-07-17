import React, { useEffect, useMemo } from "react";
import { Background, MarkerType, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import { getRelationVisual } from "../entityVisuals.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import { computeRadialRelationshipLayout } from "./computeRadialRelationshipLayout.js";
import { relationshipLayoutToFlowPositions, type FlowPosition } from "./relationshipLayoutToFlowPositions.js";
import { oppositeRelationshipHandleSide, pickRelationshipHandleSide } from "./pickRelationshipHandleSide.js";
import { RelationshipEntityNode, type RelationshipNodeData } from "./RelationshipEntityNode.js";
import { RelationshipEdge, type RelationshipEdgeData } from "./RelationshipEdge.js";
import "./relationshipGraph.css";

const NODE_WIDTH = 176;
const NODE_HEIGHT = 104;

const nodeTypes = { relationshipEntity: RelationshipEntityNode };
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
}: RelationshipGraphCanvasProps) {
  const { locale } = useTranslation();
  const { fitView } = useReactFlow();

  const positions = useMemo(() => {
    const layout = computeRadialRelationshipLayout({
      centerNode: neighborhood.center,
      neighborNodes: neighborhood.neighbors,
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
    });
    return relationshipLayoutToFlowPositions(layout, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }, [neighborhood.center, neighborhood.neighbors]);

  const nodes: Node<RelationshipNodeData>[] = useMemo(() => {
    const entities = [neighborhood.center, ...neighborhood.neighbors];
    return entities.map((graphEntity) => ({
      id: graphEntity.entityId,
      type: "relationshipEntity",
      position: positions.get(graphEntity.entityId) ?? { x: 0, y: 0 },
      data: { entity: graphEntity.entity, role: graphEntity.isCenter ? "center" : "neighbor" },
      draggable: false,
      selectable: false,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }));
  }, [neighborhood.center, neighborhood.neighbors, positions]);

  const edges: Edge<RelationshipEdgeData>[] = useMemo(() => {
    const delta = (a: FlowPosition, b: FlowPosition) => ({ dx: b.x - a.x, dy: b.y - a.y });

    return neighborhood.connections.map((connection) => {
      const isSelected = connection.connectionId === selectedConnectionId;
      const first = connection.relations[0];
      const visual = getRelationVisual(first.relationType);
      const label =
        connection.relations.length > 1
          ? `${connection.relations.length} relaciones`
          : formatRelationType(first.relationType, locale);

      const { sourceId, targetId } = edgeEndpoints(connection);
      const sourcePos = positions.get(sourceId);
      const targetPos = positions.get(targetId);
      const { dx, dy } = sourcePos && targetPos ? delta(sourcePos, targetPos) : { dx: 0, dy: 1 };
      const sourceSide = pickRelationshipHandleSide(dx, dy);
      const targetSide = oppositeRelationshipHandleSide(pickRelationshipHandleSide(-dx, -dy));

      // Every edge here connects the center to one neighbor, but domain
      // direction (source/target) varies per relation — so the path midpoint
      // isn't reliably "near the center". Tell the edge which end is the
      // neighbor so it can bias the label there instead, spreading labels
      // out across the ring instead of bunching on the shared center node.
      const sourceIsCenter = sourceId === neighborhood.center.entityId;

      return {
        id: connection.connectionId,
        type: "relationship",
        source: sourceId,
        target: targetId,
        sourceHandle: sourceSide,
        targetHandle: targetSide,
        markerEnd: { type: MarkerType.ArrowClosed, color: visual?.color ?? "color-mix(in srgb, var(--theme-graph-edge) 80%, transparent)", width: 16, height: 16 },
        data: { label, color: visual?.color, selected: isSelected, sourceIsCenter },
        style: {
          stroke: visual?.color ?? "color-mix(in srgb, var(--theme-graph-edge) 60%, transparent)",
          strokeWidth: isSelected ? 2.6 : 1.4,
          strokeDasharray: visual?.line === "dashed" ? "5 5" : undefined,
          opacity: selectedConnectionId && !isSelected ? 0.35 : 1,
        },
      } satisfies Edge<RelationshipEdgeData>;
    });
  }, [neighborhood.connections, selectedConnectionId, locale, positions]);

  useEffect(() => {
    void fitView({ padding: 0.3, duration: 200 });
  }, [neighborhood.center.entityId, fitView]);

  useEffect(() => {
    // The container was resized in place (expand/reduce toggle) rather than
    // remounted, so React Flow's own ResizeObserver measurement can lag one
    // frame behind the CSS transition; defer the re-fit past that frame.
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.3, duration: 200 });
    });
    return () => cancelAnimationFrame(frame);
  }, [resizeSignal, fitView]);

  const flow = (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={(_event, node) => {
        const data = node.data as RelationshipNodeData;
        if (data.role === "neighbor") onNavigateEntity(data.entity.entityId);
      }}
      onEdgeClick={(_event, edge) => onSelectConnection(edge.id === selectedConnectionId ? null : edge.id)}
      onPaneClick={() => onSelectConnection(null)}
      proOptions={{ hideAttribution: true }}
      minZoom={0.4}
      maxZoom={1.5}
      panOnScroll
      zoomOnScroll={false}
    >
      <Background gap={24} size={1} />
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
