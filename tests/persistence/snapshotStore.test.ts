import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rebuildCampaignSnapshot } from "../../src/persistence/snapshotStore/campaignSnapshot.js";
import { JsonSnapshotStore } from "../../src/persistence/snapshotStore/jsonSnapshotStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "dmcc-snapshot-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("campaign snapshots", () => {
  it("rebuilds a JSON snapshot from campaign events", () => {
    const snapshot = rebuildCampaignSnapshot([
      { sequence: 1, eventId: "evt_one", campaignId: "cmp_one", type: "CampaignCreated", occurredAt: "2026-06-25T00:00:00.000Z", actorId: "usr_dm", payload: { campaignId: "cmp_one", title: "Valleverde", archived: false }, schemaVersion: 1 },
      { sequence: 2, eventId: "evt_two", campaignId: "cmp_one", type: "EntityCreated", occurredAt: "2026-06-25T00:01:00.000Z", actorId: "usr_dm", payload: { entityId: "ent_mira", campaignId: "cmp_one", entityType: "npc", title: "Mira", importance: "normal", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false }, schemaVersion: 1 },
    ]);

    expect(snapshot.campaign?.title).toBe("Valleverde");
    expect(snapshot.entities).toHaveLength(1);
    expect(snapshot.lastSequence).toBe(2);
  });

  it("handles PlayerProfile create/update/archive events", () => {
    const snapshot = rebuildCampaignSnapshot([
      { sequence: 1, eventId: "evt_1", campaignId: "cmp_1", type: "CampaignCreated", occurredAt: "2026-06-25T00:00:00.000Z", actorId: "usr_dm", payload: { campaignId: "cmp_1", title: "T", archived: false }, schemaVersion: 1 },
      { sequence: 2, eventId: "evt_2", campaignId: "cmp_1", type: "PlayerProfileCreated", occurredAt: "2026-06-25T00:01:00.000Z", actorId: "usr_dm", payload: { playerId: "ply_1", campaignId: "cmp_1", name: "Alice", displayName: "Alice", email: null, archived: false, createdAt: "2026-06-25T00:01:00.000Z" }, schemaVersion: 1 },
      { sequence: 3, eventId: "evt_3", campaignId: "cmp_1", type: "PlayerProfileUpdated", occurredAt: "2026-06-25T00:02:00.000Z", actorId: "usr_dm", payload: { playerId: "ply_1", displayName: "Alice the Bold" }, schemaVersion: 1 },
    ]);
    expect(snapshot.players).toHaveLength(1);
    expect(snapshot.players[0].displayName).toBe("Alice the Bold");
    expect(snapshot.players[0].archived).toBe(false);
  });

  it("archives player profiles", () => {
    const snapshot = rebuildCampaignSnapshot([
      { sequence: 1, eventId: "evt_1", campaignId: "cmp_1", type: "CampaignCreated", occurredAt: "2026-06-25T00:00:00.000Z", actorId: "usr_dm", payload: { campaignId: "cmp_1", title: "T", archived: false }, schemaVersion: 1 },
      { sequence: 2, eventId: "evt_2", campaignId: "cmp_1", type: "PlayerProfileCreated", occurredAt: "2026-06-25T00:01:00.000Z", actorId: "usr_dm", payload: { playerId: "ply_1", campaignId: "cmp_1", name: "Bob", displayName: "Bob", email: null, archived: false, createdAt: "2026-06-25T00:01:00.000Z" }, schemaVersion: 1 },
      { sequence: 3, eventId: "evt_3", campaignId: "cmp_1", type: "PlayerProfileArchived", occurredAt: "2026-06-25T00:02:00.000Z", actorId: "usr_dm", payload: { playerId: "ply_1" }, schemaVersion: 1 },
    ]);
    expect(snapshot.players[0].archived).toBe(true);
  });

  it("writes snapshot JSON atomically and leaves no tmp file", async () => {
    const store = new JsonSnapshotStore(join(dir, "snapshot.json"));
    await store.write({ schemaVersion: 1, lastSequence: 2, campaign: { campaignId: "cmp_one", title: "Valleverde", archived: false }, entities: [], relations: [], facts: [], sessions: [] });

    const snapshot = await store.read();
    const files = await readdir(dir);

    expect(snapshot?.lastSequence).toBe(2);
    expect(files).toEqual(["snapshot.json"]);
  });
});
