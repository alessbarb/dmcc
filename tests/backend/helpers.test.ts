import * as path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertWithinDir,
  getVisibleRelations,
  getVisibleSessions,
  isPathWithinDir,
  toPublicCampaign,
} from "../../src/backend/server/helpers.js";

describe("path containment helpers", () => {
  it("accepts child paths on the current platform", () => {
    const root = path.join("tmp", "dmcc", "vaults", "default", "campaigns");
    const child = path.join(root, "cmp_123", "events.ndjson");

    expect(isPathWithinDir(child, root)).toBe(true);
    expect(() => assertWithinDir(child, root)).not.toThrow();
  });

  it("accepts Windows child paths with backslash separators", () => {
    const root = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns`;
    const child = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns\cmp_123\events.ndjson`;

    expect(isPathWithinDir(child, root, path.win32)).toBe(true);
  });

  it("rejects Windows path traversal outside the allowed directory", () => {
    const root = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\campaigns`;
    const outside = String.raw`C:\Users\alice\Documents\DMCampaignCompanion\vaults\default\evil\events.ndjson`;

    expect(isPathWithinDir(outside, root, path.win32)).toBe(false);
  });

  it("rejects similarly-prefixed sibling directories", () => {
    const root = "/tmp/dmcc/vaults/default/campaigns";
    const sibling = "/tmp/dmcc/vaults/default/campaigns-old/cmp_123";

    expect(isPathWithinDir(sibling, root, path.posix)).toBe(false);
  });
});

describe("player-safe projections", () => {
  it("removes campaign settings and internal metadata from the public campaign DTO", () => {
    expect(toPublicCampaign({
      campaignId: "cmp_safe",
      title: "Safe",
      summary: "Public summary",
      system: "dnd5e",
      status: "active",
      settings: { localAccessCodeHash: "secret", lanModeEnabled: true },
      metadata: { internal: true },
    })).toEqual({
      campaignId: "cmp_safe",
      title: "Safe",
      summary: "Public summary",
      system: "dnd5e",
      status: "active",
    });
  });

  it("enforces player and character target lists on relations", () => {
    const visibleEntityIds = new Set(["ent_a", "ent_b"]);
    const relations = [
      { relationId: "rel_player", sourceEntityId: "ent_a", targetEntityId: "ent_b", visibility: { kind: "players", playerIds: ["ply_a"] } },
      { relationId: "rel_character", sourceEntityId: "ent_a", targetEntityId: "ent_b", visibility: { kind: "characters", characterEntityIds: ["ent_pc_a"] } },
    ];

    expect(getVisibleRelations(relations, visibleEntityIds, "player", "ply_b", "ent_pc_b")).toEqual([]);
    expect(getVisibleRelations(relations, visibleEntityIds, "player", "ply_a", "ent_pc_a")).toHaveLength(2);
  });

  it("returns only public fields from active or completed sessions to players", () => {
    const sessions = [
      {
        sessionId: "sess_planned",
        title: "Secret prep",
        status: "planned",
        prep: { secrets: ["ent_secret"], cluesAvailable: ["ent_clue"] },
      },
      {
        sessionId: "sess_active",
        number: 2,
        title: "Live",
        status: "active",
        playerSummary: "What players know",
        prep: { expectedConsequences: ["bad"] },
      },
    ];

    expect(getVisibleSessions(sessions, "player")).toEqual([{
      sessionId: "sess_active",
      number: 2,
      title: "Live",
      status: "active",
      playerSummary: "What players know",
    }]);
  });
});
