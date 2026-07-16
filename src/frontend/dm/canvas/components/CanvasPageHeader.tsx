import React, { type Dispatch, type SetStateAction } from "react";
import { Folder, Plus, Eye, EyeOff, Zap, Play, Shield, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import type { Edge } from "@xyflow/react";
import type { Canvas } from "@core/domain/canvas/types.js";
import type { Session } from "../../../shared/stores/campaignStore.js";
import type { CanvasFlowNode } from "../components/CampaignCanvasFlow.js";
import { isCanvasDensity, isRelationsFilter, type CanvasDensity, type RelationsFilter } from "../canvasPageFilters.js";

export interface CanvasPageHeaderProps {
  activeCanvasId: string | null;
  setActiveCanvasId: (canvasId: string | null) => void;
  setSelectedNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedEdgeId: Dispatch<SetStateAction<string | null>>;
  setSelectedNodes: Dispatch<SetStateAction<CanvasFlowNode[]>>;
  setSelectedEdges: Dispatch<SetStateAction<Edge[]>>;
  canvases: Canvas[];
  activeCanvas: Canvas | null;
  activeSession: Session | undefined;
  isPlayerView: boolean;
  setIsPlayerView: Dispatch<SetStateAction<boolean>>;
  setIsCreateBoardOpen: Dispatch<SetStateAction<boolean>>;
  isDirectionMode: boolean;
  setIsDirectionMode: Dispatch<SetStateAction<boolean>>;
  isFullscreenPresentation: boolean;
  toggleFullscreenPresentation: () => void;
  isViewPopoverOpen: boolean;
  setIsViewPopoverOpen: Dispatch<SetStateAction<boolean>>;
  publicOnly: boolean;
  setPublicOnly: Dispatch<SetStateAction<boolean>>;
  tablePrivacy: boolean;
  setTablePrivacy: Dispatch<SetStateAction<boolean>>;
  mysteryFlowMode: boolean;
  setMysteryFlowMode: Dispatch<SetStateAction<boolean>>;
  density: CanvasDensity;
  setDensity: Dispatch<SetStateAction<CanvasDensity>>;
  relationsFilter: RelationsFilter;
  setRelationsFilter: Dispatch<SetStateAction<RelationsFilter>>;
  typeFilter: string;
  setTypeFilter: Dispatch<SetStateAction<string>>;
  isActionsDropdownOpen: boolean;
  setIsActionsDropdownOpen: Dispatch<SetStateAction<boolean>>;
  setIsImportOpen: Dispatch<SetStateAction<boolean>>;
  setIsLintOpen: Dispatch<SetStateAction<boolean>>;
  setIsLegendOpen: Dispatch<SetStateAction<boolean>>;
  handleExport: (format: "svg" | "png", viewMode: "dm" | "player") => Promise<void>;
  runCanvasPageAction: (operation: Promise<unknown>, errorMessage: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getCanvasKindLabel: (kind: string, t: (key: string) => string) => string;
}

export function CanvasPageHeader({
  activeCanvasId,
  setActiveCanvasId,
  setSelectedNodeId,
  setSelectedEdgeId,
  setSelectedNodes,
  setSelectedEdges,
  canvases,
  activeCanvas,
  activeSession,
  isPlayerView,
  setIsPlayerView,
  setIsCreateBoardOpen,
  isDirectionMode,
  setIsDirectionMode,
  isFullscreenPresentation,
  toggleFullscreenPresentation,
  isViewPopoverOpen,
  setIsViewPopoverOpen,
  publicOnly,
  setPublicOnly,
  tablePrivacy,
  setTablePrivacy,
  mysteryFlowMode,
  setMysteryFlowMode,
  density,
  setDensity,
  relationsFilter,
  setRelationsFilter,
  typeFilter,
  setTypeFilter,
  isActionsDropdownOpen,
  setIsActionsDropdownOpen,
  setIsImportOpen,
  setIsLintOpen,
  setIsLegendOpen,
  handleExport,
  runCanvasPageAction,
  t,
  getCanvasKindLabel
}: CanvasPageHeaderProps) {
  return (
<div className="canvas-header-bar">
  <div className="canvas-selector-group">
    <Folder size={16} className="text-muted" />
    <span className="canvas-selector-label">Tablero:</span>
    <select
      value={activeCanvasId || ""}
      onChange={(e) => {
        setActiveCanvasId(e.target.value || null);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedNodes([]);
        setSelectedEdges([]);
      }}
      className="canvas-select"
      disabled={isPlayerView}
    >
      {canvases.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title} ({getCanvasKindLabel(c.kind, t)})
        </option>
      ))}
    </select>

    {!isPlayerView && (
      <button
        onClick={() => setIsCreateBoardOpen(true)}
        className="btn btn-secondary btn-sm"
        title={t("canvas.page.createNewBoard")}
      >
        <Plus size={14} /> Nuevo tablero
      </button>
    )}
  </div>
           {/* View toggles & Filters */}
  <div className="canvas-header-filters" style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
    {/* Live Direction Toggle */}
    {activeSession && (
      <button
        type="button"
        className={`btn btn-sm ${isDirectionMode ? "btn-primary" : "btn-secondary"}`}
        onClick={() => {
          setIsDirectionMode(v => !v);
        }}
        title={isDirectionMode ? t("canvas.toolbar.deactivateDirection") : t("canvas.toolbar.activateDirection")}
      >
        <Zap size={12} />
        <span>{isDirectionMode ? "⚡ Dirigiendo" : "Dirigir partida"}</span>
      </button>
    )}

    {/* Fullscreen Presentation View Toggle */}
    <button
      type="button"
      className={`btn btn-sm ${isFullscreenPresentation ? "btn-primary" : "btn-secondary"}`}
      onClick={toggleFullscreenPresentation}
      title={isFullscreenPresentation ? t("canvas.toolbar.exitPresentation") : "Presentar en pantalla completa (Vista Jugador segura)"}
    >
      <Play size={12} />
      <span>{isFullscreenPresentation ? "Detener" : "Presentar"}</span>
    </button>

    {/* Vista Popover Container */}
    <div className="canvas-toolbar-group" style={{ position: "relative" }}>
      <button
        type="button"
        className={`btn btn-sm ${isViewPopoverOpen ? "btn-primary" : "btn-secondary"}`}
        onClick={() => setIsViewPopoverOpen(v => !v)}
        title="Ajustes de Vista del Canvas"
        style={{ gap: "6px" }}
      >
        <SlidersHorizontal size={12} />
        <span>Vista</span>
      </button>
      {isViewPopoverOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: "34px",
            right: 0,
            backgroundColor: "var(--theme-surfaces-base)",
            border: "1px solid var(--theme-borders-default)",
            borderRadius: "var(--theme-shapes-radius-medium)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            minWidth: "220px",
            boxShadow: "var(--theme-shadows-large)",
            padding: "12px",
            gap: "10px",
          }}
        >
          {/* Section 1: Modos (Buttons) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "10px", color: "var(--theme-text-secondary)", fontWeight: "bold", letterSpacing: "0.05em" }}>MODOS DE VISTA</div>
            
            {!isFullscreenPresentation && (
              <button
                type="button"
                className={`btn btn-sm ${isPlayerView ? "btn-primary" : "btn-secondary"}`}
                onClick={() => {
                  const nextView = !isPlayerView;
                  setIsPlayerView(nextView);
                  if (nextView) {
                    setIsDirectionMode(false);
                    setSelectedNodeId(null);
                    setSelectedEdgeId(null);
                    setSelectedNodes([]);
                    setSelectedEdges([]);
                  }
                }}
                title={isPlayerView ? "Volver a vista de DM" : t("canvas.toolbar.activatePlayerView")}
                style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
              >
                {isPlayerView ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{isPlayerView ? t("canvas.toolbar.playerViewLabel") : "👁 Vista DM"}</span>
              </button>
            )}

            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm ${publicOnly ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setPublicOnly(v => !v)}
                title={publicOnly ? t("canvas.toolbar.showingPublicOnly") : t("canvas.toolbar.showingAll")}
                style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
              >
                {publicOnly ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{publicOnly ? t("canvas.toolbar.publicOnly") : "Mostrar secretos"}</span>
              </button>
            )}

            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm ${tablePrivacy ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setTablePrivacy(value => !value)}
                title={t("canvas.toolbar.tablePrivacyHint")}
                style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
              >
                <Shield size={12} />
                <span>{t("canvas.toolbar.tablePrivacy")}</span>
              </button>
            )}

            {!isPlayerView && (
              <button
                type="button"
                className={`btn btn-sm ${mysteryFlowMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMysteryFlowMode(v => !v)}
                title={mysteryFlowMode ? "Desactivar Mystery Flow" : t("canvas.toolbar.activateMysteryFlow")}
                style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }}
              >
                <SlidersHorizontal size={12} />
                <span>{mysteryFlowMode ? "🔍 Mystery Flow" : "Ver Misterio"}</span>
              </button>
            )}
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--theme-borders-default)", margin: "4px 0" }} />

          {/* Section 2: Configurations / Filtros */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "10px", color: "var(--theme-text-secondary)", fontWeight: "bold", letterSpacing: "0.05em" }}>FILTROS Y DENSIDAD</div>

            {/* Densidad Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Densidad</span>
              <select
                value={density}
                onChange={(e) => {
                  const nextDensity = e.target.value;
                  if (isCanvasDensity(nextDensity)) {
                    setDensity(nextDensity);
                  }
                }}
                className="canvas-select"
                style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
              >
                <option value="compact">🗜️ Compacta</option>
                <option value="normal">📱 Normal</option>
                <option value="detailed">📋 Detallada</option>
              </select>
            </div>

            {/* Relaciones Filter */}
            {!isPlayerView && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Relaciones</span>
                <select
                  value={relationsFilter}
                  onChange={(e) => { if (isRelationsFilter(e.target.value)) setRelationsFilter(e.target.value); }}
                  className="canvas-select"
                  style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
                  title={t("canvas.toolbar.filterConnections")}
                >
                  <option value="all">🔗 Todas</option>
                  <option value="public">🌐 Públicas</option>
                  <option value="secret">🔴 Secretas</option>
                  <option value="selection">🎯 Selección</option>
                </select>
              </div>
            )}

            {/* Type Filter Select */}
            {!isPlayerView && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>Tipos de entidad</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="canvas-select"
                  style={{ width: "100%", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "4px 6px", height: "32px", fontSize: "12px" }}
                >
                  <option value="all">Todos los tipos</option>
                  <option value="npc">PNJs</option>
                  <option value="location">Lugares</option>
                  <option value="quest">Misiones</option>
                  <option value="clue">Pistas</option>
                  <option value="secret">Secretos</option>
                  <option value="scene">Escenas</option>
                  <option value="other">Otros</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Grupo 4: Acciones Dropdown */}
    <div className="canvas-toolbar-group" style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={() => setIsActionsDropdownOpen(v => !v)}
        title="Acciones y exportaciones de Canvas"
        style={{ gap: "6px" }}
      >
        <MoreHorizontal size={12} />
        <span>Más</span>
      </button>
      {isActionsDropdownOpen && (
        <div className="dropdown-menu" style={{ position: "absolute", top: "34px", right: 0, backgroundColor: "var(--theme-surfaces-base)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-medium)", display: "flex", flexDirection: "column", zIndex: 1000, minWidth: "180px", boxShadow: "var(--theme-shadows-large)", padding: "4px" }}>
          {!isPlayerView && (
            <>
              <button className="dropdown-item" onClick={() => { setIsImportOpen(true); setIsActionsDropdownOpen(false); }}>✏️ Importar por Texto</button>
              <button className="dropdown-item" onClick={() => { setIsLintOpen(v => !v); setIsActionsDropdownOpen(false); }}>🧠 Analizar Lore (Lint)</button>
              <button className="dropdown-item" onClick={() => { setIsLegendOpen(true); setIsActionsDropdownOpen(false); }}>📖 Ver Leyenda</button>
              <div style={{ height: "1px", backgroundColor: "var(--theme-borders-default)", margin: "4px 0" }} />
            </>
          )}
          <div style={{ fontSize: "9px", padding: "4px 12px", color: "var(--theme-text-secondary)", fontWeight: "bold" }}>EXPORTACIONES</div>
          <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "dm"), "No se pudo exportar el canvas en SVG para DM."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista DM</button>
          <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("svg", "player"), "No se pudo exportar el canvas en SVG para jugadores."); setIsActionsDropdownOpen(false); }}>Vector SVG - Vista Jugador</button>
          <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "dm"), "No se pudo exportar el canvas en PNG para DM."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista DM</button>
          <button className="dropdown-item" onClick={() => { runCanvasPageAction(handleExport("png", "player"), "No se pudo exportar el canvas en PNG para jugadores."); setIsActionsDropdownOpen(false); }}>Imagen PNG - Vista Jugador</button>
        </div>
      )}
    </div>
  </div>

  {activeCanvas && (
    <div className="canvas-board-info" style={{ marginLeft: "12px", borderLeft: "1px solid var(--theme-borders-default)", paddingLeft: "12px" }}>
      <span
        className="badge badge-primary"
        title={activeCanvas.description || undefined}
        style={{ cursor: activeCanvas.description ? "help" : undefined }}
      >
        {getCanvasKindLabel(activeCanvas.kind, t)}
      </span>
    </div>
  )}
</div>

  );
}
