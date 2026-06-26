import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { Wand2, Trash2 } from "lucide-react";
import { ConvertNoteToEntityDialog } from "./ConvertNoteToEntityDialog.js";

export interface CanvasNoteNodeProps {
  id: string;
  data: {
    canvasId: string;
    text?: string;
    color?: "yellow" | "blue" | "green" | "pink" | "purple";
  };
  selected?: boolean;
}

const COLOR_CLASSES = {
  yellow: "note-yellow",
  blue: "note-blue",
  green: "note-green",
  pink: "note-pink",
  purple: "note-purple",
};

export function CanvasNoteNode({ id, data, selected }: CanvasNoteNodeProps) {
  const { updateCanvasNode, removeNodeFromCanvas } = useCampaignStore();
  const [localText, setLocalText] = useState(data.text || "");
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  // Sync state if changed externally
  useEffect(() => {
    setLocalText(data.text || "");
  }, [data.text]);

  const handleBlur = async () => {
    if (localText !== data.text) {
      await updateCanvasNode(data.canvasId, id, { text: localText });
    }
  };

  const handleColorChange = async (color: "yellow" | "blue" | "green" | "pink" | "purple") => {
    await updateCanvasNode(data.canvasId, id, { color });
  };

  const noteColorClass = COLOR_CLASSES[data.color || "yellow"];

  return (
    <div className={`canvas-node-card note-node ${noteColorClass} ${selected ? "selected" : ""}`}>
      {/* Target handle on top */}
      <Handle type="target" position={Position.Top} className="canvas-handle target-handle" />

      <div className="note-toolbar nodrag">
        {/* Color selectors */}
        <div className="note-color-selectors">
          {(["yellow", "blue", "green", "pink", "purple"] as const).map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`note-color-dot color-${c} ${data.color === c || (!data.color && c === "yellow") ? "active" : ""}`}
              title={`Color ${c}`}
            />
          ))}
        </div>

        {/* Quick action buttons */}
        <div className="note-quick-actions">
          <button
            onClick={() => setIsConvertOpen(true)}
            className="note-action-btn btn-convert"
            title="Convertir nota en NPC/Lugar..."
          >
            <Wand2 size={12} />
          </button>
          <button
            onClick={() => removeNodeFromCanvas(data.canvasId, id)}
            className="note-action-btn btn-delete text-critical"
            title="Eliminar nota"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="note-content-area nodrag">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          className="note-textarea"
          placeholder="Escribe una idea rápida..."
        />
      </div>

      {isConvertOpen && (
        <ConvertNoteToEntityDialog
          canvasId={data.canvasId}
          nodeId={id}
          initialTitle={localText.substring(0, 30).trim() || "Nueva Entidad"}
          initialSummary={localText}
          onClose={() => setIsConvertOpen(false)}
        />
      )}

      {/* Source handle on bottom */}
      <Handle type="source" position={Position.Bottom} className="canvas-handle source-handle" />
    </div>
  );
}
