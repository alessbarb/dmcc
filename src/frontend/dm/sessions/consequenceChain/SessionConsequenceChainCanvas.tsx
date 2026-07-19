import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import { AlertTriangle, List, Maximize2, Network, X } from "lucide-react";
import type { SessionProjection, SessionProjectionEdge, SessionProjectionNode, SessionProjectionNodeKind } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { buildConsequenceChainFlow } from "./buildConsequenceChainFlow.js";
import { ConsequenceChainNode } from "./ConsequenceChainNode.js";
import { ConsequenceChainInspector } from "./ConsequenceChainInspector.js";
import { ConsequenceChainEdgeInspector } from "./ConsequenceChainEdgeInspector.js";
import { getNarrativeNodeVisual } from "../narrativeMap/narrativeNodeVisuals.js";
import "./sessionConsequenceChain.css";

const nodeTypes = { consequence: ConsequenceChainNode };

type ViewMode = "graph" | "list";

function useEscapeToClose(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [active, onClose]);
}

function kindsPresent(projection: SessionProjection): SessionProjectionNodeKind[] {
  const seen = new Set<SessionProjectionNodeKind>();
  const ordered: SessionProjectionNodeKind[] = [];
  for (const node of projection.nodes) {
    if (!seen.has(node.kind)) {
      seen.add(node.kind);
      ordered.push(node.kind);
    }
  }
  return ordered;
}

