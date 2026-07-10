import React, { useEffect, useState } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import {
  MousePointer2, Hand, BoxSelect, StickyNote, Frame, Maximize2,
  ZoomIn, ZoomOut, Map, Lock, Unlock, Target, Wrench, X
} from "lucide-react";
import "./canvas-mobile-toolbar.css";

export type InteractionMode = "select" | "pan" | "multiselect";

export interface CanvasToolbarProps {
  canvasId: string;
  interactionMode: InteractionMode;
  isLocked: boolean;
  showMinimap: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onLockChange: (locked: boolean) => void;
  onMinimapToggle: () => void;
}

export function CanvasToolbar({
  canvasId,
  interactionMode,
  isLocked,
  showMinimap,
  onModeChange,
  onLockChange,
  onMinimapToggle,
}: CanvasToolbarProps) {
  const { fitView, zoomIn, zoomOut, getNodes } = useReactFlow();
  const { placeNodeOnCanvas } = useCampaignStore();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)").matches;
    if (isMobile && interactionMode === "select") {
      onModeChange("pan");
    }
  }, []);

  const closeMobileTools = () => setIsMobileOpen(false);

  const handleAddNote = async () => {
    await placeNodeOnCanvas(canvasId, { kind: "note", text: "", color: "yellow", x: 200, y: 200 });
    closeMobileTools();
  };

  const handleAddGroup = async () => {
    await placeNodeOnCanvas(canvasId, { kind: "group", title: t("canvas.toolbar.newGroup"), color: "purple", x: 200, y: 200, width: 340, height: 220 });
    closeMobileTools();
  };

  const handleModeChange = (mode: InteractionMode) => {
    onModeChange(mode);
    closeMobileTools();
  };

  const handleFitView = () => {
    fitView({ padding: 0.25, duration: 400 });
    closeMobileTools();
  };

  const handleFocusSelection = () => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length > 0) {
      fitView({ nodes: selectedNodes, padding: 0.3, duration: 400 });
    } else {
      fitView({ padding: 0.25, duration: 400 });
    }
    closeMobileTools();
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
    closeMobileTools();
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
    closeMobileTools();
  };

  const handleMinimapToggle = () => {
    onMinimapToggle();
    closeMobileTools();
  };

  const handleLockToggle = () => {
    onLockChange(!isLocked);
    closeMobileTools();
  };

  const groupFocusSelect = (() => {
    const groups = getNodes().filter(n => n.type === "group");
    if (groups.length === 0) return null;
    return (
      <>
        <div className="canvas-toolbar__inline-divider" />
        <select
          onChange={(e) => {
            const groupId = e.target.value;
            if (groupId) {
              const gNode = getNodes().find(n => n.id === groupId);
              if (gNode) fitView({ nodes: [gNode], padding: 0.25, duration: 400 });
            }
            e.target.value = "";
            closeMobileTools();
          }}
          className="canvas-toolbar__select"
          title={t("canvas.toolbar.focusGroup")}
        >
          <option value="" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>{t("canvas.toolbar.focusPlaceholder")}</option>
          {groups.map(g => (
            <option key={g.id} value={g.id} style={{ background: "var(--bg-card)", color: "var(--text-main)" }}>
              {typeof g.data?.title === "string" ? g.data.title : t("canvas.toolbar.groupFallback")}
            </option>
          ))}
        </select>
      </>
    );
  })();

  const toolbarContent = (
    <div className="canvas-toolbar">
      <span className="canvas-mobile-tools-section">Modo táctil</span>
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${interactionMode === "pan" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("pan")} title="Explorar: arrastra el mapa, toca una tarjeta para verla">
          <Hand size={15} />
        </button>
        <button className={`canvas-toolbar__btn ${interactionMode === "select" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("select")} title="Editar: seleccionar y preparar cambios sobre tarjetas">
          <MousePointer2 size={15} />
        </button>
        <button className={`canvas-toolbar__btn ${interactionMode === "multiselect" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("multiselect")} title="Selección múltiple">
          <BoxSelect size={15} />
        </button>
      </div>

      <div className="canvas-toolbar__divider" />

      <span className="canvas-mobile-tools-section">Crear</span>
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleAddNote} title={t("canvas.toolbar.quickNote")}>
          <StickyNote size={15} />
        </button>
        <button className="canvas-toolbar__btn" onClick={handleAddGroup} title={t("canvas.toolbar.visualGroup")}>
          <Frame size={15} />
        </button>
      </div>

      <div className="canvas-toolbar__divider" />

      <span className="canvas-mobile-tools-section">Vista</span>
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleFitView} title={t("canvas.toolbar.fitView")}>
          <Maximize2 size={15} />
        </button>
        <button className="canvas-toolbar__btn" onClick={handleFocusSelection} title={t("canvas.toolbar.focusSelection")}>
          <Target size={15} />
        </button>
        <button className="canvas-toolbar__btn" onClick={handleZoomIn} title={t("canvas.toolbar.zoomIn")}>
          <ZoomIn size={15} />
        </button>
        <button className="canvas-toolbar__btn" onClick={handleZoomOut} title={t("canvas.toolbar.zoomOut")}>
          <ZoomOut size={15} />
        </button>
        <button className={`canvas-toolbar__btn ${showMinimap ? "canvas-toolbar__btn--active" : ""}`} onClick={handleMinimapToggle} title={t("canvas.toolbar.minimap")}>
          <Map size={15} />
        </button>
        {groupFocusSelect}
      </div>

      <div className="canvas-toolbar__divider" />

      <span className="canvas-mobile-tools-section">Bloqueo</span>
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${isLocked ? "canvas-toolbar__btn--active canvas-toolbar__btn--warning" : ""}`} onClick={handleLockToggle} title={isLocked ? t("canvas.toolbar.unlockPositions") : t("canvas.toolbar.lockPositions")}>
          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Panel position="top-center" className="canvas-toolbar-panel canvas-toolbar-panel--desktop" style={{ marginTop: "8px" }}>
        {toolbarContent}
      </Panel>

      <Panel position="bottom-right" className="canvas-toolbar-panel canvas-toolbar-panel--mobile">
        {isMobileOpen && (
          <>
            <button type="button" className="canvas-mobile-tools-backdrop" onClick={closeMobileTools} aria-label="Cerrar herramientas del Canvas" />
            <div className="canvas-mobile-tools-popover" role="dialog" aria-label="Herramientas del Canvas">
              <div className="canvas-mobile-tools-popover__header">
                <span>Herramientas</span>
                <button type="button" onClick={closeMobileTools} aria-label="Cerrar herramientas">
                  <X size={16} />
                </button>
              </div>
              {toolbarContent}
            </div>
          </>
        )}
        <button
          type="button"
          className={`canvas-mobile-tools-fab ${isMobileOpen ? "canvas-mobile-tools-fab--open" : ""}`}
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-expanded={isMobileOpen}
          aria-label="Abrir herramientas del Canvas"
        >
          <Wrench size={20} />
        </button>
      </Panel>
    </>
  );
}
