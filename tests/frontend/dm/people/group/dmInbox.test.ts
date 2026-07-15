import { describe, it, expect } from "vitest";
import { collectDmInboxItems } from "../../../../../src/frontend/dm/people/group/dmInbox.js";
import type { DmPortalPlayer } from "../../../../../src/frontend/shared/api/playerPortalApi.js";

describe("collectDmInboxItems", () => {
  it("returns empty collections and zero total for no players", () => {
    expect(collectDmInboxItems([])).toEqual({ proposals: [], questions: [], notes: [], total: 0 });
  });

  it("collects only pending proposals, open DM questions, and all notes", () => {
    const players: DmPortalPlayer[] = [
      {
        playerId: "ply_1",
        displayName: "Alice",
        link: null,
        proposals: [
          { proposalId: "prop_1", status: "pending" },
          { proposalId: "prop_2", status: "approved" },
        ],
        objectives: [
          { objectiveId: "obj_1", title: "Why is the sky red?", status: "open", kind: "question_for_dm" },
          { objectiveId: "obj_2", title: "Find the sword", status: "open", kind: "personal" },
          { objectiveId: "obj_3", title: "Old question", status: "done", kind: "question_for_dm" },
        ],
        notes: [{ noteId: "note_1", title: "Visible note" }],
      },
      {
        playerId: "ply_2",
        displayName: "Bob",
        link: null,
      },
    ];

    const result = collectDmInboxItems(players);

    expect(result.proposals).toHaveLength(1);
    expect(result.proposals[0].proposal.proposalId).toBe("prop_1");
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].objective.objectiveId).toBe("obj_1");
    expect(result.notes).toHaveLength(1);
    expect(result.notes[0].note.noteId).toBe("note_1");
    expect(result.total).toBe(3);
  });

  it("tags every item with the portal player it came from", () => {
    const player: DmPortalPlayer = {
      playerId: "ply_1",
      displayName: "Alice",
      link: null,
      proposals: [{ proposalId: "prop_1", status: "pending" }],
    };
    const result = collectDmInboxItems([player]);
    expect(result.proposals[0].portalPlayer).toBe(player);
  });
});
