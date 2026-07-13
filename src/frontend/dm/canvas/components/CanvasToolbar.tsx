import React, { useEffect, useState } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import {
  MousePointer2, Hand, BoxSelect, StickyNote, Frame, Maximize2,
  ZoomIn, ZoomOut, Map, Lock, Unlock, Target, Wrench, X, Link2
} from "lucide-react";
import { connectCanvasNodes } from "../services/connectCanvasNodes.js";
import "./canvas-mobile-toolbar.css";

export type InteractionMode = "select" | "pan" | "multiselect";
export type CanvasTouchMode = "explore" | "edit" | "connect" | "multi";

export interface CanvasToolbarProps {
  canvasId: string;
  interactionMode: InteractionMode;
  isLocked: boolean;
  showMinimap: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onLockChange: (locked: boolean) => void;
  onMinimapToggle: () => void;
}

function toDesktopInteractionMode(touchMode: CanvasTouchMode): InteractionMode {
  switch (touchMode) {
    case "explore": return "pan";
    case "connect": return "pan";
    case "multi": return "multiselect";
    case "edit":
    default: return "select";
  }
}

function toTouchMode(interactionMode: InteractionMode, isLocked: boolean): CanvasTouchMode {
  if (isLocked) return "explore";
  switch (interactionMode) {
    case "pan": return "explore";
    case "multiselect": return "multi";
    case "select":
    default: return "edit";
  }
}

function relationTypeFromLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "related_to";
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
  const { placeNodeOnCanvas, createRelation, addEdgeToCanvas } = useCampaignStore();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileTouchMode, setMobileTouchMode] = useState<CanvasTouchMode | null>(null);
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<string | null>(null);
  const touchMode = mobileTouchMode ?? toTouchMode(interactionMode, isLocked);

  const closeMobileTools = () => setIsMobileOpen(false);
  const reportToolbarActionError = (message: string) => (error: unknown) => {
    console.error(message, error);
  };
  const runToolbarAction = (operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch(reportToolbarActionError(errorMessage));
  };

  useEffect(() => {
    if (touchMode !== "connect") {
      setConnectSourceNodeId(null);
      return;
    }

    const handleNodeClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const nodeElement = target?.closest?.(".react-flow__node") as HTMLElement | null;
      const nodeId = nodeElement?.dataset?.id ?? nodeElement?.getAttribute("data-id");
      if (!nodeId) return;

      event.preventDefault();
      event.stopPropagation();

      const flowNodes = getNodes();
      const tappedNode = flowNodes.find((node) => node.id === nodeId);
      if (!tappedNode) return;

      if (!connectSourceNodeId) {
        setConnectSourceNodeId(nodeId);
        return;
      }

      if (connectSourceNodeId === nodeId) {
        setConnectSourceNodeId(null);
        return;
      }

      const sourceNode = flowNodes.find((node) => node.id === connectSourceNodeId);
      const targetNode = tappedNode;
      const label = window.prompt("Describe la relación", "relacionado con")?.trim() || "relacionado con";
      const sourceEntityId = typeof sourceNode?.data?.entityId === "string" ? sourceNode.data.entityId : undefined;
      const targetEntityId = typeof targetNode.data?.entityId === "string" ? targetNode.data.entityId : undefined;

      runToolbarAction(
        (async () => {
          if (sourceEntityId && targetEntityId) {
            await connectCanvasNodes({
              canvasId,
              sourceNode: { id: connectSourceNodeId, entityId: sourceEntityId },
              targetNode: { id: nodeId, entityId: targetEntityId },
              edge: { label, status: "draft", visibility: "dm", style: "solid" },
              relation: { relationType: relationTypeFromLabel(label), visibility: { kind: "dm_only" } },
              createRelation,
              addEdgeToCanvas,
            });
          } else {
            await addEdgeToCanvas(canvasId, {
              sourceNodeId: connectSourceNodeId,
              targetNodeId: nodeId,
              label,
              status: "draft",
              visibility: "dm",
              style: "solid",
            });
          }

          setConnectSourceNodeId(null);
          setMobileTouchMode("explore");
          onModeChange("pan");
          onLockChange(true);
        })(),
        "No se pudo conectar los nodos del canvas."
      );
    };

    document.addEventListener("click", handleNodeClick, true);
    return () => document.removeEventListener("click", handleNodeClick, true);
  }, [addEdgeToCanvas, canvasId, connectSourceNodeId, createRelation, getNodes, onLockChange, onModeChange, touchMode]);

  const handleAddNote = () => {
    runToolbarAction(
      placeNodeOnCanvas(canvasId, { kind: "note", text: "", color: "yellow", x: 200, y: 200 }).then(closeMobileTools),
      "No se pudo crear la nota en el canvas."
    );
  };

  const handleAddGroup = () => {
    runToolbarAction(
      placeNodeOnCanvas(canvasId, { kind: "group", title: t("canvas.toolbar.newGroup"), color: "purple", x: 200, y: 200, width: 340, height: 220 }).then(closeMobileTools),
      "No se pudo crear el grupo en el canvas."
    );
  };

  const handleModeChange = (mode: InteractionMode) => {
    setMobileTouchMode(null);
    setConnectSourceNodeId(null);
    onModeChange(mode);
    closeMobileTools();
  };

  const handleTouchModeChange = (mode: CanvasTouchMode) => {
    setMobileTouchMode(mode);
    setConnectSourceNodeId(null);
    onModeChange(toDesktopInteractionMode(mode));
    onLockChange(mode === "explore" || mode === "connect");
    closeMobileTools();
  };

  const handleFitView = () => {
    runToolbarAction(fitView({ padding: 0.25, duration: 400 }), "No se pudo ajustar la vista del canvas.");
    closeMobileTools();
  };

  const handleFocusSelection = () => {
    const selectedNodes = getNodes().filter(n => n.selected);
    if (selectedNodes.length > 0) {
      runToolbarAction(fitView({ nodes: selectedNodes, padding: 0.3, duration: 400 }), "No se pudo enfocar la selección.");
    } else {
      runToolbarAction(fitView({ padding: 0.25, duration: 400 }), "No se pudo ajustar la vista del canvas.");
    }
    closeMobileTools();
  };

  const handleZoomIn = () => {
    runToolbarAction(zoomIn({ duration: 200 }), "No se pudo acercar el canvas.");
    closeMobileTools();
  };

  const handleZoomOut = () => {
    runToolbarAction(zoomOut({ duration: 200 }), "No se pudo alejar el canvas.");
    closeMobileTools();
  };

  const handleMinimapToggle = () => {
    onMinimapToggle();
    closeMobileTools();
  };

  const handleLockToggle = () => {
    setMobileTouchMode(null);
    setConnectSourceNodeId(null);
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
              if (gNode) {
                runToolbarAction(fitView({ nodes: [gNode], padding: 0.25, duration: 400 }), "No se pudo enfocar el grupo.");
              }
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

  const desktopToolbarContent = (
    <div className="canvas-toolbar">
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${interactionMode === "select" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("select")} title={t("canvas.toolbar.selectMode")}><MousePointer2 size={15} /></button>
        <button className={`canvas-toolbar__btn ${interactionMode === "pan" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("pan")} title={t("canvas.toolbar.panMode")}><Hand size={15} /></button>
        <button className={`canvas-toolbar__btn ${interactionMode === "multiselect" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleModeChange("multiselect")} title={t("canvas.toolbar.multiSelectMode")}><BoxSelect size={15} /></button>
      </div>
      <div className="canvas-toolbar__divider" />
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleAddNote} title={t("canvas.toolbar.quickNote")}><StickyNote size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleAddGroup} title={t("canvas.toolbar.visualGroup")}><Frame size={15} /></button>
      </div>
      <div className="canvas-toolbar__divider" />
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleFitView} title={t("canvas.toolbar.fitView")}><Maximize2 size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleFocusSelection} title={t("canvas.toolbar.focusSelection")}><Target size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleZoomIn} title={t("canvas.toolbar.zoomIn")}><ZoomIn size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleZoomOut} title={t("canvas.toolbar.zoomOut")}><ZoomOut size={15} /></button>
        <button className={`canvas-toolbar__btn ${showMinimap ? "canvas-toolbar__btn--active" : ""}`} onClick={handleMinimapToggle} title={t("canvas.toolbar.minimap")}><Map size={15} /></button>
        {groupFocusSelect}
      </div>
      <div className="canvas-toolbar__divider" />
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${isLocked ? "canvas-toolbar__btn--active canvas-toolbar__btn--warning" : ""}`} onClick={handleLockToggle} title={isLocked ? t("canvas.toolbar.unlockPositions") : t("canvas.toolbar.lockPositions")}>
          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
      </div>
    </div>
  );

  const mobileToolbarContent = (
    <div className="canvas-toolbar canvas-toolbar--touch">
      <span className="canvas-mobile-tools-section">Modo táctil</span>
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${touchMode === "explore" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleTouchModeChange("explore")} title="Explorar: arrastra el mapa y toca tarjetas para verlas"><Hand size={15} /></button>
        <button className={`canvas-toolbar__btn ${touchMode === "edit" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleTouchModeChange("edit")} title="Editar: arrastra tarjetas y toca para seleccionarlas"><MousePointer2 size={15} /></button>
        <button className={`canvas-toolbar__btn ${touchMode === "connect" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleTouchModeChange("connect")} title="Conectar: toca origen y destino"><Link2 size={15} /></button>
        <button className={`canvas-toolbar__btn ${touchMode === "multi" ? "canvas-toolbar__btn--active" : ""}`} onClick={() => handleTouchModeChange("multi")} title="Seleccionar varias tarjetas"><BoxSelect size={15} /></button>
      </div>
      <div className="canvas-toolbar__divider" />
      <span className="canvas-mobile-tools-section">Crear</span>
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleAddNote} title={t("canvas.toolbar.quickNote")}><StickyNote size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleAddGroup} title={t("canvas.toolbar.visualGroup")}><Frame size={15} /></button>
      </div>
      <div className="canvas-toolbar__divider" />
      <span className="canvas-mobile-tools-section">Vista</span>
      <div className="canvas-toolbar__group">
        <button className="canvas-toolbar__btn" onClick={handleFitView} title={t("canvas.toolbar.fitView")}><Maximize2 size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleFocusSelection} title={t("canvas.toolbar.focusSelection")}><Target size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleZoomIn} title={t("canvas.toolbar.zoomIn")}><ZoomIn size={15} /></button>
        <button className="canvas-toolbar__btn" onClick={handleZoomOut} title={t("canvas.toolbar.zoomOut")}><ZoomOut size={15} /></button>
        <button className={`canvas-toolbar__btn ${showMinimap ? "canvas-toolbar__btn--active" : ""}`} onClick={handleMinimapToggle} title={t("canvas.toolbar.minimap")}><Map size={15} /></button>
        {groupFocusSelect}
      </div>
      <div className="canvas-toolbar__divider" />
      <span className="canvas-mobile-tools-section">Seguridad</span>
      <div className="canvas-toolbar__group">
        <button className={`canvas-toolbar__btn ${isLocked ? "canvas-toolbar__btn--active canvas-toolbar__btn--warning" : ""}`} onClick={handleLockToggle} title={isLocked ? t("canvas.toolbar.unlockPositions") : t("canvas.toolbar.lockPositions")}>
          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>
      </div>
    </div>
  );

  const touchModeLabel = touchMode === "connect"
    ? (connectSourceNodeId ? "Toca la tarjeta destino" : "Toca la tarjeta origen")
    : touchMode === "edit"
      ? "Editar: arrastra tarjetas"
      : touchMode === "multi"
        ? "Selección múltiple"
        : "Explorar: arrastra el mapa";

  return (
    <>
      <Panel position="top-center" className="canvas-toolbar-panel canvas-toolbar-panel--desktop" style={{ marginTop: "8px" }}>{desktopToolbarContent}</Panel>
      <Panel position="top-center" className="canvas-mobile-mode-panel">
        <div className={`canvas-mobile-mode-pill canvas-mobile-mode-pill--${touchMode}`}>
          {touchMode === "connect" && <Link2 size={13} />}
          {touchMode !== "connect" && (touchMode === "explore" ? <Hand size={13} /> : touchMode === "multi" ? <BoxSelect size={13} /> : <MousePointer2 size={13} />)}
          <span>{touchModeLabel}</span>
        </div>
      </Panel>
      <Panel position="bottom-right" className="canvas-toolbar-panel canvas-toolbar-panel--mobile">
        {isMobileOpen && (
          <>
            <button type="button" className="canvas-mobile-tools-backdrop" onClick={closeMobileTools} aria-label="Cerrar herramientas del Canvas" />
            <div className="canvas-mobile-tools-popover" role="dialog" aria-label="Herramientas del Canvas">
              <div className="canvas-mobile-tools-popover__header">
                <span>Herramientas</span>
                <button type="button" onClick={closeMobileTools} aria-label="Cerrar herramientas"><X size={16} /></button>
              </div>
              {mobileToolbarContent}
            </div>
          </>
        )}
        <button type="button" className={`canvas-mobile-tools-fab ${isMobileOpen ? "canvas-mobile-tools-fab--open" : ""}`} onClick={() => setIsMobileOpen((open) => !open)} aria-expanded={isMobileOpen} aria-label="Abrir herramientas del Canvas"><Wrench size={20} /></button>
      </Panel>
    </>
  );
}
