import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Clock, Link2, Plus, ShieldCheck, User, Users } from "lucide-react";
import type { PlayerProfile } from "../../../shared/stores/campaignStore.js";
import { useCampaignStore } from "../../../shared/stores/campaignStore.js";
import { useToast } from "../../../shared/hooks/useToast.js";
import { useTranslation } from "../../../shared/i18n/useTranslation.js";
import { collectDmInboxItems } from "./dmInbox.js";
import { getAvailablePlayerCharacters, getCharactersForPlayer } from "./playerCharacterAssociations.js";
import { GroupPlayerCard } from "./components/GroupPlayerCard.js";
import { PlayerProfileModal } from "./components/PlayerProfileModal.js";
import { DmPlayerInbox } from "./components/DmPlayerInbox.js";
import { DmPortalPlayerCard } from "./components/DmPortalPlayerCard.js";
import { CompactEmptyState } from "../../../shared/components/CompactEmptyState.js";
import { apiFetch } from "../../../shared/api/apiClient.js";
import "./groupWorkspace.css";

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

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function GroupView() {
  const { t } = useTranslation();
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { addToast } = useToast();
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);

  const { loadDmPlayerPortalSummary } = store;
  useEffect(() => {
    void loadDmPlayerPortalSummary().catch((error: unknown) => {
      console.error("No se pudo cargar el resumen del portal de jugadores.", error);
    });
  }, [loadDmPlayerPortalSummary]);

  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);

  useEffect(() => {
    if (!campaignId) return;
    apiFetch(`/api/campaigns/${campaignId}/invitations`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch invitations");
      })
      .then((data: unknown) => {
        if (data && typeof data === "object" && "invitations" in data && Array.isArray(data.invitations)) {
          setInvitations(data.invitations as CampaignInvitation[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load invitations in GroupView", err);
      });
  }, [campaignId]);

  const activeInvitations = invitations.filter((inv) => inv.status === "active");

  const campaignState = store.campaignState;
  const players = campaignState?.players ?? [];
  const campaignEntities = campaignState?.entities ?? [];
  const portalPlayers = store.dmPlayerPortalSummary?.players ?? [];
  const availableCharacters = getAvailablePlayerCharacters(store.dmPlayerPortalSummary?.availableCharacters, campaignEntities, portalPlayers);
  const dmInbox = collectDmInboxItems(portalPlayers);

  const openCreateModal = () => {
    setEditingPlayer(null);
    setIsPlayerModalOpen(true);
  };

  const openEditModal = (player: PlayerProfile) => {
    setEditingPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setEditingPlayer(null);
  };

  const goToInvitations = () => {
    void navigate({ to: `/campaigns/${campaignId}/people/invitations` });
  };

  const handleArchivePlayer = async (player: PlayerProfile) => {
    const displayName = player.displayName ?? player.name;
    try {
      await store.archivePlayer(player.playerId);
      addToast(t("players.playerArchived", { name: displayName }), "info");
    } catch (err) {
      addToast(t("players.playerArchiveError", { error: errorMessage(err) }), "error");
    }
  };

  return (
    <div className="group-view-workspace">
      <header className="group-view-summary surface-panel">
        <div className="group-view-summary__identity">
          <span className="group-view-summary__icon" aria-hidden="true">
            <Users size={24} />
          </span>
          <div>
            <p className="group-view-summary__eyebrow">{t("campaignShell.nav.players")}</p>
            <div className="group-view-summary__metrics" aria-live="polite">
              <span><strong>{players.length}</strong> {t("campaignShell.nav.players")}</span>
              <span><strong>{portalPlayers.length}</strong> {t("players.portalHeading")}</span>
              {dmInbox.total > 0 && <span className="group-view-summary__pending"><strong>{dmInbox.total}</strong></span>}
            </div>
          </div>
        </div>
        {players.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> {t("players.addPlayer")}
          </button>
        )}
      </header>

      <DmPlayerInbox items={dmInbox} />

      <div className={`group-view-overview master-detail-layout ${portalPlayers.length > 0 ? "has-portal" : ""}`}>
        <section className="group-view-section master-detail-layout__sidebar" aria-labelledby="group-directory-heading">
          <header className="group-view-section__header">
            <div>
              <p className="group-view-section__eyebrow">{players.length}</p>
              <h2 id="group-directory-heading">
                <User size={18} aria-hidden="true" />
                {t("campaignShell.nav.players")}
              </h2>
            </div>
          </header>

          {players.length === 0 ? (
            <CompactEmptyState
              title={t("players.noPlayersRegistered")}
              description={t("players.noPlayersRegisteredDescription")}
              size="standard"
              primaryAction={{
                label: t("players.addPlayer"),
                onClick: openCreateModal,
              }}
              secondaryAction={{
                label: t("players.generateInvitation"),
                onClick: goToInvitations,
              }}
            />
          ) : (
            <div className="group-player-grid">
              {players.map((player) => (
                <GroupPlayerCard
                  key={player.playerId}
                  player={player}
                  characters={getCharactersForPlayer(campaignEntities, player.playerId)}
                  onEdit={() => openEditModal(player)}
                  onArchive={() => { void handleArchivePlayer(player); }}
                />
              ))}
            </div>
          )}

          {activeInvitations.length > 0 && (
            <div className="group-active-invitations" style={{ marginTop: "24px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--theme-text-primary)" }}>
                <Link2 size={16} />
                {t("players.activeInvitations")}
              </h3>
              <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
                {activeInvitations.map((inv) => (
                  <div
                    key={inv.invitationId}
                    className="card"
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "var(--theme-surfaces-base)",
                      border: "1px solid var(--theme-borders-default)",
                      borderRadius: "8px",
                      boxShadow: "var(--theme-shadows-small)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <Clock size={16} style={{ color: "var(--theme-text-secondary)", flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontWeight: 650, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                          {t("players.invitationFallback", { id: inv.invitationId.length > 6 ? inv.invitationId.slice(-6) : inv.invitationId })}
                        </span>
                        <span
                          className="people-status-badge is-active"
                          style={{
                            marginTop: "2px",
                            padding: "1px 6px",
                            fontSize: "10px",
                            border: "1px solid color-mix(in srgb, var(--theme-accents-primary-foreground) 50%, transparent)",
                            background: "color-mix(in srgb, var(--theme-accents-primary-foreground) 12%, transparent)",
                            color: "var(--theme-accents-primary-foreground)",
                            borderRadius: "999px",
                            display: "inline-block"
                          }}
                        >
                          {t("players.invitationStatusActive")}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <span style={{ fontSize: "var(--type-micro)", color: "var(--theme-text-secondary)" }}>
                        {inv.usesCount} / {inv.maxUses}
                      </span>
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={goToInvitations}
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      >
                        {t("players.manageInvitations")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {portalPlayers.length > 0 && (
          <section className="group-view-section group-view-section--portal master-detail-layout__content" aria-labelledby="group-portal-heading">
            <header className="group-view-section__header">
              <div>
                <p className="group-view-section__eyebrow">{portalPlayers.length}</p>
                <h2 id="group-portal-heading">
                  <ShieldCheck size={18} aria-hidden="true" />
                  {t("players.portalHeading")}
                </h2>
              </div>
            </header>
            <div className="group-view-portal-grid">
              {portalPlayers.map((portalPlayer) => (
                <DmPortalPlayerCard
                  key={portalPlayer.playerId}
                  portalPlayer={portalPlayer}
                  availableCharacters={availableCharacters}
                  resolvePlayerCharacterProposal={store.resolvePlayerCharacterProposal}
                  linkPlayerCharacter={store.linkPlayerCharacter}
                  unlinkPlayerCharacter={store.unlinkPlayerCharacter}
                  addToast={addToast}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {isPlayerModalOpen && (
        <PlayerProfileModal
          editingPlayer={editingPlayer}
          onClose={closePlayerModal}
          createPlayer={store.createPlayer}
          updatePlayer={store.updatePlayer}
          addToast={addToast}
        />
      )}
    </div>
  );
}
