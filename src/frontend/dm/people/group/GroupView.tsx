import { useEffect, useState } from "react";
import { Plus, User, ShieldCheck } from "lucide-react";
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
      <div className="group-view-top-bar">
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
          <Plus size={14} /> {t("players.addPlayer")}
        </button>
      </div>

      <DmPlayerInbox items={dmInbox} />

      {players.length === 0 ? (
        <div className="card group-view-empty">
          <User size={48} aria-hidden="true" />
          <p>{t("players.noPlayersRegistered")}</p>
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

      {isPlayerModalOpen && (
        <PlayerProfileModal
          editingPlayer={editingPlayer}
          onClose={closePlayerModal}
          createPlayer={store.createPlayer}
          updatePlayer={store.updatePlayer}
          addToast={addToast}
        />
      )}

      {portalPlayers.length > 0 && (
        <section>
          <h3 className="group-view-portal-heading">
            <ShieldCheck size={18} aria-hidden="true" /> {t("players.portalHeading")}
          </h3>
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
  );
}
