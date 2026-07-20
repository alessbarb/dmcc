import React, { useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import {
  Search, Film, X,
  StickyNote, BoxSelect, Eye, CheckCircle2, RefreshCcw, Trash2,
  Lock, MessageSquare, XCircle, Lightbulb, AlertTriangle, RefreshCw,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { getEntityVisual } from "../../entities/entityVisuals.js";
import { connectCanvasNodes } from "../services/connectCanvasNodes.js";
import { placeEntityOnCanvas } from "../services/placeEntityOnCanvas.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import type { Canvas, CanvasNode } from "@core/domain/canvas/types.js";
import type { Entity, Fact, Session, CampaignStateStore } from "../../../shared/stores/campaignStore.js";


export interface CanvasPaletteProps {
  canvasId: string;
  isDirectionMode?: boolean;
  selectedNodeId: string | null;
  getViewportCenter?: () => { x: number; y: number } | null;
  className?: string;
  onMobileClose?: () => void;
}

function makeDragGhost(label: string, color: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = label;
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    padding: 6px 14px; border-radius: 8px;
    background: ${color}; color: var(--theme-text-on-media);
    font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-surfaces-canvas) 40%, transparent);
    pointer-events: none; z-index: 9999;
  `;
  document.body.appendChild(el);
  return el;
}

function runCanvasPaletteAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function CanvasPalette({ canvasId, isDirectionMode, selectedNodeId, getViewportCenter, className, onMobileClose }: CanvasPaletteProps) {
  const { t } = useTranslation();
  const {
    campaignState,
    placeNodeOnCanvas,
    createEntity,
    createFact,
    updateEntity,
    removeNodeFromCanvas,
    addEdgeToCanvas,
    createRelation,
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
  const canvas = campaignState?.canvases?.find((c: Canvas) => c.id === canvasId);
  const existingEntityIds = new Set(
    canvas?.nodes?.filter((n: CanvasNode) => n.kind === "entity").map((n: CanvasNode) => n.entityId) || []
  );

  const filteredEntities = entities.filter(
    (e: Entity) =>
      !e.archived &&
      !existingEntityIds.has(e.entityId) &&
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaceExisting = (entity: Entity) => {
    runCanvasPaletteAction(placeEntityOnCanvas({
      canvasId,
      entityId: entity.entityId,
      selectedNode,
      viewportCenter: getViewportCenter?.(),
      placeNodeOnCanvas,
    }).then(() => {
      setSearchQuery("");
      setIsDropdownOpen(false);
    }), "Failed to place existing entity on canvas");
  };

  const handleCreateNewNode = (kind: "note" | "group" | "entity", entityType?: string, label?: string) => {
    const x = 150 + Math.random() * 80;
    const y = 150 + Math.random() * 80;

    runCanvasPaletteAction((async () => {
      if (kind === "note") {
        await placeNodeOnCanvas(canvasId, { kind: "note", text: t("canvas.noteNode.contentPlaceholderLong"), color: "yellow", x, y });
      } else if (kind === "group") {
        await placeNodeOnCanvas(canvasId, { kind: "group", title: t("canvasPalette.groupDefaultName"), color: "purple", x, y, width: 300, height: 200 });
      } else if (kind === "entity" && entityType) {
        const title = `Nuevo ${label || "Elemento"}`;
        const campaignId = campaignState?.campaign?.campaignId;
        if (!campaignId) return;
        try {
          await createEntity({ entityType, title, status: "ready", importance: "normal", visibility: { kind: "dm_only" } });
          const currentStore = useCampaignStore.getState();
          const createdEntity = currentStore.campaignState?.entities?.slice(-1)[0];
          if (createdEntity) {
            await placeEntityOnCanvas({
              canvasId,
              entityId: createdEntity.entityId,
              selectedNode,
              viewportCenter: getViewportCenter?.() ?? { x, y },
              placeNodeOnCanvas,
            });
          }
        } catch (err) {
          console.error("Failed to create new entity from canvas", err);
        }
      }
    })(), "Failed to create new canvas node from palette");
  };

  const selectedNode = canvas?.nodes?.find((n: CanvasNode) => n.id === selectedNodeId);
  const selectedEntity = selectedNode?.entityId ? campaignState?.entities?.find((e: Entity) => e.entityId === selectedNode.entityId) : null;

  const handleCreateQuickScene = () => {
    handleCreateNewNode("entity", "scene", t("domain.entityTypes.scene"));
  };

  const handleQuickSessionNote = () => {
    const text = window.prompt(t("canvas.noteNode.addQuickSessionNote"));
    if (text && text.trim()) {
      const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
      if (activeSession) {
        runCanvasPaletteAction(recordSessionEvent(activeSession.sessionId, {
          type: "note_recorded",
          title: t("canvas.noteNode.quickSessionNote"),
          description: text.trim(),
          relatedEntityIds: [],
        }), "Failed to record quick session note from canvas palette");
      } else {
        alert(t("canvas.noteNode.noActiveSession"));
      }
    }
  };

  const handleRevealSelected = () => {
    if (!selectedEntity) return;
    runCanvasPaletteAction((async () => {
      await updateEntity(selectedEntity.entityId, { visibility: { kind: "public" } });
      const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
      if (activeSession) {
        await recordSessionEvent(activeSession.sessionId, {
          type: "reveal",
          title: `Revelado: ${selectedEntity.title}`,
          description: t("toasts.entityRevealedInspector", { title: selectedEntity.title }),
          relatedEntityIds: [selectedEntity.entityId],
        });
      }
    })(), "Failed to reveal selected entity from canvas palette");
  };

  const handleResolveSelected = () => {
    if (!selectedEntity) return;
    const currentStatus = selectedEntity.status || "ready";
    let newStatus = "resolved";
    if (selectedEntity.entityType === "npc") newStatus = currentStatus === "alive" ? "dead" : "alive";
    else if (selectedEntity.entityType === "location") newStatus = currentStatus === "unvisited" ? "visited" : "unvisited";
    else if (selectedEntity.entityType === "clue") newStatus = currentStatus === "unfound" ? "found" : "unfound";
    else if (selectedEntity.entityType === "quest") newStatus = currentStatus === "active" ? "completed" : "active";
    else if (selectedEntity.entityType === "secret") newStatus = currentStatus === "hidden" ? "revealed" : "hidden";

    runCanvasPaletteAction((async () => {
      await updateEntity(selectedEntity.entityId, { status: newStatus });
      const activeSession = campaignState?.sessions?.find((s: Session) => s.status === "active");
      if (activeSession) {
        await recordSessionEvent(activeSession.sessionId, {
          type: "status_changed",
          title: t("canvas.node.statusPrompt", { title: selectedEntity.title, status: newStatus }),
          description: t("toasts.statusUpdatedInspector", { title: selectedEntity.title, status: newStatus }),
          relatedEntityIds: [selectedEntity.entityId],
        });
      }
    })(), "Failed to update selected entity status from canvas palette");
  };

  const handleAddConsequenceSelected = () => {
    if (!selectedEntity) return;
    const title = window.prompt(t("canvas.node.consequenceTitlePrompt", { title: selectedEntity.title }));
    if (title && title.trim()) {
      const campaignId = campaignState?.campaign?.campaignId;
      if (!campaignId) return;
      runCanvasPaletteAction((async () => {
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
            await placeEntityOnCanvas({
              canvasId,
              entityId: created.entityId,
              selectedNode,
              viewportCenter: getViewportCenter?.(),
              placeNodeOnCanvas,
            });
            const finalStore = useCampaignStore.getState();
            const finalCanvas = finalStore.canvasesById[canvasId];
            const newNode = finalCanvas?.nodes?.find((n: CanvasNode) => n.entityId === created.entityId);
            if (newNode) {
              await connectCanvasNodes({
                canvasId,
                sourceNode: { id: selectedNode.id, entityId: selectedEntity.entityId },
                targetNode: { id: newNode.id, entityId: created.entityId },
                edge: {
                  label: "consecuencia",
                  status: "domain",
                  visibility: "dm",
                  style: "solid",
                },
                relation: {
                  relationType: "consecuencia",
                  visibility: { kind: "dm_only" },
                },
                createRelation,
                addEdgeToCanvas,
              });
            }
          }
        } catch (err) {
          console.error("Failed to create consequence", err);
        }
      })(), "Failed to create selected entity consequence from canvas palette");
    }
  };

  const handleRemoveSelected = () => {
    if (selectedNodeId) {
      runCanvasPaletteAction(
        removeNodeFromCanvas(canvasId, selectedNodeId),
        "Failed to remove selected node from canvas palette",
      );
    }
  };

  if (isDirectionMode) {
    const isSecret = selectedEntity && isDmOnlyVisibility(selectedEntity.visibility);
    return (
      <div className="canvas-palette canvas-palette--direction canvas-palette-direction">
        <button
          onClick={toggleCollapsed}
          title={t("canvasPalette.collapsePalette")}
          className="canvas-palette-collapse-button canvas-palette-collapse-button--direction"
        >
          <ChevronLeft size={13} />
        </button>
        <div className="palette-section">
          <h3>⚡ {t("canvasPalette.liveDirection")}</h3>
          <div className="palette-list palette-list--direction-quick-actions">
            <button
              onClick={handleCreateQuickScene}
              className="palette-list-item-btn palette-direction-action"
            >
              <Film size={14} className="palette-direction-action__icon palette-direction-action__icon--scene" />
              <span>🎬 {t("canvasPalette.createQuickScene")}</span>
            </button>
            <button
              onClick={handleQuickSessionNote}
              className="palette-list-item-btn palette-direction-action"
            >
              <StickyNote size={14} className="palette-direction-action__icon palette-direction-action__icon--note" />
              <span>📝 {t("canvasPalette.quickSessionNote")}</span>
            </button>
          </div>
        </div>

        <div className="palette-divider palette-divider--direction" />

        <div className="palette-section palette-section--selection">
          <h3>🎯 {t("canvasPalette.actionOnSelection")}</h3>
          {selectedNode ? (
            <div className="palette-selection-card">
              <div>
                <div className="palette-selection-card__kind">
                  {selectedNode.kind === "entity" ? (selectedEntity?.entityType || "Entidad") : selectedNode.kind}
                </div>
                <div className="palette-selection-card__title">
                  {selectedEntity?.title || selectedNode.title || selectedNode.text || t("canvas.node.untitledElement")}
                </div>
              </div>

              {selectedNode.kind === "entity" && selectedEntity && (
                <>
                  <button
                    onClick={handleRevealSelected}
                    disabled={!isSecret}
                    className="btn btn-sm btn-secondary palette-selection-card__action"
                  >
                    <Eye size={12} />
                    <span>{isSecret ? `👁 ${t("canvasPalette.revealToPlayers")}` : t("canvasPalette.revealed")}</span>
                  </button>

                  <button
                    onClick={handleResolveSelected}
                    className="btn btn-sm btn-secondary palette-selection-card__action"
                  >
                    <CheckCircle2 size={12} />
                    <span>✅ {t("canvasPalette.resolveStatus")}</span>
                  </button>

                  <button
                    onClick={handleAddConsequenceSelected}
                    className="btn btn-sm btn-secondary palette-selection-card__action"
                  >
                    <RefreshCcw size={12} />
                    <span>💥 {t("canvasPalette.quickConsequence")}</span>
                  </button>
                </>
              )}

              <button
                onClick={handleRemoveSelected}
                className="btn btn-sm btn-secondary text-critical palette-selection-card__action palette-selection-card__action--remove"
              >
                <Trash2 size={12} />
                <span>{t("canvasPalette.removeFromCanvas")}</span>
              </button>
            </div>
          ) : (
            <div className="palette-selection-empty">
              {t("canvasPalette.selectNodeForActions")}
            </div>
          )}
        </div>
      </div>
    );
  }

  const PALETTE_ITEMS = [
    "npc", "location", "scene", "clue", "secret", "quest", "creature", "item", "faction",
  ].map((type) => {
    const visual = getEntityVisual(type);
    return {
      label: t(visual.labelKey),
      type,
      Icon: visual.icon,
      color: visual.accent,
      colorSoft: visual.accentSoft,
    };
  });

  if (collapsed) {
    return (
      <div
        className="canvas-palette canvas-palette--collapsed"
      >
        <button
          onClick={toggleCollapsed}
          title={t("canvasPalette.expandPalette")}
          className="canvas-palette-collapse-button"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={["canvas-palette", className].filter(Boolean).join(" ")}>
      {onMobileClose && (
        <div className="canvas-mobile-sheet-header">
          <span>{t("canvas.toolbar.addNode")}</span>
          <button type="button" className="canvas-mobile-sheet-close" onClick={onMobileClose} aria-label={t("canvas.closeAddPanel")}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className="canvas-palette-collapse-row">
        <button
          onClick={toggleCollapsed}
          title={t("canvasPalette.collapsePalette")}
          className="canvas-palette-collapse-button"
        >
          <ChevronLeft size={13} />
        </button>
      </div>
      <div className="palette-section">
        <h3>{t("canvasPalette.addIdeas")}</h3>
        <div className="palette-buttons-grid">
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "note");
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeDragGhost("📝 Nota", "var(--theme-feedback-warning-foreground)");
              e.dataTransfer.setDragImage(ghost, 50, 18);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewNode("note")}
            className="palette-btn palette-btn--note"
            title={t("canvas.palette.addNoteDragHint")}
          >
            <StickyNote size={16} />
            <span>{t("canvasPalette.stickyNote")}</span>
          </button>
          <button
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "group");
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeDragGhost("▭ Grupo", "var(--theme-narrative-secret-foreground)");
              e.dataTransfer.setDragImage(ghost, 50, 18);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewNode("group")}
            className="palette-btn palette-btn--group"
            title={t("canvas.palette.addGroupDragHint")}
          >
            <BoxSelect size={16} />
            <span>{t("canvasPalette.frameGroup")}</span>
          </button>
        </div>
      </div>

      <div className="palette-divider" />

      <div className="palette-section">
        <h3>{t("canvasPalette.createEntities")} <span className="palette-drag-hint">{t("canvasPalette.dragToCanvas")}</span></h3>
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
                style={paletteItemStyle(item.color, item.colorSoft)}
                role="button"
                className="palette-list-item-btn palette-list-item-btn--draggable"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNewNode("entity", item.type, item.label)}
              >
                <IconComponent className="palette-item__icon" size={14} />
                <span>+ {item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="palette-divider" />

      <div className="palette-section">
        <h3>{t("canvasPalette.addExisting")}</h3>
        <div className="palette-search-container">
          <div className="palette-search-input-wrapper">
            <Search size={14} className="palette-search-icon" />
            <input
              type="text"
              placeholder={t("canvas.palette.searchEntityPlaceholder")}
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
                <span>{t("canvasPalette.campaignResults")}</span>
                <button onClick={() => setIsDropdownOpen(false)} className="palette-results-close">&times;</button>
              </div>
              {filteredEntities.length === 0 ? (
                <div className="palette-results-empty">{t("canvasPalette.noAvailableEntities")}</div>
              ) : (
                <div className="palette-results-list">
                  {filteredEntities.map((entity: Entity) => (
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

type FactKindConfig = Record<string, { label: string; color: string; Icon: React.ElementType }>;
type PaletteItemStyle = React.CSSProperties & {
  "--item-color": string;
  "--item-color-soft"?: string;
};

function paletteItemStyle(color: string, colorSoft?: string): PaletteItemStyle {
  return colorSoft
    ? { "--item-color": color, "--item-color-soft": colorSoft }
    : { "--item-color": color };
}

function getFactKindConfig(t: (key: string) => string): FactKindConfig {
  return {
    canon:         { label: t("canvas.factNode.kindCanonShort"),     color: "var(--theme-feedback-success-foreground)", Icon: CheckCircle2 },
    dm_secret:     { label: t("canvas.factNode.kindDmSecretShort"), color: "var(--theme-feedback-danger-foreground)", Icon: Lock },
    rumor:         { label: t("canvas.factNode.kindRumorShort"),     color: "var(--theme-feedback-warning-foreground)", Icon: MessageSquare },
    lie:           { label: t("canvas.factNode.kindLieShort"),       color: "var(--theme-activity-system-foreground)", Icon: XCircle },
    player_theory: { label: t("canvas.factNode.kindTheoryShort"),    color: "var(--theme-accents-secondary-foreground)", Icon: Lightbulb },
    mistake:       { label: t("canvas.factNode.kindMistakeShort"),   color: "var(--theme-text-secondary)", Icon: AlertTriangle },
    retcon:        { label: t("canvas.factNode.kindRetconShort"),    color: "var(--theme-narrative-secret-foreground)", Icon: RefreshCw },
  };
}

function makeFactDragGhost(kind: string, color: string, factKindConfig: FactKindConfig): HTMLElement {
  const el = document.createElement("div");
  const cfg = factKindConfig[kind];
  el.textContent = cfg ? cfg.label.toUpperCase() : "HECHO";
  el.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    padding: 4px 12px; border-radius: 4px;
    background: ${color}; color: var(--theme-text-on-media);
    font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-surfaces-canvas) 40%, transparent);
    pointer-events: none; z-index: 9999;
  `;
  document.body.appendChild(el);
  return el;
}

