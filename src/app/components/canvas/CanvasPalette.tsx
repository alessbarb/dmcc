import React, { useState } from "react";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { Search, User, MapPin, Film, HelpCircle, Key, Award, Skull, Box, Shield, StickyNote, BoxSelect } from "lucide-react";

export interface CanvasPaletteProps {
  canvasId: string;
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

export function CanvasPalette({ canvasId }: CanvasPaletteProps) {
  const { campaignState, placeNodeOnCanvas, createEntity } = useCampaignStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <div className="canvas-palette">
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
    </div>
  );
}
