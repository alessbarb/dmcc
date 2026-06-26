import React, { useState } from "react";
import { useCampaignStore } from "../../stores/campaignStore.js";
import { GitCommit, X } from "lucide-react";

export interface RelationshipTypePopoverProps {
  canvasId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceEntity?: any;
  targetEntity?: any;
  onSubmit: (data: {
    relationshipId?: string;
    label: string;
    status: "draft" | "domain";
    visibility?: "dm" | "public";
    style?: "solid" | "dashed" | "secret" | "weak" | "strong";
    description?: string;
  }) => void;
  onCancel: () => void;
}

export function RelationshipTypePopover({
  canvasId: _canvasId,
  sourceNodeId: _sourceNodeId,
  targetNodeId: _targetNodeId,
  sourceEntity,
  targetEntity,
  onSubmit,
  onCancel
}: RelationshipTypePopoverProps) {
  const { createRelation } = useCampaignStore();
  const [relationType, setRelationType] = useState("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [visibilityKind, setVisibilityKind] = useState<"dm_only" | "public">("dm_only");
  const [edgeStyle, setEdgeStyle] = useState<"solid" | "dashed" | "secret" | "weak" | "strong">("solid");

  // Determine if it CAN be a domain relation (requires both ends to be campaign entities)
  const canBeDomainRelation = !!(sourceEntity && targetEntity);
  const [status, setStatus] = useState<"draft" | "domain">(canBeDomainRelation ? "domain" : "draft");

  // Tailored relation options
  const getRelationOptions = () => {
    if (!sourceEntity || !targetEntity) {
      return [{ value: "relacionado_con", label: "relacionado con" }];
    }

    const srcType = sourceEntity.entityType;
    const tgtType = targetEntity.entityType;

    if (srcType === "npc" && tgtType === "location") {
      return [
        { value: "lives_in", label: "vive en" },
        { value: "works_for", label: "trabaja en" },
        { value: "protects", label: "protege" },
        { value: "located_in", label: "se encuentra en" },
        { value: "hates", label: "quiere destruir" },
      ];
    }

    if (srcType === "npc" && tgtType === "npc") {
      return [
        { value: "ally_of", label: "aliado de" },
        { value: "enemy_of", label: "enemigo de" },
        { value: "member_of", label: "familia de" },
        { value: "works_for", label: "sirve a" },
        { value: "suspects", label: "sospecha de" },
        { value: "hates", label: "odia a" },
      ];
    }

    if (srcType === "clue" && tgtType === "location") {
      return [
        { value: "points_to", label: "apunta a" },
        { value: "located_in", label: "se encuentra en" },
        { value: "reveals", label: "revela información de" },
      ];
    }

    // Generic defaults
    return [
      { value: "relacionado_con", label: "relacionado con" },
      { value: "hides", label: "oculta" },
      { value: "unlocks", label: "desbloquea" },
      { value: "causes", label: "causa" },
      { value: "contradicts", label: "contradice" },
      { value: "confirms", label: "confirma" },
      { value: "located_in", label: "miembro de / está en" },
      { value: "knows", label: "conoce" },
    ];
  };

  const options = getRelationOptions();

  // Set default relationType to first option
  React.useEffect(() => {
    if (options.length > 0 && !relationType) {
      setRelationType(options[0].value);
    }
  }, [options]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLabel = relationType === "custom" ? customType : (options.find(o => o.value === relationType)?.label || relationType);
    if (!selectedLabel.trim()) return;

    let relationshipId: string | undefined;

    if (status === "domain" && sourceEntity && targetEntity) {
      try {
        const relTypeVal = relationType === "custom" ? `custom:${customType}` : relationType;
        relationshipId = await createRelation({
          sourceEntityId: sourceEntity.entityId,
          targetEntityId: targetEntity.entityId,
          relationType: relTypeVal,
          description: description || undefined,
          visibility: { kind: visibilityKind }
        } as any);
      } catch (err) {
        console.error("Failed to create domain relation", err);
        return;
      }
    }

    onSubmit({
      relationshipId,
      label: selectedLabel,
      status,
      visibility: visibilityKind === "dm_only" ? "dm" : "public",
      style: edgeStyle,
      description: description || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h2>
            <GitCommit size={18} style={{ color: "var(--primary)" }} />
            Crear conexión
          </h2>
          <button onClick={onCancel} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label>Tipo de conexión</label>
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  className="form-select"
                >
                  {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  <option value="custom">-- Otro (Escribir personalizado) --</option>
                </select>

                {relationType === "custom" && (
                  <input
                    type="text"
                    placeholder="Ej. odia, apoya a, custodia..."
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Nivel de relación</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="relStatus"
                    value="domain"
                    disabled={!canBeDomainRelation}
                    checked={status === "domain"}
                    onChange={() => setStatus("domain")}
                    style={{ marginTop: "3px" }}
                  />
                  <div>
                    <strong>Relación real de campaña</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      Registra esta conexión en el lore de la campaña. visible en búsquedas, grafos, etc.
                    </div>
                  </div>
                </label>
                
                <label style={{ display: "flex", alignItems: "start", gap: "8px", fontWeight: "normal", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="relStatus"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    style={{ marginTop: "3px" }}
                  />
                  <div>
                    <strong>Borrador visual</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      Solo dibuja una línea visual en este canvas. Útil para ideas y bocetos rápidos.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Estilo de línea</label>
              <select
                value={edgeStyle}
                onChange={(e) => setEdgeStyle(e.target.value as any)}
                className="form-select"
              >
                <option value="solid">Línea sólida (normal)</option>
                <option value="dashed">Línea discontinua (débil/borrador)</option>
                <option value="secret">Línea de secreto (oculta/roja)</option>
                <option value="strong">Línea gruesa (fuerte)</option>
                <option value="weak">Línea fina (tenue)</option>
              </select>
            </div>

            {status === "domain" && (
              <>
                <div className="form-group">
                  <label>Descripción de la relación (opcional)</label>
                  <input
                    type="text"
                    placeholder="Detalles sobre esta relación..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Visibilidad de la relación</label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="relVisibility"
                        checked={visibilityKind === "dm_only"}
                        onChange={() => setVisibilityKind("dm_only")}
                      />
                      Solo DM
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="relVisibility"
                        checked={visibilityKind === "public"}
                        onChange={() => setVisibilityKind("public")}
                      />
                      Público
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Conectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
