import { describe, it, expect } from "vitest";
import {
  getCharactersForPlayer,
  getLinkedCharacterIds,
  getAvailablePlayerCharacters,
} from "../../../../../src/frontend/dm/people/group/playerCharacterAssociations.js";
import type { Entity } from "../../../../../src/frontend/shared/stores/campaignStore.js";
import type { DmPortalPlayer } from "../../../../../src/frontend/shared/api/playerPortalApi.js";

function makeCharacter(overrides: Partial<Entity> = {}): Entity {
  return {
    entityId: "ent_1",
    entityType: "player_character",
    title: "Aldric",
    archived: false,
    metadata: {},
    ...overrides,
  } as Entity;
}

function makePortalPlayer(overrides: Partial<DmPortalPlayer> = {}): DmPortalPlayer {
  return {
    playerId: "ply_1",
    displayName: "Alice",
    link: null,
    ...overrides,
  };
}

describe("getCharactersForPlayer", () => {
  it("returns only non-archived player_character entities owned by the given player", () => {
    const entities = [
      makeCharacter({ entityId: "ent_1", metadata: { playerId: "ply_1" } }),
      makeCharacter({ entityId: "ent_2", metadata: { playerId: "ply_2" } }),
      makeCharacter({ entityId: "ent_3", metadata: { playerId: "ply_1" }, archived: true }),
      makeCharacter({ entityId: "ent_4", entityType: "npc", metadata: { playerId: "ply_1" } }),
    ];
    const result = getCharactersForPlayer(entities, "ply_1");
    expect(result.map((e) => e.entityId)).toEqual(["ent_1"]);
  });

  it("returns an empty array when the player owns no characters", () => {
    expect(getCharactersForPlayer([], "ply_1")).toEqual([]);
  });
});

describe("getLinkedCharacterIds", () => {
  it("collects character ids from players that have a link", () => {
    const players = [
      makePortalPlayer({ playerId: "ply_1", link: { characterEntityId: "ent_1" } }),
      makePortalPlayer({ playerId: "ply_2", link: null }),
      makePortalPlayer({ playerId: "ply_3", link: { characterEntityId: "ent_2" } }),
    ];
    expect(getLinkedCharacterIds(players)).toEqual(new Set(["ent_1", "ent_2"]));
  });
});

describe("getAvailablePlayerCharacters", () => {
  const linkedPlayer = makePortalPlayer({ playerId: "ply_1", link: { characterEntityId: "ent_linked" } });

  it("excludes already-linked characters from the server-provided availableCharacters list", () => {
    const availableCharacters = [
      { entityId: "ent_linked", entityType: "player_character", title: "Linked" },
      { entityId: "ent_free", entityType: "player_character", title: "Free" },
    ];
    const result = getAvailablePlayerCharacters(availableCharacters, [], [linkedPlayer]);
    expect(result.map((c) => c.entityId)).toEqual(["ent_free"]);
  });

  it("excludes already-linked characters when falling back to campaign entities", () => {
    const entities = [
      makeCharacter({ entityId: "ent_linked" }),
      makeCharacter({ entityId: "ent_free" }),
      makeCharacter({ entityId: "ent_archived", archived: true }),
      makeCharacter({ entityId: "ent_npc", entityType: "npc" }),
    ];
    const result = getAvailablePlayerCharacters(undefined, entities, [linkedPlayer]);
    expect(result.map((c) => c.entityId)).toEqual(["ent_free"]);
  });

  it("returns an empty list when every campaign character is already linked", () => {
    const entities = [makeCharacter({ entityId: "ent_linked" })];
    expect(getAvailablePlayerCharacters(undefined, entities, [linkedPlayer])).toEqual([]);
  });
});
