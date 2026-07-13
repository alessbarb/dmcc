import { useState, useEffect, useCallback } from "react";
import { Plus, X, User, Pencil, Archive, Eye, EyeOff, ShieldCheck, Link2, Copy, Trash2, Clock, Wifi, MessageSquare, Target } from "lucide-react";
import type { Entity, PlayerProfile, Campaign, StoreCampaignState } from "../../shared/stores/campaignStore.js";
import type { ToastKind } from "../../shared/hooks/useToast.js";
import { useCampaignStore } from "../../shared/stores/campaignStore.js";
import { useToast } from "../../shared/hooks/useToast.js";
import { EntityDetailModal } from "../entities/EntityDetailModal.js";
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";
import { apiFetch } from "../../shared/api/apiClient.js";
import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type CampaignInvitationStatus = "active" | "exhausted" | "expired" | "revoked";

interface CampaignInvitation {
  invitationId: string;
  role: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  status: CampaignInvitationStatus;
}

interface CreateCampaignInvitationResponse {
  invitation: {
    invitationId: string;
    url: string;
    token: string;
    expiresAt: string;
  };
}

function runPlayersAction(operation: Promise<unknown>, errorMessage: string): void {
  void operation.catch((error: unknown) => {
    console.error(errorMessage, error);
  });
}

interface ListCampaignInvitationsResponse {
  invitations: CampaignInvitation[];
}

function invitationDisplayId(invitationId: string): string {
  return invitationId.length > 6 ? invitationId.slice(-6) : invitationId;
}

function isInvitationStatus(value: unknown): value is CampaignInvitationStatus {
  return value === "active" || value === "exhausted" || value === "expired" || value === "revoked";
}

function normalizeInvitation(value: unknown): CampaignInvitation | null {
  if (!isRecord(value)) return null;
  const record = value;
  if (
    typeof record.invitationId !== "string" ||
    typeof record.role !== "string" ||
    typeof record.maxUses !== "number" ||
    typeof record.usesCount !== "number" ||
    typeof record.expiresAt !== "string" ||
    !(record.revokedAt === null || typeof record.revokedAt === "string") ||
    typeof record.createdAt !== "string" ||
    !isInvitationStatus(record.status)
  ) {
    return null;
  }
  return {
    invitationId: record.invitationId,
    role: record.role,
    maxUses: record.maxUses,
    usesCount: record.usesCount,
    expiresAt: record.expiresAt,
    revokedAt: record.revokedAt,
    createdAt: record.createdAt,
    status: record.status,
  };
}

function normalizeListCampaignInvitationsResponse(value: unknown): ListCampaignInvitationsResponse {
  if (!isRecord(value) || !Array.isArray(value.invitations)) {
    throw new Error("Invalid invitations response");
  }
  const invitations: CampaignInvitation[] = [];
  for (const raw of value.invitations) {
    const invitation = normalizeInvitation(raw);
    if (!invitation) {
      throw new Error("Invalid invitation in response");
    }
    invitations.push(invitation);
  }
  return { invitations };
}

function normalizeCreateCampaignInvitationResponse(value: unknown): CreateCampaignInvitationResponse {
  if (!isRecord(value)) throw new Error("Invalid invitation response");
  const invitation = value.invitation;
  if (!isRecord(invitation)) throw new Error("Invalid invitation response");
  const record = invitation;
  if (
    typeof record.invitationId !== "string" ||
    typeof record.url !== "string" ||
    typeof record.token !== "string" ||
    typeof record.expiresAt !== "string"
  ) {
    throw new Error("Invalid invitation response");
  }
  return { invitation: { invitationId: record.invitationId, url: record.url, token: record.token, expiresAt: record.expiresAt } };
}

// Response shape for GET /api/campaigns/:id/player-portal/dm-character-summary — modeled from
// the handler in src/backend/server/web/routes/playerCharacterLinkWebRoutes.ts. `proposals[]` is
// a spread of the raw DB row plus its freeform JSON `content` blob, so only the fields this page
// actually reads are declared here.
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

// The `/api/campaigns/:id/visibility` endpoint currently only returns `{ grants }` (see
// campaignWebRoutes.ts); it does not yet produce the `{ summary, partyKnows }` shape this page
// reads below. That's a pre-existing gap (the party-knowledge summary always renders empty), out
// of scope for this pass — this type documents what the UI expects if/when that projection ships.
interface PartyKnowledgeEntitySummary {
  entityId: string;
  entityType: string;
  title: string;
}

interface PartyKnowledgeSummary {
  summary?: { partyKnowsCount?: number; total?: number };
  partyKnows?: PartyKnowledgeEntitySummary[];
}

