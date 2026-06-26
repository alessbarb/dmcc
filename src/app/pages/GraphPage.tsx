import React, { useState, useRef, useCallback, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { Plus, Eye, EyeOff, AlertTriangle, X } from "lucide-react";
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

const TYPE_LABEL_ES: Record<string, string> = {
  player_character: "PJ", npc: "PNJ", location: "Ubicación", quest: "Misión",
  clue: "Pista", secret: "Secreto", faction: "Facción", consequence: "Consecuencia",
  clock: "Reloj", item: "Objeto", creature: "Criatura", encounter: "Encuentro",
  scene: "Escena", front: "Frente", decision: "Decisión", rumor: "Rumor",
  rule_reference: "Regla", handout: "Documento", note: "Nota",
};

const RELATION_LABELS_ES: Record<string, string> = {
  hides: "oculta", unlocks: "desbloquea", points_to: "apunta a", causes: "causa",
  contradicts: "contradice", confirms: "confirma", knows: "conoce", fears: "teme",
  located_in: "ubicado en", member_of: "miembro de", leader_of: "lidera",
  threatens: "amenaza", trusts: "confía en", hates: "odia", loves: "ama",
  ally_of: "aliado de", enemy_of: "enemigo de", reveals: "revela", blocks: "bloquea",
  foreshadows: "presagia", depends_on: "depende de", affected_by: "afectado por",
  created_by: "creado por", protects: "protege", suspects: "sospecha de",
  knows_partially: "conoce parcialmente", lies_about: "miente sobre",
  appears_in: "aparece en", contains: "contiene", lives_in: "vive en",
  works_for: "trabaja para", owes_debt_to: "le debe a", transforms_into: "se transforma en",
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
  todos: "Todos", misiones: "Misiones", personajes: "Personajes",
  secretos: "Secretos", lugares: "Lugares", facciones: "Facciones",
  consecuencias: "Consecuencias",
};

function hexToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function nodeRadius(val: number): number {
  return val === 3 ? 6 : val === 2 ? 4.5 : 3;
}

export function GraphPage(props: GraphPageProps = {}) {
  const store = useCampaignStore();
  const campaignState = props.campaignState ?? store.campaignState;
  const [, setIsRelationModalOpenLocal] = useState(false);
  const setIsRelationModalOpen = props.setIsRelationModalOpen ?? setIsRelationModalOpenLocal;
  const setSelectedEntity = props.setSelectedEntity ?? ((_e: any) => {});

  const [preset, setPreset] = useState<FilterPreset>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [panelEntity, setPanelEntity] = useState<any>(null);
  const [containerSize, setContainerSize] = useState({ w: 900, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  // Refs for direct THREE mutation (avoids re-render on hover)
  const hoveredNodeRef = useRef<any>(null);
  const panelEntityRef = useRef<any>(null);

  useEffect(() => { panelEntityRef.current = panelEntity; }, [panelEntity]);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: width || 900, h: height || 600 });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Tune d3 forces after mount to keep nodes close
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge");
    if (charge) charge.strength(-60);
    const link = fg.d3Force("link");
    if (link) link.distance(40);
  });

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

  const relationsArr: any[] = Array.from(
    (campaignState?.relations instanceof Map
      ? campaignState.relations.values()
      : Object.values(campaignState?.relations ?? {})) as Iterable<any>
  );

  const graphData = {
    nodes: visibleEntities.map((e: Entity) => ({
      id: e.entityId,
      title: e.title,
      entityType: e.entityType,
      entityData: e,
      val: e.entityType === "faction" ? 3 : e.entityType === "location" ? 2 : 1,
    })),
    links: relationsArr
      .filter((r: any) => !r.archived && visibleIds.has(r.sourceEntityId) && visibleIds.has(r.targetEntityId))
      .map((r: any) => ({
        source: r.sourceEntityId,
        target: r.targetEntityId,
        relationType: r.relationType,
        label: RELATION_LABELS_ES[r.relationType] ?? (r.relationType?.replace("custom:", "") ?? ""),
      })),
  };

  const panelRelations = panelEntity
    ? relationsArr.filter((r: any) =>
        !r.archived && (r.sourceEntityId === panelEntity.entityId || r.targetEntityId === panelEntity.entityId)
      )
    : [];

  // STABLE nodeThreeObject — no React state deps, mutates objects directly on hover
  const nodeThreeObject = useCallback((node: any) => {
    const color = ENTITY_TYPE_COLORS[node.entityType] ?? "#6366f1";
    const colorInt = hexToInt(color);
    const r = nodeRadius(node.val ?? 1);
    const group = new THREE.Group();

    const coreMat = new THREE.MeshLambertMaterial({ color: colorInt, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), coreMat);
    group.add(core);

    const glowMat = new THREE.MeshLambertMaterial({ color: colorInt, transparent: true, opacity: 0.1, side: THREE.BackSide });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 10, 10), glowMat);
    group.add(glow);

    const sprite = new SpriteText(node.title) as SpriteText & { position: { y: number } };
    sprite.color = "rgba(203,213,225,0.75)";
    sprite.textHeight = 2.8;
    sprite.fontWeight = "600";
    sprite.backgroundColor = "transparent";
    sprite.padding = 0;
    sprite.position.y = r + 5;
    group.add(sprite);

    // Store THREE refs on the node for direct mutation on hover
    node._coreMat = coreMat;
    node._glowMat = glowMat;
    node._sprite = sprite;

    return group;
  }, []); // STABLE — no deps

  const applyHighlight = useCallback((node: any, active: boolean) => {
    if (!node) return;
    if (node._coreMat) node._coreMat.opacity = active ? 1 : 0.9;
    if (node._glowMat) node._glowMat.opacity = active ? 0.35 : 0.1;
    if (node._sprite) {
      node._sprite.color = active ? "#ffffff" : "rgba(203,213,225,0.75)";
      node._sprite.textHeight = active ? 3.8 : 2.8;
    }
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    applyHighlight(hoveredNodeRef.current, false);
    hoveredNodeRef.current = node;
    applyHighlight(node, true);
    // restore cursor
    document.body.style.cursor = node ? "pointer" : "default";
  }, [applyHighlight]);

  const handleNodeClick = useCallback((node: any) => {
    const entity = node.entityData;
    setPanelEntity(entity);
    setSelectedEntity(entity);
    if (fgRef.current) {
      const d = 80;
      const { x = 0, y = 0, z = 0 } = node;
      fgRef.current.cameraPosition({ x: x + d, y: y + d * 0.4, z: z + d }, { x, y, z }, 800);
    }
  }, [setSelectedEntity]);

  const graphWidth = containerSize.w;
  const graphHeight = containerSize.h;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontWeight: "700" }}>Grafo narrativo</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            {visibleEntities.length} nodos · {graphData.links.length} relaciones visibles
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsRelationModalOpen(true)}>
          <Plus size={16} /> Nueva relación
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "4px" }}>Filtro:</span>
        {(Object.keys(PRESET_TYPES) as FilterPreset[]).map((p) => (
          <button key={p} className={`btn btn-sm ${preset === p ? "btn-primary" : "btn-secondary"}`} onClick={() => setPreset(p)}>
            {PRESET_LABELS[p]}
          </button>
        ))}
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "12px", marginRight: "4px" }}>Vista:</span>
        {(["all", "dm_only", "players"] as ViewMode[]).map((m) => (
          <button key={m} className={`btn btn-sm ${viewMode === m ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode(m)}>
            {m === "all" ? "Todo" : m === "dm_only" ? "Solo DM" : "Solo jugadores"}
          </button>
        ))}
      </div>

      {/* Graph + panel */}
      <div style={{ display: "flex", gap: "0", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)", height: "calc(100vh - 260px)", minHeight: "500px" }}>

        {/* 3D canvas */}
        <div ref={containerRef} style={{ position: "relative", flex: 1, background: "#000008" }}>
          {visibleEntities.length === 0 ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--text-muted)" }}>
              <AlertTriangle size={32} />
              <p>Sin entidades para este filtro</p>
            </div>
          ) : (
            <ForceGraph3D
              ref={fgRef}
              graphData={graphData}
              width={graphWidth}
              height={graphHeight}
              backgroundColor="#000008"
              nodeThreeObject={nodeThreeObject}
              nodeThreeObjectExtend={false}
              // Links visible
              linkColor={() => "rgba(148,163,184,0.55)"}
              linkWidth={1.5}
              linkOpacity={1}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={() => "rgba(148,163,184,0.7)"}
              linkCurvature={0.1}
              // Interaction — no state changes in hover, only ref mutation
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onBackgroundClick={() => setPanelEntity(null)}
              // Physics
              cooldownTicks={150}
              d3AlphaDecay={0.025}
              d3VelocityDecay={0.4}
              showNavInfo={false}
            />
          )}

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: "16px", left: "16px",
            background: "rgba(0,0,12,0.85)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px", padding: "10px 14px", backdropFilter: "blur(8px)",
            pointerEvents: "none", maxWidth: "220px",
          }}>
            <p style={{ fontSize: "0.63rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.5)", marginBottom: "8px" }}>
              Leyenda
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px" }}>
              {Object.entries(ENTITY_TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.67rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                  <span style={{ color: "rgba(203,213,225,0.75)" }}>{TYPE_LABEL_ES[type] ?? type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div style={{ position: "absolute", bottom: "16px", right: "16px", fontSize: "0.63rem", color: "rgba(100,116,139,0.45)", textAlign: "right", pointerEvents: "none", lineHeight: 1.7 }}>
            Rotar · clic + arrastrar<br />
            Zoom · scroll<br />
            Mover · clic derecho<br />
            Seleccionar · clic en nodo
          </div>
        </div>

        {/* Side panel */}
        {panelEntity && (
          <div style={{
            width: "270px", flexShrink: 0,
            background: "rgba(2,2,18,0.97)", borderLeft: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column", overflowY: "auto",
          }}>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: ENTITY_TYPE_COLORS[panelEntity.entityType] ?? "#6366f1" }}>
                  {TYPE_LABEL_ES[panelEntity.entityType] ?? panelEntity.entityType}
                </span>
                <button onClick={() => setPanelEntity(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.5)", padding: 0 }}>
                  <X size={13} />
                </button>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, color: "#e2e8f0", lineHeight: 1.3 }}>{panelEntity.title}</h3>
              {panelEntity.visibility && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "rgba(100,116,139,0.55)", marginTop: "5px" }}>
                  {panelEntity.visibility.kind === "dm_only" ? <EyeOff size={10} /> : <Eye size={10} />}
                  {panelEntity.visibility.kind === "dm_only" ? "Solo DM" : "Visible"}
                </div>
              )}
            </div>

            {panelEntity.summary && (
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "0.76rem", color: "rgba(148,163,184,0.8)", margin: 0, lineHeight: 1.55 }}>{panelEntity.summary}</p>
              </div>
            )}

            {panelEntity.status && (
              <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "rgba(203,213,225,0.6)" }}>
                  {panelEntity.status}
                </span>
              </div>
            )}

            {/* Relations */}
            <div style={{ padding: "12px 16px", flex: 1 }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,116,139,0.5)", marginBottom: "10px" }}>
                Relaciones ({panelRelations.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {panelRelations.slice(0, 15).map((r: any) => {
                  const isSource = r.sourceEntityId === panelEntity.entityId;
                  const otherId = isSource ? r.targetEntityId : r.sourceEntityId;
                  const other = entitiesArr.find((e: Entity) => e.entityId === otherId);
                  const otherColor = other ? (ENTITY_TYPE_COLORS[other.entityType] ?? "#6366f1") : "#6366f1";
                  const label = RELATION_LABELS_ES[r.relationType] ?? r.relationType?.replace("custom:", "") ?? r.relationType;
                  return (
                    <div
                      key={r.relationId}
                      style={{ fontSize: "0.73rem", padding: "6px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "5px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.04)" }}
                      onClick={() => { const e = entitiesArr.find((en: Entity) => en.entityId === otherId); if (e) { setPanelEntity(e); setSelectedEntity(e); } }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    >
                      <div style={{ color: "rgba(100,116,139,0.55)", fontSize: "0.63rem", marginBottom: "2px" }}>
                        {isSource ? "→" : "←"} {label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: otherColor, boxShadow: `0 0 4px ${otherColor}`, flexShrink: 0 }} />
                        <span style={{ color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {other?.title ?? otherId}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {panelRelations.length > 15 && (
                  <p style={{ fontSize: "0.7rem", color: "rgba(100,116,139,0.45)", textAlign: "center", marginTop: "4px" }}>+{panelRelations.length - 15} más</p>
                )}
                {panelRelations.length === 0 && (
                  <p style={{ fontSize: "0.76rem", color: "rgba(100,116,139,0.45)" }}>Sin relaciones</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
