import React, { useState } from "react";
import type { Node, Edge } from "reactflow";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Eye, EyeOff, AlertTriangle } from "lucide-react";
import type { Entity } from "../stores/campaignStore.js";
import { useCampaignStore } from "../stores/campaignStore.js";

export interface GraphPageProps {
  graph?: any;
  campaignState?: any;
  selectedEntity?: any;
  setSelectedEntity?: (e: any) => void;
  graphTypeFilter?: string[];
  setGraphTypeFilter?: (filter: string[] | ((prev: string[]) => string[])) => void;
  setIsRelationModalOpen?: (open: boolean) => void;
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  player_character: "#6366f1",
  npc:             "#3b82f6",
  location:        "#10b981",
  faction:         "#f59e0b",
  quest:           "#f97316",
  clue:            "#eab308",
  secret:          "#ef4444",
  item:            "#8b5cf6",
  creature:        "#dc2626",
  encounter:       "#0891b2",
  scene:           "#64748b",
  front:           "#7c3aed",
  clock:           "#0ea5e9",
  decision:        "#d97706",
  consequence:     "#b45309",
  rumor:           "#6b7280",
  rule_reference:  "#374151",
  handout:         "#1d4ed8",
  note:            "#475569",
};

// Keep TYPE_COLORS as alias for backward-compat (MiniMap, side panel badge)
const TYPE_COLORS = ENTITY_TYPE_COLORS;

const RELATION_LABELS_ES: Record<string, string> = {
  hides:          "oculta",
  unlocks:        "desbloquea",
  points_to:      "apunta a",
  causes:         "causa",
  contradicts:    "contradice",
  confirms:       "confirma",
  belongs_to:     "pertenece a",
  leads_to:       "lleva a",
  opposes:        "se opone a",
  allies_with:    "aliado de",
  knows:          "conoce",
  fears:          "teme",
  employs:        "emplea",
  seeks:          "busca",
  guards:         "custodia",
  located_in:     "ubicado en",
  member_of:      "miembro de",
  owns:           "posee",
  controls:       "controla",
  threatens:      "amenaza",
  trusts:         "confía en",
  hates:          "odia",
  loves:          "ama",
  allied_with:    "aliado de",
  reveals:        "revela",
  blocks:         "bloquea",
  parent_of:      "progenitor de",
  child_of:       "descendiente de",
  custom:         "relación personalizada",
};

type FilterPreset = "todos" | "misiones" | "personajes" | "secretos" | "lugares" | "facciones" | "consecuencias";
type ViewMode = "all" | "dm_only" | "players";

const PRESET_TYPES: Record<FilterPreset, string[] | null> = {
  todos: null,
  misiones: ["quest", "clue", "consequence"],
  personajes: ["npc", "player_character"],
  secretos: ["secret"],
  lugares: ["location"],
  facciones: ["faction"],
  consecuencias: ["consequence", "front", "clock"],
};

const PRESET_LABELS: Record<FilterPreset, string> = {
  todos: "Todos",
  misiones: "Misiones",
  personajes: "Personajes",
  secretos: "Secretos",
  lugares: "Lugares",
  facciones: "Facciones",
  consecuencias: "Consecuencias",
};

function statusBorder(e: Entity): string {
  if ((e as any).archived) return "#475569";
  if ((e as any).status === "completed" || (e as any).status === "resolved") return "#22c55e";
  if ((e as any).status === "active" || (e as any).status === "revealed") return TYPE_COLORS[e.entityType] ?? "#6366f1";
  return TYPE_COLORS[e.entityType] ?? "#6366f1";
}

