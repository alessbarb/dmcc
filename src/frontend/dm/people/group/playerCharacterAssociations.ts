import type { Entity } from "../../../shared/stores/campaignStore.js";
import type { DmPortalCharacterSummary, DmPortalPlayer } from "../../../shared/api/playerPortalApi.js";

export function getCharactersForPlayer(entities: Entity[], playerId: string): Entity[] {
  return entities.filter(
    (entity) => entity.entityType === "player_character" && !entity.archived && entity.metadata?.playerId === playerId
  );
}

export function getLinkedCharacterIds(portalPlayers: DmPortalPlayer[]): Set<string> {
  return new Set(
    portalPlayers
      .map((portalPlayer) => portalPlayer.link?.characterEntityId)
      .filter((id): id is string => Boolean(id))
  );
}

/**
 * Characters a player could be assigned to. Prefers the server-computed list; falls back to
 * deriving it from campaign entities when the portal summary hasn't provided one. Either way,
 * already-linked characters are excluded so a character can never be offered to a second player.
 */
export function getAvailablePlayerCharacters(
  availableCharacters: DmPortalCharacterSummary[] | undefined,
  campaignEntities: Entity[],
  portalPlayers: DmPortalPlayer[]
): DmPortalCharacterSummary[] {
  const linkedCharacterIds = getLinkedCharacterIds(portalPlayers);

  if (availableCharacters) {
    return availableCharacters.filter((character) => !linkedCharacterIds.has(character.entityId));
  }

  return campaignEntities.filter(
    (entity) => entity.entityType === "player_character" && !entity.archived && !linkedCharacterIds.has(entity.entityId)
  );
}