function ConsequenceChainListView({ nodes, onSelect }: { nodes: SessionProjectionNode[]; onSelect: (node: SessionProjectionNode) => void }) {
  const { t } = useTranslation();
  return (
    <ul className="consequence-chain-list" aria-label={t("sessionConsequenceChain.title")}>
      {nodes.map((node) => {
        const visual = getNarrativeNodeVisual(node.kind);
        return (
          <li key={node.id}>
            <button
              type="button"
              className="consequence-chain-list__item"
              style={{ "--consequence-node-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}
              onClick={() => onSelect(node)}
            >
              <span className="consequence-chain-list__kind">{t(`sessionConsequenceChain.nodeKinds.${node.kind}`)}</span>
              <span className="consequence-chain-list__label">{node.label}</span>
            </button>
          </li>
        );
      })}
      {nodes.length === 0 && <li className="consequence-chain-list__empty">{t("sessionConsequenceChain.empty")}</li>}
    </ul>
  );
}

function DiagnosticsBanner({ projection }: { projection: SessionProjection }) {
  const { t } = useTranslation();
  if (projection.diagnostics.length === 0) return null;
  return (
    <ul className="consequence-chain-diagnostics" role="list">
      {projection.diagnostics.map((diagnostic, index) => (
        <li key={index} className={`consequence-chain-diagnostics__item consequence-chain-diagnostics__item--${diagnostic.severity}`}>
          <AlertTriangle size={14} />
          <span>{t(diagnostic.messageKey)}</span>
        </li>
      ))}
    </ul>
  );
}

export type ConsequenceChainReviewHandler = (
  target: { kind: "node"; node: SessionProjectionNode } | { kind: "edge"; edge: SessionProjectionEdge },
  decision: "accepted" | "hidden",
) => void;
export type ConsequenceChainPromoteHandler = (edge: SessionProjectionEdge) => void;

function CanvasInner({
  projection,
  onReview,
  onPromote,
}: {
  projection: SessionProjection;
  onReview: ConsequenceChainReviewHandler;
  onPromote: ConsequenceChainPromoteHandler;
}) {
  const { t } = useTranslation();
  const { fitView } = useReactFlow();
  const [kindFilter, setKindFilter] = useState<Set<SessionProjectionNodeKind> | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("graph");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flow, setFlow] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 900, h: 600 });

  useEscapeToClose(isFullscreen, () => setIsFullscreen(false));

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const next = { w: Math.max(320, Math.round(rect.width)), h: Math.max(360, Math.round(rect.height)) };
      setViewportSize((current) => (current.w === next.w && current.h === next.h ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  const allKinds = useMemo(() => kindsPresent(projection), [projection]);

  const filteredProjection = useMemo((): SessionProjection => {
    if (!kindFilter) return projection;
    const keptNodeIds = new Set(projection.nodes.filter((node) => kindFilter.has(node.kind)).map((node) => node.id));
    return {
      ...projection,
      nodes: projection.nodes.filter((node) => keptNodeIds.has(node.id)),
      edges: projection.edges.filter((edge) => keptNodeIds.has(edge.sourceId) && keptNodeIds.has(edge.targetId)),
    };
  }, [projection, kindFilter]);

  useEffect(() => {
    let cancelled = false;
    void buildConsequenceChainFlow(filteredProjection, viewportSize.w, viewportSize.h).then((result) => {
      if (!cancelled) setFlow(result);
    });
    return () => {
      cancelled = true;
    };
  }, [filteredProjection, viewportSize.h, viewportSize.w]);

  useEffect(() => {
    if (flow.nodes.length === 0) return;
    const timer = window.setTimeout(() => void fitView({ duration: 400, padding: 0.3, maxZoom: 1.1 }), 60);
    return () => window.clearTimeout(timer);
  }, [fitView, flow.nodes.length]);

  const selectedNode = selectedNodeId ? projection.nodes.find((node) => node.id === selectedNodeId) ?? null : null;
  const selectedEdge = selectedEdgeId ? projection.edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;

  function selectNode(node: SessionProjectionNode) {
    setSelectedEdgeId(null);
    setSelectedNodeId(node.id);
  }
  function selectEdge(edge: SessionProjectionEdge) {
    setSelectedNodeId(null);
    setSelectedEdgeId(edge.id);
  }
  function clearSelection() {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }

  const toggleKind = (kind: SessionProjectionNodeKind) => {
    setKindFilter((current) => {
      const base = current ?? new Set(allKinds);
      const next = new Set(base);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const content = (
    <div className="consequence-chain-workspace">
      <div className="consequence-chain-header">
      <div className="consequence-chain-topbar">
        <div className="consequence-chain-heading">
          <h2>{t("sessionConsequenceChain.title")}</h2>
          <span>{filteredProjection.nodes.length} · {filteredProjection.edges.length}</span>
        </div>
        <div className="consequence-chain-filters" role="group" aria-label={t("sessionConsequenceChain.filterByKind")}>
          {allKinds.map((kind) => {
            const active = !kindFilter || kindFilter.has(kind);
            return (
              <button
                key={kind}
                type="button"
                className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleKind(kind)}
              >
                {t(`sessionConsequenceChain.nodeKinds.${kind}`)}
              </button>
            );
          })}
        </div>
        <div className="consequence-chain-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewMode(viewMode === "graph" ? "list" : "graph")}
            title={viewMode === "graph" ? t("sessionConsequenceChain.viewList") : t("sessionConsequenceChain.viewGraph")}
          >
            {viewMode === "graph" ? <List size={14} /> : <Network size={14} />}
          </button>
          {viewMode === "graph" && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void fitView({ duration: 400, padding: 0.3 })}>
              <Maximize2 size={14} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFullscreen((current) => !current)}
            title={t("sessionConsequenceChain.fullscreen")}
          >
            {isFullscreen ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <DiagnosticsBanner projection={filteredProjection} />
      </div>

      <div className="consequence-chain-stage">
        <div ref={containerRef} className="consequence-chain-canvas">
          {viewMode === "list" ? (
            <ConsequenceChainListView nodes={filteredProjection.nodes} onSelect={selectNode} />
          ) : filteredProjection.nodes.length === 0 ? (
            <div className="consequence-chain-empty">{t("sessionConsequenceChain.empty")}</div>
          ) : (
            <ReactFlow
              nodes={flow.nodes}
              edges={flow.edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_event, node) => {
                const match = projection.nodes.find((n) => n.id === node.id);
                if (match) selectNode(match);
              }}
              onEdgeClick={(_event, edge) => {
                const match = projection.edges.find((e) => e.id === edge.id);
                if (match) selectEdge(match);
              }}
              onPaneClick={clearSelection}
              proOptions={{ hideAttribution: true }}
              minZoom={0.1}
              maxZoom={1.6}
              nodesDraggable={false}
              fitView
            >
              <Background gap={24} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        {selectedNode && (
          <ConsequenceChainInspector
            node={selectedNode}
            onClose={clearSelection}
            onReview={(decision) => onReview({ kind: "node", node: selectedNode }, decision)}
          />
        )}
        {selectedEdge && (
          <ConsequenceChainEdgeInspector
            edge={selectedEdge}
            onClose={clearSelection}
            onReview={(decision) => onReview({ kind: "edge", edge: selectedEdge }, decision)}
            onPromote={() => onPromote(selectedEdge)}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && content}
      {isFullscreen &&
        createPortal(
          <div className="consequence-chain-fullscreen" role="dialog" aria-modal="true" aria-label={t("sessionConsequenceChain.title")}>
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

export function SessionConsequenceChainCanvas({
  projection,
  onReview,
  onPromote,
}: {
  projection: SessionProjection;
  onReview: ConsequenceChainReviewHandler;
  onPromote: ConsequenceChainPromoteHandler;
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner projection={projection} onReview={onReview} onPromote={onPromote} />
    </ReactFlowProvider>
  );
}
