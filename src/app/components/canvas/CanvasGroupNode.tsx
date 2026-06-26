import React, { useState, useEffect } from "react";
import { NodeResizer } from "reactflow";
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

export function CanvasGroupNode({ id, data, selected }: CanvasGroupNodeProps) {
  const { updateCanvasNode, updateCanvasNodesLayout } = useCampaignStore();
  const [localTitle, setLocalTitle] = useState(data.title || "Grupo");

  useEffect(() => {
    setLocalTitle(data.title || "Grupo");
  }, [data.title]);

  const handleBlur = async () => {
    if (localTitle !== data.title) {
      await updateCanvasNode(data.canvasId, id, { title: localTitle });
    }
  };

  const groupColor = data.color || "purple";

  return (
    <div className={`canvas-node-card group-node group-${groupColor} ${selected ? "selected" : ""}`}>
      {/* NodeResizer shows handle UI only when selected */}
      <NodeResizer
        minWidth={150}
        minHeight={100}
        isVisible={selected}
        lineClassName="group-resizer-line"
        handleClassName="group-resizer-handle"
        onResizeEnd={(event, params) => {
          const { x, y, width, height } = params;
          updateCanvasNodesLayout(data.canvasId, [
            { nodeId: id, x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
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
