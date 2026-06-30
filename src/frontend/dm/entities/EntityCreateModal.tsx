import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { getRuleSystem } from "@core/domain/rules/index.js";
import { TypeMetadataForm } from "./TypeMetadataForm.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";


interface EntityCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EntityCreateModal({ isOpen, onClose }: EntityCreateModalProps) {
  const { t } = useTranslation();
  const { campaignState, createEntity, setIsEntityModalOpen } = useCampaignStore();

  const [entityForm, setEntityForm] = useState({
    entityType: "npc",
    title: "",
    subtitle: "",
    summary: "",
    content: "",
    status: "known",
    importance: "normal",
    visibility: { kind: "dm_only" },
    metadata: { role: "", attitudeToParty: "neutral", goal: "", imageUrl: "" } as any
  });

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<Partial<typeof entityForm>>).detail ?? {};
      const nextType = typeof detail.entityType === "string" ? detail.entityType : "npc";
      let defaultStatus = "active";
      let defaultMetadata: Record<string, any> = {};

      if (nextType === "npc") {
        defaultStatus = "known";
        defaultMetadata = { role: "", attitudeToParty: "neutral", goal: "" };
      } else if (nextType === "location") {
        defaultStatus = "visited";
        defaultMetadata = { locationType: "settlement", atmosphere: "" };
      } else if (nextType === "quest") {
        defaultStatus = "active";
        defaultMetadata = { priority: "main", rewardPromised: "" };
      } else if (nextType === "clue") {
        defaultStatus = "prepared";
        defaultMetadata = { clueType: "verbal", content: "" };
      } else if (nextType === "secret") {
        defaultStatus = "dm_only";
        defaultMetadata = { truth: "" };
      } else if (nextType === "front") {
        defaultStatus = "active";
        defaultMetadata = { stakes: "", countdown: "" };
      } else if (nextType === "consequence") {
        defaultStatus = "pending";
        defaultMetadata = { impact: "", triggerCondition: "" };
      } else if (nextType === "scene") {
        defaultStatus = "planned";
        defaultMetadata = { mood: "", trigger: "" };
      } else if (nextType === "faction") {
        defaultStatus = "active";
        defaultMetadata = { goal: "", attitudeToParty: "neutral", influence: "minor" };
      } else if (nextType === "rumor") {
        defaultStatus = "unverified";
        defaultMetadata = { source: "", truth: "unknown" };
      }

      setEntityForm({
        entityType: nextType,
        title: typeof detail.title === "string" ? detail.title : "",
        subtitle: typeof detail.subtitle === "string" ? detail.subtitle : "",
        summary: typeof detail.summary === "string" ? detail.summary : "",
        content: typeof detail.content === "string" ? detail.content : "",
        status: typeof detail.status === "string" ? detail.status : defaultStatus,
        importance: typeof detail.importance === "string" ? detail.importance : "normal",
        visibility: detail.visibility ?? { kind: "dm_only" },
        metadata: { imageUrl: "", ...defaultMetadata, ...(detail.metadata ?? {}) },
      });
      setIsEntityModalOpen(true);
    };

    window.addEventListener("dmcc:open-entity-template", listener);
    return () => window.removeEventListener("dmcc:open-entity-template", listener);
  }, [campaignState?.campaign?.system, setIsEntityModalOpen]);

  // Sync default status when entity type changes in form
  const handleEntityTypeChange = (type: string) => {
    let defaultStatus = "active";
    let defaultMetadata = {};

    if (type === "npc") {
      defaultStatus = "known";
      defaultMetadata = { role: "", attitudeToParty: "neutral", goal: "" };
    } else if (type === "location") {
      defaultStatus = "visited";
      defaultMetadata = { locationType: "settlement", atmosphere: "" };
    } else if (type === "quest") {
      defaultStatus = "active";
      defaultMetadata = { priority: "main", rewardPromised: "" };
    } else if (type === "clue") {
      defaultStatus = "prepared";
      defaultMetadata = { clueType: "physical", content: "" };
    } else if (type === "secret") {
      defaultStatus = "dm_only";
      defaultMetadata = { truth: "" };
    } else if (type === "clock") {
      defaultStatus = "active";
      defaultMetadata = { maxSegments: 4, currentSegments: 0, meaning: "" };
    } else if (type === "consequence") {
      defaultStatus = "pending";
      defaultMetadata = { impact: "", triggerCondition: "" };
    } else if (type === "player_character") {
      defaultStatus = "active";
      defaultMetadata = getRuleSystem(campaignState?.campaign?.system).getInitialCharacterMetadata();
    } else if (type === "faction") {
      defaultStatus = "active";
      defaultMetadata = { goal: "", attitudeToParty: "neutral", influence: "minor" };
    } else if (type === "item") {
      defaultStatus = "unknown";
      defaultMetadata = { itemType: "artifact", currentHolder: "" };
    } else if (type === "creature") {
      defaultStatus = "alive";
      defaultMetadata = { creatureType: "beast", threat: "moderate" };
    } else if (type === "encounter") {
      defaultStatus = "planned";
      defaultMetadata = { difficulty: "medium", location: "" };
    } else if (type === "scene") {
      defaultStatus = "planned";
      defaultMetadata = { mood: "", trigger: "" };
    } else if (type === "front") {
      defaultStatus = "active";
      defaultMetadata = { stakes: "", countdown: "" };
    } else if (type === "rumor") {
      defaultStatus = "unverified";
      defaultMetadata = { source: "", truth: "unknown" };
    } else if (type === "decision") {
      defaultStatus = "pending";
      defaultMetadata = { options: "", madeAt: "" };
    } else if (type === "rule_reference") {
      defaultStatus = "active";
      defaultMetadata = { system: "", page: "" };
    } else if (type === "handout") {
      defaultStatus = "withheld";
      defaultMetadata = { deliveredAt: "" };
    }

    setEntityForm({
      ...entityForm,
      entityType: type,
      status: defaultStatus,
      metadata: { imageUrl: "", ...defaultMetadata }
    });
  };

  const handleCreateEntitySubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!entityForm.title.trim()) return;
    await createEntity(entityForm);
    onClose();
    setEntityForm({
      entityType: "npc",
      title: "",
      subtitle: "",
      summary: "",
      content: "",
      status: "known",
      importance: "normal",
      visibility: { kind: "dm_only" },
      metadata: { role: "", attitudeToParty: "neutral", goal: "", imageUrl: "" }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontWeight: "700" }}>Crear entidad narrativa</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleCreateEntitySubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Tipo de entidad</label>
              <select
                className="form-select"
                value={entityForm.entityType}
                onChange={(e) => handleEntityTypeChange(e.target.value)}
              >
                <optgroup label={t("entityModal.playerCharacters")}>
                  <option value="npc">PNJ (Personaje No Jugador)</option>
                  <option value="player_character">Personaje jugador</option>
                  <option value="creature">Criatura / Monstruo</option>
                </optgroup>
                <optgroup label="Lugares">
                  <option value="location">Ubicación</option>
                  <option value="scene">Escena</option>
                </optgroup>
                <optgroup label="Narrativa">
                  <option value="quest">Misión</option>
                  <option value="clue">Pista</option>
                  <option value="secret">Secreto</option>
                  <option value="rumor">Rumor</option>
                  <option value="decision">Punto de decisión</option>
                  <option value="consequence">Consecuencia</option>
                  <option value="front">Frente / Amenaza</option>
                  <option value="clock">Reloj narrativo</option>
                </optgroup>
                <optgroup label="Organizaciones y objetos">
                  <option value="faction">Facción / Organización</option>
                  <option value="item">Objeto / Artefacto</option>
                  <option value="encounter">Encuentro</option>
                </optgroup>
                <optgroup label="Referencia">
                  <option value="rule_reference">Regla de referencia</option>
                  <option value="handout">Handout</option>
                  <option value="note">Nota</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Título / Nombre</label>
              <input
                type="text"
                className="form-input"
                value={entityForm.title}
                onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                placeholder="ej: Mira la posaderera"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subtítulo / Clasificación</label>
              <input
                type="text"
                className="form-input"
                value={entityForm.subtitle}
                onChange={(e) => setEntityForm({ ...entityForm, subtitle: e.target.value })}
                placeholder="ej. Aventurero retirado"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resumen breve</label>
              <input
                type="text"
                className="form-input"
                value={entityForm.summary}
                onChange={(e) => setEntityForm({ ...entityForm, summary: e.target.value })}
                placeholder={t("entityModal.descriptionPlaceholder")}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL de la Imagen (PNJ, Entornos, etc.)</label>
              <input
                type="text"
                className="form-input"
                value={entityForm.metadata?.imageUrl || ""}
                onChange={(e) => setEntityForm({
                  ...entityForm,
                  metadata: {
                    ...entityForm.metadata,
                    imageUrl: e.target.value
                  }
                })}
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {entityForm.metadata?.imageUrl && (
                <div style={{ marginTop: "10px", width: "100%", height: "120px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={entityForm.metadata.imageUrl} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Descripción / contenido narrativo</label>
              <textarea
                className="form-textarea"
                value={entityForm.content}
                onChange={(e) => setEntityForm({ ...entityForm, content: e.target.value })}
                placeholder="Historia detallada, reglas, notas..."
              />
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Importancia</label>
                <select
                  className="form-select"
                  value={entityForm.importance}
                  onChange={(e) => setEntityForm({ ...entityForm, importance: e.target.value })}
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <input
                  type="text"
                  className="form-input"
                  value={entityForm.status}
                  onChange={(e) => setEntityForm({ ...entityForm, status: e.target.value })}
                />
              </div>
            </div>

            {/* Customized fields based on type */}
            {(entityForm.entityType === "npc" || entityForm.entityType === "creature") && (
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Posadero, Mago..."
                    value={entityForm.metadata.role || ""}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, role: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Attitude to Party</label>
                  <select
                    className="form-select"
                    value={entityForm.metadata.attitudeToParty || "neutral"}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, attitudeToParty: e.target.value } })}
                  >
                    <option value="friendly">Friendly</option>
                    <option value="neutral">Neutral</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="hostile">Hostile</option>
                  </select>
                </div>
              </div>
            )}
            {(entityForm.entityType === "npc" || entityForm.entityType === "creature") && (
              <div className="form-group">
                <label className="form-label">Goal / Motivation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("entityModal.motivationPlaceholder")}
                  value={entityForm.metadata.goal || ""}
                  onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, goal: e.target.value } })}
                />
              </div>
            )}
            {entityForm.entityType === "player_character" && (
              campaignState?.campaign?.system === "dnd_srd_5_2_1" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Información Básica</h4>
                    <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Perfil del jugador</label>
                        <select className="form-select" value={entityForm.metadata.playerId || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, playerId: e.target.value } })}>
                          <option value="">-- Seleccionar jugador --</option>
                          {(campaignState?.players || []).map((p: any) => (
                            <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Clase *</label>
                        <input type="text" className="form-input" placeholder={t("typeMetadataForm.classPlaceholder")} required value={entityForm.metadata.className || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, className: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subclase {entityForm.metadata.level >= 3 ? "*" : "(Nivel 3+)"}</label>
                        <input type="text" className="form-input" placeholder="Ej. Asesino, Ilusionista" required={entityForm.metadata.level >= 3} value={entityForm.metadata.subclass || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, subclass: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nivel *</label>
                        <input type="number" className="form-input" min={1} max={20} required value={entityForm.metadata.level || 1}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, level: parseInt(e.target.value) || 1 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Especie / Raza *</label>
                        <input type="text" className="form-input" placeholder="Ej. Elfo, Enano" required value={entityForm.metadata.species || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, species: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Trasfondo *</label>
                        <input type="text" className="form-input" placeholder={t("typeMetadataForm.backgroundPlaceholder")} required value={entityForm.metadata.background || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, background: e.target.value } })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Atributos Principales (1-30)</h4>
                    <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Fuerza (STR) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.strength || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, strength: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Destreza (DEX) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.dexterity || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, dexterity: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Constitución (CON) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.constitution || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, constitution: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Inteligencia (INT) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.intelligence || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, intelligence: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sabiduría (WIS) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.wisdom || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, wisdom: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Carisma (CHA) *</label>
                        <input type="number" className="form-input" min={1} max={30} required value={entityForm.metadata.charisma || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, charisma: parseInt(e.target.value) || 10 } })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Estadísticas de Combate y Progreso</h4>
                    <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">CA *</label>
                        <input type="number" className="form-input" min={0} required value={entityForm.metadata.armorClass || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, armorClass: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Iniciativa *</label>
                        <input type="number" className="form-input" required value={entityForm.metadata.initiative || 0}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, initiative: parseInt(e.target.value) || 0 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Velocidad *</label>
                        <input type="number" className="form-input" min={0} required value={entityForm.metadata.speed || 30}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, speed: parseInt(e.target.value) || 30 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PG Actuales *</label>
                        <input type="number" className="form-input" min={0} required value={entityForm.metadata.hitPointsCurrent || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsCurrent: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PG Máximos *</label>
                        <input type="number" className="form-input" min={1} required value={entityForm.metadata.hitPointsMax || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsMax: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PG Temp</label>
                        <input type="number" className="form-input" min={0} value={entityForm.metadata.hitPointsTemp || 0}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitPointsTemp: parseInt(e.target.value) || 0 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dados de Golpe *</label>
                        <input type="text" className="form-input" placeholder="Ej. 1d8, 3d10" required value={entityForm.metadata.hitDice || "1d8"}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, hitDice: e.target.value } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Experiencia (XP)</label>
                        <input type="number" className="form-input" min={0} value={entityForm.metadata.xp || 0}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, xp: parseInt(e.target.value) || 0 } })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Habilidades Pasivas</h4>
                    <div className="grid grid-cols-3" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">Percepción Pasiva *</label>
                        <input type="number" className="form-input" required value={entityForm.metadata.passivePerception || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passivePerception: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Perspicacia Pasiva *</label>
                        <input type="number" className="form-input" required value={entityForm.metadata.passiveInsight || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passiveInsight: parseInt(e.target.value) || 10 } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Investigación Pasiva *</label>
                        <input type="number" className="form-input" required value={entityForm.metadata.passiveInvestigation || 10}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, passiveInvestigation: parseInt(e.target.value) || 10 } })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)", marginBottom: "12px" }}>Competencias, Dotes e Idiomas</h4>
                    <div className="form-group">
                      <label className="form-label">Salvaciones Competentes (ej. dex, con)</label>
                      <input type="text" className="form-input" placeholder="Separadas por comas"
                        value={Array.isArray(entityForm.metadata.savingThrows) ? entityForm.metadata.savingThrows.join(", ") : ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, savingThrows: e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Habilidades Competentes (ej. perception, stealth)</label>
                      <input type="text" className="form-input" placeholder="Separadas por comas"
                        value={Array.isArray(entityForm.metadata.skills) ? entityForm.metadata.skills.join(", ") : ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, skills: e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Idiomas conocidos (ej. Común, Élfico)</label>
                      <input type="text" className="form-input" placeholder="Separados por comas"
                        value={Array.isArray(entityForm.metadata.languages) ? entityForm.metadata.languages.join(", ") : ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dotes (ej. Alerta, Iniciación Mágica)</label>
                      <input type="text" className="form-input" placeholder="Separados por comas"
                        value={Array.isArray(entityForm.metadata.feats) ? entityForm.metadata.feats.join(", ") : ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, feats: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })} />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                      <div className="form-group">
                        <label className="form-label">CD Salvación Conjuros</label>
                        <input type="number" className="form-input" placeholder="Ej. 13" value={entityForm.metadata.spellSaveDC || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, spellSaveDC: parseInt(e.target.value) || undefined } })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bonif. Ataque Conjuros</label>
                        <input type="number" className="form-input" placeholder="Ej. +5" value={entityForm.metadata.spellAttackBonus || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, spellAttackBonus: parseInt(e.target.value) || undefined } })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notas del personaje</label>
                      <textarea className="form-textarea" rows={3} placeholder="Detalles o anotaciones adicionales..." value={entityForm.metadata.note || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, note: e.target.value } })} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Player Profile</label>
                    <select className="form-select" value={entityForm.metadata.playerId || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, playerId: e.target.value } })}>
                      <option value="">-- Select Player --</option>
                      {(campaignState?.players || []).map((p: any) => (
                        <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <input type="text" className="form-input" placeholder="Rogue, Paladin..." value={entityForm.metadata.className || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, className: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Species</label>
                    <input type="text" className="form-input" placeholder="Human, Elf..." value={entityForm.metadata.species || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, species: e.target.value } })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <input type="number" className="form-input" min={1} max={20} value={entityForm.metadata.level || 1}
                      onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, level: parseInt(e.target.value) || 1 } })} />
                  </div>
                </div>
              )
            )}
            {entityForm.entityType === "clock" && (
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Total Segments</label>
                  <input type="number" className="form-input" min={2} max={12} value={entityForm.metadata.segmentsTotal || 4}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, segmentsTotal: parseInt(e.target.value) } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Clock Type</label>
                  <select className="form-select" value={entityForm.metadata.clockType || "countdown"}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, clockType: e.target.value } })}>
                    <option value="countdown">Countdown</option>
                    <option value="progress">Progress</option>
                    <option value="threat">Threat</option>
                  </select>
                </div>
              </div>
            )}
            {entityForm.entityType === "location" && (
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <input type="text" className="form-input" placeholder="The Sunken Coast..." value={entityForm.metadata.region || ""}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, region: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Terrain</label>
                  <input type="text" className="form-input" placeholder="Coastal, Forest..." value={entityForm.metadata.terrainType || ""}
                    onChange={(e) => setEntityForm({ ...entityForm, metadata: { ...entityForm.metadata, terrainType: e.target.value } })} />
                </div>
              </div>
            )}
            {["clue", "secret"].includes(entityForm.entityType) && (
              <TypeMetadataForm
                entityType={entityForm.entityType}
                metadata={entityForm.metadata}
                players={campaignState?.players ?? []}
                entities={campaignState?.entities ?? []}
                campaignSystem={campaignState?.campaign?.system}
                onChange={(field, value) =>
                  setEntityForm({
                    ...entityForm,
                    metadata: {
                      ...entityForm.metadata,
                      [field]: value,
                    },
                  })
                }
              />
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
