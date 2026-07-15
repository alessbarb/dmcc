import { Pencil, Archive } from "lucide-react";
import type { Entity, PlayerProfile } from "../../../../shared/stores/campaignStore.js";
import { useTranslation } from "../../../../shared/i18n/useTranslation.js";

export function GroupPlayerCard({
  player,
  characters,
  onEdit,
  onArchive,
}: {
  player: PlayerProfile;
  characters: Entity[];
  onEdit: () => void;
  onArchive: () => void;
}) {
  const { t } = useTranslation();
  const displayName = player.displayName ?? player.name;

  return (
    <div className="group-player-card card">
      <div className="group-player-card__header">
        <div className="group-player-card__identity">
          <div className="group-player-card__avatar">
            <img src={player.avatarUrl || player.imageUrl || "/assets/avatars/default-avatar.png"} alt="" />
          </div>
          <div className="group-player-card__names">
            <h3>{displayName}</h3>
            {player.email && <p className="group-player-card__email">{player.email}</p>}
          </div>
        </div>

        <div className="group-player-card__actions">
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onEdit}
            aria-label={t("players.editPlayerAction", { name: displayName })}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            className="btn btn-danger btn-icon"
            onClick={onArchive}
            aria-label={t("players.archivePlayerAction", { name: displayName })}
          >
            <Archive size={12} />
          </button>
        </div>
      </div>

      <div className="group-player-card__characters">
        <p className="group-player-card__section-label">{t("players.charactersLabel")}</p>
        {characters.length === 0 ? (
          <p className="group-player-card__empty-hint">{t("players.noLinkedCharacters")}</p>
        ) : (
          <div className="group-player-card__character-list">
            {characters.map((character) => (
              <span key={character.entityId} className="group-character-chip">
                {character.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
