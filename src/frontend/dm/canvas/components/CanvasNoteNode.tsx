import { useState, useEffect, useRef, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { Wand2, Trash2 } from "lucide-react";
import { ConvertNoteToEntityDialog } from "./ConvertNoteToEntityDialog.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


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
  const { t } = useTranslation();
  const { updateCanvasNode, removeNodeFromCanvas } = useCampaignStore();
  const [localText, setLocalText] = useState(data.text || "");
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const reportNoteActionError = (message: string) => (error: unknown) => {
    console.error(message, error);
  };

  const runNoteAction = (operation: Promise<unknown>, errorMessage: string) => {
    void operation.catch(reportNoteActionError(errorMessage));
  };

  // Autofocus when note is newly created (empty text)
  useEffect(() => {
    if (textareaRef.current && (data.text === undefined || data.text === "")) {
      textareaRef.current.focus();
    }
  }, []);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Sync state if changed externally
  useEffect(() => {
    setLocalText(data.text || "");
  }, [data.text]);

  // Resize whenever text changes
  useEffect(() => {
    autoResize();
  }, [localText, autoResize]);

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
              onClick={() => {
                runNoteAction(handleColorChange(c), "No se pudo actualizar el color de la nota.");
              }}
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
            onClick={() => {
              runNoteAction(removeNodeFromCanvas(data.canvasId, id), "No se pudo eliminar la nota.");
            }}
            className="note-action-btn btn-delete text-critical"
            title={t("canvas.noteNode.deleteNote")}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="note-content-area nodrag">
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => {
            runNoteAction(handleBlur(), "No se pudo guardar la nota.");
          }}
          className="note-textarea"
          placeholder={t("canvas.noteNode.contentPlaceholder")}
        />
      </div>

      {selected && (
        <div className="note-convert-footer nodrag">
          <button
            type="button"
            className="note-convert-btn"
            onClick={() => setIsConvertOpen(true)}
          >
            ✨ Convertir a entidad
          </button>
        </div>
      )}

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
