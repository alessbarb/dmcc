import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  MarkerType,
} from "reactflow";
import type {
  ReactFlowInstance,
  Edge,
  Node,
  Connection,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { CanvasEntityNode } from "./CanvasEntityNode.js";
import { CanvasNoteNode } from "./CanvasNoteNode.js";
import { CanvasGroupNode } from "./CanvasGroupNode.js";
import { RelationshipTypePopover } from "./RelationshipTypePopover.js";
import { CanvasToolbar } from "./CanvasToolbar.js";
import type { InteractionMode } from "./CanvasToolbar.js";

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
  interactionMode: InteractionMode;
  isLocked: boolean;
  showMinimap: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onLockChange: (locked: boolean) => void;
  onMinimapToggle: () => void;
}

export function CampaignCanvasFlow({
  canvasId,
  canvas,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  interactionMode,
  isLocked,
  showMinimap,
  onModeChange,
  onLockChange,
  onMinimapToggle,
}: CampaignCanvasFlowProps) {
  const {
    campaignState,
    updateCanvasNodesLayout,
    addEdgeToCanvas,
    placeNodeOnCanvas,
    createEntity,
    saveViewport
  } = useCampaignStore();

  const wrapperRef = useRef<HTMLDivElement>(null);

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
      const isStrong = edge.style === "strong";
      const isWeak   = edge.style === "weak";

      let strokeColor = "hsl(220, 20%, 40%)";
      let strokeWidth = 1.5;
      let strokeDasharray: string | undefined;
      let filter: string | undefined;

      if (isSecret) {
        strokeColor = "#ef4444";
        strokeWidth = 1.5;
        strokeDasharray = "4 3";
        filter = "drop-shadow(0 0 3px rgba(239,68,68,0.5))";
      } else if (isDashed) {
        strokeColor = "hsl(220, 20%, 50%)";
        strokeDasharray = "6 4";
      } else if (isStrong) {
        strokeWidth = 3;
        strokeColor = "hsl(220, 30%, 65%)";
        filter = "drop-shadow(0 0 4px rgba(148,163,184,0.35))";
      } else if (isWeak) {
        strokeWidth = 1;
        strokeColor = "hsl(220, 15%, 30%)";
      }

      const isSelected = selectedEdgeId === edge.id;
      if (isSelected) {
        strokeColor = "hsl(255, 85%, 72%)";
        filter = "drop-shadow(0 0 5px hsla(255, 85%, 65%, 0.6))";
        strokeWidth = Math.max(strokeWidth, 2);
      }

      return {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.label,
        type: "smoothstep",
        selected: isSelected,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: isStrong ? 18 : 14,
          height: isStrong ? 18 : 14,
          color: strokeColor,
        },
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          filter,
        },
        labelStyle: {
          fill: isSecret ? "#f87171" : isSelected ? "hsl(255, 85%, 80%)" : "hsl(220, 20%, 75%)",
          fontWeight: 600,
          fontSize: "10px",
          letterSpacing: "0.02em",
        },
        labelBgStyle: {
          fill: "hsl(230, 28%, 10%)",
          fillOpacity: 0.9,
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

  // Keep local nodes state in sync when canvas updates externally.
  // Preserve React Flow selection state (needed for NodeResizer visibility).
  useEffect(() => {
    setNodes(prev => {
      const rfSelectedIds = new Set(prev.filter(n => n.selected).map(n => n.id));
      return flowNodes.map(n => ({
        ...n,
        selected: rfSelectedIds.has(n.id) || n.id === selectedNodeId,
      }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowNodes, selectedNodeId]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  // --- Group-snap helper ---
  const CARD_W = 162;
  const CARD_H = 190;

  /** Returns group whose bounds contain the center of the dropped card, or null. */
  const findContainingGroup = useCallback((absPos: XYPosition, allNodes: Node[]): Node | null => {
    for (const g of allNodes) {
      if (g.type !== "group") continue;
      const gx = g.position.x;
      const gy = g.position.y;
      const gw = (g.style?.width as number | undefined) ?? g.width ?? 300;
      const gh = (g.style?.height as number | undefined) ?? g.height ?? 200;
      const cx = absPos.x + CARD_W / 2;
      const cy = absPos.y + CARD_H / 2;
      if (cx > gx && cx < gx + gw && cy > gy && cy < gy + gh) return g;
    }
    return null;
  }, []);

  // Handle node drag stop: commit positions and detect group membership
  const onNodeDragStop = useCallback((_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
    const updates = draggedNodes.map((n) => {
      if (n.type !== "entity") {
        return { nodeId: n.id, x: Math.round(n.position.x), y: Math.round(n.position.y) };
      }

      const absPos: XYPosition = {
        x: n.positionAbsolute?.x ?? n.position.x,
        y: n.positionAbsolute?.y ?? n.position.y,
      };

      const group = findContainingGroup(absPos, nodes);

      if (group) {
        return {
          nodeId: n.id,
          x: Math.round(absPos.x - group.position.x),
          y: Math.round(absPos.y - group.position.y),
          parentId: group.id,
        };
      }
      return { nodeId: n.id, x: Math.round(absPos.x), y: Math.round(absPos.y), parentId: null };
    });

    updateCanvasNodesLayout(canvasId, updates);
  }, [canvasId, nodes, updateCanvasNodesLayout, findContainingGroup]);

  const onSelectionDragStop = useCallback((_event: React.MouseEvent, draggedNodes: Node[]) => {
    const updates = draggedNodes.map((n) => ({
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

  // --- Palette drag & drop ---
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("palette/kind")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the whole wrapper (not just child elements)
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const kind = e.dataTransfer.getData("palette/kind");
    const entityType = e.dataTransfer.getData("palette/entityType");
    const label = e.dataTransfer.getData("palette/label");
    if (!kind || !rfInstance) return;

    const bounds = wrapperRef.current!.getBoundingClientRect();
    const pos = rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const x = Math.round(pos.x - CARD_W / 2);
    const y = Math.round(pos.y - CARD_H / 2);

    if (kind === "note") {
      await placeNodeOnCanvas(canvasId, { kind: "note", text: "", color: "yellow", x, y });
    } else if (kind === "group") {
      await placeNodeOnCanvas(canvasId, { kind: "group", title: "Nuevo Grupo", color: "purple", x, y, width: 340, height: 220 });
    } else if (kind === "entity" && entityType) {
      const campaignId = campaignState?.campaign?.campaignId;
      if (!campaignId) return;
      try {
        await createEntity({ entityType, title: `Nuevo ${label}`, status: "ready", importance: "normal", visibility: { kind: "dm_only" } });
        const created = useCampaignStore.getState().campaignState?.entities?.slice(-1)[0];
        if (created) {
          await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: created.entityId, x, y });
        }
      } catch (err) {
        console.error("Drop create entity failed", err);
      }
    }
  }, [rfInstance, canvasId, campaignState, placeNodeOnCanvas, createEntity]);

  const isPanMode = interactionMode === "pan";

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: "100%", cursor: isPanMode ? "grab" : "default" }}
      className={isDragOver ? "canvas-drop-zone--active" : undefined}
      onDoubleClick={onPaneDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onSelectionDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        fitViewOptions={{ padding: 0.2 }}
        className="campaign-react-flow"
        panOnDrag={isPanMode}
        nodesDraggable={!isLocked && !isPanMode}
        elementsSelectable={!isPanMode}
        panOnScroll={false}
        zoomOnDoubleClick={false}
      >
        <Background color="hsl(230, 25%, 18%)" gap={28} size={0.8} />

        <CanvasToolbar
          canvasId={canvasId}
          interactionMode={interactionMode}
          isLocked={isLocked}
          showMinimap={showMinimap}
          onModeChange={onModeChange}
          onLockChange={onLockChange}
          onMinimapToggle={onMinimapToggle}
        />

        {showMinimap && (
          <MiniMap
            nodeColor={(n) => {
              if (n.type === "note") return "#fef08a";
              if (n.type === "group") return "rgba(124,58,237,0.3)";
              return "hsl(230, 25%, 22%)";
            }}
            maskColor="rgba(10,12,20,0.75)"
            style={{ background: "hsl(230, 28%, 10%)", border: "1px solid hsl(230,20%,20%)" }}
          />
        )}
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
