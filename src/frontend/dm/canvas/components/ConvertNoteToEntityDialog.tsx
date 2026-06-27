import React, { useState } from "react";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { Wand2, X } from "lucide-react";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


export interface ConvertNoteToEntityDialogProps {
  canvasId: string;
  nodeId: string;
  initialTitle: string;
  initialSummary: string;
  onClose: () => void;
}

export function ConvertNoteToEntityDialog({
  canvasId,
  nodeId,
  initialTitle,
  initialSummary,
  onClose
}: ConvertNoteToEntityDialogProps) {
  const { t } = useTranslation();
  const { convertNoteToEntity } = useCampaignStore();
  const [entityType, setEntityType] = useState("npc");
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState(initialSummary);
  const [visibilityKind, setVisibilityKind] = useState<"dm_only" | "public">("dm_only");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await convertNoteToEntity(canvasId, nodeId, {
      entityType,
      title,
      subtitle: subtitle || undefined,
      summary: summary || undefined,
      visibility: { kind: visibilityKind }
    });

    onClose();
  };

  const ENTITY_OPTIONS = [
    { value: "npc", label: "Personaje No Jugador (PNJ)" },
    { value: "location", label: t("canvas.palette.typeLabelLocation") },
    { value: "quest", label: t("canvas.palette.typeLabelQuest") },
    { value: "clue", label: "Pista" },
    { value: "secret", label: t("canvas.palette.typeLabelSecret") },
    { value: "item", label: "Objeto" },
    { value: "creature", label: "Criatura / Monstruo" },
    { value: "faction", label: t("canvas.palette.typeLabelFaction") },
    { value: "scene", label: t("canvas.palette.typeLabelScene") },
    { value: "encounter", label: "Encuentro o Combate" },
    { value: "consequence", label: "Consecuencia o Efecto" },
    { value: "rumor", label: "Rumor" },
    { value: "handout", label: t("canvas.palette.typeLabelHandout") },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
        <div className="modal-header">
          <h2>
            <Wand2 size={18} style={{ color: "var(--primary)" }} />
            Convertir nota en entidad
          </h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label>Tipo de entidad de campaña</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="form-select"
              >
                {ENTITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nombre / Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
                placeholder={t("canvas.palette.searchEntityExampleHint")}
              />
            </div>

            <div className="form-group">
              <label>Subtítulo o rol rápido (opcional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="form-input"
                placeholder="Ej. Tabernera desconfiada, Mazmorra olvidada..."
              />
            </div>

            <div className="form-group">
              <label>Descripción / Notas públicas</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder={t("canvas.node.generalNotesPlaceholder")}
              />
            </div>

            <div className="form-group">
              <label>Visibilidad inicial</label>
              <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibilityKind === "dm_only"}
                    onChange={() => setVisibilityKind("dm_only")}
                  />
                  Solo DM (Oculto)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibilityKind === "public"}
                    onChange={() => setVisibilityKind("public")}
                  />
                  Público (Revelado)
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Wand2 size={14} /> Convertir ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
