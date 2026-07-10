import React from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import {
  MousePointer2, Hand, BoxSelect, StickyNote, Frame, Maximize2,
  ZoomIn, ZoomOut, Map, Lock, Unlock, Target
} from "lucide-react";

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
      title: t("canvas.toolbar.newGroup"),
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
            title={t("canvas.toolbar.selectMode")}
          >
            <MousePointer2 size={15} />
          </button>
          <button
            className={`canvas-toolbar__btn ${interactionMode === "pan" ? "canvas-toolbar__btn--active" : ""}`}
            onClick={() => onModeChange("pan")}
            title={t("canvas.toolbar.panMode")}
          >
            <Hand size={15} />
          </button>
          <button
            className={`canvas-toolbar__btn ${interactionMode === "multiselect" ? "canvas-toolbar__btn--active" : ""}`}
            onClick={() => onModeChange("multiselect")}
            title={t("canvas.toolbar.multiSelectMode")}
          >
            <BoxSelect size={15} />
          </button>
        </div>

        <div className="canvas-toolbar__divider" />

        {/* Add group */}
        <div className="canvas-toolbar__group">
          <button
            className="canvas-toolbar__btn"
            onClick={handleAddNote}
            title={t("canvas.toolbar.quickNote")}
          >
            <StickyNote size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={handleAddGroup}
            title={t("canvas.toolbar.visualGroup")}
          >
            <Frame size={15} />
          </button>
        </div>

        <div className="canvas-toolbar__divider" />

        {/* View group */}
        <div className="canvas-toolbar__group">
          <button
            className="canvas-toolbar__btn"
            onClick={() => fitView({ padding: 0.25, duration: 400 })}
            title={t("canvas.toolbar.fitView")}
          >
            <Maximize2 size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={() => {
              const selectedNodes = getNodes().filter(n => n.selected);
              if (selectedNodes.length > 0) {
                fitView({ nodes: selectedNodes, padding: 0.3, duration: 400 });
              } else {
                fitView({ padding: 0.25, duration: 400 });
              }
            }}
            title={t("canvas.toolbar.focusSelection")}
          >
            <Target size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={() => zoomIn({ duration: 200 })}
            title={t("canvas.toolbar.zoomIn")}
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="canvas-toolbar__btn"
            onClick={() => zoomOut({ duration: 200 })}
            title={t("canvas.toolbar.zoomOut")}
          >
            <ZoomOut size={15} />
          </button>
          <button
            className={`canvas-toolbar__btn ${showMinimap ? "canvas-toolbar__btn--active" : ""}`}
            onClick={onMinimapToggle}
            title={t("canvas.toolbar.minimap")}
          >
            <Map size={15} />
          </button>

          {(() => {
            const groups = getNodes().filter(n => n.type === "group");
            if (groups.length === 0) return null;
            return (
              <>
                <div style={{ width: "1px", height: "14px", backgroundColor: "var(--border-color)", margin: "0 2px", opacity: 0.4 }} />
                <select
                  onChange={(e) => {
                    const groupId = e.target.value;
                    if (groupId) {
                      const gNode = getNodes().find(n => n.id === groupId);
                      if (gNode) {
                        fitView({ nodes: [gNode], padding: 0.25, duration: 400 });
                      }
                    }
                    e.target.value = "";
                  }}
                  className="canvas-toolbar__select"
                  style={{
                    fontSize: "10px",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-main)",
                    padding: "2px 4px",
                    cursor: "pointer",
                    maxWidth: "90px",
                    outline: "none"
                  }}
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
          })()}
        </div>

        <div className="canvas-toolbar__divider" />

        {/* Lock group */}
        <div className="canvas-toolbar__group">
          <button
            className={`canvas-toolbar__btn ${isLocked ? "canvas-toolbar__btn--active canvas-toolbar__btn--warning" : ""}`}
            onClick={() => onLockChange(!isLocked)}
            title={isLocked ? t("canvas.toolbar.unlockPositions") : t("canvas.toolbar.lockPositions")}
          >
            {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
        </div>
      </div>
    </Panel>
  );
}
