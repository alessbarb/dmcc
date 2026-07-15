import React, { useState, useEffect } from "react";
import { Plus, X, User, Pencil, Archive, Eye, ShieldCheck, MessageSquare, Target } from "lucide-react";
import type { Entity, PlayerProfile } from "../../../shared/stores/campaignStore.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { EntityDetailModal } from "../../entities/EntityDetailModal.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { ImagePickerButton } from "../../../shared/components/ImagePickerButton.js";

interface DmPortalCharacterSummary {
  entityId: string;
  entityType: string;
  title: string;
  summary?: string;
  status?: string;
  importance?: string;
}

interface DmPortalProposal {
  proposalId: string;
  kind?: string;
  status?: string;
  targetCharacterEntityId?: string;
  proposedChanges?: {
    title?: string;
    name?: string;
    className?: string;
    species?: string;
    race?: string;
    background?: string;
  };
}

interface DmPortalObjective {
  objectiveId: string;
  title: string;
  description?: string;
  status?: string;
  kind?: string;
}

interface DmPortalNote {
  noteId: string;
  title: string;
  content?: string;
}

interface DmPortalPlayerSheetStatus {
  hitPointsCurrent?: number;
  hitPointsMax?: number;
  armorClass?: number;
  inspiration?: boolean;
  conditions?: string[];
}

interface DmPortalPlayer {
  playerId: string;
  displayName: string;
  link: { characterEntityId: string } | null;
  linkedCharacter?: DmPortalCharacterSummary | null;
  sheet?: { status?: DmPortalPlayerSheetStatus };
  proposals?: DmPortalProposal[];
  objectives?: DmPortalObjective[];
  notes?: DmPortalNote[];
}

interface DmPlayerPortalSummary {
  players: DmPortalPlayer[];
  availableCharacters?: DmPortalCharacterSummary[];
}

function runPlayersAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

