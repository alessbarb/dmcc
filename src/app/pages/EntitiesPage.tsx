import React from "react";
import { Search, Plus, Eye, EyeOff } from "lucide-react";
import { getEntityDefaultImage } from "../utils/entityVisuals.js";

export interface EntitiesPageProps {
  campaignState: any;
  selectedEntity: any;
  setSelectedEntity: (e: any) => void;
  entitySearchQuery: string;
  setEntitySearchQuery: (q: string) => void;
  entityTypeFilter: string;
  setEntityTypeFilter: (f: string) => void;
  setIsEntityModalOpen: (open: boolean) => void;
}

export function EntitiesPage(props: EntitiesPageProps) {
  const {
    campaignState,
    setSelectedEntity,
    entitySearchQuery,
    setEntitySearchQuery,
    entityTypeFilter,
    setEntityTypeFilter,
    setIsEntityModalOpen,
  } = props;

  return (
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
          <option value="all">All Types</option>
          <option value="npc">NPCs</option>
          <option value="location">Locations</option>
          <option value="quest">Quests</option>
          <option value="clue">Clues</option>
          <option value="secret">Secrets</option>
          <option value="clock">Clocks</option>
          <option value="consequence">Consequences</option>
        </select>

        <button className="btn btn-primary" onClick={() => setIsEntityModalOpen(true)}>
          <Plus size={16} /> Create Entity
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
          .map((e: any) => (
            <div key={e.entityId} className="card" style={{ cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={() => setSelectedEntity(e)}>
              {(() => {
                const imgUrl = e.metadata?.imageUrl || getEntityDefaultImage(e.entityType);
                const isDmOnly = e.visibility?.kind === "dm_only" || e.status === "hidden" || e.entityType === "secret" || e.status === "dm_only";
                return (
                  <div style={{ width: "100%", height: "140px", overflow: "hidden", position: "relative", borderBottom: "1px solid var(--border-color)" }}>
                    <img
                      src={imgUrl}
                      alt={e.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isDmOnly ? "grayscale(80%) brightness(35%)" : "none",
                        transition: "var(--transition-normal)"
                      }}
                    />
                    {isDmOnly && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        backgroundColor: "rgba(6, 7, 14, 0.4)",
                        color: "var(--color-critical)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        <EyeOff size={14} />
                        <span>Solo DM</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="card-header" style={{ marginBottom: "12px" }}>
                  <span className={`badge ${e.entityType === "secret" ? "badge-critical" : e.entityType === "clue" ? "badge-warning" : "badge-primary"}`}>
                    {e.entityType}
                  </span>
                  <span className="badge badge-default">{e.status}</span>
                </div>
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>{e.title}</h3>
                {e.subtitle && <h4 className="card-subtitle">{e.subtitle}</h4>}
                <p className="card-body" style={{ marginTop: "8px", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                  {e.summary || "Sin resumen."}
                </p>
                <div className="card-footer" style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                  <span>Importance: {e.importance}</span>
                  {e.visibility?.kind && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Eye size={12} /> {e.visibility.kind}</span>}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
