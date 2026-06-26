import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import type {
  ReactFlowInstance,
  Edge,
  Node,
  Connection
} from "reactflow";
import "reactflow/dist/style.css";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { CanvasEntityNode } from "./CanvasEntityNode.js";
import { CanvasNoteNode } from "./CanvasNoteNode.js";
import { CanvasGroupNode } from "./CanvasGroupNode.js";
import { RelationshipTypePopover } from "./RelationshipTypePopover.js";

// Register custom node types
const nodeTypes = {
  entity: CanvasEntityNode,
  note: CanvasNoteNode,
  group: CanvasGroupNode,
};

export interface CampaignCanvasFlowProps {
  canvasId: string;
  canvas: any;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
  onClearSelection: () => void;
}

export function CampaignCanvasFlow({
  canvasId,
  canvas,
  selectedNodeId: _selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onClearSelection
}: CampaignCanvasFlowProps) {
  const {
    campaignState,
    updateCanvasNodesLayout,
    addEdgeToCanvas,
    placeNodeOnCanvas,
    saveViewport
  } = useCampaignStore();

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  // Connect Popover state
  const [connectPopover, setConnectPopover] = useState<{
    sourceNodeId: string;
    targetNodeId: string;
    sourceEntity?: any;
    targetEntity?: any;
  } | null>(null);

  // Map canvas nodes to React Flow nodes format
  const flowNodes = useMemo(() => {
    return (canvas.nodes || []).map((node: any) => {
      // Find entity data if it's an entity node to pass titles etc. down
      const entity = node.entityId ? campaignState?.entities?.find((e: any) => e.entityId === node.entityId) : null;
      
      return {
        id: node.id,
        type: node.kind, // 'entity', 'note', 'group'
        position: { x: node.x, y: node.y },
        width: node.width,
        height: node.height,
        parentNode: node.parentId, // support nesting in groups
        data: {
          canvasId,
          entityId: node.entityId,
          text: node.text,
          title: node.title,
          color: node.color,
          status: node.status,
          visibility: node.visibility,
          // pass label for built-in text styling
          label: node.kind === "note" ? node.text : (entity ? entity.title : node.title),
        },
        style: node.kind === "group" ? { width: node.width || 300, height: node.height || 200 } : undefined,
      };
    });
  }, [canvas.nodes, campaignState?.entities, canvasId]);

  // Map canvas edges to React Flow edges format
  const flowEdges = useMemo(() => {
    return (canvas.edges || []).map((edge: any) => {
      const isSecret = edge.style === "secret";
      const isDashed = edge.style === "dashed";
      
      // Determine stroke styles
      let strokeColor = "#94a3b8"; // Slate color
      let strokeWidth = 1.5;
      let strokeDasharray = undefined;

      if (isSecret) {
        strokeColor = "#ef4444"; // Red secret connection
        strokeDasharray = "3,3";
      } else if (isDashed) {
        strokeDasharray = "5,5";
      } else if (edge.style === "strong") {
        strokeWidth = 3;
      } else if (edge.style === "weak") {
        strokeWidth = 1;
        strokeColor = "#cbd5e1";
      }

      return {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.label,
        type: "smoothstep",
        selected: selectedEdgeId === edge.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: strokeColor,
        },
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
        },
        labelStyle: {
          fill: isSecret ? "#ef4444" : "#f1f5f9",
          fontWeight: 500,
          fontSize: "11px",
        },
        labelBgStyle: {
          fill: "hsl(230, 25%, 11%)",
          fillOpacity: 0.85,
          rx: 4,
        },
        data: {
          relationshipId: edge.relationshipId,
          status: edge.status,
          style: edge.style,
          visibility: edge.visibility,
        }
      };
    });
  }, [canvas.edges, selectedEdgeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Keep local nodes state in sync when canvas updates externally (e.g. from reload)
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  // Handle node drag stop: commit positions in bulk to backend
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node, draggedNodes: Node[]) => {
    const updates = draggedNodes.map((n) => ({
      nodeId: n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    }));
    updateCanvasNodesLayout(canvasId, updates);
  }, [canvasId, updateCanvasNodesLayout]);

  const onSelectionDragStop = useCallback((event: React.MouseEvent, nodes: Node[]) => {
    const updates = nodes.map((n) => ({
      nodeId: n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    }));
    updateCanvasNodesLayout(canvasId, updates);
  }, [canvasId, updateCanvasNodesLayout]);

  // Handle group resizing finished: commit size/positions
  // (Handled directly inside CanvasGroupNode using NodeResizer onResizeEnd now)

  // Viewport change end: save zoom/pan coords
  const onMoveEnd = useCallback((_event: any) => {
    if (rfInstance) {
      const zoom = rfInstance.getZoom();
      const { x, y } = rfInstance.getViewport();
      saveViewport(canvasId, { x: Math.round(x), y: Math.round(y), zoom });
    }
  }, [canvasId, rfInstance, saveViewport]);

  // Initial viewport restore from canvas model
  useEffect(() => {
    if (rfInstance && canvas.viewport) {
      rfInstance.setViewport({
        x: canvas.viewport.x,
        y: canvas.viewport.y,
        zoom: canvas.viewport.zoom
      });
    }
  }, [canvasId, rfInstance]); // execute once per canvas switch

  // Click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onSelectNode(node.id);
  }, [onSelectNode]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    onSelectEdge(edge.id);
  }, [onSelectEdge]);

  const onPaneClick = useCallback(() => {
    onClearSelection();
  }, [onClearSelection]);

  // Connect handles: show popover before adding edge
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    // Lookup source and target entities
    const sourceNode = canvas.nodes.find((n: any) => n.id === connection.source);
    const targetNode = canvas.nodes.find((n: any) => n.id === connection.target);
    
    const sourceEntity = sourceNode?.entityId ? campaignState?.entities?.find((e: any) => e.entityId === sourceNode.entityId) : null;
    const targetEntity = targetNode?.entityId ? campaignState?.entities?.find((e: any) => e.entityId === targetNode.entityId) : null;

    setConnectPopover({
      sourceNodeId: connection.source,
      targetNodeId: connection.target,
      sourceEntity,
      targetEntity
    });
  }, [canvas.nodes, campaignState?.entities]);

  const handlePopoverSubmit = async (edgeData: any) => {
    if (!connectPopover) return;
    
    await addEdgeToCanvas(canvasId, {
      sourceNodeId: connectPopover.sourceNodeId,
      targetNodeId: connectPopover.targetNodeId,
      ...edgeData
    });

    setConnectPopover(null);
  };

  // Double click pane -> add note at coordinates
  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (rfInstance && (event.target as HTMLElement).classList.contains("react-flow__pane")) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      placeNodeOnCanvas(canvasId, {
        kind: "note",
        text: "",
        color: "yellow",
        x: Math.round(position.x),
        y: Math.round(position.y)
      });
    }
  }, [rfInstance, canvasId, placeNodeOnCanvas]);

  return (
    <div style={{ width: "100%", height: "100%" }} onDoubleClick={onPaneDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onSelectionDragStop} // for multiselection drags
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
        fitViewOptions={{ padding: 0.2 }}
        className="campaign-react-flow"
      >
        <Background color="#2a3342" gap={24} size={1} />
        <Controls />
      </ReactFlow>

      {/* Relationship Type Selection Dialog */}
      {connectPopover && (
        <RelationshipTypePopover
          canvasId={canvasId}
          sourceNodeId={connectPopover.sourceNodeId}
          targetNodeId={connectPopover.targetNodeId}
          sourceEntity={connectPopover.sourceEntity}
          targetEntity={connectPopover.targetEntity}
          onSubmit={handlePopoverSubmit}
          onCancel={() => setConnectPopover(null)}
        />
      )}
    </div>
  );
}