export function GraphPage(props: GraphPageProps = {}) {
  const store = useCampaignStore();
  const graph = props.graph ?? store.graph;
  const campaignState = props.campaignState ?? store.campaignState;
  const [isRelationModalOpenLocal, setIsRelationModalOpenLocal] = useState(false);
  const setIsRelationModalOpen = props.setIsRelationModalOpen ?? setIsRelationModalOpenLocal;
  const setSelectedEntity = props.setSelectedEntity ?? ((_e: any) => {});

  const [preset, setPreset] = useState<FilterPreset>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [panelEntity, setPanelEntity] = useState<any>(null);

  const allowedTypes = PRESET_TYPES[preset];

  const entitiesArr: Entity[] = Array.from(
    (campaignState?.entities instanceof Map
      ? campaignState.entities.values()
      : Object.values(campaignState?.entities ?? {})) as Iterable<Entity>
  );

  const visibleEntities = entitiesArr.filter((e: Entity) => {
    if ((e as any).archived) return false;
    if (allowedTypes && !allowedTypes.includes(e.entityType)) return false;
    if (viewMode === "dm_only" && (e as any).visibility?.kind !== "dm_only") return false;
    if (viewMode === "players" && (e as any).visibility?.kind === "dm_only") return false;
    return true;
  });

  const visibleIds = new Set(visibleEntities.map((e: Entity) => e.entityId));

  const rfNodes: Node[] = visibleEntities.map((e: Entity, idx: number) => {
    const border = statusBorder(e);
    const isDmOnly = (e as any).visibility?.kind === "dm_only";
    return {
      id: e.entityId,
      position: { x: 200 + (idx % 5) * 220, y: 100 + Math.floor(idx / 5) * 160 },
      data: {
        label: (
          <div
            style={{ fontSize: "11px", fontWeight: 700, maxWidth: "120px", cursor: "pointer", position: "relative" }}
            title={e.title}
            onClick={() => { setSelectedEntity(e); setPanelEntity(e); }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
              <span style={{ fontSize: "9px", textTransform: "uppercase", opacity: 0.7 }}>{e.entityType}</span>
              {isDmOnly ? <EyeOff size={9} style={{ opacity: 0.5 }} /> : <Eye size={9} style={{ opacity: 0.5 }} />}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
          </div>
        ),
      },
      style: {
        background: ENTITY_TYPE_COLORS[e.entityType] ?? "#6b7280",
        border: `2px solid ${border}`,
        borderRadius: "8px",
        color: "#fff",
        boxShadow: `0 0 8px ${border}40`,
        minWidth: "120px",
      },
    };
  });

  const rfEdges: Edge[] = (graph?.edges ?? [])
    .filter((edge: any) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
    .map((edge: any) => ({
      id: edge.id ?? `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: RELATION_LABELS_ES[edge.relationType] ?? edge.relationType ?? edge.label ?? edge.type ?? "",
      style: { stroke: "#64748b", strokeWidth: 1.5 },
      labelStyle: { fill: "#94a3b8", fontSize: 10 },
      labelBgStyle: { fill: "#1e293b", fillOpacity: 0.8 },
      animated: false,
    }));

  const relationsArr = Array.from(
    (campaignState?.relations instanceof Map
      ? campaignState.relations.values()
      : Object.values(campaignState?.relations ?? {})) as Iterable<any>
  );

  const panelRelations = panelEntity
    ? relationsArr.filter((r: any) =>
        !r.archived && (r.sourceEntityId === panelEntity.entityId || r.targetEntityId === panelEntity.entityId)
      )
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontWeight: "700" }}>Grafo narrativo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            {visibleEntities.length} nodos · {rfEdges.length} relaciones visibles
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsRelationModalOpen(true)}>
          <Plus size={16} /> Nueva relación
        </button>
      </div>

      {/* Preset filters */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>Filtro:</span>
        {(Object.keys(PRESET_TYPES) as FilterPreset[]).map((p) => (
          <button
            key={p}
            className={`btn btn-sm ${preset === p ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setPreset(p)}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "12px", marginRight: "4px" }}>Vista:</span>
        {(["all", "dm_only", "players"] as ViewMode[]).map((m) => (
          <button
            key={m}
            className={`btn btn-sm ${viewMode === m ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setViewMode(m)}
          >
            {m === "all" ? "Todo" : m === "dm_only" ? "Solo DM" : "Solo jugadores"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        {/* Graph */}
        <div style={{ position: "relative", flex: 1, height: "600px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
          {visibleEntities.length === 0 ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--text-muted)" }}>
              <AlertTriangle size={32} />
              <p>Sin entidades para este filtro</p>
            </div>
          ) : (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
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
                    return e ? (TYPE_COLORS[e.entityType] ?? "#6366f1") : "#6366f1";
                  }}
                  style={{ background: "#0b0d19", border: "1px solid var(--border-color)" }}
                />
              </ReactFlow>

              {/* Floating Legend */}
              <div style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 4,
                backgroundColor: "rgba(11, 13, 25, 0.9)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                width: "280px",
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                pointerEvents: "none"
              }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Leyenda del Grafo
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                  {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => {
                    const labelMap: Record<string, string> = {
                      player_character: "PJ",
                      npc: "PNJ",
                      location: "Ubicación",
                      quest: "Misión",
                      clue: "Pista",
                      secret: "Secreto",
                      faction: "Facción",
                      consequence: "Consecuencia",
                      clock: "Reloj",
                      item: "Objeto",
                      creature: "Criatura",
                      encounter: "Encuentro",
                      scene: "Escena",
                      front: "Frente",
                      decision: "Decisión",
                      rumor: "Rumor",
                      rule_reference: "Regla",
                      handout: "Documento",
                      note: "Nota",
                    };
                    return (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                        <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{labelMap[type] || type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {panelEntity && (
          <div className="card" style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px", height: "600px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  className="badge badge-primary"
                  style={{ backgroundColor: TYPE_COLORS[panelEntity.entityType] ?? undefined, marginBottom: "6px" }}
                >
                  {panelEntity.entityType}
                </span>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{panelEntity.title}</h3>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => setPanelEntity(null)}>✕</button>
            </div>
             {panelEntity.visibility && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {panelEntity.visibility.kind === "dm_only" ? <EyeOff size={14} /> : <Eye size={14} />}
                {panelEntity.visibility.kind === "group" ? "Grupo" : panelEntity.visibility.kind === "dm_only" ? "Solo DM" : panelEntity.visibility.kind}
              </div>
            )}
            {panelEntity.summary && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>{panelEntity.summary}</p>
            )}
            {panelEntity.status && (
              <div>
                <span className="badge badge-default">{panelEntity.status}</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>
                RELACIONES ({panelRelations.length})
              </p>
              {panelRelations.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sin relaciones</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {panelRelations.slice(0, 10).map((r: any) => {
                    const isSource = r.sourceEntityId === panelEntity.entityId;
                    const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
                    const other = entitiesArr.find((e: Entity) => e.entityId === otherId);
                    return (
                      <div
                        key={r.relationId}
                        style={{ fontSize: "0.78rem", padding: "4px 8px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                        onClick={() => { const e = entitiesArr.find((en: Entity) => en.entityId === otherId); if (e) { setPanelEntity(e); setSelectedEntity(e); } }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>{isSource ? "→" : "←"} {r.relationType}</span>
                        <span style={{ marginLeft: "6px", fontWeight: 600 }}>{other?.title ?? otherId}</span>
                      </div>
                    );
                  })}
                  {panelRelations.length > 10 && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>+{panelRelations.length - 10} más</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
