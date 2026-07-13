import React, { useState, useEffect, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { ReactFlow,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  MarkerType,
  SelectionMode,
} from "@xyflow/react";
import type {
  ReactFlowInstance,
  Edge,
  Node,
  Connection,
  OnMove,
  OnMoveEnd,
  OnNodeDrag,
  OnSelectionChangeParams,
  SelectionDragHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { CanvasEntityNode } from "./CanvasEntityNode.js";
import { CanvasNoteNode } from "./CanvasNoteNode.js";
import { CanvasFactNode } from "./CanvasFactNode.js";
import { CanvasGroupHulls } from "./CanvasGroupHulls.js";
import type { Viewport } from "./CanvasGroupHulls.js";
import { RelationshipTypePopover } from "./RelationshipTypePopover.js";
import { CanvasToolbar } from "./CanvasToolbar.js";
import type { InteractionMode } from "./CanvasToolbar.js";
import type { ProOptions } from "@xyflow/react";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import type { Entity, Relation, Fact } from "../../../shared/stores/campaignStore.js";
import { getRelationVisual } from "../../entities/entityVisuals.js";
import { isPublicCanvasEdge, isPublicCanvasNode } from "../services/canvasVisibility.js";
import { viewportContainsCanvasNode } from "../services/canvasViewport.js";

// Register custom node types — group nodes are no longer rendered as boxes
const nodeTypes = {
  entity: CanvasEntityNode,
  note: CanvasNoteNode,
  fact: CanvasFactNode,
};

const reactFlowProOptions: ProOptions = { hideAttribution: true };

function runCanvasFlowAction(operation: Promise<unknown> | undefined, errorMessage: string): void {
  if (!operation) return;
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

type RelationshipPopoverSubmitData = Parameters<React.ComponentProps<typeof RelationshipTypePopover>["onSubmit"]>[0];

export type CanvasFlowNodeKind = "entity" | "note" | "fact" | "group" | "image";

export interface CanvasFlowNodeData extends Record<string, unknown> {
  canvasId: string;
  entityId?: string;
  entityType?: string;
  factId?: string;
  statement?: string;
  kind?: string;
  confidence?: string;
  relatedEntityCount: number;
  text?: string;
  title?: string;
  color?: string;
  status?: string;
  visibility?: CanvasNode["visibility"];
  label?: string;
  isDirectionMode: boolean;
  isPlayerView: boolean;
  tablePrivacy: boolean;
  isAttenuated: boolean;
  density: "compact" | "normal" | "detailed";
  collapsed?: boolean;
}

export type CanvasFlowNode = Node<CanvasFlowNodeData, CanvasFlowNodeKind>;

export interface CampaignCanvasFocusOptions {
  zoom?: number;
  duration?: number;
}

/** Public navigation API for external canvas controls. */
export interface CampaignCanvasFlowHandle {
  focusNode: (nodeId: string, options?: CampaignCanvasFocusOptions) => boolean;
  focusEntity: (entityId: string, options?: CampaignCanvasFocusOptions) => boolean;
  focusFact: (factId: string, options?: CampaignCanvasFocusOptions) => boolean;
  getViewportCenter: () => { x: number; y: number } | null;
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export type CanvasDeviceMode = "wide-screen" | "tablet" | "mobile";
export type CanvasInteractionProfile = "explore" | "direct" | "edit";

export interface CampaignCanvasFlowProps {
  canvasId: string;
  canvas: Canvas;
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
  typeFilter?: string;
  publicOnly?: boolean;
  onSelectionChange?: (selectedNodes: CanvasFlowNode[], selectedEdges: Edge[]) => void;
  isDirectionMode?: boolean;
  isPlayerView?: boolean;
  tablePrivacy?: boolean;
  mysteryFlowMode?: boolean;
  density?: "compact" | "normal" | "detailed";
  relationsFilter?: "all" | "public" | "secret" | "selection";
  deviceMode?: CanvasDeviceMode;
  interactionProfile?: CanvasInteractionProfile;
  focusMode?: boolean;
  focusNodeId?: string | null;
  maxGraphDepth?: number;
  showOnlyNeighborhood?: boolean;
  onNodeContextRequest?: (nodeId: string) => void;
}

export const CampaignCanvasFlow = React.forwardRef<CampaignCanvasFlowHandle, CampaignCanvasFlowProps>(function CampaignCanvasFlow({
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
  typeFilter = "all",
  publicOnly = false,
  onSelectionChange,
  isDirectionMode = false,
  isPlayerView = false,
  tablePrivacy = false,
  mysteryFlowMode = false,
  density = "normal",
  relationsFilter = "all",
  deviceMode = "wide-screen",
  interactionProfile = "edit",
  focusMode = false,
  focusNodeId = null,
  maxGraphDepth: _maxGraphDepth,
  showOnlyNeighborhood: _showOnlyNeighborhood = false,
  onNodeContextRequest,
}: CampaignCanvasFlowProps, ref) {
  const { t } = useTranslation();
  const {
    campaignState,
    updateCanvasNodesLayout,
    addEdgeToCanvas,
    placeNodeOnCanvas,
    createEntity,
    createFact,
    saveViewport
  } = useCampaignStore();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<CanvasFlowNode, Edge> | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });

  // Sync viewport for the group hull overlay
  const onMove: OnMove = useCallback((_, vp: Viewport) => {
    setViewport(vp);
  }, []);
  
  // Connect Popover state
  const [connectPopover, setConnectPopover] = useState<{
    sourceNodeId: string;
    targetNodeId: string;
    sourceEntity?: Entity | null;
    targetEntity?: Entity | null;
  } | null>(null);

  // Highlighted path in Mystery Flow Mode
  const highlightedNodeIds = useMemo(() => {
    if (!mysteryFlowMode || !selectedNodeId) return null;
    const startNode = canvas.nodes?.find((n: CanvasNode) => n.id === selectedNodeId);
    if (!startNode) return null;
    
    // Only traverse if starting from a mystery type entity
    const entity = startNode.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === startNode.entityId) : null;
    if (entity) {
      const mysteryTypes = ["clue", "secret", "quest", "decision"];
      if (!mysteryTypes.includes(entity.entityType)) return null;
    } else {
      return null;
    }

    const visited = new Set<string>();
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const edge of canvas.edges || []) {
        if (edge.sourceNodeId === current) {
          const rel = edge.relationshipId ? campaignState?.relations?.find((r: Relation) => r.relationId === edge.relationshipId) : null;
          const relType = rel?.relationType || "";
          const logicalTypes = ["points_to", "reveals", "unlocks", "causes", "contradicts", "confirms"];
          const labelLower = edge.label?.toLowerCase() || "";
          const isLogical = logicalTypes.some(t => relType.includes(t)) ||
                            logicalTypes.some(t => labelLower.includes(t)) ||
                            labelLower.includes("apunta a") ||
                            labelLower.includes("revela") ||
                            labelLower.includes("desbloquea") ||
                            labelLower.includes("causa") ||
                            labelLower.includes("contradice") ||
                            labelLower.includes("confirma");
          if (isLogical) {
            queue.push(edge.targetNodeId);
          }
        }
      }
    }
    return visited;
  }, [mysteryFlowMode, selectedNodeId, canvas.nodes, canvas.edges, campaignState?.entities, campaignState?.relations]);

  // Map canvas nodes to React Flow nodes format
  const flowNodes = useMemo<CanvasFlowNode[]>(() => {
    const rawNodes: CanvasNode[] = canvas.nodes || [];

    // Build group position lookup for relative→absolute conversion (old data with parentId)
    const groupAbsPos: Record<string, { x: number; y: number }> = {};
    rawNodes.forEach((n: CanvasNode) => {
      if (n.kind === "group") groupAbsPos[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
    });

    return rawNodes
      .filter((node: CanvasNode) => {
        // Groups are rendered as hull overlays — not as RF nodes
        if (node.kind === "group") return false;

        const entity = node.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === node.entityId) : null;

        const facts = campaignState?.facts;
        const fact = node.factId && facts
          ? (facts instanceof Map
              ? facts.get(node.factId)
              : Array.isArray(facts)
                ? (facts as Fact[]).find((f: Fact) => f.factId === node.factId)
                : undefined)
          : undefined;

        if (publicOnly && !isPublicCanvasNode(node, entity ?? fact ?? null)) return false;

        if (mysteryFlowMode) {
          if (node.kind === "entity" && entity) {
            const mysteryTypes = ["clue", "secret", "quest", "decision"];
            if (!mysteryTypes.includes(entity.entityType)) return false;
          } else {
            return false;
          }
        }

        if (typeFilter !== "all" && node.kind === "entity" && entity) {
          if (typeFilter === "other") {
            const knownTypes = ["npc", "location", "clue", "secret", "quest"];
            if (knownTypes.includes(entity.entityType)) return false;
          } else if (entity.entityType !== typeFilter) {
            return false;
          }
        }

        return true;
      })
      .map((node: CanvasNode) => {
        const entity = node.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === node.entityId) : null;

        // Resolve fact data
        const facts = campaignState?.facts;
        const fact = node.factId && facts
          ? (facts instanceof Map
              ? facts.get(node.factId)
              : Array.isArray(facts)
                ? (facts as Fact[]).find((f: Fact) => f.factId === node.factId)
                : undefined)
          : undefined;

        const isHighlighted = highlightedNodeIds ? highlightedNodeIds.has(node.id) : true;
        const isAttenuated = highlightedNodeIds ? !isHighlighted : false;

        // Convert relative → absolute for nodes still using old parentId-based positioning
        let absX = node.x ?? 0, absY = node.y ?? 0;
        if (node.parentId && !node.groupId && groupAbsPos[node.parentId]) {
          absX = absX + groupAbsPos[node.parentId].x;
          absY = absY + groupAbsPos[node.parentId].y;
        }

        const nodeStyle: React.CSSProperties | undefined = isAttenuated ? { opacity: 0.25, pointerEvents: "none" } : undefined;

        return {
          id: node.id,
          type: node.kind, // 'entity', 'note', 'fact'
          position: { x: absX, y: absY },
          // No parentNode — groups are visual overlays, not RF parent-child
          data: {
            canvasId,
            entityId: node.entityId,
            entityType: entity?.entityType,
            factId: node.factId,
            statement: fact?.statement,
            kind: fact?.kind,
            confidence: fact?.confidence,
            relatedEntityCount: fact?.relatedEntityIds?.length ?? 0,
            text: node.text,
            title: node.title,
            color: node.color,
            status: node.status,
            visibility: node.visibility,
            label: node.kind === "note" ? node.text : (entity ? entity.title : node.title),
            isDirectionMode,
            isPlayerView,
            tablePrivacy,
            isAttenuated,
            density,
            collapsed: node.collapsed,
          },
          style: nodeStyle,
        };
      });
  }, [canvas.nodes, campaignState?.entities, campaignState?.facts, canvasId, typeFilter, publicOnly, mysteryFlowMode, highlightedNodeIds, isDirectionMode, isPlayerView, tablePrivacy, density]);

  // Map canvas edges to React Flow edges format
  const flowEdges = useMemo<Edge[]>(() => {
    const visibleNodeIds = new Set(flowNodes.map((n) => n.id));
    const defaultEdges = (canvas.edges || [])
      .filter((edge: CanvasEdge) => visibleNodeIds.has(edge.sourceNodeId) && visibleNodeIds.has(edge.targetNodeId))
      .filter((edge: CanvasEdge) => {
        const relation = edge.relationshipId ? campaignState?.relations?.find((r: Relation) => r.relationId === edge.relationshipId) : null;
        const isPublicEdge = isPublicCanvasEdge(edge, relation);
        if ((publicOnly || relationsFilter === "public") && !isPublicEdge) return false;

        if (relationsFilter === "secret" && isPublicEdge) return false;

        if (relationsFilter === "selection" && selectedNodeId) {
          if (edge.sourceNodeId !== selectedNodeId && edge.targetNodeId !== selectedNodeId) {
            return false;
          }
        }

        if (mysteryFlowMode) {
          const rel = edge.relationshipId ? campaignState?.relations?.find((r: Relation) => r.relationId === edge.relationshipId) : null;
          const relType = rel?.relationType || "";
          const logicalTypes = ["points_to", "reveals", "unlocks", "causes", "contradicts", "confirms"];
          const labelLower = edge.label?.toLowerCase() || "";
          const isLogical = logicalTypes.some(t => relType.includes(t)) ||
                            logicalTypes.some(t => labelLower.includes(t)) ||
                            labelLower.includes("apunta a") ||
                            labelLower.includes("revela") ||
                            labelLower.includes("desbloquea") ||
                            labelLower.includes("causa") ||
                            labelLower.includes("contradice") ||
                            labelLower.includes("confirma");
          if (!isLogical) return false;
        }
        return true;
      })
      .map((edge: CanvasEdge) => {
        const relation = edge.relationshipId
          ? campaignState?.relations?.find((item: Relation) => item.relationId === edge.relationshipId)
          : undefined;
        const relationVisual = getRelationVisual(relation?.relationType ?? edge.label ?? "", edge.style);
        const isSecret = edge.style === "secret";
        const isDashed = edge.style === "dashed";
        const isStrong = edge.style === "strong";
        const isWeak   = edge.style === "weak";

        const isHighlighted = highlightedNodeIds ? (highlightedNodeIds.has(edge.sourceNodeId) && highlightedNodeIds.has(edge.targetNodeId)) : true;
        
        // Highlight selection connections: attenuate others if there's a selection
        const hasSelection = !!selectedNodeId;
        const connectsToSelection = edge.sourceNodeId === selectedNodeId || edge.targetNodeId === selectedNodeId;
        const isAttenuatedBySelection = hasSelection && !connectsToSelection;

        const isAttenuated = (highlightedNodeIds ? !isHighlighted : false) || isAttenuatedBySelection;

        let strokeColor = "hsl(220, 20%, 40%)";
        let strokeWidth = 1.5;
        let strokeDasharray: string | undefined;
        let filter: string | undefined;
        let opacity = 1;

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

        if (!isSecret && relationVisual.semantic !== "neutral") {
          strokeColor = relationVisual.color;
          strokeDasharray = relationVisual.line === "dashed"
            ? "7 5"
            : relationVisual.line === "double"
              ? "2 2"
              : undefined;
          strokeWidth = relationVisual.line === "double" ? 3.5 : Math.max(strokeWidth, 2);
        }

        const isSelected = selectedEdgeId === edge.id;
        if (isSelected) {
          strokeColor = "hsl(255, 85%, 72%)";
          filter = "drop-shadow(0 0 5px hsla(255, 85%, 65%, 0.6))";
          strokeWidth = Math.max(strokeWidth, 2);
        }

        if (isAttenuated) {
          opacity = 0.15;
          filter = undefined;
        }

        return {
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          label: relationVisual.semantic === "neutral"
            ? edge.label
            : `${relationVisual.label}${edge.label ? ` · ${edge.label}` : ""}`,
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
            opacity,
          },
          labelStyle: {
            fill: isSecret ? "#f87171" : isSelected ? "hsl(255, 85%, 80%)" : "hsl(220, 20%, 75%)",
            fontWeight: 600,
            fontSize: "10px",
            letterSpacing: "0.02em",
            opacity,
          },
          labelBgStyle: {
            fill: "hsl(230, 28%, 10%)",
            fillOpacity: 0.9,
            rx: 4,
            opacity,
          },
          data: {
            relationshipId: edge.relationshipId,
            status: edge.status,
            style: edge.style,
            visibility: edge.visibility,
          }
        };
      });

    // Add virtual anchor lines for DM
    const anchorEdges: Edge[] = [];
    if (!publicOnly && !mysteryFlowMode && campaignState?.entities) {
      const secretNodes = canvas.nodes?.filter((n: CanvasNode) => {
        const ent = n.entityId ? campaignState.entities.find((e: Entity) => e.entityId === n.entityId) : null;
        return ent?.entityType === "secret" && !ent.archived;
      }) || [];

      for (const secretNode of secretNodes) {
        const secretEntity = campaignState.entities.find((e: Entity) => e.entityId === secretNode.entityId);
        const anchors = Array.isArray(secretEntity?.metadata?.revelationAnchors) ? secretEntity.metadata.revelationAnchors : [];
        for (const anchorId of anchors) {
          const anchorNode = canvas.nodes?.find((n: CanvasNode) => n.entityId === anchorId);
          if (anchorNode && visibleNodeIds.has(anchorNode.id)) {
            // Apply relations filter checks for virtual anchor edges as well
            if (relationsFilter === "selection" && selectedNodeId) {
              if (anchorNode.id !== selectedNodeId && secretNode.id !== selectedNodeId) {
                continue;
              }
            }
            if (relationsFilter === "secret") {
              // Virtual anchors are not technically core database secrets, but we can treat them as secrets or all
              continue;
            }

            // Attenuation checks for anchors
            const hasSelection = !!selectedNodeId;
            const connectsToSelection = anchorNode.id === selectedNodeId || secretNode.id === selectedNodeId;
            const isAttenuatedBySelection = hasSelection && !connectsToSelection;
            const opacityVal = isAttenuatedBySelection ? 0.15 : 1;

            anchorEdges.push({
              id: `virtual-anchor-${anchorNode.id}-${secretNode.id}`,
              source: anchorNode.id,
              target: secretNode.id,
              type: "smoothstep",
              style: {
                stroke: "rgba(167, 139, 250, 0.45)",
                strokeWidth: 1.2,
                strokeDasharray: "3 3",
                opacity: opacityVal,
              },
              label: "ancla",
              labelStyle: {
                fill: "rgba(167, 139, 250, 0.6)",
                fontSize: "8px",
                fontWeight: 500,
                opacity: opacityVal,
              },
              labelBgStyle: {
                fill: "hsl(230, 28%, 10%)",
                fillOpacity: 0.8,
                rx: 3,
                opacity: opacityVal,
              },
            });
          }
        }
      }
    }

    return [...defaultEdges, ...anchorEdges];
  }, [canvas.nodes, canvas.edges, selectedEdgeId, flowNodes, publicOnly, mysteryFlowMode, campaignState?.entities, campaignState?.relations, highlightedNodeIds, relationsFilter, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Keep local nodes state in sync when canvas updates externally.
  // Preserve RF selection (needed for NodeResizer visibility on groups).
  // Do NOT include selectedNodeId here — RF already marks nodes selected via onNodeClick.
  // Adding selectedNodeId causes multi-selection bugs (race with onNodesChange).
  useEffect(() => {
    setNodes(prev => {
      const rfSelectedIds = new Set(prev.filter((n) => n.selected).map((n) => n.id));
      return flowNodes.map((n) => ({
        ...n,
        selected: rfSelectedIds.has(n.id),
      }));
    });
  }, [flowNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const viewportRecoveryCanvasIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!rfInstance || !canvasId || viewportRecoveryCanvasIdRef.current === canvasId || flowNodes.length === 0) return;

    const wrapperBounds = wrapperRef.current?.getBoundingClientRect();
    if (!wrapperBounds || wrapperBounds.width <= 0 || wrapperBounds.height <= 0) return;

    const currentViewport = canvas.viewport ?? rfInstance.getViewport();
    const hasVisibleNode = viewportContainsCanvasNode(flowNodes, currentViewport, {
      width: wrapperBounds.width,
      height: wrapperBounds.height,
    });

    viewportRecoveryCanvasIdRef.current = canvasId;

    if (!canvas.viewport || !hasVisibleNode) {
      window.setTimeout(() => {
        runCanvasFlowAction(
          rfInstance.fitView({ padding: 0.25, duration: 800 }),
          "Failed to recover canvas viewport",
        );
      }, 100);
    }
  }, [canvas.viewport, canvasId, flowNodes, rfInstance]);


  const focusNode = useCallback((nodeId: string, options?: CampaignCanvasFocusOptions) => {
    const node = canvas.nodes?.find((item: CanvasNode) => item.id === nodeId);
    if (!node || !rfInstance) return false;

    const width = node.width ?? 160;
    const height = node.height ?? 120;
    runCanvasFlowAction(
      rfInstance.setCenter((node.x ?? 0) + width / 2, (node.y ?? 0) + height / 2, options),
      "Failed to focus canvas node",
    );
    setNodes((currentNodes) => currentNodes.map((currentNode) => ({
      ...currentNode,
      selected: currentNode.id === node.id,
    })));
    onSelectNode(node.id);
    return true;
  }, [canvas.nodes, onSelectNode, rfInstance, setNodes]);

  const focusEntity = useCallback((entityId: string, options?: CampaignCanvasFocusOptions) => {
    const node = canvas.nodes?.find((item: CanvasNode) => item.entityId === entityId);
    return node ? focusNode(node.id, options) : false;
  }, [canvas.nodes, focusNode]);

  const focusFact = useCallback((factId: string, options?: CampaignCanvasFocusOptions) => {
    const node = canvas.nodes?.find((item: CanvasNode) => item.factId === factId);
    return node ? focusNode(node.id, options) : false;
  }, [canvas.nodes, focusNode]);

  const getViewportCenter = useCallback(() => {
    if (!rfInstance || !wrapperRef.current) return null;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
    return { x: Math.round(position.x), y: Math.round(position.y) };
  }, [rfInstance]);

  const fitCanvasView = useCallback(() => {
    runCanvasFlowAction(rfInstance?.fitView({ padding: 0.25, duration: 400 }), "Failed to fit canvas view");
  }, [rfInstance]);

  const zoomCanvasIn = useCallback(() => {
    runCanvasFlowAction(rfInstance?.zoomIn({ duration: 200 }), "Failed to zoom canvas in");
  }, [rfInstance]);

  const zoomCanvasOut = useCallback(() => {
    runCanvasFlowAction(rfInstance?.zoomOut({ duration: 200 }), "Failed to zoom canvas out");
  }, [rfInstance]);

  useImperativeHandle(ref, () => ({
    focusNode,
    focusEntity,
    focusFact,
    getViewportCenter,
    fitView: fitCanvasView,
    zoomIn: zoomCanvasIn,
    zoomOut: zoomCanvasOut,
  }), [fitCanvasView, focusEntity, focusFact, focusNode, getViewportCenter, zoomCanvasIn, zoomCanvasOut]);

  // Handle node drag stop: commit absolute positions.
  // Migrates old parentId-based relative positioning to groupId on first drag.
  const onNodeDragStop: OnNodeDrag<CanvasFlowNode> = useCallback((_event, _node, draggedNodes) => {
    const storeNodes: CanvasNode[] = useCampaignStore.getState().canvasesById[canvasId]?.nodes ?? [];
    const updates = draggedNodes.map((n) => {
      const sn = storeNodes.find((s: CanvasNode) => s.id === n.id);
      const update: { nodeId: string; x: number; y: number; groupId?: string; parentId?: null } = { nodeId: n.id, x: Math.round(n.position.x), y: Math.round(n.position.y) };
      // On first drag after old-style group parenting: migrate parentId → groupId
      if (sn?.parentId && !sn?.groupId) {
        update.groupId = sn.parentId;
        update.parentId = null;
      }
      return update;
    });
    runCanvasFlowAction(
      updateCanvasNodesLayout(canvasId, updates),
      "Failed to save dragged canvas node positions",
    );
  }, [canvasId, updateCanvasNodesLayout]);

  const onSelectionDragStop: SelectionDragHandler<CanvasFlowNode> = useCallback((_event, draggedNodes) => {
    const updates = draggedNodes.map((n) => ({
      nodeId: n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    }));
    runCanvasFlowAction(
      updateCanvasNodesLayout(canvasId, updates),
      "Failed to save selected canvas node positions",
    );
  }, [canvasId, updateCanvasNodesLayout]);

  // Viewport change end: save zoom/pan coords
  const onMoveEnd: OnMoveEnd = useCallback(() => {
    if (rfInstance) {
      const zoom = rfInstance.getZoom();
      const { x, y } = rfInstance.getViewport();
      runCanvasFlowAction(
        saveViewport(canvasId, { x: Math.round(x), y: Math.round(y), zoom }),
        "Failed to save canvas viewport",
      );
    }
  }, [canvasId, rfInstance, saveViewport]);

  // Initial viewport restore from canvas model + seed hull overlay state
  useEffect(() => {
    if (rfInstance && canvas.viewport) {
      const vp = { x: canvas.viewport.x, y: canvas.viewport.y, zoom: canvas.viewport.zoom };
      setViewport(vp);
      runCanvasFlowAction(
        rfInstance.setViewport({
          x: canvas.viewport.x,
          y: canvas.viewport.y,
          zoom: canvas.viewport.zoom
        }),
        "Failed to restore canvas viewport",
      );
    }
  }, [canvasId, rfInstance]); // execute once per canvas switch

  // Click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: CanvasFlowNode) => {
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
    const sourceNode = canvas.nodes.find((n: CanvasNode) => n.id === connection.source);
    const targetNode = canvas.nodes.find((n: CanvasNode) => n.id === connection.target);
    
    const sourceEntity = sourceNode?.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === sourceNode.entityId) : null;
    const targetEntity = targetNode?.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === targetNode.entityId) : null;

    setConnectPopover({
      sourceNodeId: connection.source,
      targetNodeId: connection.target,
      sourceEntity,
      targetEntity
    });
  }, [canvas.nodes, campaignState?.entities]);

  const handlePopoverSubmit = (edgeData: RelationshipPopoverSubmitData) => {
    if (!connectPopover) return;

    runCanvasFlowAction(addEdgeToCanvas(canvasId, {
      sourceNodeId: connectPopover.sourceNodeId,
      targetNodeId: connectPopover.targetNodeId,
      ...edgeData
    }).then(() => {
      setConnectPopover(null);
    }), "Failed to add canvas relationship edge");
  };

  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (rfInstance && event.target instanceof HTMLElement && event.target.classList.contains("react-flow__pane")) {
      const position = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      runCanvasFlowAction(placeNodeOnCanvas(canvasId, {
        kind: "note",
        text: "",
        color: "yellow",
        x: Math.round(position.x),
        y: Math.round(position.y)
      }), "Failed to add note from canvas double click");
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
    if (!(e.relatedTarget instanceof globalThis.Node) || !wrapperRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const kind = e.dataTransfer.getData("palette/kind");
    const entityType = e.dataTransfer.getData("palette/entityType");
    const label = e.dataTransfer.getData("palette/label");
    if (!kind || !rfInstance) return;

    const pos = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const x = Math.round(pos.x - 81);  // center node on cursor (card ~162px wide)
    const y = Math.round(pos.y - 95);  // center node on cursor (card ~190px tall)

    runCanvasFlowAction((async () => {
      if (kind === "note") {
        await placeNodeOnCanvas(canvasId, { kind: "note", text: "", color: "yellow", x, y });
      } else if (kind === "group") {
        await placeNodeOnCanvas(canvasId, { kind: "group", title: "Nuevo Grupo", color: "purple", x, y, width: 340, height: 220 });
      } else if (kind === "entity" && entityType) {
        const campaignId = campaignState?.campaign?.campaignId;
        if (!campaignId) return;
        try {
          const created = await createEntity({ entityType, title: `Nuevo ${label}`, status: "ready", importance: "normal", visibility: { kind: "dm_only" } });
          if (created?.entityId) {
            await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: created.entityId, x, y });
          }
        } catch (err) {
          console.error("Drop create entity failed", err);
        }
      } else if (kind === "fact") {
        const factId = e.dataTransfer.getData("palette/factId");
        if (factId) {
          await placeNodeOnCanvas(canvasId, { kind: "fact", factId, x, y });
        }
      } else if (kind === "fact-create") {
        const factKind = e.dataTransfer.getData("palette/factKind") || "rumor";
        const statement = window.prompt(t("canvas.factNode.newFactPrompt", { kind: factKind }));
        if (!statement?.trim()) return;
        try {
          const newFactId = await createFact({ statement: statement.trim(), kind: factKind, confidence: "suspected", relatedEntityIds: [], source: { kind: "manual" } });
          if (newFactId) {
            await placeNodeOnCanvas(canvasId, { kind: "fact", factId: newFactId, x, y });
          }
        } catch (err) {
          console.error("Drop create fact failed", err);
        }
      }
    })(), "Failed to handle canvas palette drop");
  }, [rfInstance, canvasId, campaignState, placeNodeOnCanvas, createEntity, createFact, t]);

  const isMobileExplore = deviceMode === "mobile" && interactionProfile !== "edit";
  const isPanMode = interactionMode === "pan" || isMobileExplore;
  const isMarqueeMode = !isMobileExplore && interactionMode === "multiselect";
  const mobileNodesDraggable = deviceMode !== "mobile" || interactionProfile === "edit";

  const canvasNodes = useCampaignStore(s => s.canvasesById[canvasId]?.nodes);

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: "100%", cursor: isPanMode ? "grab" : "default", position: "relative" }}
      className={isDragOver ? "canvas-drop-zone--active" : undefined}
      onDoubleClick={onPaneDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Group hull overlay — behind RF nodes, synced with viewport */}
      <CanvasGroupHulls canvasId={canvasId} viewport={viewport} canvasNodes={canvasNodes} rfNodes={nodes} />

      <ReactFlow<CanvasFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        proOptions={reactFlowProOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStop={onSelectionDragStop}
        onNodeClick={(event, node) => {
          if (isMobileExplore) {
            onNodeContextRequest?.(node.id);
          }
          onNodeClick(event, node);
        }}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onSelectionChange={onSelectionChange ? ({ nodes, edges }: OnSelectionChangeParams<CanvasFlowNode, Edge>) => onSelectionChange(nodes, edges) : undefined}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        fitViewOptions={{ padding: focusMode && focusNodeId ? 0.35 : 0.2 }}
        className="campaign-react-flow"
        panOnDrag={interactionProfile !== "edit" || isPanMode}
        selectionOnDrag={deviceMode === "mobile" ? false : isMarqueeMode}
        selectionMode={isMarqueeMode ? SelectionMode.Partial : SelectionMode.Full}
        nodesDraggable={!isLocked && !isPanMode && !isMarqueeMode && mobileNodesDraggable}
        elementsSelectable={!isPanMode || isMobileExplore}
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
          sourceEntity={connectPopover.sourceEntity ?? undefined}
          targetEntity={connectPopover.targetEntity ?? undefined}
          onSubmit={handlePopoverSubmit}
          onCancel={() => setConnectPopover(null)}
        />
      )}
    </div>
  );
});

CampaignCanvasFlow.displayName = "CampaignCanvasFlow";
