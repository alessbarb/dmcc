import React, { useEffect, useMemo } from "react";
import { Background, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getRelationVisual } from "../entityVisuals.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { formatRelationType } from "@shared/i18n/index.js";
import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";
import { computeRadialRelationshipLayout } from "./computeRadialRelationshipLayout.js";
import { relationshipLayoutToFlowPositions } from "./relationshipLayoutToFlowPositions.js";
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
}

function RelationshipGraphCanvasInner({
  neighborhood,
  selectedConnectionId,
  onSelectConnection,
  onNavigateEntity,
}: RelationshipGraphCanvasProps) {
  const { locale } = useTranslation();
  const { fitView } = useReactFlow();

  const positions = useMemo(() => {
    const layout = computeRadialRelationshipLayout({
      centerNode: neighborhood.center,
      neighborNodes: neighborhood.neighbors,
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
    return neighborhood.connections.map((connection) => {
      const isSelected = connection.connectionId === selectedConnectionId;
      const first = connection.relations[0];
      const visual = getRelationVisual(first.relationType);
      const label =
        connection.relations.length > 1
          ? `${connection.relations.length} relaciones`
          : formatRelationType(first.relationType, locale);

      return {
        id: connection.connectionId,
        type: "relationship",
        source: connection.entityAId,
        target: connection.entityBId,
        data: { label, color: visual?.color, selected: isSelected },
        style: {
          stroke: visual?.color ?? "rgba(148,163,184,0.6)",
          strokeWidth: isSelected ? 2.6 : 1.4,
          strokeDasharray: visual?.line === "dashed" ? "5 5" : undefined,
          opacity: selectedConnectionId && !isSelected ? 0.35 : 1,
        },
      } satisfies Edge<RelationshipEdgeData>;
    });
  }, [neighborhood.connections, selectedConnectionId, locale]);

  useEffect(() => {
    void fitView({ padding: 0.3, duration: 200 });
  }, [neighborhood.center.entityId, fitView]);

  return (
    <div className="entity-relations-graph">
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
    </div>
  );
}

export function RelationshipGraphCanvas(props: RelationshipGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <RelationshipGraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
