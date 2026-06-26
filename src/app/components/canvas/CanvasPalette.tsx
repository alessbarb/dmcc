import React, { useState } from "react";
import { useCampaignStore } from "../../stores/campaignStore.js";
import {
  Search, User, MapPin, Film, HelpCircle, Key, Award, Skull, Box, Shield,
  StickyNote, BoxSelect, Eye, CheckCircle2, RefreshCcw, Trash2,
  Lock, MessageSquare, XCircle, Lightbulb, AlertTriangle, RefreshCw, Plus,
  ChevronLeft, ChevronRight
} from "lucide-react";

export interface CanvasPaletteProps {
  canvasId: string;
  isDirectionMode?: boolean;
  selectedNodeId: string | null;
}

function makeDragGhost(label: string, color: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = label;
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    padding: 6px 14px; border-radius: 8px;
    background: ${color}; color: #fff;
    font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    pointer-events: none; z-index: 9999;
  `;
  document.body.appendChild(el);
  return el;
}

export function CanvasPalette({ canvasId, isDirectionMode, selectedNodeId }: CanvasPaletteProps) {
  const {
    campaignState,
    placeNodeOnCanvas,
    createEntity,
    createFact,
    updateEntity,
    removeNodeFromCanvas,
    addEdgeToCanvas,
    recordSessionEvent
  } = useCampaignStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("dmcc-palette-collapsed") === "1"
  );
  const toggleCollapsed = () => {
    setCollapsed(v => {
      const next = !v;
      localStorage.setItem("dmcc-palette-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const entities = campaignState?.entities || [];
  const canvas = campaignState?.canvases?.find((c: any) => c.id === canvasId);
  const existingEntityIds = new Set(
    canvas?.nodes?.filter((n: any) => n.kind === "entity").map((n: any) => n.entityId) || []
  );

  const filteredEntities = entities.filter(
    (e: any) =>
      !e.archived &&
      !existingEntityIds.has(e.entityId) &&
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceExisting = async (entity: any) => {
    const x = 100 + Math.random() * 100;
    const y = 100 + Math.random() * 100;
    await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: entity.entityId, x, y });
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleCreateNewNode = async (kind: "note" | "group" | "entity", entityType?: string, label?: string) => {
    const x = 150 + Math.random() * 80;
    const y = 150 + Math.random() * 80;

    if (kind === "note") {
      await placeNodeOnCanvas(canvasId, { kind: "note", text: "Nota rápida. Escribe tu idea aquí...", color: "yellow", x, y });
    } else if (kind === "group") {
      await placeNodeOnCanvas(canvasId, { kind: "group", title: "Nuevo Grupo", color: "purple", x, y, width: 300, height: 200 });
    } else if (kind === "entity" && entityType) {
      const title = `Nuevo ${label || "Elemento"}`;
      const campaignId = campaignState?.campaign?.campaignId;
      if (!campaignId) return;
      try {
        const payload: any = { entityType, title, status: "ready", importance: "normal", visibility: { kind: "dm_only" } };
        await createEntity(payload);
        const currentStore = useCampaignStore.getState();
        const createdEntity = currentStore.campaignState?.entities?.slice(-1)[0];
        if (createdEntity) {
          await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: createdEntity.entityId, x, y });
        }
      } catch (err) {
        console.error("Failed to create new entity from canvas", err);
      }
    }
  };

  const selectedNode = canvas?.nodes?.find((n: any) => n.id === selectedNodeId);
  const selectedEntity = selectedNode?.entityId ? campaignState?.entities?.find((e: any) => e.entityId === selectedNode.entityId) : null;

  const handleCreateQuickScene = async () => {
    await handleCreateNewNode("entity", "scene", "Escena");
  };

  const handleQuickSessionNote = async () => {
    const text = window.prompt("Añadir nota de sesión rápida:");
    if (text && text.trim()) {
      const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
      if (activeSession) {
        await recordSessionEvent(activeSession.sessionId, {
          type: "note_recorded",
          title: "Nota de sesión rápida",
          description: text.trim(),
          relatedEntityIds: [],
        });
      } else {
        alert("No hay ninguna sesión activa en curso.");
      }
    }
  };

  const handleRevealSelected = async () => {
    if (!selectedEntity) return;
    await updateEntity(selectedEntity.entityId, { visibility: { kind: "public" } });
    const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
    if (activeSession) {
      await recordSessionEvent(activeSession.sessionId, {
        type: "reveal",
        title: `Revelado: ${selectedEntity.title}`,
        description: `El DM reveló la entidad "${selectedEntity.title}" desde el panel de dirección.`,
        relatedEntityIds: [selectedEntity.entityId],
      });
    }
  };

  const handleResolveSelected = async () => {
    if (!selectedEntity) return;
    const currentStatus = selectedEntity.status || "ready";
    let newStatus = "resolved";
    if (selectedEntity.entityType === "npc") newStatus = currentStatus === "alive" ? "dead" : "alive";
    else if (selectedEntity.entityType === "location") newStatus = currentStatus === "unvisited" ? "visited" : "unvisited";
    else if (selectedEntity.entityType === "clue") newStatus = currentStatus === "unfound" ? "found" : "unfound";
    else if (selectedEntity.entityType === "quest") newStatus = currentStatus === "active" ? "completed" : "active";
    else if (selectedEntity.entityType === "secret") newStatus = currentStatus === "hidden" ? "revealed" : "hidden";

    await updateEntity(selectedEntity.entityId, { status: newStatus });
    const activeSession = campaignState?.sessions?.find((s: any) => s.status === "active");
    if (activeSession) {
      await recordSessionEvent(activeSession.sessionId, {
        type: "status_changed",
        title: `Estado de ${selectedEntity.title}: ${newStatus}`,
        description: `Se actualizó el estado de "${selectedEntity.title}" a "${newStatus}" desde el panel de dirección.`,
        relatedEntityIds: [selectedEntity.entityId],
      });
    }
  };

  const handleAddConsequenceSelected = async () => {
    if (!selectedEntity) return;
    const title = window.prompt(`Título de la consecuencia para: ${selectedEntity.title}`);
    if (title && title.trim()) {
      const campaignId = campaignState?.campaign?.campaignId;
      if (!campaignId) return;
      try {
        await createEntity({
          entityType: "consequence",
          title: title.trim(),
          status: "ready",
          importance: "normal",
          visibility: { kind: "dm_only" }
        });
        const updatedStore = useCampaignStore.getState();
        const created = updatedStore.campaignState?.entities?.slice(-1)[0];
        if (created && selectedNode) {
          const x = selectedNode.x + 200;
          const y = selectedNode.y;
          await placeNodeOnCanvas(canvasId, { kind: "entity", entityId: created.entityId, x, y });
          const finalStore = useCampaignStore.getState();
          const finalCanvas = finalStore.canvasesById[canvasId];
          const newNode = finalCanvas?.nodes?.find((n: any) => n.entityId === created.entityId);
          if (newNode) {
            await addEdgeToCanvas(canvasId, {
              sourceNodeId: selectedNode.id,
              targetNodeId: newNode.id,
              label: "consecuencia",
              status: "domain",
              visibility: "dm",
              style: "solid",
            });
          }
        }
      } catch (err) {
        console.error("Failed to create consequence", err);
      }
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedNodeId) {
      await removeNodeFromCanvas(canvasId, selectedNodeId);
    }
  };

  if (isDirectionMode) {
    const isSecret = selectedEntity && (!selectedEntity.visibility || selectedEntity.visibility.kind === "dm_only" || selectedEntity.visibility.kind === "dm");
    return (
      <div className="canvas-palette canvas-palette--direction" style={{ backgroundColor: "rgba(15,18,30,0.92)", borderRight: "1px solid var(--border-color)", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", zIndex: 10, position: "relative" }}>
        <button
          onClick={toggleCollapsed}
          title="Colapsar paleta"
          style={{
            position: "absolute", top: "8px", right: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: "2px 4px", borderRadius: "4px",
            display: "flex", alignItems: "center",
          }}
        >
          <ChevronLeft size={13} />
        </button>
        <div className="palette-section">
          <h3>⚡ Dirección en Vivo</h3>
          <div className="palette-list" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleCreateQuickScene}
              className="palette-list-item-btn"
              style={{ cursor: "pointer", width: "100%", textAlign: "left", display: "flex", gap: "8px", alignItems: "center", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-input)", color: "var(--text-main)" } as any}
            >
              <Film size={14} style={{ color: "#64748b" }} />
              <span>🎬 Crear Escena rápida</span>
            </button>
            <button
              onClick={handleQuickSessionNote}
              className="palette-list-item-btn"
              style={{ cursor: "pointer", width: "100%", textAlign: "left", display: "flex", gap: "8px", alignItems: "center", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-input)", color: "var(--text-main)" } as any}
            >
              <StickyNote size={14} style={{ color: "#eab308" }} />
              <span>📝 Nota de Sesión rápida</span>
            </button>
          </div>
        </div>

        <div className="palette-divider" style={{ height: "1px", backgroundColor: "var(--border-color)", opacity: 0.3 }} />

        <div className="palette-section" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3>🎯 Acción sobre Selección</h3>
          {selectedNode ? (
            <div style={{ marginTop: "12px", padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>
                  {selectedNode.kind === "entity" ? (selectedEntity?.entityType || "Entidad") : selectedNode.kind}
                </div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-main)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedEntity?.title || selectedNode.title || selectedNode.text || "Elemento sin título"}
                </div>
              </div>

              {selectedNode.kind === "entity" && selectedEntity && (
                <>
                  <button
                    onClick={handleRevealSelected}
                    disabled={!isSecret}
                    className="btn btn-sm btn-secondary"
                    style={{ width: "100%", justifyContent: "center", display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", height: "28px" }}
                  >
                    <Eye size={12} />
                    <span>{isSecret ? "👁 Revelar a jugadores" : "Revelado"}</span>
                  </button>

                  <button
                    onClick={handleResolveSelected}
                    className="btn btn-sm btn-secondary"
                    style={{ width: "100%", justifyContent: "center", display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", height: "28px" }}
                  >
                    <CheckCircle2 size={12} />
                    <span>✅ Resolver Estado</span>
                  </button>

                  <button
                    onClick={handleAddConsequenceSelected}
                    className="btn btn-sm btn-secondary"
                    style={{ width: "100%", justifyContent: "center", display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", height: "28px" }}
                  >
                    <RefreshCcw size={12} />
                    <span>💥 Consecuencia</span>
                  </button>
                </>
              )}

              <button
                onClick={handleRemoveSelected}
                className="btn btn-sm btn-secondary text-critical"
                style={{ width: "100%", justifyContent: "center", display: "flex", gap: "6px", alignItems: "center", fontSize: "11px", height: "28px", borderColor: "rgba(239,68,68,0.2)" }}
              >
                <Trash2 size={12} />
                <span>Quitar del Canvas</span>
              </button>
            </div>
          ) : (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", padding: "16px 0", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Selecciona un nodo en el canvas para ver las acciones de partida.
            </div>
          )}
        </div>
      </div>
    );
  }

  const PALETTE_ITEMS = [
    { label: "NPC / PNJ",  type: "npc",      Icon: User,        color: "#3b82f6" },
    { label: "Lugar",      type: "location",  Icon: MapPin,      color: "#10b981" },
    { label: "Escena",     type: "scene",     Icon: Film,        color: "#64748b" },
    { label: "Pista",      type: "clue",      Icon: HelpCircle,  color: "#eab308" },
    { label: "Secreto",    type: "secret",    Icon: Key,         color: "#ef4444" },
    { label: "Misión",     type: "quest",     Icon: Award,       color: "#f97316" },
    { label: "Criatura",   type: "creature",  Icon: Skull,       color: "#dc2626" },
    { label: "Objeto",     type: "item",      Icon: Box,         color: "#8b5cf6" },
    { label: "Facción",    type: "faction",   Icon: Shield,      color: "#f59e0b" },
  ];

  if (collapsed) {
    return (
      <div
        style={{
          width: "32px",
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "10px",
          zIndex: 5,
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleCollapsed}
          title="Expandir paleta"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "6px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="canvas-palette">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-8px" }}>
        <button
          onClick={toggleCollapsed}
          title="Colapsar paleta"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "2px 4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={13} />
        </button>
      </div>
      <div className="palette-section">
        <h3>Agregar ideas</h3>
        <div className="palette-buttons-grid">
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "note");
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeDragGhost("📝 Nota", "#ca8a04");
              e.dataTransfer.setDragImage(ghost, 50, 18);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewNode("note")}
            className="palette-btn palette-btn--note"
            title="Arrastra o haz clic para añadir nota"
          >
            <StickyNote size={16} />
            <span>Nota adhesiva</span>
          </button>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "group");
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeDragGhost("▭ Grupo", "#7c3aed");
              e.dataTransfer.setDragImage(ghost, 50, 18);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewNode("group")}
            className="palette-btn palette-btn--group"
            title="Arrastra o haz clic para añadir grupo"
          >
            <BoxSelect size={16} />
            <span>Marco / Grupo</span>
          </button>
        </div>
      </div>

      <div className="palette-divider" />

      <div className="palette-section">
        <h3>Crear entidades <span className="palette-drag-hint">arrastra al canvas</span></h3>
        <div className="palette-list">
          {PALETTE_ITEMS.map((item) => {
            const IconComponent = item.Icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("palette/kind", "entity");
                  e.dataTransfer.setData("palette/entityType", item.type);
                  e.dataTransfer.setData("palette/label", item.label);
                  e.dataTransfer.effectAllowed = "copy";
                  const ghost = makeDragGhost(item.label, item.color);
                  e.dataTransfer.setDragImage(ghost, 60, 18);
                  requestAnimationFrame(() => document.body.removeChild(ghost));
                }}
                onClick={() => handleCreateNewNode("entity", item.type, item.label)}
                className="palette-list-item-btn"
                style={{ "--item-color": item.color, cursor: "grab" } as React.CSSProperties}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNewNode("entity", item.type, item.label)}
              >
                <IconComponent size={14} style={{ color: item.color }} />
                <span>+ {item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="palette-divider" />

      <div className="palette-section">
        <h3>Añadir existente</h3>
        <div className="palette-search-container">
          <div className="palette-search-input-wrapper">
            <Search size={14} className="palette-search-icon" />
            <input
              type="text"
              placeholder="Buscar entidad..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="palette-search-input"
            />
          </div>

          {isDropdownOpen && searchQuery && (
            <div className="palette-search-results">
              <div className="palette-search-results-header">
                <span>Resultados de campaña</span>
                <button onClick={() => setIsDropdownOpen(false)} className="palette-results-close">&times;</button>
              </div>
              {filteredEntities.length === 0 ? (
                <div className="palette-results-empty">No hay entidades disponibles</div>
              ) : (
                <div className="palette-results-list">
                  {filteredEntities.map((entity: any) => (
                    <button
                      key={entity.entityId}
                      onClick={() => handlePlaceExisting(entity)}
                      className="palette-result-item"
                    >
                      <span className="palette-result-title">{entity.title}</span>
                      <span className="palette-result-type">{entity.entityType}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="palette-divider" />

      <FactsSection canvasId={canvasId} createFact={createFact} placeNodeOnCanvas={placeNodeOnCanvas} campaignState={campaignState} />
    </div>
  );
}

const FACT_KIND_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  canon:         { label: "Canon",      color: "#10b981", Icon: CheckCircle2 },
  dm_secret:     { label: "Secreto DM", color: "#dc2626", Icon: Lock },
  rumor:         { label: "Rumor",      color: "#d97706", Icon: MessageSquare },
  lie:           { label: "Mentira",    color: "#ea580c", Icon: XCircle },
  player_theory: { label: "Teoría",     color: "#6366f1", Icon: Lightbulb },
  mistake:       { label: "Error",      color: "#64748b", Icon: AlertTriangle },
  retcon:        { label: "Retcon",     color: "#8b5cf6", Icon: RefreshCw },
};

function makeFactDragGhost(kind: string, color: string): HTMLElement {
  const el = document.createElement("div");
  const cfg = FACT_KIND_CONFIG[kind];
  el.textContent = cfg ? cfg.label.toUpperCase() : "HECHO";
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    padding: 4px 12px; border-radius: 4px;
    background: ${color}; color: #fff;
    font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    pointer-events: none; z-index: 9999;
  `;
  document.body.appendChild(el);
  return el;
}

