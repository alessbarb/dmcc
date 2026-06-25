import React from "react";
import type { Node, Edge } from "reactflow";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { Plus } from "lucide-react";
import type { Entity } from "../stores/campaignStore.js";

export interface GraphPageProps {
  graph: any;
  campaignState: any;
  selectedEntity: any;
  setSelectedEntity: (e: any) => void;
  graphTypeFilter: string[];
  setGraphTypeFilter: (filter: string[] | ((prev: string[]) => string[])) => void;
  setIsRelationModalOpen: (open: boolean) => void;
}

export function GraphPage(props: GraphPageProps) {
  const {
    graph,
    campaignState,
    setSelectedEntity,
    graphTypeFilter,
    setGraphTypeFilter,
    setIsRelationModalOpen,
  } = props;

  const typeColorMap: Record<string, string> = {
    npc: "#2dd4bf", location: "#38bdf8", quest: "#fbbf24",
    clue: "#a78bfa", secret: "#f87171", clock: "#fb923c",
    consequence: "#f472b6", faction: "#4ade80",
    player_character: "#86efac", item: "#c084fc",
    creature: "#ef4444", encounter: "#f97316",
    scene: "#60a5fa", front: "#818cf8",
    decision: "#34d399", rumor: "#94a3b8",
    handout: "#e2e8f0", note: "#64748b",
  };

  const visibleTypes = graphTypeFilter.length === 0
    ? null
    : graphTypeFilter;

  const visibleEntities = (campaignState?.entities ?? []).filter(
    (e: Entity) => !e.archived && (visibleTypes === null || visibleTypes.includes(e.entityType))
  );
  const visibleIds = new Set(visibleEntities.map((e: Entity) => e.entityId));

  const rfNodes: Node[] = visibleEntities.map((e: Entity, idx: number) => ({
    id: e.entityId,
    position: {
      x: 200 + (idx % 5) * 220,
      y: 100 + Math.floor(idx / 5) * 160,
    },
    data: {
      label: (
        <div style={{ fontSize: "11px", fontWeight: 700, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
          title={e.title}
          onClick={() => setSelectedEntity(e)}
        >
          <div style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.7, marginBottom: "2px" }}>{e.entityType}</div>
          {e.title}
        </div>
      )
    },
    style: {
      background: "#0f1120",
      border: `2px solid ${typeColorMap[e.entityType] ?? "#6366f1"}`,
      borderRadius: "8px",
      color: "#e2e8f0",
      boxShadow: `0 0 8px ${typeColorMap[e.entityType] ?? "#6366f1"}40`,
      minWidth: "120px",
    },
  }));

  const rfEdges: Edge[] = (graph.edges ?? [])
    .filter((edge: any) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
    .map((edge: any) => ({
      id: edge.id ?? `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || edge.relationType || edge.type || "",
      style: { stroke: "#6366f1", strokeWidth: 1.5 },
      labelStyle: { fill: "#94a3b8", fontSize: 10 },
      labelBgStyle: { fill: "#0b0d19" },
      animated: false,
    }));

  const allEntityTypes = [...new Set((campaignState?.entities ?? []).filter((e: Entity) => !e.archived).map((e: Entity) => e.entityType))].sort() as string[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontWeight: "700" }}>Grafo narrativo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>Interactive React Flow graph. Drag nodes, zoom with scroll, click to open entity detail.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsRelationModalOpen(true)}>
            <Plus size={16} /> Add Relation
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <button
          className={`btn btn-sm ${graphTypeFilter.length === 0 ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setGraphTypeFilter([])}
        >All</button>
        {allEntityTypes.map((t: string) => (
          <button
            key={t}
            className={`btn btn-sm ${graphTypeFilter.includes(t) ? "btn-primary" : "btn-secondary"}`}
            style={{ borderColor: typeColorMap[t] ?? undefined }}
            onClick={() => setGraphTypeFilter((prev: string[]) =>
              prev.includes(t) ? prev.filter((x: string) => x !== t) : [...prev, t]
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", height: "600px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          style={{ background: "#06070e" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e2235" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const e = visibleEntities.find((ve: Entity) => ve.entityId === n.id);
              return e ? (typeColorMap[e.entityType] ?? "#6366f1") : "#6366f1";
            }}
            style={{ background: "#0b0d19", border: "1px solid var(--border-color)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
