import React from "react";
import { useTranslation } from "../../shared/i18n/useTranslation.js";

interface Props {
  entityType: string;
  metadata: any;
  onChange: (field: string, value: any) => void;
  players?: any[];
  entities?: any[];
  campaignSystem?: string;
}

export function TypeMetadataForm({ entityType, metadata, onChange, players = [], entities = [], campaignSystem }: Props) {
  const { t } = useTranslation();
  switch (entityType) {
    case "npc":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos del PNJ</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rol</label>
              <input type="text" className="form-input" value={metadata.role || ""} onChange={e => onChange("role", e.target.value)} placeholder="Ej. Guardia, Comerciante" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Actitud hacia el grupo</label>
              <select className="form-select" value={metadata.attitudeToParty || "neutral"} onChange={e => onChange("attitudeToParty", e.target.value)}>
                <option value="unknown">Desconocida</option>
                <option value="friendly">Amistosa</option>
                <option value="neutral">Neutral</option>
                <option value="suspicious">Suspicaz</option>
                <option value="hostile">Hostil</option>
                <option value="afraid">Asustado</option>
                <option value="loyal">Leal</option>
                <option value="deceptive">Engañoso</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Objetivo / Motivación</label>
            <input type="text" className="form-input" value={metadata.goal || ""} onChange={e => onChange("goal", e.target.value)} placeholder={t("typeMetadataForm.goalPlaceholder")} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Miedo</label>
            <input type="text" className="form-input" value={metadata.fear || ""} onChange={e => onChange("fear", e.target.value)} placeholder={t("typeMetadataForm.fearPlaceholder")} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Secreto privado</label>
            <input type="text" className="form-input" value={metadata.secret || ""} onChange={e => onChange("secret", e.target.value)} placeholder={t("typeMetadataForm.privateSecretPlaceholder")} />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ubicación</label>
              <select className="form-select" value={metadata.currentLocationId || ""} onChange={e => onChange("currentLocationId", e.target.value || undefined)}>
                <option value="">-- Ninguna --</option>
                {entities.filter(ent => ent.entityType === "location").map(ent => (
                  <option key={ent.entityId} value={ent.entityId}>{ent.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Facción</label>
              <select className="form-select" value={metadata.factionId || ""} onChange={e => onChange("factionId", e.target.value || undefined)}>
                <option value="">-- Ninguna --</option>
                {entities.filter(ent => ent.entityType === "faction").map(ent => (
                  <option key={ent.entityId} value={ent.entityId}>{ent.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    case "location":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos de la ubicación</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tipo de ubicación</label>
              <select className="form-select" value={metadata.locationType || "settlement"} onChange={e => onChange("locationType", e.target.value)}>
                <option value="settlement">Asentamiento</option>
                <option value="building">Edificio</option>
                <option value="dungeon">Mazmorra</option>
                <option value="region">Región</option>
                <option value="room">Habitación</option>
                <option value="networkdmark">Punto de interés</option>
                <option value="pnetworke">Pnetworko</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Atmósfera</label>
              <input type="text" className="form-input" value={metadata.atmosphere || ""} onChange={e => onChange("atmosphere", e.target.value)} placeholder="Ej. Siniestra, Alegre" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Peligros (separados por comas)</label>
            <input type="text" className="form-input"
              value={Array.isArray(metadata.dangers) ? metadata.dangers.join(", ") : ""}
              onChange={e => onChange("dangers", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              placeholder="Ej. Trampas, Monstruos, Maldiciones"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Descripción pública</label>
            <textarea className="form-textarea" rows={2} value={metadata.publicDescription || ""} onChange={e => onChange("publicDescription", e.target.value)} placeholder="Lo que los jugadores ven inicialmente..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Descripción privada (Solo DM)</label>
            <textarea className="form-textarea" rows={2} value={metadata.privateDescription || ""} onChange={e => onChange("privateDescription", e.target.value)} placeholder="Secretos de la zona..." />
          </div>
        </div>
      );
    case "quest":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos de la misión</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prioridad de la misión</label>
              <select className="form-select" value={metadata.priority || "side"} onChange={e => onChange("priority", e.target.value)}>
                <option value="background">Trasfondo</option>
                <option value="side">Secundaria</option>
                <option value="main">Principal</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Recompensa prometida</label>
              <input type="text" className="form-input" value={metadata.rewardPromised || ""} onChange={e => onChange("rewardPromised", e.target.value)} placeholder="Oro, objetos..." />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Objetivo público</label>
            <input type="text" className="form-input" value={metadata.publicObjective || ""} onChange={e => onChange("publicObjective", e.target.value)} placeholder="Lo que los jugadores creen que deben hacer..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Objetivo oculto</label>
            <input type="text" className="form-input" value={metadata.hiddenObjective || ""} onChange={e => onChange("hiddenObjective", e.target.value)} placeholder="El objetivo real..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Consecuencia de fallo</label>
            <input type="text" className="form-input" value={metadata.failureConsequence || ""} onChange={e => onChange("failureConsequence", e.target.value)} placeholder={t("typeMetadataForm.failurePlaceholder")} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Consecuencia de éxito</label>
            <input type="text" className="form-input" value={metadata.completionConsequence || ""} onChange={e => onChange("completionConsequence", e.target.value)} placeholder="Impacto narrativo al completarla..." />
          </div>
        </div>
      );
    case "clue":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos de la pista</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tipo de pista</label>
              <select className="form-select" value={metadata.clueType || "physical"} onChange={e => onChange("clueType", e.target.value)}>
                <option value="physical">Objeto físico</option>
                <option value="verbal">Relato verbal</option>
                <option value="visual">Detalle visual</option>
                <option value="magical">Aura mágica</option>
                <option value="document">Documento escrito</option>
                <option value="behavioral">Rasgo de conducta</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Interpretación</label>
              <input type="text" className="form-input" value={metadata.interpretation || ""} onChange={e => onChange("interpretation", e.target.value)} placeholder="Lo que implica esta pista..." />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contenido de la pista *</label>
            <textarea
              data-testid="clue-content-input"
              className="form-textarea"
              rows={3}
              required
              value={metadata.content || ""}
              onChange={e => onChange("content", e.target.value)}
              placeholder={t("typeMetadataForm.clueContentPlaceholder")}
            />
          </div>
        </div>
      );
    case "secret":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos del secreto</h4>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">La verdad *</label>
            <textarea
              data-testid="secret-truth-input"
              className="form-textarea"
              rows={3}
              required
              value={metadata.truth || ""}
              onChange={e => onChange("truth", e.target.value)}
              placeholder={t("typeMetadataForm.truthPlaceholder")}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Versión pública (coartada)</label>
            <input type="text" className="form-input" value={metadata.publicVersion || ""} onChange={e => onChange("publicVersion", e.target.value)} placeholder="Lo que se cree habitualmente..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Impacto</label>
            <input type="text" className="form-input" value={metadata.impact || ""} onChange={e => onChange("impact", e.target.value)} placeholder={t("typeMetadataForm.impactPlaceholder")} />
          </div>
        </div>
      );
    case "clock":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Metadatos del reloj narrativo</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Segmentos máximos *</label>
              <input type="number" className="form-input" required min={2} max={12} value={metadata.maxSegments || 4} onChange={e => onChange("maxSegments", parseInt(e.target.value) || 4)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Segmentos llenos actuales *</label>
              <input type="number" className="form-input" required min={0} max={metadata.maxSegments || 4} value={metadata.currentSegments || 0} onChange={e => onChange("currentSegments", parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Significado / Descripción *</label>
            <input type="text" className="form-input" required value={metadata.meaning || ""} onChange={e => onChange("meaning", e.target.value)} placeholder={t("typeMetadataForm.clockMeaningPlaceholder")} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Efecto al completarse</label>
            <input type="text" className="form-input" value={metadata.onComplete || ""} onChange={e => onChange("onComplete", e.target.value)} placeholder={t("typeMetadataForm.clockCompletePlaceholder")} />
          </div>
        </div>
      );
    case "player_character":
      return campaignSystem === "dnd_srd_5_2_1" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Ficha de personaje (D&D 5.2.1)</h4>

          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)" }}>Datos Básicos</h5>
            <div className="grid grid-cols-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Perfil del jugador *</label>
                <select className="form-select" required value={metadata.playerId || ""} onChange={e => onChange("playerId", e.target.value)}>
                  <option value="">-- Seleccionar jugador --</option>
                  {players.map(p => (
                    <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Clase *</label>
                <input type="text" className="form-input" required value={metadata.className || ""} onChange={e => onChange("className", e.target.value)} placeholder={t("typeMetadataForm.classPlaceholder")} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subclase {metadata.level >= 3 ? "*" : "(Nivel 3+)"}</label>
                <input type="text" className="form-input" required={metadata.level >= 3} value={metadata.subclass || ""} onChange={e => onChange("subclass", e.target.value)} placeholder="Ej. Asesino, Ilusionista" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nivel *</label>
                <input type="number" className="form-input" min={1} required value={metadata.level || 1} onChange={e => onChange("level", parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Especie / Raza *</label>
                <input type="text" className="form-input" required value={metadata.species || ""} onChange={e => onChange("species", e.target.value)} placeholder="Ej. Elfo, Enano" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trasfondo *</label>
                <input type="text" className="form-input" required value={metadata.background || ""} onChange={e => onChange("background", e.target.value)} placeholder={t("typeMetadataForm.backgroundPlaceholder")} />
              </div>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)" }}>Atributos Principales (1-30)</h5>
            <div className="grid grid-cols-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fuerza (STR) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.strength || 10} onChange={e => onChange("strength", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Destreza (DEX) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.dexterity || 10} onChange={e => onChange("dexterity", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Constitución (CON) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.constitution || 10} onChange={e => onChange("constitution", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Inteligencia (INT) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.intelligence || 10} onChange={e => onChange("intelligence", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sabiduría (WIS) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.wisdom || 10} onChange={e => onChange("wisdom", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Carisma (CHA) *</label>
                <input type="number" className="form-input" min={1} max={30} required value={metadata.charisma || 10} onChange={e => onChange("charisma", parseInt(e.target.value) || 10)} />
              </div>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)" }}>Estadísticas de Combate y Progreso</h5>
            <div className="grid grid-cols-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">CA *</label>
                <input type="number" className="form-input" min={0} required value={metadata.armorClass || 10} onChange={e => onChange("armorClass", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Iniciativa *</label>
                <input type="number" className="form-input" required value={metadata.initiative || 0} onChange={e => onChange("initiative", parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Velocidad *</label>
                <input type="number" className="form-input" min={0} required value={metadata.speed || 30} onChange={e => onChange("speed", parseInt(e.target.value) || 30)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">PG actuales *</label>
                <input type="number" className="form-input" min={0} required value={metadata.hitPointsCurrent || 10} onChange={e => onChange("hitPointsCurrent", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">PG máximos *</label>
                <input type="number" className="form-input" min={1} required value={metadata.hitPointsMax || 10} onChange={e => onChange("hitPointsMax", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">PG Temporales</label>
                <input type="number" className="form-input" min={0} value={metadata.hitPointsTemp || 0} onChange={e => onChange("hitPointsTemp", parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Dados de Golpe *</label>
                <input type="text" className="form-input" required value={metadata.hitDice || "1d8"} onChange={e => onChange("hitDice", e.target.value)} placeholder="Ej. 1d8, 3d10" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Experiencia (XP)</label>
                <input type="number" className="form-input" min={0} value={metadata.xp || 0} onChange={e => onChange("xp", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)" }}>Atributos Pasivos</h5>
            <div className="grid grid-cols-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Percepción Pasiva *</label>
                <input type="number" className="form-input" required value={metadata.passivePerception || 10} onChange={e => onChange("passivePerception", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Perspicacia Pasiva *</label>
                <input type="number" className="form-input" required value={metadata.passiveInsight || 10} onChange={e => onChange("passiveInsight", parseInt(e.target.value) || 10)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Investigación Pasiva *</label>
                <input type="number" className="form-input" required value={metadata.passiveInvestigation || 10} onChange={e => onChange("passiveInvestigation", parseInt(e.target.value) || 10)} />
              </div>
            </div>
          </div>

          <div>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)" }}>Competencias, Dotes e Idiomas</h5>
            <div className="form-group">
              <label className="form-label">Salvaciones Competentes (ej. dex, con)</label>
              <input type="text" className="form-input" placeholder="Separadas por comas"
                value={Array.isArray(metadata.savingThrows) ? metadata.savingThrows.join(", ") : ""}
                onChange={e => onChange("savingThrows", e.target.value.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean))} />
            </div>
            <div className="form-group">
              <label className="form-label">Habilidades Competentes (ej. perception, stealth)</label>
              <input type="text" className="form-input" placeholder="Separadas por comas"
                value={Array.isArray(metadata.skills) ? metadata.skills.join(", ") : ""}
                onChange={e => onChange("skills", e.target.value.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean))} />
            </div>
            <div className="form-group">
              <label className="form-label">Idiomas conocidos (ej. Común, Élfico)</label>
              <input type="text" className="form-input" placeholder="Separados por comas"
                value={Array.isArray(metadata.languages) ? metadata.languages.join(", ") : ""}
                onChange={e => onChange("languages", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
            </div>
            <div className="form-group">
              <label className="form-label">Dotes (ej. Alerta, Duro)</label>
              <input type="text" className="form-input" placeholder="Separados por comas"
                value={Array.isArray(metadata.feats) ? metadata.feats.join(", ") : ""}
                onChange={e => onChange("feats", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
            </div>
            <div className="grid grid-cols-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">CD Salvación Conjuros</label>
                <input type="number" className="form-input" placeholder="Ej. 13" value={metadata.spellSaveDC || ""} onChange={e => onChange("spellSaveDC", parseInt(e.target.value) || undefined)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bonif. Ataque Conjuros</label>
                <input type="number" className="form-input" placeholder="Ej. 5" value={metadata.spellAttackBonus || ""} onChange={e => onChange("spellAttackBonus", parseInt(e.target.value) || undefined)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notas del personaje</label>
              <textarea className="form-textarea" rows={3} placeholder={t("typeMetadataForm.notesPlaceholder")} value={metadata.note || ""} onChange={e => onChange("note", e.target.value)} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Metadatos del personaje jugador</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Perfil del jugador propietario *</label>
              <select className="form-select" required value={metadata.playerId || ""} onChange={e => onChange("playerId", e.target.value)}>
                <option value="">-- Seleccionar jugador --</option>
                {players.map(p => (
                  <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Clase</label>
              <input type="text" className="form-input" value={metadata.className || ""} onChange={e => onChange("className", e.target.value)} placeholder={t("typeMetadataForm.classPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nivel</label>
              <input type="number" className="form-input" min={1} value={metadata.level || 1} onChange={e => onChange("level", parseInt(e.target.value) || 1)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">PG actuales</label>
              <input type="number" className="form-input" min={0} value={metadata.hitPointsCurrent || 10} onChange={e => onChange("hitPointsCurrent", parseInt(e.target.value) || 10)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">PG máximos</label>
              <input type="number" className="form-input" min={1} value={metadata.hitPointsMax || 10} onChange={e => onChange("hitPointsMax", parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Especie / Raza</label>
              <input type="text" className="form-input" value={metadata.species || ""} onChange={e => onChange("species", e.target.value)} placeholder="Elfo, Enano" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Clase de armadura (CA)</label>
              <input type="number" className="form-input" value={metadata.armorClass || 10} onChange={e => onChange("armorClass", parseInt(e.target.value) || 10)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Percepción pasiva</label>
              <input type="number" className="form-input" value={metadata.passivePerception || 10} onChange={e => onChange("passivePerception", parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Historia / Trasfondo</label>
            <input type="text" className="form-input" value={metadata.background || ""} onChange={e => onChange("background", e.target.value)} placeholder="Huerfano, Soldado..." />
          </div>
        </div>
      );
    default:
      return null;
  }
}