function FactsSection({ canvasId, createFact, placeNodeOnCanvas, campaignState }: {
  canvasId: string;
  createFact: any;
  placeNodeOnCanvas: any;
  campaignState: any;
}) {
  const [factSearch, setFactSearch] = useState("");
  const [showFactSearch, setShowFactSearch] = useState(false);

  // Select stable reference — the nodes array itself, not a derived array
  const canvasNodes = useCampaignStore(s => s.canvasesById[canvasId]?.nodes);
  const placedFactIds = new Set(
    (canvasNodes ?? []).filter((n: any) => n.kind === "fact").map((n: any) => n.factId)
  );

  const allFacts: any[] = campaignState?.facts instanceof Map
    ? Array.from(campaignState.facts.values())
    : Array.isArray(campaignState?.facts) ? campaignState.facts : [];

  const availableFacts = allFacts.filter(f =>
    !f.archived && !placedFactIds.has(f.factId) &&
    f.statement?.toLowerCase().includes(factSearch.toLowerCase())
  );

  const handlePlaceExistingFact = async (fact: any) => {
    const x = 150 + Math.random() * 100;
    const y = 150 + Math.random() * 100;
    await placeNodeOnCanvas(canvasId, { kind: "fact", factId: fact.factId, x, y });
    setFactSearch("");
    setShowFactSearch(false);
  };

  const handleCreateNewFact = async (kind: string) => {
    const statement = window.prompt(`Nuevo hecho (${FACT_KIND_CONFIG[kind]?.label ?? kind}):\n\nEscribe la declaración:`);
    if (!statement?.trim()) return;
    try {
      const newFactId = await createFact({
        statement: statement.trim(),
        kind,
        confidence: "suspected",
        relatedEntityIds: [],
        source: { type: "manual" },
      });
      if (newFactId) {
        const x = 150 + Math.random() * 100;
        const y = 150 + Math.random() * 100;
        await placeNodeOnCanvas(canvasId, { kind: "fact", factId: newFactId, x, y });
      }
    } catch (err) {
      console.error("Failed to create fact", err);
    }
  };

  return (
    <div className="palette-section">
      <h3>Hechos narrativos <span className="palette-drag-hint">arrastra al canvas</span></h3>

      {/* Quick-create by kind */}
      <div className="palette-list" style={{ gap: "4px", marginBottom: "8px" }}>
        {Object.entries(FACT_KIND_CONFIG).map(([kind, { label, color, Icon }]) => (
          <div
            key={kind}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "fact-create");
              e.dataTransfer.setData("palette/factKind", kind);
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeFactDragGhost(kind, color);
              e.dataTransfer.setDragImage(ghost, 50, 14);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewFact(kind)}
            className="palette-list-item-btn"
            style={{ "--item-color": color, cursor: "grab" } as React.CSSProperties}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCreateNewFact(kind)}
          >
            <Icon size={12} style={{ color }} />
            <span style={{ fontSize: "0.68rem" }}>+ {label}</span>
          </div>
        ))}
      </div>

      {/* Existing facts search */}
      <button
        onClick={() => setShowFactSearch(v => !v)}
        className="palette-list-item-btn"
        style={{ justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", cursor: "pointer" }}
      >
        <span>Colocar hecho existente</span>
        <Search size={11} />
      </button>

      {showFactSearch && (
        <div style={{ marginTop: "6px" }}>
          <input
            type="text"
            placeholder="Buscar hecho..."
            value={factSearch}
            onChange={e => setFactSearch(e.target.value)}
            className="palette-search-input"
            style={{ width: "100%", marginBottom: "4px" }}
          />
          <div style={{ maxHeight: "140px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {availableFacts.length === 0 ? (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", padding: "8px 0", textAlign: "center" }}>
                {allFacts.length === 0 ? "No hay hechos creados" : "Todos los hechos ya están en el canvas"}
              </div>
            ) : (
              availableFacts.slice(0, 12).map((f: any) => {
                const cfg = FACT_KIND_CONFIG[f.kind] ?? FACT_KIND_CONFIG.rumor;
                return (
                  <div
                    key={f.factId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("palette/kind", "fact");
                      e.dataTransfer.setData("palette/factId", f.factId);
                      e.dataTransfer.effectAllowed = "copy";
                      const ghost = makeFactDragGhost(f.kind, cfg.color);
                      e.dataTransfer.setDragImage(ghost, 50, 14);
                      requestAnimationFrame(() => document.body.removeChild(ghost));
                    }}
                    onClick={() => handlePlaceExistingFact(f)}
                    className="palette-list-item-btn"
                    style={{ "--item-color": cfg.color, cursor: "grab", gap: "6px" } as React.CSSProperties}
                    role="button"
                    tabIndex={0}
                  >
                    <cfg.Icon size={10} style={{ color: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.statement}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