export function GroupView() {
  const { t } = useTranslation();
  const store = useCampaignStore();
  const { addToast } = useToast();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState<{ name: string; displayName: string; email: string; imageUrl: string; avatarUrl?: string }>({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" });
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const { loadDmPlayerPortalSummary, resolvePlayerCharacterProposal, linkPlayerCharacter, unlinkPlayerCharacter } = store;
  const dmPlayerPortalSummary = store.dmPlayerPortalSummary as DmPlayerPortalSummary | null;
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    runPlayersAction(loadDmPlayerPortalSummary(), "No se pudo cargar el resumen del portal de jugadores.");
  }, [loadDmPlayerPortalSummary]);

  const campaignState = store.campaignState;
  const linkedCharacterIds = new Set(
    (dmPlayerPortalSummary?.players ?? [])
      .map((p) => p.link?.characterEntityId)
      .filter((id): id is string => Boolean(id))
  );
  const playerCharacters: DmPortalCharacterSummary[] = dmPlayerPortalSummary?.availableCharacters ??
    (campaignState?.entities ?? []).filter(
      (e: Entity) => e.entityType === "player_character" && !e.archived && !linkedCharacterIds.has(e.entityId)
    );

  const { createPlayer, updatePlayer, archivePlayer, updateEntity, archiveEntity } = store;

  const portalPlayers = dmPlayerPortalSummary?.players ?? [];
  const pendingProposalItems = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.proposals ?? [])
      .filter((proposal) => proposal.status === "pending")
      .map((proposal) => ({ portalPlayer, proposal }))
  );
  const dmQuestionItems = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.objectives ?? [])
      .filter((objective) => objective.status === "open" && objective.kind === "question_for_dm")
      .map((objective) => ({ portalPlayer, objective }))
  );
  const dmVisibleNotes = portalPlayers.flatMap((portalPlayer) =>
    (portalPlayer.notes ?? []).map((note) => ({ portalPlayer, note }))
  );
  const dmInboxCount = pendingProposalItems.length + dmQuestionItems.length + dmVisibleNotes.length;

  return (
    <>
      <div>
        <div className="top-bar" style={{ marginBottom: "16px" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setIsPlayerModalOpen(true)}>
            <Plus size={14} /> {t("players.addPlayer")}
          </button>
        </div>

        {dmInboxCount > 0 && (
          <div className="card dm-player-inbox" style={{ marginBottom: "20px", padding: "18px", border: "1px solid rgba(99,102,241,0.34)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <MessageSquare size={18} style={{ color: "var(--primary)" }} /> Bandeja del DM
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", margin: "4px 0 0" }}>
                  Preguntas, notas visibles y propuestas que los jugadores han enviado desde su portal.
                </p>
              </div>
              <span className="badge badge-default">{dmInboxCount} pendiente{dmInboxCount === 1 ? "" : "s"}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
              {pendingProposalItems.slice(0, 4).map(({ portalPlayer, proposal }) => (
                <div key={proposal.proposalId} className="dm-player-inbox-item">
                  <Target size={15} />
                  <div>
                    <strong>{portalPlayer.displayName}</strong>
                    <p>{proposal.kind === "link_request" ? "Solicita personaje existente" : proposal.kind === "create_character" ? "Propone personaje nuevo" : "Propone cambio de personaje"}</p>
                  </div>
                </div>
              ))}
              {dmQuestionItems.slice(0, 6).map(({ portalPlayer, objective }) => (
                <div key={objective.objectiveId} className="dm-player-inbox-item">
                  <MessageSquare size={15} />
                  <div>
                    <strong>{portalPlayer.displayName}: {objective.title}</strong>
                    {objective.description && <p>{objective.description}</p>}
                  </div>
                </div>
              ))}
              {dmVisibleNotes.slice(0, 4).map(({ portalPlayer, note }) => (
                <div key={note.noteId} className="dm-player-inbox-item">
                  <Eye size={15} />
                  <div>
                    <strong>{portalPlayer.displayName}: {note.title}</strong>
                    {note.content && <p>{note.content}</p>}
                  </div>
                </div>
              ))}
            </div>
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
                      <div style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px double hsl(38, 60%, 55%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                        flexShrink: 0
                      }}>
                        <img src={player.avatarUrl || player.imageUrl || "/assets/avatars/default-avatar.png"} alt={player.displayName ?? player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
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
                            imageUrl: player.imageUrl ?? "",
                            avatarUrl: player.avatarUrl ?? ""
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
                          runPlayersAction((async () => {
                            await archivePlayer(player.playerId);
                            addToast(`Jugador "${player.displayName ?? player.name}" archivado.`, "info");
                          })(), "No se pudo archivar el jugador.");
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

        {isPlayerModalOpen && (
          <div className="modal-overlay" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" }); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h3 style={{ fontWeight: "700" }}>{editingPlayerId ? t("players.editProfile") : t("players.addPlayer")}</h3>
                <button className="btn btn-icon btn-secondary" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" }); }}><X size={16} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!playerForm.name.trim()) return;
                runPlayersAction((async () => {
                  const displayNameVal = playerForm.displayName.trim() || playerForm.name.trim();
                  const emailVal = playerForm.email.trim() || null;
                  const imageUrlVal = playerForm.imageUrl.trim() || "";
                  const avatarUrlVal = playerForm.avatarUrl?.trim() || "";

                  if (editingPlayerId) {
                    await updatePlayer(editingPlayerId, {
                      name: playerForm.name.trim(),
                      displayName: displayNameVal,
                      email: emailVal,
                      imageUrl: imageUrlVal,
                      avatarUrl: avatarUrlVal
                    });
                  } else {
                    await createPlayer(
                      playerForm.name.trim(),
                      displayNameVal,
                      emailVal || undefined,
                      imageUrlVal,
                      avatarUrlVal
                    );
                  }
                  setIsPlayerModalOpen(false);
                  setEditingPlayerId(null);
                  setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" });
                })(), "No se pudo guardar el jugador.");
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
                    <label className="form-label">Avatar del jugador</label>
                    <ImagePickerButton
                      value={playerForm.imageUrl || playerForm.avatarUrl || ""}
                      onChange={(path) => setPlayerForm({ ...playerForm, imageUrl: path, avatarUrl: "" })}
                      catalog="avatars"
                      defaultImage="/assets/avatars/default-avatar.png"
                      shape="circle"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsPlayerModalOpen(false); setEditingPlayerId(null); setPlayerForm({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" }); }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingPlayerId ? t("common.saveChanges") : t("players.addPlayer")}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {portalPlayers.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Portal de jugadores (vista del DM)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {portalPlayers.map((portalPlayer) => {
                const pendingProposals = (portalPlayer.proposals ?? []).filter((p) => p.status === "pending");
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
                          {(portalPlayer.sheet.status?.conditions ?? []).map((cond) => (
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
                          {(portalPlayer.notes ?? []).map((note) => (
                            <li key={note.noteId} style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{note.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(portalPlayer.objectives ?? []).length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Objetivos visibles (DM)</p>
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {(portalPlayer.objectives ?? []).map((obj) => (
                            <li key={obj.objectiveId} style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>{obj.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pendingProposals.length > 0 && (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>Propuestas pendientes</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {pendingProposals.map((proposal) => (
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
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    runPlayersAction(
                                      resolvePlayerCharacterProposal(proposal.proposalId, { status: "approved", dmResolutionNote: "Aprobado" }),
                                      "No se pudo aprobar la propuesta de personaje.",
                                    );
                                  }}
                                >
                                  Aprobar
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    runPlayersAction(
                                      resolvePlayerCharacterProposal(proposal.proposalId, { status: "rejected", dmResolutionNote: "Rechazado por el DM" }),
                                      "No se pudo rechazar la propuesta de personaje.",
                                    );
                                  }}
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                              if (confirm(t("players.unlinkCharacterConfirm"))) {
                                runPlayersAction(unlinkPlayerCharacter(portalPlayer.playerId), "No se pudo desvincular el personaje.");
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
                            onClick={() => {
                              const characterEntityId = assignSelections[portalPlayer.playerId];
                              if (!characterEntityId) return;
                              runPlayersAction((async () => {
                                await linkPlayerCharacter(portalPlayer.playerId, characterEntityId);
                                setAssignSelections((prev) => {
                                  const next = { ...prev };
                                  delete next[portalPlayer.playerId];
                                  return next;
                                });
                              })(), "No se pudo asignar el personaje.");
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
      </div>

      {selectedEntity && campaignState && (
        <EntityDetailModal
          selectedEntity={selectedEntity}
          campaignState={campaignState}
          onClose={() => setSelectedEntity(null)}
          onEdit={async (entityId, updates) => {
            await updateEntity(entityId, updates);
            setSelectedEntity({ ...selectedEntity, ...updates });
          }}
          onArchive={async (entityId) => {
            await archiveEntity(entityId);
            setSelectedEntity(null);
          }}
          onVisibilityChange={async (entityId, visibility) => {
            await updateEntity(entityId, { visibility });
            setSelectedEntity({ ...selectedEntity, visibility });
          }}
          addToast={addToast}
        />
      )}
    </>
  );
}
