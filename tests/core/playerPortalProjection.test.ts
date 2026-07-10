import { describe, expect, it } from "vitest";
import { buildPlayerPortalProjection } from "../../src/core/projections/playerPortalProjection.js";
import type { CampaignProjection } from "../../src/core/projections/campaignProjection.js";
import type { StoredEvent } from "../../src/core/domain/shared/events.js";

function event(type: string, payload: any, sequence = 1): StoredEvent {
  return {
    id: `evt_${sequence}`,
    campaignId: payload.campaignId ?? "cmp_portal",
    sequence,
    type,
    actorId: "usr_test",
    payload,
    timestamp: `2026-06-27T00:00:${String(sequence).padStart(2, "0")}.000Z`,
    hash: `hash_${sequence}`,
  } as unknown as StoredEvent;
}

function campaignProjection(): CampaignProjection {
  return {
    campaign: { campaignId: "cmp_portal", title: "Portal Test", system: "dnd_5_2_1" } as any,
    entities: [
      {
        entityId: "ent_pc_1",
        campaignId: "cmp_portal",
        entityType: "player_character",
        title: "Premade Hero",
        metadata: { playerId: "ply_1", className: "Fighter" },
        visibility: { kind: "party" },
        archived: false,
      } as any,
    ],
    relations: [],
    facts: [],
    sessions: [],
    players: [{ playerId: "ply_1", displayName: "Player One", archived: false } as any],
    tags: [],
    canvases: [],
    settings: {},
    lastSequence: 0,
  } as unknown as CampaignProjection;
}

describe("PlayerPortalProjection", () => {
  it("synthesizes previous metadata.playerId links when no explicit link exists", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), []);

    expect(projection.linksByPlayerId.get("ply_1")?.characterEntityId).toBe("ent_pc_1");
    expect(projection.linksByPlayerId.get("ply_1")?.ownership).toBe("campaign_premade");
  });

  it("uses explicit latest link over previous metadata.playerId", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), [
      event("PlayerCharacterLinked", {
        campaignId: "cmp_portal",
        playerId: "ply_1",
        characterEntityId: "ent_pc_2",
        ownership: "player_owned",
        syncMode: "live_player_editable",
        createdAt: "2026-06-27T00:00:01.000Z",
        updatedAt: "2026-06-27T00:00:01.000Z",
      }),
    ]);

    expect(projection.linksByPlayerId.get("ply_1")?.characterEntityId).toBe("ent_pc_2");
    expect(projection.linksByPlayerId.get("ply_1")?.ownership).toBe("player_owned");
  });

  it("excludes private notes and objectives from dm summary", () => {
    const projection = buildPlayerPortalProjection(campaignProjection(), [
      event("PlayerPortalNoteCreated", {
        noteId: "note_private",
        campaignId: "cmp_portal",
        playerId: "ply_1",
        title: "Private",
        content: "Only me",
        visibility: "private",
        linkedEntityIds: [],
        createdAt: "2026-06-27T00:00:01.000Z",
        updatedAt: "2026-06-27T00:00:01.000Z",
        archived: false,
      }, 1),
      event("PlayerPortalNoteCreated", {
        noteId: "note_dm",
        campaignId: "cmp_portal",
        playerId: "ply_1",
        title: "DM visible",
        content: "Show DM",
        visibility: "dm_visible",
        linkedEntityIds: [],
        createdAt: "2026-06-27T00:00:02.000Z",
        updatedAt: "2026-06-27T00:00:02.000Z",
        archived: false,
      }, 2),
    ]);

    const summary = projection.dmSummaries.find((item) => item.playerId === "ply_1");
    expect(summary?.notes.map((note) => note.noteId)).toEqual(["note_dm"]);
  });
});