export interface PlayersPageProps {
  campaignState?: StoreCampaignState;
  campaigns?: Campaign[];
  activeCampaignId?: string | null;
  visibility?: PartyKnowledgeSummary;
  createPlayer?: (name: string, displayName?: string, email?: string, imageUrl?: string, avatarUrl?: string) => Promise<void>;
  updatePlayer?: (playerId: string, data: Partial<PlayerProfile>) => Promise<void>;
  archivePlayer?: (playerId: string) => Promise<void>;
  isPlayerModalOpen?: boolean;
  setIsPlayerModalOpen?: (open: boolean) => void;
  editingPlayerId?: string | null;
  setEditingPlayerId?: (id: string | null) => void;
  playerForm?: { name: string; displayName: string; email: string; imageUrl: string; avatarUrl?: string };
  setPlayerForm?: (form: { name: string; displayName: string; email: string; imageUrl: string; avatarUrl?: string }) => void;
  setSelectedEntity?: (entity: Entity | null) => void;
  addToast?: (msg: string, kind?: ToastKind) => void;
}

export function PlayersPage(props: PlayersPageProps = {}) {
  const { t } = useTranslation();
  const store = useCampaignStore();
  const { addToast: toastAdd } = useToast();
  const [isPlayerModalOpenLocal, setIsPlayerModalOpenLocal] = useState(false);
  const [editingPlayerIdLocal, setEditingPlayerIdLocal] = useState<string | null>(null);
  const [playerFormLocal, setPlayerFormLocal] = useState<{ name: string; displayName: string; email: string; imageUrl: string; avatarUrl?: string }>({ name: "", displayName: "", email: "", imageUrl: "", avatarUrl: "" });
  const [selectedEntityLocal, setSelectedEntityLocal] = useState<Entity | null>(null);

  const { loadDmPlayerPortalSummary, resolvePlayerCharacterProposal } = store;
  // Cast at the store boundary: the store types this field as `unknown` since it comes straight
  // from a JSON network response. Shape modeled in DmPlayerPortalSummary above.
  const dmPlayerPortalSummary = store.dmPlayerPortalSummary as DmPlayerPortalSummary | null;
  const { linkPlayerCharacter, unlinkPlayerCharacter } = store;
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});

  // Invitation state
  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null);
  const [networkUrl, setNetworkUrl] = useState<string | null>(null);
  const addToast = props.addToast ?? toastAdd;

  const fetchInvitations = useCallback(async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      const res = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`);
      if (!res.ok) {
        throw new Error(t("players.invitationListError"));
      }
      const data: unknown = await res.json();
      setInvitations(normalizeListCampaignInvitationsResponse(data).invitations);
      setInvitationError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("players.invitationListError");
      setInvitationError(message);
      addToast(message, "error");
    }
  }, [addToast, store.activeCampaignId, t]);

  useEffect(() => {
    runPlayersAction(fetchInvitations(), "No se pudieron cargar las invitaciones.");
  }, [fetchInvitations]);

  useEffect(() => {
    fetch("/api/network-info")
      .then(async (r) => {
        if (!r.ok) {
          setNetworkUrl(null);
          return null;
        }
        return r.json();
      })
      .then((d: unknown) => {
        if (d && typeof d === "object" && "url" in d && typeof d.url === "string") {
          setNetworkUrl(d.url);
        }
      })
      .catch(() => setNetworkUrl(null));
  }, []);

  const handleCreateInvite = async () => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    setInviteLoading(true);
    setNewInviteUrl(null);
    try {
      const res = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations`, {
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expiresInHours: 72 }),
        },
      });
      const data: unknown = await res.json();
      if (res.ok) {
        const created = normalizeCreateCampaignInvitationResponse(data);
        setNewInviteUrl(created.invitation.url);
        await fetchInvitations();
      } else {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : t("players.invitationCreateError");
        addToast(message, "error");
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : t("players.invitationCreateError"), "error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    const activeCampaignId = store.activeCampaignId;
    if (!activeCampaignId) return;
    try {
      const response = await apiFetch(`/api/campaigns/${activeCampaignId}/invitations/${invitationId}/revoke`, {
        init: { method: "POST" },
      });
      if (!response.ok) {
        throw new Error(t("players.invitationRevokeError"));
      }
      await fetchInvitations();
    } catch (error) {
      addToast(error instanceof Error ? error.message : t("players.invitationRevokeError"), "error");
    }
  };

  useEffect(() => {
    runPlayersAction(loadDmPlayerPortalSummary(), "No se pudo cargar el resumen del portal de jugadores.");
  }, [loadDmPlayerPortalSummary]);

  const campaignState = props.campaignState ?? store.campaignState;
  const linkedCharacterIds = new Set(
    (dmPlayerPortalSummary?.players ?? [])
      .map((p) => p.link?.characterEntityId)
      .filter((id): id is string => Boolean(id))
  );
  const playerCharacters: DmPortalCharacterSummary[] = dmPlayerPortalSummary?.availableCharacters ??
    (campaignState?.entities ?? []).filter(
      (e) => e.entityType === "player_character" && !e.archived && !linkedCharacterIds.has(e.entityId)
    );
  // Cast at the store boundary; see the PartyKnowledgeSummary comment above for the known
  // mismatch with the current backend response shape.
  const visibility = (props.visibility ?? store.visibility) as PartyKnowledgeSummary | null;
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

  return (<>
    <div>
      <h2 style={{ fontWeight: "700", marginBottom: "16px" }}>{t("players.title")}</h2>
      <div className="top-bar" style={{ marginBottom: "16px" }}>
        <button className="btn btn-primary btn-sm" onClick={() => setIsPlayerModalOpen(true)}>
          <Plus size={14} /> {t("players.addPlayer")}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setShowInvitePanel((v) => !v); setNewInviteUrl(null); }}
        >
          <Link2 size={14} /> {t("players.invitePlayer")}
        </button>
      </div>

      {showInvitePanel && (
        <div className="card" style={{ marginBottom: "20px", padding: "16px", border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
              <Link2 size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t("players.playerInvitations")}
            </h3>
            <button className="btn btn-secondary btn-icon" style={{ padding: "4px" }} onClick={() => setShowInvitePanel(false)} aria-label={t("players.closeInvitationsPanel")}>
              <X size={12} />
            </button>
          </div>
          {networkUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", padding: "6px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Wifi size={13} style={{ color: "#34d399", flexShrink: 0 }} />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t("players.localNetworkActive")} </span>
              <code style={{ fontSize: "0.78rem", color: "#34d399" }}>{networkUrl}</code>
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              runPlayersAction(handleCreateInvite(), "No se pudo crear la invitación.");
            }}
            disabled={inviteLoading}
            aria-busy={inviteLoading}
            aria-live="polite"
            style={{ marginBottom: "12px" }}
          >
            <Plus size={14} /> {inviteLoading ? t("players.creatingInvitation") : t("players.createInvitationLink")}
          </button>

          {invitationError && (
            <p role="alert" style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "12px" }}>{invitationError}</p>
          )}

          {newInviteUrl && (
            <div aria-live="polite" style={{ background: "rgba(99,102,241,0.08)", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                {t("players.shareInvitationLink")}
              </p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <code style={{ fontSize: "0.75rem", wordBreak: "break-all", flex: 1, color: "var(--accent)" }}>{newInviteUrl}</code>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ padding: "4px", flexShrink: 0 }}
                  aria-label={t("players.copyInvitationLink")}
                  onClick={() => {
                    navigator.clipboard.writeText(newInviteUrl)
                      .then(() => addToast(t("players.linkCopied"), "success"))
                      .catch(() => addToast(t("players.copyInvitationError"), "error"));
                  }}
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}

          {invitations.length > 0 && (
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>{t("players.activeInvitations")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {invitations.map((inv) => (
                  <div key={inv.invitationId} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: "0.8rem",
                  }}>
                    <Clock size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                    <span style={{ flex: 1, color: inv.status === "active" ? "var(--text-main)" : "var(--text-muted)" }}>
                      {t("players.invitationFallback", { id: invitationDisplayId(inv.invitationId) })}
                    </span>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: inv.status === "active" ? "rgba(99,102,241,0.15)" : inv.status === "exhausted" ? "rgba(16,185,129,0.15)" : inv.status === "expired" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                      color: inv.status === "active" ? "#818cf8" : inv.status === "exhausted" ? "#34d399" : inv.status === "expired" ? "#fbbf24" : "#f87171",
                    }}>
                      {t(`players.invitationStatus${inv.status.charAt(0).toUpperCase()}${inv.status.slice(1)}`)}
                    </span>
                    {inv.status === "active" && (
                      <button
                        className="btn btn-danger btn-icon"
                        style={{ padding: "3px" }}
                        aria-label={t("players.revokeInvitation")}
                        onClick={() => {
                          runPlayersAction(handleRevokeInvite(inv.invitationId), "No se pudo revocar la invitación.");
                        }}
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

      {/* Add/Edit Player Modal */}
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

      {/* DM Player Portal Summary */}
      {(dmPlayerPortalSummary?.players ?? []).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Portal de jugadores (vista del DM)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {(dmPlayerPortalSummary?.players ?? []).map((portalPlayer) => {
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
              {(visibility.partyKnows ?? []).map((e) => (
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