function FactsSection({ canvasId, createFact, placeNodeOnCanvas, campaignState }: {
  canvasId: string;
  createFact: CampaignStateStore["createFact"];
  placeNodeOnCanvas: CampaignStateStore["placeNodeOnCanvas"];
  campaignState: CampaignStateStore["campaignState"];
}) {
  const { t } = useTranslation();
  const FACT_KIND_CONFIG = getFactKindConfig(t);
  const [factSearch, setFactSearch] = useState("");
  const [showFactSearch, setShowFactSearch] = useState(false);

  // Select stable reference — the nodes array itself, not a derived array
  const canvasNodes = useCampaignStore(s => s.canvasesById[canvasId]?.nodes);
  const placedFactIds = new Set(
    (canvasNodes ?? []).filter((n: CanvasNode) => n.kind === "fact").map((n: CanvasNode) => n.factId)
  );

  const allFacts: Fact[] = campaignState?.facts instanceof Map
    ? Array.from(campaignState.facts.values())
    : Array.isArray(campaignState?.facts) ? campaignState.facts : [];

  const availableFacts = allFacts.filter((f: Fact) =>
    !f.archived && !placedFactIds.has(f.factId) &&
    f.statement?.toLowerCase().includes(factSearch.toLowerCase())
  );

  const handlePlaceExistingFact = (fact: Fact) => {
    const x = 150 + Math.random() * 100;
    const y = 150 + Math.random() * 100;
    runCanvasPaletteAction(placeNodeOnCanvas(canvasId, { kind: "fact", factId: fact.factId, x, y }).then(() => {
      setFactSearch("");
      setShowFactSearch(false);
    }), "Failed to place existing fact on canvas");
  };

  const handleCreateNewFact = (kind: string) => {
    const statement = window.prompt(t("canvas.factNode.newFactPrompt", { kind: FACT_KIND_CONFIG[kind]?.label ?? kind }));
    if (!statement?.trim()) return;
    runCanvasPaletteAction((async () => {
      try {
        const newFactId = await createFact({
          statement: statement.trim(),
          kind,
          confidence: "suspected",
          relatedEntityIds: [],
          source: { kind: "manual" },
        });
        if (newFactId) {
          const x = 150 + Math.random() * 100;
          const y = 150 + Math.random() * 100;
          await placeNodeOnCanvas(canvasId, { kind: "fact", factId: newFactId, x, y });
        }
      } catch (err) {
        console.error("Failed to create fact", err);
      }
    })(), "Failed to create fact from canvas palette");
  };

  return (
    <div className="palette-section">
      <h3>{t("canvasPalette.narrativeFacts")} <span className="palette-drag-hint">{t("canvasPalette.dragToCanvas")}</span></h3>

      {/* Quick-create by kind */}
      <div className="palette-list palette-list--facts">
        {Object.entries(FACT_KIND_CONFIG).map(([kind, { label, color, Icon }]) => (
          <div
            key={kind}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("palette/kind", "fact-create");
              e.dataTransfer.setData("palette/factKind", kind);
              e.dataTransfer.effectAllowed = "copy";
              const ghost = makeFactDragGhost(kind, color, FACT_KIND_CONFIG);
              e.dataTransfer.setDragImage(ghost, 50, 14);
              requestAnimationFrame(() => document.body.removeChild(ghost));
            }}
            onClick={() => handleCreateNewFact(kind)}
            style={paletteItemStyle(color)}
            className="palette-list-item-btn palette-list-item-btn--draggable"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCreateNewFact(kind)}
          >
            <Icon size={12} className="palette-fact-item__icon" />
            <span className="palette-fact-item__label">+ {label}</span>
          </div>
        ))}
      </div>

      {/* Existing facts search */}
      <button
        onClick={() => setShowFactSearch(v => !v)}
        className="palette-list-item-btn palette-fact-search-toggle"
      >
        <span>{t("canvasPalette.placeExistingFact")}</span>
        <Search size={11} />
      </button>

      {showFactSearch && (
        <div className="palette-fact-search">
          <input
            type="text"
            placeholder={t("canvas.palette.searchFactPlaceholder")}
            value={factSearch}
            onChange={e => setFactSearch(e.target.value)}
            className="palette-search-input palette-search-input--fact"
          />
          <div className="palette-fact-results">
            {availableFacts.length === 0 ? (
              <div className="palette-fact-results__empty">
                {allFacts.length === 0 ? t("canvasPalette.noFactsCreated") : t("canvas.palette.allFactsOnCanvas")}
              </div>
            ) : (
              availableFacts.slice(0, 12).map((f: Fact) => {
                const cfg = FACT_KIND_CONFIG[f.kind] ?? FACT_KIND_CONFIG.rumor;
                return (
                  <div
                    key={f.factId}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("palette/kind", "fact");
                      e.dataTransfer.setData("palette/factId", f.factId);
                      e.dataTransfer.effectAllowed = "copy";
                      const ghost = makeFactDragGhost(f.kind, cfg.color, FACT_KIND_CONFIG);
                      e.dataTransfer.setDragImage(ghost, 50, 14);
                      requestAnimationFrame(() => document.body.removeChild(ghost));
                    }}
                    onClick={() => handlePlaceExistingFact(f)}
                    style={paletteItemStyle(cfg.color)}
                    className="palette-list-item-btn palette-list-item-btn--draggable palette-list-item-btn--fact"
                    role="button"
                    tabIndex={0}
                  >
                    <cfg.Icon size={10} className="palette-fact-item__icon palette-fact-item__icon--small" />
                    <span className="palette-fact-item__statement">
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
