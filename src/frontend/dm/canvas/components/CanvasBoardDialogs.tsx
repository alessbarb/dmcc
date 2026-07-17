import React from "react";
import { Award, Film, HelpCircle, Key, MapPin, Shield, User, UserCheck, X } from "lucide-react";
import type { Canvas } from "@core/domain/canvas/types.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";

const isCanvasKind = (value: string): value is Canvas["kind"] =>
  value === "world" || value === "session" || value === "mystery" ||
  value === "location" || value === "characters" || value === "custom";

interface CanvasBoardDialogsProps {
  isCreateBoardOpen: boolean;
  setIsCreateBoardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isImportOpen: boolean;
  setIsImportOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLegendOpen: boolean;
  setIsLegendOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newBoardTitle: string;
  setNewBoardTitle: React.Dispatch<React.SetStateAction<string>>;
  newBoardKind: Canvas["kind"];
  setNewBoardKind: React.Dispatch<React.SetStateAction<Canvas["kind"]>>;
  newBoardTemplate: string;
  setNewBoardTemplate: React.Dispatch<React.SetStateAction<string>>;
  importText: string;
  setImportText: React.Dispatch<React.SetStateAction<string>>;
  handleCreateBoard: (event: React.SubmitEvent<HTMLFormElement>) => void;
  handleImportText: () => void;
}

export function CanvasBoardDialogs({
  isCreateBoardOpen, setIsCreateBoardOpen, isImportOpen, setIsImportOpen,
  isLegendOpen, setIsLegendOpen, newBoardTitle, setNewBoardTitle,
  newBoardKind, setNewBoardKind, newBoardTemplate, setNewBoardTemplate,
  importText, setImportText, handleCreateBoard, handleImportText,
}: CanvasBoardDialogsProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Create Board Modal Overlay */}
      {isCreateBoardOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateBoardOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Crear nuevo tablero visual</h2>
              <button onClick={() => setIsCreateBoardOpen(false)} className="modal-close-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label>Nombre del tablero</label>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder={t("canvas.page.importExamplePlaceholder")}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Tablero</label>
                  <select
                    value={newBoardKind}
                    onChange={(e) => { if (isCanvasKind(e.target.value)) setNewBoardKind(e.target.value); }}
                    className="form-select"
                  >
                    <option value="world">Mapa del Mundo / Estructura General</option>
                    <option value="session">Preparación de Sesión (Escenas, encuentros)</option>
                    <option value="mystery">Mapa de Conspiración (Pistas, sospechosos)</option>
                    <option value="location">Ubicación / Mazmorra (Salas, trampas)</option>
                    <option value="characters">Personajes (Relaciones sociales, familias)</option>
                    <option value="custom">Tablero en blanco personalizado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Plantilla de inicio</label>
                  <select
                    value={newBoardTemplate}
                    onChange={(e) => setNewBoardTemplate(e.target.value)}
                    className="form-select"
                  >
                    <option value="custom">Ninguna (Tablero en blanco)</option>
                    <option value="mystery">🕵️ Misterio (Pistas, sospechosos y secretos)</option>
                    <option value="faction">🛡️ Facción (Líder, agentes y recursos)</option>
                    <option value="city">🏙️ Ciudad (Barrios, PNJ y rumores)</option>
                    <option value="session">🎬 Sesión (Línea de escenas secuenciales)</option>
                    <option value="dungeon">🏰 Mazmorra (Entrada, salas y monstruos)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateBoardOpen(false)}>
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Text Modal Overlay */}
      {isImportOpen && (
        <div className="modal-overlay" onClick={() => setIsImportOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>✏️ Importación rápida por texto</h2>
              <button onClick={() => setIsImportOpen(false)} className="modal-close-btn">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--theme-text-secondary)", lineHeight: "1.4" }}>
                Escribe o pega texto estructurado. Usa <code># Grupo</code> para agrupar, <code>[Tipo] Nombre</code> para declarar entidades y <code>Origen -&gt; Relación -&gt; Destino</code> para enlazarlas.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={t("canvas.page.importExampleContent")}
                rows={10}
                className="form-textarea"
                style={{ fontFamily: "monospace", fontSize: "0.82rem", backgroundColor: "var(--theme-surfaces-interactive)", border: "1px solid var(--theme-borders-default)", borderRadius: "var(--theme-shapes-radius-small)", color: "var(--theme-text-primary)", padding: "10px" }}
              />
              <div style={{ fontSize: "11px", color: "var(--theme-text-secondary)" }}>
                Tipos de entidad: NPC (pnj), PC (pj), Lugar, Faccion, Pista, Secreto, Mision, Objeto, Criatura, Escena, Consecuencia, Rumor, Nota.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsImportOpen(false)}>
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportText}
              >
                Importar al lienzo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Modal Overlay */}
      {isLegendOpen && (
        <div className="modal-overlay" onClick={() => setIsLegendOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "320px" }}>
            <div className="modal-header">
              <h2>📖 Leyenda del Canvas</h2>
              <button onClick={() => setIsLegendOpen(false)} className="modal-close-btn" style={{ background: "none", border: "none", color: "var(--theme-text-secondary)", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--theme-borders-default)", paddingBottom: "4px", color: "var(--theme-accents-primary-foreground)" }}>VISIBILIDAD</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🔒</span>
                <div><strong>Secreto DM</strong>: Visible solo para el DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>🕯</span>
                <div><strong>Parcial</strong>: Revelado parcialmente.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <span style={{ fontSize: "12px" }}>👁</span>
                <div><strong>Revelado</strong>: Visible públicamente para jugadores.</div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--theme-borders-default)", paddingBottom: "4px", marginTop: "8px", color: "var(--theme-accents-primary-foreground)" }}>ENTIDADES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><UserCheck size={12} color="var(--theme-entities-npc-foreground)" /> <span>🎭 PNJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={12} color="var(--theme-entities-player-foreground)" /> <span>👤 PJ</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={12} color="var(--theme-entities-location-foreground)" /> <span>📍 Lugar</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Shield size={12} color="var(--theme-entities-faction-foreground)" /> <span>🏛 Facción</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={12} color="var(--theme-entities-clue-foreground)" /> <span>🧩 Pista</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Key size={12} color="var(--theme-entities-secret-foreground)" /> <span>🔑 Secreto</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={12} color="var(--theme-entities-quest-foreground)" /> <span>🏆 Misión</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Film size={12} color="var(--theme-entities-scene-foreground)" /> <span>🎬 Escena</span></div>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid var(--theme-borders-default)", paddingBottom: "4px", marginTop: "8px", color: "var(--theme-accents-primary-foreground)" }}>RELACIONES</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "var(--theme-graph-edge-critical)", borderStyle: "dashed" }} />
                <div><strong>Línea Roja Punteada</strong>: Secreto DM.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                <div style={{ width: "24px", height: "2px", backgroundColor: "color-mix(in srgb, var(--theme-narrative-secret-foreground) 60%, transparent)", borderStyle: "dashed" }} />
                <div><strong>Línea Violeta Punteada</strong>: Ancla de secreto.</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
