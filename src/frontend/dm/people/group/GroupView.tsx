import { useEffect, useState } from "react";
import { Plus, ShieldCheck, User, Users } from "lucide-react";
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
import "./groupWorkspace.css";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function GroupView() {
  const { t } = useTranslation();
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
              {dmInbox.length > 0 && <span className="group-view-summary__pending"><strong>{dmInbox.length}</strong></span>}
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> {t("players.addPlayer")}
        </button>
      </header>

      <DmPlayerInbox items={dmInbox} />

      <div className={`group-view-overview ${portalPlayers.length > 0 ? "has-portal" : ""}`}>
        <section className="group-view-section" aria-labelledby="group-directory-heading">
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
            <div className="card group-view-empty">
              <User size={42} aria-hidden="true" />
              <p>{t("players.noPlayersRegistered")}</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
                <Plus size={14} /> {t("players.addPlayer")}
              </button>
            </div>
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
        </section>

        {portalPlayers.length > 0 && (
          <section className="group-view-section group-view-section--portal" aria-labelledby="group-portal-heading">
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
