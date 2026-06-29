import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, User, Pencil, Archive, Eye, EyeOff, ShieldCheck, Link2, Copy, Trash2, Clock, Wifi } from "lucide-react";
import type { Entity, PlayerProfile } from "../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { getDmSessionToken } from "../../shared/auth/authClient.js";


export interface PlayersPageProps {
  campaignState?: any;
  campaigns?: any[];
  activeCampaignId?: string | null;
  visibility?: any;
  createPlayer?: (name: string, displayName: string, email?: string, imageUrl?: string) => Promise<any>;
  updatePlayer?: (playerId: string, data: any) => Promise<any>;
  archivePlayer?: (playerId: string) => Promise<any>;
  isPlayerModalOpen?: boolean;
  setIsPlayerModalOpen?: (open: boolean) => void;
  editingPlayerId?: string | null;
  setEditingPlayerId?: (id: string | null) => void;
  playerForm?: { name: string; displayName: string; email: string; imageUrl: string };
  setPlayerForm?: (form: { name: string; displayName: string; email: string; imageUrl: string }) => void;
  setSelectedEntity?: (entity: any) => void;
  addToast?: (msg: string, kind?: ToastKind) => void;
}

export function PlayersPage(props: PlayersPageProps = {}) {
  const { t } = useTranslation();
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const [isPlayerModalOpenLocal, setIsPlayerModalOpenLocal] = useState(false);
  const [editingPlayerIdLocal, setEditingPlayerIdLocal] = useState<string | null>(null);
  const [playerFormLocal, setPlayerFormLocal] = useState({ name: "", displayName: "", email: "", imageUrl: "" });
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<any>(null);

  const { dmPlayerPortalSummary, loadDmPlayerPortalSummary, resolvePlayerCharacterProposal } = store;
  const { linkPlayerCharacter, unlinkPlayerCharacter } = store;
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});

  // Invitation state
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null);
  const [networkUrl, setNetworkUrl] = useState<string | null>(null);

  const dmHeaders = useCallback((): Record<string, string> => {
    const token = getDmSessionToken();
    const h: Record<string, string> = { "x-vault-id": store.activeVaultId || "default" };
    if (token) h["x-dm-token"] = token;
    return h;
  }, [store.activeVaultId]);

  const fetchInvitations = useCallback(async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      const res = await fetch(`/api/campaigns/${activeCampaignId}/invitations`, {
        headers: dmHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations ?? []);
      }
    } catch { /* non-fatal */ }
  }, [store.activeCampaignId, dmHeaders]);

  useEffect(() => {
    void fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    fetch("/api/network-info")
      .then((r) => r.json())
      .then((d: any) => { if (d?.url) setNetworkUrl(d.url); })
      .catch(() => {});
  }, []);

  const handleCreateInvite = async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    setInviteLoading(true);
    setNewInviteUrl(null);
    try {
      const res = await fetch(`/api/campaigns/${activeCampaignId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...dmHeaders() },
        body: JSON.stringify({ expiresInHours: 72 }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewInviteUrl(data.registerUrl);
        await fetchInvitations();
      } else {
        addToast(data.error || "Error creating invitation", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Error", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      await fetch(`/api/campaigns/${activeCampaignId}/invitations/${inviteId}`, {
        method: "DELETE",
        headers: dmHeaders(),
      });
      await fetchInvitations();
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    void loadDmPlayerPortalSummary();
  }, [loadDmPlayerPortalSummary]);

  const campaignState = props.campaignState ?? store.campaignState;
  const linkedCharacterIds = new Set(
    ((dmPlayerPortalSummary?.players ?? []) as any[])
      .map((p: any) => p.link?.characterEntityId)
      .filter(Boolean)
  );
  const playerCharacters: Entity[] = ((dmPlayerPortalSummary?.availableCharacters as Entity[] | undefined) ??
    (campaignState?.entities ?? []).filter(
      (e: any) => e.entityType === "player_character" && !e.archived && !linkedCharacterIds.has(e.entityId)
    ));
  const visibility = props.visibility ?? store.visibility;
  const createPlayer = props.createPlayer ?? store.createPlayer;
  const updatePlayer = props.updatePlayer ?? store.updatePlayer;
  const archivePlayer = props.archivePlayer ?? store.archivePlayer;
  const { updateEntity, archiveEntity } = store;
  const isPlayerModalOpen = props.isPlayerModalOpen ?? isPlayerModalOpenLocal;
  const setIsPlayerModalOpen = props.setIsPlayerModalOpen ?? setIsPlayerModalOpenLocal;
  const editingPlayerId = props.editingPlayerId ?? editingPlayerIdLocal;
  const setEditingPlayerId = props.setEditingPlayerId ?? setEditingPlayerIdLocal;
  const playerForm = props.playerForm ?? playerFormLocal;
  const setPlayerForm = props.setPlayerForm ?? setPlayerFormLocal;
  const setSelectedEntity = props.setSelectedEntity ?? setSelectedEntityLocal;
  const addToast = props.addToast ?? toastAdd;

  return (<>
    <div>
      <h2 style={{ fontWeight: "700", marginBottom: "16px" }}>Jugadores y personajes</h2>
      <div className="top-bar" style={{ marginBottom: "16px" }}>
        <button className="btn btn-primary btn-sm" onClick={() => setIsPlayerModalOpen(true)}>
          <Plus size={14} /> Añadir jugador
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setShowInvitePanel((v) => !v); setNewInviteUrl(null); }}
        >
          <Link2 size={14} /> Invitar jugador
        </button>
      </div>

      {showInvitePanel && (
        <div className="card" style={{ marginBottom: "20px", padding: "16px", border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
              <Link2 size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Invitaciones de jugador
            </h3>
            <button className="btn btn-secondary btn-icon" style={{ padding: "4px" }} onClick={() => setShowInvitePanel(false)}>
              <X size={12} />
            </button>
          </div>
          {networkUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", padding: "6px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Wifi size={13} style={{ color: "#34d399", flexShrink: 0 }} />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Red local activa: </span>
              <code style={{ fontSize: "0.78rem", color: "#34d399" }}>{networkUrl}</code>
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreateInvite}
            disabled={inviteLoading}
            style={{ marginBottom: "12px" }}
          >
            <Plus size={14} /> {inviteLoading ? t("players.creatingInvitation") : t("players.createInvitationLink")}
          </button>

          {newInviteUrl && (
            <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                Comparte este enlace con el jugador (válido 72h):
              </p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <code style={{ fontSize: "0.75rem", wordBreak: "break-all", flex: 1, color: "var(--accent)" }}>{newInviteUrl}</code>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ padding: "4px", flexShrink: 0 }}
                  onClick={() => { void navigator.clipboard.writeText(newInviteUrl); addToast("Enlace copiado", "success"); }}
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}

          {invitations.length > 0 && (
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Invitaciones activas:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {invitations.map((inv: any) => (
                  <div key={inv.inviteId} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: "0.8rem",
                  }}>
                    <Clock size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ flex: 1, color: inv.status === "pending" ? "var(--text-main)" : "var(--text-muted)" }}>
                      {inv.label || t("players.invitationFallback", { id: inv.inviteId.slice(-6) })}
                    </span>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: inv.status === "pending" ? "rgba(99,102,241,0.15)" : inv.status === "consumed" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: inv.status === "pending" ? "#818cf8" : inv.status === "consumed" ? "#34d399" : "#f87171",
                    }}>
                      {inv.status === "pending" ? "pendiente" : inv.status === "consumed" ? "usada" : "revocada"}
                    </span>
                    {inv.status === "pending" && (
                      <button
                        className="btn btn-danger btn-icon"
                        style={{ padding: "3px" }}
                        onClick={() => void handleRevokeInvite(inv.inviteId)}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "24px" }} />

      {(campaignState?.players ?? []).length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <User size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p>No hay jugadores registrados. Añade jugadores para llevar el control de quién está en la mesa y vincular sus personajes.</p>
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
                      <div style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px double hsl(38, 60%, 55%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                        flexShrink: 0
                      }}>
                        <img src={player.imageUrl} alt={player.displayName ?? player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px double hsl(38, 60%, 55%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                        flexShrink: 0
                      }}>
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
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Personajes</p>
                  {characters.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>Sin personajes vinculados. Crea una entidad de personaje jugador para asociar uno.</p>
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
              <h3 style={{ fontWeight: "700" }}>{editingPlayerId ? t("players.editProfile") : t("players.addPlayer")}</h3>
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
                  <label className="form-label">Nombre (nombre real) *</label>
                  <input className="form-input" value={playerForm.name} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} placeholder="Ej. Alicia" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nombre para mostrar (apodo)</label>
                  <input className="form-input" value={playerForm.displayName} onChange={e => setPlayerForm({ ...playerForm, displayName: e.target.value })} placeholder="Apodo o alias mostrado en la app" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Correo electrónico (opcional)</label>
                  <input className="form-input" type="email" value={playerForm.email} onChange={e => setPlayerForm({ ...playerForm, email: e.target.value })} placeholder="alicia@example.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">URL de la Imagen (Foto / Avatar)</label>
                  <input className="form-input" value={playerForm.imageUrl} onChange={e => setPlayerForm({ ...playerForm, imageUrl: e.target.value })} placeholder="https://example.com/avatar.png" />
                  {playerForm.imageUrl && (
                    <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
                      <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "2px double hsl(38, 60%, 55%)",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.4)"
                      }}>
                        <img src={playerForm.imageUrl} alt="Vista previa del avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "" }); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingPlayerId ? t("common.saveChanges") : t("players.addPlayer")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DM Player Portal Summary */}
      {(dmPlayerPortalSummary?.players ?? []).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Portal de jugadores (vista del DM)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {(dmPlayerPortalSummary.players as any[]).map((portalPlayer: any) => {
              const pendingProposals = (portalPlayer.proposals ?? []).filter((p: any) => p.status === "pending");
              return (
                <div key={portalPlayer.playerId ?? portalPlayer.displayName} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <User size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-main)" }}>{portalPlayer.displayName}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {portalPlayer.link?.characterEntityId
                          ? `Personaje vinculado: ${portalPlayer.linkedCharacter?.title ?? portalPlayer.link.characterEntityId}`
                          : "Sin personaje vinculado"}
                      </p>
                    </div>
                  </div>

                  {portalPlayer.sheet && (
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>Estado en vivo</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ fontSize: "0.8rem", padding: "2px 8px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                          HP: {portalPlayer.sheet.status?.hitPointsCurrent ?? "?"} / {portalPlayer.sheet.status?.hitPointsMax ?? "?"}
                        </span>
                        {portalPlayer.sheet.status?.armorClass !== undefined && (
                          <span style={{ fontSize: "0.8rem", padding: "2px 8px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                            CA: {portalPlayer.sheet.status?.armorClass}
                          </span>
                        )}
                        {portalPlayer.sheet.status?.inspiration && (
                          <span style={{ fontSize: "0.8rem", padding: "2px 8px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", color: "var(--primary)" }}>
                            Inspiración
                          </span>
                        )}
                        {(portalPlayer.sheet.status?.conditions ?? []).length > 0 && (portalPlayer.sheet.status?.conditions as string[]).map((cond: string) => (
                          <span key={cond} style={{ fontSize: "0.8rem", padding: "2px 8px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", color: "var(--danger, #e05252)" }}>
                            {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(portalPlayer.notes ?? []).length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Notas visibles (DM)</p>
                      <ul style={{ margin: 0, paddingLeft: "16px" }}>
                        {(portalPlayer.notes as any[]).map((note: any) => (
                          <li key={note.noteId} style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{note.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(portalPlayer.objectives ?? []).length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Objetivos visibles (DM)</p>
                      <ul style={{ margin: 0, paddingLeft: "16px" }}>
                        {(portalPlayer.objectives as any[]).map((obj: any) => (
                          <li key={obj.objectiveId} style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{obj.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pendingProposals.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>Propuestas pendientes</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {pendingProposals.map((proposal: any) => (
                          <div key={proposal.proposalId} style={{ padding: "10px", backgroundColor: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-main)", marginBottom: "6px", fontWeight: 700 }}>
                              {proposal.kind === "link_request" ? "Solicitud de personaje" : proposal.kind === "create_character" ? "Nuevo personaje" : proposal.kind === "update_character_core" ? "Cambio de personaje" : "Propuesta"}
                            </p>
                            {proposal.kind === "link_request" && proposal.targetCharacterEntityId && (
                              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                                Pide vincularse a: {playerCharacters.find((pc) => pc.entityId === proposal.targetCharacterEntityId)?.title ?? proposal.targetCharacterEntityId}
                              </p>
                            )}
                            {proposal.kind === "create_character" && proposal.proposedChanges && (
                              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "8px", display: "grid", gap: "2px" }}>
                                <span><strong>Nombre:</strong> {proposal.proposedChanges.title ?? proposal.proposedChanges.name ?? "—"}</span>
                                <span><strong>Clase:</strong> {proposal.proposedChanges.className ?? "—"}</span>
                                <span><strong>Especie:</strong> {proposal.proposedChanges.species ?? proposal.proposedChanges.race ?? "—"}</span>
                                <span><strong>Trasfondo:</strong> {proposal.proposedChanges.background ?? "—"}</span>
                              </div>
                            )}
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button className="btn btn-primary btn-sm" onClick={() => resolvePlayerCharacterProposal(proposal.proposalId, { status: "approved", dmResolutionNote: "Aprobado" })}>
                                Aprobar
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => resolvePlayerCharacterProposal(proposal.proposalId, { status: "rejected", dmResolutionNote: "Rechazado por el DM" })}>
                                Rechazar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Character Assignment */}
                  <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Asignar personaje
                    </p>
                    {portalPlayer.link?.characterEntityId ? (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                          Vinculado: {portalPlayer.linkedCharacter?.title ?? portalPlayer.link.characterEntityId}
                        </p>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (confirm("¿Desvincular este personaje del jugador?")) {
                              void unlinkPlayerCharacter(portalPlayer.playerId);
                            }
                          }}
                        >
                          Desvincular
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <select
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--surface-2)",
                            color: "var(--text-main)",
                          }}
                          value={assignSelections[portalPlayer.playerId] ?? ""}
                          onChange={(e) =>
                            setAssignSelections((prev) => ({
                              ...prev,
                              [portalPlayer.playerId]: e.target.value,
                            }))
                          }
                        >
                          <option value="">-- Seleccionar personaje --</option>
                          {playerCharacters.map((pc) => (
                            <option key={pc.entityId} value={pc.entityId}>
                              {pc.title}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!assignSelections[portalPlayer.playerId]}
                          onClick={async () => {
                            const characterEntityId = assignSelections[portalPlayer.playerId];
                            if (!characterEntityId) return;
                            await linkPlayerCharacter(portalPlayer.playerId, characterEntityId);
                            setAssignSelections((prev) => {
                              const next = { ...prev };
                              delete next[portalPlayer.playerId];
                              return next;
                            });
                          }}
                        >
                          Asignar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Party Knowledge Summary */}
      {visibility && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Eye size={18} style={{ color: "var(--primary)" }} /> Conocimiento del grupo
            <span style={{ fontSize: "0.8rem", fontWeight: "400", color: "var(--text-muted)" }}>
              — {visibility.summary?.partyKnowsCount ?? 0} de {visibility.summary?.total ?? 0} entidades reveladas al grupo
            </span>
          </h3>
          {(visibility.partyKnows ?? []).length === 0 ? (
            <div className="card" style={{ padding: "20px", color: "var(--text-muted)", textAlign: "center" }}>
              <EyeOff size={32} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p>Nada revelado al grupo todavía. Usa "Revelar al grupo" en los detalles de una entidad o revela pistas durante las sesiones.</p>
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
