import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignStore } from "../stores/campaignStore.js";
import {
  User,
  Shield,
  BookOpen,
  Plus,
  Trash2,
  GitFork,
  FileText
} from "lucide-react";

export function PlayerPortalView({ campaignId }: { campaignId: string }) {
  const navigate = useNavigate();
  const { campaignState, selectCampaign, createEntity, updateEntity, archiveEntity } = useCampaignStore();
  const [activeTab, setActiveTab] = useState<"character" | "story" | "clues" | "notes" | "relations">("character");
  
  // Note creation form
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Edit character sheet
  const [isEditingChar, setIsEditingChar] = useState(false);
  const [charForm, setCharForm] = useState<any>({});

  const playerId = sessionStorage.getItem("dmcc_playerId");
  
  useEffect(() => {
    selectCampaign(campaignId);
  }, [campaignId]);

  if (!campaignState) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-muted)" }}>
        Cargando portal del jugador...
      </div>
    );
  }

  const player = campaignState.players?.find(p => p.playerId === playerId);
  const myCharacter = campaignState.entities?.find(e => e.entityType === "player_character" && e.metadata?.playerId === playerId);
  const visibleQuests = campaignState.entities?.filter(e => e.entityType === "quest" && !e.archived);
  const visibleClues = campaignState.entities?.filter(e => e.entityType === "clue" && !e.archived);
  const visibleFacts = campaignState.facts?.filter(f => !f.archived);
  const visibleSessions = campaignState.sessions?.filter(s => s.status === "closed" || s.status === "active");
  const myNotes = campaignState.entities?.filter(e => e.entityType === "note" && !e.archived && e.visibility?.playerIds?.includes(playerId));

  const handleCreateNoteSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    await createEntity({
      entityType: "note",
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      visibility: { kind: "players", playerIds: [playerId!] },
      status: "active"
    });
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsCreatingNote(false);
  };

  const handleEditCharSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!myCharacter) return;
    await updateEntity(myCharacter.entityId, {
      metadata: {
        ...myCharacter.metadata,
        hitPointsCurrent: parseInt(charForm.hitPointsCurrent) || 10,
        hitPointsMax: parseInt(charForm.hitPointsMax) || 10,
        armorClass: parseInt(charForm.armorClass) || 10
      }
    });
    setIsEditingChar(false);
  };

  const handleExit = () => {
    sessionStorage.clear();
    useCampaignStore.setState({ activeCampaignId: null, campaignState: null });
    navigate({ to: "/" });
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: "260px", flexShrink: 0 }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">{campaignState.campaign?.title}</div>
          <div className="sidebar-logo-subtitle">Portal del Jugador</div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--primary)", color: "var(--text-main)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontWeight: "700" }}>
            {player?.displayName?.slice(0, 2).toUpperCase() || "PL"}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{player?.displayName}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Jugador</div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flexGrow: 1, padding: "16px 0" }}>
          <div className={`nav-item ${activeTab === "character" ? "active" : ""}`} onClick={() => setActiveTab("character")}>
            <User size={16} /> Mi Personaje
          </div>
          <div className={`nav-item ${activeTab === "story" ? "active" : ""}`} onClick={() => setActiveTab("story")}>
            <Shield size={16} /> Misiones & Sesiones
          </div>
          <div className={`nav-item ${activeTab === "clues" ? "active" : ""}`} onClick={() => setActiveTab("clues")}>
            <BookOpen size={16} /> Pistas & Hechos
          </div>
          <div className={`nav-item ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
            <FileText size={16} /> Mis Notas
          </div>
          <div className={`nav-item ${activeTab === "relations" ? "active" : ""}`} onClick={() => setActiveTab("relations")}>
            <GitFork size={16} /> Relaciones
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={handleExit}>
            Salir del Portal
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div className="top-bar">
          <div className="top-bar-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>
              {activeTab === "character" && "Mi Personaje"}
              {activeTab === "story" && "Misiones y Bitácora de Sesiones"}
              {activeTab === "clues" && "Pistas y Hechos Revelados"}
              {activeTab === "notes" && "Diario Personal del Jugador"}
              {activeTab === "relations" && "Relaciones Narrativas"}
            </span>
          </div>
          <div className="top-bar-actions">
            {myCharacter && (
              <span className="badge badge-success">
                Vínculo: {myCharacter.title} ({myCharacter.metadata?.className || "Sin clase"})
              </span>
            )}
          </div>
        </div>

        <div className="content-body" style={{ padding: "32px", maxWidth: "900px", width: "100%", margin: "0 auto" }}>
          
          {/* TAB 1: Character Sheet */}
          {activeTab === "character" && (
            <div>
              {!myCharacter ? (
                <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                  <User size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
                  <h3>Sin personaje vinculado</h3>
                  <p style={{ marginTop: "6px" }}>
                    No tienes ningún personaje vinculado a tu perfil. Pídele al DM que asigne tu ficha de personaje a tu perfil "{player?.displayName}".
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="card" style={{ display: "flex", gap: "24px", padding: "24px", background: "linear-gradient(135deg, hsla(255, 85%, 65%, 0.1), transparent)" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-2)", border: "1px solid var(--border-color)", overflow: "hidden", flexShrink: 0 }}>
                      <img src={myCharacter.metadata?.imageUrl || "/assets/default_npc.png"} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>{myCharacter.title}</h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                        Nivel {myCharacter.metadata?.level || 1} {myCharacter.metadata?.species || "Raza desconocida"} {myCharacter.metadata?.className || "Sin clase"}
                      </p>
                      {myCharacter.metadata?.background && (
                        <p style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "8px", color: "var(--text-main)" }}>
                          Traspasado: {myCharacter.metadata.background}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3" style={{ gap: "16px" }}>
                    <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Puntos de Vida (HP)</span>
                      <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "6px" }}>
                        {myCharacter.metadata?.hitPointsCurrent ?? 10} / {myCharacter.metadata?.hitPointsMax ?? 10}
                      </h3>
                    </div>
                    <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Clase de Armadura (AC)</span>
                      <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "6px" }}>
                        {myCharacter.metadata?.armorClass ?? 10}
                      </h3>
                    </div>
                    <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700" }}>Percepción Pasiva</span>
                      <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginTop: "6px" }}>
                        {myCharacter.metadata?.passivePerception ?? 10}
                      </h3>
                    </div>
                  </div>

                  <div className="card">
                    <h3 style={{ fontWeight: "700", marginBottom: "12px" }}>Notas de Personaje</h3>
                    <p style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}>
                      {myCharacter.content || "Sin notas biográficas añadidas por el DM."}
                    </p>
                  </div>

                  {/* Quick HP update card */}
                  <div className="card">
                    <h3 style={{ fontWeight: "700", marginBottom: "16px" }}>Actualización Rápida</h3>
                    {isEditingChar ? (
                      <form onSubmit={handleEditCharSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">HP Actual</label>
                          <input type="number" className="form-input" style={{ width: "80px" }} value={charForm.hitPointsCurrent} onChange={e => setCharForm({ ...charForm, hitPointsCurrent: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">HP Máx</label>
                          <input type="number" className="form-input" style={{ width: "80px" }} value={charForm.hitPointsMax} onChange={e => setCharForm({ ...charForm, hitPointsMax: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Armadura (AC)</label>
                          <input type="number" className="form-input" style={{ width: "80px" }} value={charForm.armorClass} onChange={e => setCharForm({ ...charForm, armorClass: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingChar(false)}>Cancelar</button>
                      </form>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setCharForm({
                          hitPointsCurrent: String(myCharacter.metadata?.hitPointsCurrent ?? 10),
                          hitPointsMax: String(myCharacter.metadata?.hitPointsMax ?? 10),
                          armorClass: String(myCharacter.metadata?.armorClass ?? 10)
                        });
                        setIsEditingChar(true);
                      }}>
                        Modificar HP / AC
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Quests & Sessions */}
          {activeTab === "story" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <section>
                <h3 style={{ fontWeight: "800", marginBottom: "16px", color: "var(--primary)" }}>Misiones Activas</h3>
                {visibleQuests?.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No hay misiones conocidas actualmente.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {visibleQuests?.map(q => (
                      <div key={q.entityId} className="card" style={{ padding: "16px" }}>
                        <h4 style={{ fontWeight: "700" }}>{q.title}</h4>
                        {q.subtitle && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>{q.subtitle}</p>}
                        <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>{q.summary || q.content}</p>
                        {q.metadata?.publicObjective && (
                          <div style={{ marginTop: "10px", fontSize: "0.85rem", padding: "6px 10px", backgroundColor: "var(--surface-2)", borderRadius: "4px" }}>
                            <strong>Objetivo:</strong> {q.metadata.publicObjective}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 style={{ fontWeight: "800", marginBottom: "16px", color: "var(--secondary)" }}>Bitácora de Sesiones</h3>
                {visibleSessions?.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No hay registros de sesiones cerradas.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {visibleSessions?.slice().reverse().map(s => (
                      <div key={s.sessionId} className="card" style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <h4 style={{ fontWeight: "700" }}>{s.title}</h4>
                          <span className={`badge ${s.status === "active" ? "badge-success" : "badge-default"}`}>
                            {s.status === "active" ? "En curso" : "Finalizada"}
                          </span>
                        </div>
                        {s.summary && (
                          <p style={{ fontSize: "0.9rem", marginTop: "10px", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                            {s.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: Clues & Facts */}
          {activeTab === "clues" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <section>
                <h3 style={{ fontWeight: "800", marginBottom: "16px", color: "var(--primary)" }}>Pistas Reveladas</h3>
                {visibleClues?.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No se han descubierto pistas aún en el diario del grupo.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {visibleClues?.map(c => (
                      <div key={c.entityId} className="card" style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <h4 style={{ fontWeight: "700" }}>{c.title}</h4>
                          <span className="badge" style={{ backgroundColor: "hsla(38, 95%, 55%, 0.15)", color: "hsl(38, 95%, 55%)", border: "1px solid hsl(38, 95%, 55%)", fontSize: "0.7rem" }}>
                            {c.metadata?.clueType || "Pista"}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.9rem", marginTop: "10px", fontStyle: "italic", borderLeft: "2px solid var(--border-color)", paddingLeft: "10px" }}>
                          "{c.metadata?.content || c.content || c.summary}"
                        </p>
                        {c.metadata?.interpretation && (
                          <p style={{ fontSize: "0.85rem", marginTop: "10px", color: "var(--text-muted)" }}>
                            <strong>Interpretación:</strong> {c.metadata.interpretation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 style={{ fontWeight: "800", marginBottom: "16px", color: "var(--secondary)" }}>Hechos Confirmados</h3>
                {visibleFacts?.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No hay hechos revelados aún.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {visibleFacts?.map(f => (
                      <div key={f.factId} className="card" style={{ padding: "12px 16px", borderLeft: "4px solid hsl(120, 60%, 45%)" }}>
                        <p style={{ fontSize: "0.9rem", margin: 0 }}>{f.statement}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 4: Player Notes */}
          {activeTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: "800", margin: 0 }}>Mis Notas Personales</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setIsCreatingNote(true)}>
                  <Plus size={14} /> Nueva Nota
                </button>
              </div>

              {isCreatingNote && (
                <div className="card" style={{ padding: "20px", border: "1px solid var(--secondary)" }}>
                  <h4 style={{ fontWeight: "700", marginBottom: "12px" }}>Escribir Nota</h4>
                  <form onSubmit={handleCreateNoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Título</label>
                      <input type="text" className="form-input" placeholder="e.g. Sospechas sobre Lord Malvus" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Contenido</label>
                      <textarea className="form-textarea" rows={4} placeholder="Escribe tus observaciones aquí..." value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCreatingNote(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary btn-sm">Guardar Nota</button>
                    </div>
                  </form>
                </div>
              )}

              {myNotes?.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No has escrito ninguna nota privada aún.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {myNotes?.map(n => (
                    <div key={n.entityId} className="card" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontWeight: "700" }}>{n.title}</h4>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          style={{ padding: "4px" }}
                          onClick={async () => {
                            if (confirm("¿Seguro que deseas eliminar esta nota?")) {
                              await archiveEntity(n.entityId);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {n.content && (
                        <p style={{ fontSize: "0.9rem", marginTop: "8px", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                          {n.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Relations */}
          {activeTab === "relations" && (
            <div>
              <h3 style={{ fontWeight: "800", marginBottom: "16px" }}>Relaciones Descubiertas</h3>
              {(!campaignState.relations || campaignState.relations.length === 0) ? (
                <p style={{ color: "var(--text-muted)" }}>No hay conexiones conocidas registradas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {campaignState.relations.filter((r: any) => !r.archived).map((r: any) => {
                    const src = campaignState.entities.find(e => e.entityId === r.sourceEntityId);
                    const tgt = campaignState.entities.find(e => e.entityId === r.targetEntityId);
                    if (!src || !tgt) return null;
                    return (
                      <div key={r.relationId} className="card" style={{ padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontWeight: "600", color: "var(--primary)" }}>{src.title}</span>
                        <span className="badge" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)" }}>
                          {r.relationType.replace(/_/g, " ")}
                        </span>
                        <span style={{ fontWeight: "600", color: "var(--secondary)" }}>{tgt.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
