import React from "react";
import { Panel, useReactFlow } from "reactflow";
import { useCampaignStore } from "../../stores/campaignStore.js";
import {
  MousePointer2, Hand, StickyNote, Frame, Maximize2,
  ZoomIn, ZoomOut, Map, Lock, Unlock
} from "lucide-react";

export type InteractionMode = "select" | "pan";

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
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { placeNodeOnCanvas } = useCampaignStore();

  const handleAddNote = async () => {
    await placeNodeOnCanvas(canvasId, {
      kind: "note",
      text: "",
      color: "yellow",
      x: 200,
      y: 200,
    });
  };

  const handleAddGroup = async () => {
    await placeNodeOnCanvas(canvasId, {
      kind: "group",
      title: "Nuevo grupo",
      color: "purple",
      x: 200,
      y: 200,
      width: 340,
      height: 220,
    });
  };

  return (
    <Panel position="top-center" style={{ marginTop: "8px" }}>
      <div className="canvas-toolbar">
        {/* Mode group */}
        <div className="canvas-toolbar__group">
          <button
            className={`canvas-toolbar__btn ${interactionMode === "select" ? "canvas-toolbar__btn--active" : ""}`}
            onClick={() => onModeChange("select")}
            title="Seleccionar / Mover nodos (V)"
          >
            <MousePointer2 size={15} />
          </button>
          <button
            className={`canvas-toolbar__btn ${interactionMode === "pan" ? "canvas-toolbar__btn--active" : ""}`}
            onClick={() => onModeChange("pan")}
            title="Mover cámara (H)"
          >
            <Hand size={15} />
          </button>
        </div>

        <div className="canvas-toolbar__divider" />

        {/* Add group */}
        <div className="canvas-toolbar__group">
          <button
            className="canvas-toolbar__btn"
            onClick={handleAddNote}
            title="Añadir nota rápida (N)"
          >
            <StickyNote size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={handleAddGroup}
            title="Añadir grupo visual (G)"
          >
            <Frame size={15} />
          </button>
        </div>

        <div className="canvas-toolbar__divider" />

        {/* View group */}
        <div className="canvas-toolbar__group">
          <button
            className="canvas-toolbar__btn"
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            title="Ajustar vista (F)"
          >
            <Maximize2 size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={() => zoomIn({ duration: 200 })}
            title="Acercar (+)"
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={() => zoomOut({ duration: 200 })}
            title="Alejar (-)"
          >
            <ZoomOut size={15} />
          </button>
          <button
            className={`canvas-toolbar__btn ${showMinimap ? "canvas-toolbar__btn--active" : ""}`}
            onClick={onMinimapToggle}
            title="Minimapa"
          >
            <Map size={15} />
          </button>
        </div>

        <div className="canvas-toolbar__divider" />

        {/* Lock group */}
        <div className="canvas-toolbar__group">
          <button
            className={`canvas-toolbar__btn ${isLocked ? "canvas-toolbar__btn--active canvas-toolbar__btn--warning" : ""}`}
            onClick={() => onLockChange(!isLocked)}
            title={isLocked ? "Desbloquear posiciones de nodos" : "Bloquear posiciones (modo presentación)"}
          >
            {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
        </div>
      </div>
    </Panel>
  );
}
