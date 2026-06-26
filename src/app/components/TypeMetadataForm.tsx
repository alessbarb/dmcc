import React from "react";

interface Props {
  entityType: string;
  metadata: any;
  onChange: (field: string, value: any) => void;
  players?: any[];
  entities?: any[];
}

export function TypeMetadataForm({ entityType, metadata, onChange, players = [], entities = [] }: Props) {
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
            <input type="text" className="form-input" value={metadata.goal || ""} onChange={e => onChange("goal", e.target.value)} placeholder="¿Qué es lo que quiere?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Miedo</label>
            <input type="text" className="form-input" value={metadata.fear || ""} onChange={e => onChange("fear", e.target.value)} placeholder="¿A qué le teme?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Secreto privado</label>
            <input type="text" className="form-input" value={metadata.secret || ""} onChange={e => onChange("secret", e.target.value)} placeholder="Secreto profundo y oculto..." />
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
                <option value="landmark">Punto de interés</option>
                <option value="plane">Plano</option>
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
            <input type="text" className="form-input" value={metadata.failureConsequence || ""} onChange={e => onChange("failureConsequence", e.target.value)} placeholder="¿Qué pasa si fallan?" />
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
            <textarea className="form-textarea" rows={3} required value={metadata.content || ""} onChange={e => onChange("content", e.target.value)} placeholder="El texto exacto o descripción de la pista..." />
          </div>
        </div>
      );
    case "secret":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos del secreto</h4>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">La verdad *</label>
            <textarea className="form-textarea" rows={3} required value={metadata.truth || ""} onChange={e => onChange("truth", e.target.value)} placeholder="La verdad real detrás de este secreto..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Versión pública (coartada)</label>
            <input type="text" className="form-input" value={metadata.publicVersion || ""} onChange={e => onChange("publicVersion", e.target.value)} placeholder="Lo que se cree habitualmente..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Impacto</label>
            <input type="text" className="form-input" value={metadata.impact || ""} onChange={e => onChange("impact", e.target.value)} placeholder="¿Qué cambia cuando se revela?" />
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
            <input type="text" className="form-input" required value={metadata.meaning || ""} onChange={e => onChange("meaning", e.target.value)} placeholder="¿Qué representa este reloj?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Efecto al completarse</label>
            <input type="text" className="form-input" value={metadata.onComplete || ""} onChange={e => onChange("onComplete", e.target.value)} placeholder="¿Qué ocurre cuando se llena el reloj?" />
          </div>
        </div>
      );
    case "player_character":
      return (
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
              <input type="text" className="form-input" value={metadata.className || ""} onChange={e => onChange("className", e.target.value)} placeholder="Ej. Pícaro, Mago" />
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
