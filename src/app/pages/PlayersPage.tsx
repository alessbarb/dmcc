import React from "react";
import { Plus, X, User, Pencil, Archive, Eye, EyeOff } from "lucide-react";
import type { Entity, PlayerProfile } from "../stores/campaignStore.js";
import type { ToastKind } from "../hooks/useToast.js";

export interface PlayersPageProps {
  campaignState: any;
  campaigns: any[];
  activeCampaignId: string | null;
  visibility: any;
  createPlayer: (name: string, displayName: string, email?: string, imageUrl?: string) => Promise<any>;
  updatePlayer: (playerId: string, data: any) => Promise<any>;
  archivePlayer: (playerId: string) => Promise<any>;
  isPlayerModalOpen: boolean;
  setIsPlayerModalOpen: (open: boolean) => void;
  editingPlayerId: string | null;
  setEditingPlayerId: (id: string | null) => void;
  playerForm: { name: string; displayName: string; email: string; imageUrl: string };
  setPlayerForm: (form: { name: string; displayName: string; email: string; imageUrl: string }) => void;
  setSelectedEntity: (entity: any) => void;
  addToast: (msg: string, kind?: ToastKind) => void;
}

export function PlayersPage(props: PlayersPageProps) {
  const {
    campaignState,
    visibility,
    createPlayer,
    updatePlayer,
    archivePlayer,
    isPlayerModalOpen,
    setIsPlayerModalOpen,
    editingPlayerId,
    setEditingPlayerId,
    playerForm,
    setPlayerForm,
    setSelectedEntity,
    addToast,
  } = props;

  return (
    <div>
      <div className="top-bar" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontWeight: "700", fontSize: "1.4rem" }}>Jugadores y personajes</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setIsPlayerModalOpen(true)}>
          <Plus size={14} /> Add Player
        </button>
      </div>

      {(campaignState?.players ?? []).length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <User size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p>No players yet. Add players to track who is at the table and link their characters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {(campaignState?.players ?? []).map((player: PlayerProfile) => {
            const characters = (campaignState?.entities ?? []).filter(
              (e: Entity) => e.entityType === "player_character" && !e.archived && e.metadata?.playerId === player.playerId
            );
            return (
              <div key={player.playerId} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0, flex: 1 }}>
                    {player.imageUrl ? (
                      <div style={{ width: "46px", height: "46px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-color)", flexShrink: 0 }}>
                        <img src={player.imageUrl} alt={player.displayName ?? player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: "46px", height: "46px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-color)", flexShrink: 0 }}>
                        <img src="/assets/default_player.png" alt={player.displayName ?? player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "2px", fontSize: "1rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {player.displayName ?? player.name}
                      </h3>
                      {player.email && (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{player.email}</p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: "6px" }}
                      onClick={() => {
                        setEditingPlayerId(player.playerId);
                        setPlayerForm({
                          name: player.name,
                          displayName: player.displayName ?? player.name,
                          email: player.email ?? "",
                          imageUrl: player.imageUrl ?? ""
                        });
                        setIsPlayerModalOpen(true);
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      style={{ padding: "6px" }}
                      onClick={() => {
                        archivePlayer(player.playerId);
                        addToast(`Jugador "${player.displayName ?? player.name}" archivado.`, "info");
                      }}
                    >
                      <Archive size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Characters</p>
                  {characters.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No characters. Create a player_character entity to link one.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {characters.map((c: Entity) => (
                        <span key={c.entityId} style={{
                          padding: "2px 8px",
                          backgroundColor: "var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-color)"
                        }}>
                          {c.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Player Modal */}
      {isPlayerModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "" }); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: "700" }}>{editingPlayerId ? "Editar perfil de jugador" : "Añadir jugador"}</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "" }); }}><X size={16} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!playerForm.name.trim()) return;
              const displayNameVal = playerForm.displayName.trim() || playerForm.name.trim();
              const emailVal = playerForm.email.trim() || null;
              const imageUrlVal = playerForm.imageUrl.trim() || "";

              if (editingPlayerId) {
                await updatePlayer(editingPlayerId, {
                  name: playerForm.name.trim(),
                  displayName: displayNameVal,
                  email: emailVal,
                  imageUrl: imageUrlVal
                });
              } else {
                await createPlayer(
                  playerForm.name.trim(),
                  displayNameVal,
                  emailVal || undefined,
                  imageUrlVal
                );
              }
              setIsPlayerModalOpen(false);
              setEditingPlayerId(null);
              setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "" });
            }}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name (real name) *</label>
                  <input className="form-input" value={playerForm.name} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} placeholder="e.g. Alice" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Display Name</label>
                  <input className="form-input" value={playerForm.displayName} onChange={e => setPlayerForm({ ...playerForm, displayName: e.target.value })} placeholder="Apodo o alias mostrado en la app" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email (optional)</label>
                  <input className="form-input" type="email" value={playerForm.email} onChange={e => setPlayerForm({ ...playerForm, email: e.target.value })} placeholder="alice@example.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">URL de la Imagen (Foto / Avatar)</label>
                  <input className="form-input" value={playerForm.imageUrl} onChange={e => setPlayerForm({ ...playerForm, imageUrl: e.target.value })} placeholder="https://example.com/avatar.png" />
                  {playerForm.imageUrl && (
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-color)" }}>
                        <img src={playerForm.imageUrl} alt="Vista previa del avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "" }); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingPlayerId ? "Guardar cambios" : "Añadir jugador"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Party Knowledge Summary */}
      {visibility && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Eye size={18} style={{ color: "var(--primary)" }} /> Party Knowledge
            <span style={{ fontSize: "0.8rem", fontWeight: "400", color: "var(--text-muted)" }}>
              — {visibility.summary?.partyKnowsCount ?? 0} of {visibility.summary?.total ?? 0} entities revealed to party
            </span>
          </h3>
          {(visibility.partyKnows ?? []).length === 0 ? (
            <div className="card" style={{ padding: "20px", color: "var(--text-muted)", textAlign: "center" }}>
              <EyeOff size={32} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p>Nada revelado al grupo todavía. Usa "Revelar al grupo" en los detalles de la entidad or clue reveal in sessions.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(visibility.partyKnows ?? []).map((e: any) => (
                <div
                  key={e.entityId}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid var(--border-color)"
                  }}
                  onClick={() => {
                    const entity = campaignState?.entities.find((ent: Entity) => ent.entityId === e.entityId);
                    if (entity) { setSelectedEntity(entity); }
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{e.entityType}</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{e.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
