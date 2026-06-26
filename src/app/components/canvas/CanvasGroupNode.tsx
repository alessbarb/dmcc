import React, { useState, useEffect } from "react";
import { NodeResizer, useReactFlow } from "reactflow";
import { useCampaignStore } from "../../stores/campaignStore.js";

export interface CanvasGroupNodeProps {
  id: string;
  data: {
    canvasId: string;
    title?: string;
    color?: string;
  };
  selected?: boolean;
}

const CHILD_CARD_W = 162;
const CHILD_CARD_H = 190;
const GROUP_PAD = 20;
const GROUP_HEADER_H = 32;

export function CanvasGroupNode({ id, data, selected }: CanvasGroupNodeProps) {
  const { updateCanvasNode, updateCanvasNodesLayout } = useCampaignStore();
  const { getNodes } = useReactFlow();
  const [localTitle, setLocalTitle] = useState(data.title || "Grupo");

  useEffect(() => {
    setLocalTitle(data.title || "Grupo");
  }, [data.title]);

  const handleBlur = async () => {
    if (localTitle !== data.title) {
      await updateCanvasNode(data.canvasId, id, { title: localTitle });
    }
  };

  // Compute min size from current children
  const children = getNodes().filter(n => n.parentNode === id);
  const minW = children.length > 0
    ? Math.max(160, Math.max(...children.map(c => c.position.x + (c.width ?? CHILD_CARD_W))) + GROUP_PAD)
    : 160;
  const minH = children.length > 0
    ? Math.max(120, Math.max(...children.map(c => c.position.y + (c.height ?? CHILD_CARD_H))) + GROUP_PAD + GROUP_HEADER_H)
    : 120;

  const GROUP_COLORS: Record<string, string> = {
    purple: "#7c3aed",
    blue:   "#2563eb",
    green:  "#059669",
    yellow: "#d97706",
    pink:   "#db2777",
  };

  const borderColor = GROUP_COLORS[data.color || "purple"] ?? GROUP_COLORS.purple;

  return (
    <div
      className={`canvas-node-card group-node ${selected ? "selected" : ""}`}
      style={{ borderColor, backgroundColor: `${borderColor}08` }}
    >
      <NodeResizer
        minWidth={minW}
        minHeight={minH}
        isVisible={selected}
        lineClassName="group-resizer-line"
        handleClassName="group-resizer-handle"
        onResizeEnd={(_event, params) => {
          const { x, y, width, height } = params;
          updateCanvasNodesLayout(data.canvasId, [
            {
              nodeId: id,
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(Math.max(width, minW)),
              height: Math.round(Math.max(height, minH)),
            }
          ]);
        }}
      />

      <div className="group-header nodrag">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleBlur}
          className="group-title-input"
          placeholder="Nombre del grupo..."
        />
      </div>
    </div>
  );
}
