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
              <label className="form-label">Role</label>
              <input type="text" className="form-input" value={metadata.role || ""} onChange={e => onChange("role", e.target.value)} placeholder="e.g. Guard, Merchant" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Attitude to Party</label>
              <select className="form-select" value={metadata.attitudeToParty || "neutral"} onChange={e => onChange("attitudeToParty", e.target.value)}>
                <option value="unknown">Unknown</option>
                <option value="friendly">Friendly</option>
                <option value="neutral">Neutral</option>
                <option value="suspicious">Suspicious</option>
                <option value="hostile">Hostile</option>
                <option value="afraid">Afraid</option>
                <option value="loyal">Loyal</option>
                <option value="deceptive">Deceptive</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Goal / Motivation</label>
            <input type="text" className="form-input" value={metadata.goal || ""} onChange={e => onChange("goal", e.target.value)} placeholder="What do they want?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Fear</label>
            <input type="text" className="form-input" value={metadata.fear || ""} onChange={e => onChange("fear", e.target.value)} placeholder="What do they fear?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Private Secret</label>
            <input type="text" className="form-input" value={metadata.secret || ""} onChange={e => onChange("secret", e.target.value)} placeholder="Deep dark secret..." />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <select className="form-select" value={metadata.currentLocationId || ""} onChange={e => onChange("currentLocationId", e.target.value || undefined)}>
                <option value="">-- None --</option>
                {entities.filter(ent => ent.entityType === "location").map(ent => (
                  <option key={ent.entityId} value={ent.entityId}>{ent.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Faction</label>
              <select className="form-select" value={metadata.factionId || ""} onChange={e => onChange("factionId", e.target.value || undefined)}>
                <option value="">-- None --</option>
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
              <label className="form-label">Location Type</label>
              <select className="form-select" value={metadata.locationType || "settlement"} onChange={e => onChange("locationType", e.target.value)}>
                <option value="settlement">Settlement</option>
                <option value="building">Building</option>
                <option value="dungeon">Dungeon</option>
                <option value="region">Region</option>
                <option value="room">Room</option>
                <option value="landmark">Landmark</option>
                <option value="plane">Plane</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Atmosphere</label>
              <input type="text" className="form-input" value={metadata.atmosphere || ""} onChange={e => onChange("atmosphere", e.target.value)} placeholder="e.g. Creepy, Joyful" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dangers (comma separated)</label>
            <input type="text" className="form-input"
              value={Array.isArray(metadata.dangers) ? metadata.dangers.join(", ") : ""}
              onChange={e => onChange("dangers", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              placeholder="e.g. Traps, Monsters, Curses"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Public Description</label>
            <textarea className="form-textarea" rows={2} value={metadata.publicDescription || ""} onChange={e => onChange("publicDescription", e.target.value)} placeholder="What players see initially..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Private Description (DM Only)</label>
            <textarea className="form-textarea" rows={2} value={metadata.privateDescription || ""} onChange={e => onChange("privateDescription", e.target.value)} placeholder="Secrets of the room..." />
          </div>
        </div>
      );
    case "quest":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos de la misión</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quest Priority</label>
              <select className="form-select" value={metadata.priority || "side"} onChange={e => onChange("priority", e.target.value)}>
                <option value="background">Background</option>
                <option value="side">Side Quest</option>
                <option value="main">Main Quest</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Promised Reward</label>
              <input type="text" className="form-input" value={metadata.rewardPromised || ""} onChange={e => onChange("rewardPromised", e.target.value)} placeholder="Gold, items..." />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Public Objective</label>
            <input type="text" className="form-input" value={metadata.publicObjective || ""} onChange={e => onChange("publicObjective", e.target.value)} placeholder="What the players think they must do..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Hidden Objective</label>
            <input type="text" className="form-input" value={metadata.hiddenObjective || ""} onChange={e => onChange("hiddenObjective", e.target.value)} placeholder="The real goal..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Failure Consequence</label>
            <input type="text" className="form-input" value={metadata.failureConsequence || ""} onChange={e => onChange("failureConsequence", e.target.value)} placeholder="What happens if they fail?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Completion Consequence</label>
            <input type="text" className="form-input" value={metadata.completionConsequence || ""} onChange={e => onChange("completionConsequence", e.target.value)} placeholder="Narrative impact when completed..." />
          </div>
        </div>
      );
    case "clue":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos de la pista</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Clue Type</label>
              <select className="form-select" value={metadata.clueType || "physical"} onChange={e => onChange("clueType", e.target.value)}>
                <option value="physical">Physical object</option>
                <option value="verbal">Verbal account</option>
                <option value="visual">Visual detail</option>
                <option value="magical">Magical aura</option>
                <option value="document">Written document</option>
                <option value="behavioral">Behavioral tell</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Interpretation</label>
              <input type="text" className="form-input" value={metadata.interpretation || ""} onChange={e => onChange("interpretation", e.target.value)} placeholder="What this clue implies..." />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Clue Content *</label>
            <textarea className="form-textarea" rows={3} required value={metadata.content || ""} onChange={e => onChange("content", e.target.value)} placeholder="The exact text or description of the clue..." />
          </div>
        </div>
      );
    case "secret":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Datos del secreto</h4>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">The Truth *</label>
            <textarea className="form-textarea" rows={3} required value={metadata.truth || ""} onChange={e => onChange("truth", e.target.value)} placeholder="The real truth behind this secret..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Public Version (Cover Story)</label>
            <input type="text" className="form-input" value={metadata.publicVersion || ""} onChange={e => onChange("publicVersion", e.target.value)} placeholder="What is commonly believed..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Impact</label>
            <input type="text" className="form-input" value={metadata.impact || ""} onChange={e => onChange("impact", e.target.value)} placeholder="What changes when revealed?" />
          </div>
        </div>
      );
    case "clock":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Reloj narrativo Metadata</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Segments *</label>
              <input type="number" className="form-input" required min={2} max={12} value={metadata.maxSegments || 4} onChange={e => onChange("maxSegments", parseInt(e.target.value) || 4)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Filled Segments *</label>
              <input type="number" className="form-input" required min={0} max={metadata.maxSegments || 4} value={metadata.currentSegments || 0} onChange={e => onChange("currentSegments", parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Meaning / Description *</label>
            <input type="text" className="form-input" required value={metadata.meaning || ""} onChange={e => onChange("meaning", e.target.value)} placeholder="What does this clock represent?" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">On Complete Effect</label>
            <input type="text" className="form-input" value={metadata.onComplete || ""} onChange={e => onChange("onComplete", e.target.value)} placeholder="What happens when the clock fills?" />
          </div>
        </div>
      );
    case "player_character":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--primary)" }}>Player Character Metadata</h4>
          <div className="grid grid-cols-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Owner Player Profile *</label>
              <select className="form-select" required value={metadata.playerId || ""} onChange={e => onChange("playerId", e.target.value)}>
                <option value="">-- Select Player --</option>
                {players.map(p => (
                  <option key={p.playerId} value={p.playerId}>{p.displayName || p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Class Name</label>
              <input type="text" className="form-input" value={metadata.className || ""} onChange={e => onChange("className", e.target.value)} placeholder="e.g. Rogue, Mage" />
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Level</label>
              <input type="number" className="form-input" min={1} value={metadata.level || 1} onChange={e => onChange("level", parseInt(e.target.value) || 1)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">HP Current</label>
              <input type="number" className="form-input" min={0} value={metadata.hitPointsCurrent || 10} onChange={e => onChange("hitPointsCurrent", parseInt(e.target.value) || 10)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">HP Max</label>
              <input type="number" className="form-input" min={1} value={metadata.hitPointsMax || 10} onChange={e => onChange("hitPointsMax", parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="grid grid-cols-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Species / Race</label>
              <input type="text" className="form-input" value={metadata.species || ""} onChange={e => onChange("species", e.target.value)} placeholder="Elf, Dwarf" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Armor Class (AC)</label>
              <input type="number" className="form-input" value={metadata.armorClass || 10} onChange={e => onChange("armorClass", parseInt(e.target.value) || 10)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Passive Perception</label>
              <input type="number" className="form-input" value={metadata.passivePerception || 10} onChange={e => onChange("passivePerception", parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Background story</label>
            <input type="text" className="form-input" value={metadata.background || ""} onChange={e => onChange("background", e.target.value)} placeholder="Urchin, Soldier..." />
          </div>
        </div>
      );
    default:
      return null;
  }
}
