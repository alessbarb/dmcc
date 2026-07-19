import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Background, Controls, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import { List, Maximize2, Network, X } from "lucide-react";
import type { SessionProjection, SessionProjectionNode, SessionProjectionNodeKind } from "@core/domain/session/projection/sessionProjectionTypes.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { buildNarrativeMapFlow } from "./buildNarrativeMapFlow.js";
import { NarrativeMapNode } from "./NarrativeMapNode.js";
import { NarrativeMapInspector } from "./NarrativeMapInspector.js";
import { getNarrativeNodeVisual } from "./narrativeNodeVisuals.js";
import "./sessionNarrativeMap.css";

const nodeTypes = { narrative: NarrativeMapNode };

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

function NarrativeMapListView({ nodes, onSelect }: { nodes: SessionProjectionNode[]; onSelect: (node: SessionProjectionNode) => void }) {
  const { t } = useTranslation();
  return (
    <ul className="narrative-map-list" aria-label={t("sessionNarrativeMap.title")}>
      {nodes.map((node) => {
        const visual = getNarrativeNodeVisual(node.kind);
        return (
          <li key={node.id}>
            <button
              type="button"
              className="narrative-map-list__item"
              style={{ "--narrative-node-accent": visual.accent } as React.CSSProperties & Record<`--${string}`, string>}
              onClick={() => onSelect(node)}
            >
              <span className="narrative-map-list__kind">{t(`sessionNarrativeMap.nodeKinds.${node.kind}`)}</span>
              <span className="narrative-map-list__label">{node.label}</span>
            </button>
          </li>
        );
      })}
      {nodes.length === 0 && <li className="narrative-map-list__empty">{t("sessionNarrativeMap.empty")}</li>}
    </ul>
  );
}

function CanvasInner({ projection }: { projection: SessionProjection }) {
  const { t } = useTranslation();
  const { fitView } = useReactFlow();
  const [kindFilter, setKindFilter] = useState<Set<SessionProjectionNodeKind> | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
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
    void buildNarrativeMapFlow(filteredProjection, viewportSize.w, viewportSize.h).then((result) => {
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
    <div className="narrative-map-workspace">
      <div className="narrative-map-topbar">
        <div className="narrative-map-heading">
          <h2>{t("sessionNarrativeMap.title")}</h2>
          <span>{filteredProjection.nodes.length} · {filteredProjection.edges.length}</span>
        </div>
        <div className="narrative-map-filters" role="group" aria-label={t("sessionNarrativeMap.filterByKind")}>
          {allKinds.map((kind) => {
            const active = !kindFilter || kindFilter.has(kind);
            return (
              <button
                key={kind}
                type="button"
                className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleKind(kind)}
              >
                {t(`sessionNarrativeMap.nodeKinds.${kind}`)}
              </button>
            );
          })}
        </div>
        <div className="narrative-map-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewMode(viewMode === "graph" ? "list" : "graph")}
            title={viewMode === "graph" ? t("sessionNarrativeMap.viewList") : t("sessionNarrativeMap.viewGraph")}
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
            title={t("sessionNarrativeMap.fullscreen")}
          >
            {isFullscreen ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="narrative-map-stage">
        <div ref={containerRef} className="narrative-map-canvas">
          {viewMode === "list" ? (
            <NarrativeMapListView nodes={filteredProjection.nodes} onSelect={(node) => setSelectedNodeId(node.id)} />
          ) : filteredProjection.nodes.length === 0 ? (
            <div className="narrative-map-empty">{t("sessionNarrativeMap.empty")}</div>
          ) : (
            <ReactFlow
              nodes={flow.nodes}
              edges={flow.edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
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

        {selectedNode && <NarrativeMapInspector node={selectedNode} onClose={() => setSelectedNodeId(null)} />}
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && content}
      {isFullscreen &&
        createPortal(
          <div className="narrative-map-fullscreen" role="dialog" aria-modal="true" aria-label={t("sessionNarrativeMap.title")}>
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

export function SessionNarrativeMapCanvas({ projection }: { projection: SessionProjection }) {
  return (
    <ReactFlowProvider>
      <CanvasInner projection={projection} />
    </ReactFlowProvider>
  );
}
