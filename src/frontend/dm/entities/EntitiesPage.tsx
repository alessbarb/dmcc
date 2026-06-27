import React, { useState } from "react";
import { Search, Plus, Eye, EyeOff } from "lucide-react";
import { getEntityDefaultImage } from "./entityVisuals.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { EntityDetailModal } from "./EntityDetailModal.js";
import { useToast } from "../../shared/hooks/useToast.js";

export interface EntitiesPageProps {
  campaignState?: any;
  selectedEntity?: any;
  setSelectedEntity?: (e: any) => void;
  entitySearchQuery?: string;
  setEntitySearchQuery?: (q: string) => void;
  entityTypeFilter?: string;
  setEntityTypeFilter?: (f: string) => void;
  setIsEntityModalOpen?: (open: boolean) => void;
}

const getImportanceLabel = (imp: string) => {
  const map: Record<string, string> = {
    critical: "crítica",
    high: "alta",
    normal: "normal",
    low: "baja"
  };
  return map[String(imp).toLowerCase()] || imp;
};

const getEntityTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    npc: "PNJ",
    location: "Ubicación",
    quest: "Misión",
    clue: "Pista",
    secret: "Secreto",
    clock: "Reloj",
    consequence: "Consecuencia"
  };
  return map[type] || type;
};

export function EntitiesPage(props: EntitiesPageProps = {}) {
  const store = useCampaignStore();
  const campaignState = props.campaignState ?? store.campaignState;
  const { updateEntity, archiveEntity } = store;
  const { addToast } = useToast();
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<any>(null);
  const setSelectedEntity = props.setSelectedEntity ?? setSelectedEntityLocal;
  const [entitySearchQueryLocal, setEntitySearchQueryLocal] = useState("");
  const [entityTypeFilterLocal, setEntityTypeFilterLocal] = useState("all");
  const entitySearchQuery = props.entitySearchQuery ?? entitySearchQueryLocal;
  const setEntitySearchQuery = props.setEntitySearchQuery ?? setEntitySearchQueryLocal;
  const entityTypeFilter = props.entityTypeFilter ?? entityTypeFilterLocal;
  const setEntityTypeFilter = props.setEntityTypeFilter ?? setEntityTypeFilterLocal;
  const setIsEntityModalOpen = props.setIsEntityModalOpen ?? store.setIsEntityModalOpen;

  return (<>
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar entidades por título o resumen..."
            style={{ paddingLeft: "38px" }}
            value={entitySearchQuery}
            onChange={(e) => setEntitySearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select className="form-select" style={{ width: "180px" }} value={entityTypeFilter} onChange={(e) => setEntityTypeFilter(e.target.value)}>
          <option value="all">Todos los tipos</option>
          <option value="npc">PNJs</option>
          <option value="location">Ubicaciones</option>
          <option value="quest">Misiones</option>
          <option value="clue">Pistas</option>
          <option value="secret">Secretos</option>
          <option value="clock">Relojes</option>
          <option value="consequence">Consecuencias</option>
        </select>

        <button className="btn btn-primary" onClick={() => setIsEntityModalOpen(true)}>
          <Plus size={16} /> Crear entidad
        </button>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-3">
        {campaignState.entities
          .filter((e: any) => !e.archived)
          .filter((e: any) => {
            if (entityTypeFilter !== "all" && e.entityType !== entityTypeFilter) return false;
            if (!entitySearchQuery.trim()) return true;
            const query = entitySearchQuery.toLowerCase();
            return e.title.toLowerCase().includes(query) || (e.summary && e.summary.toLowerCase().includes(query));
          })
          .map((e: any) => {
            const isDmOnly = e.visibility?.kind === "dm_only" || e.status === "hidden" || e.entityType === "secret" || e.status === "dm_only";
            return (
              <div
                key={e.entityId}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  border: isDmOnly ? "1px solid hsla(350, 70%, 50%, 0.4)" : "1px solid var(--border-color)",
                  boxShadow: isDmOnly ? "0 0 10px hsla(350, 70%, 50%, 0.1)" : "none",
                  transition: "all 0.2s"
                }}
                onClick={() => setSelectedEntity(e)}
              >
                {(() => {
                  const imgUrl = e.metadata?.imageUrl || getEntityDefaultImage(e.entityType);
                  return (
                    <div style={{
                      width: "100%",
                      height: "140px",
                      overflow: "hidden",
                      position: "relative",
                      borderBottom: isDmOnly ? "1px solid hsla(350, 70%, 50%, 0.4)" : "1px solid var(--border-color)"
                    }}>
                      <img
                        src={imgUrl}
                        alt={e.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: isDmOnly ? "grayscale(50%) brightness(45%)" : "none",
                          transition: "var(--transition-normal)"
                        }}
                      />
                      {isDmOnly && (
                        <>
                          {/* Viñeta oscura */}
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(6, 7, 14, 0.75) 100%)",
                            pointerEvents: "none"
                          }} />
                          {/* Glifo central */}
                          <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            opacity: 0.12,
                            color: "var(--color-critical)",
                            pointerEvents: "none"
                          }}>
                            <EyeOff size={72} />
                          </div>
                          {/* Chip Solo DM */}
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            backgroundColor: "hsla(350, 75%, 45%, 0.85)",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            <EyeOff size={11} />
                            <span>Solo DM</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div className="card-header" style={{ marginBottom: "12px" }}>
                    <span className={`badge ${e.entityType === "secret" ? "badge-critical" : e.entityType === "clue" ? "badge-warning" : "badge-primary"}`}>
                      {getEntityTypeLabel(e.entityType)}
                    </span>
                    <span className="badge badge-default">{e.status}</span>
                  </div>
                  <h3 className="card-title" style={{ fontSize: "1.05rem" }}>{e.title}</h3>
                  {e.subtitle && <h4 className="card-subtitle">{e.subtitle}</h4>}
                  <p className="card-body" style={{ marginTop: "8px", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                    {e.summary || "Sin resumen."}
                  </p>
                  <div className="card-footer" style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                    <span>Importancia: {getImportanceLabel(e.importance)}</span>
                    {e.visibility?.kind && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Eye size={12} /> {e.visibility.kind === "group" ? "Grupo" : e.visibility.kind === "dm_only" ? "Solo DM" : e.visibility.kind}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
    {selectedEntityLocal && campaignState && (
      <EntityDetailModal
        selectedEntity={selectedEntityLocal}
        campaignState={campaignState}
        onClose={() => setSelectedEntityLocal(null)}
        onEdit={async (entityId, updates) => {
          await updateEntity(entityId, updates);
          setSelectedEntityLocal({ ...selectedEntityLocal, ...updates });
        }}
        onArchive={async (entityId) => {
          await archiveEntity(entityId);
          setSelectedEntityLocal(null);
        }}
        onVisibilityChange={async (entityId, visibility) => {
          await updateEntity(entityId, { visibility });
          setSelectedEntityLocal({ ...selectedEntityLocal, visibility });
        }}
        addToast={addToast}
      />
    )}
  </>);
}
