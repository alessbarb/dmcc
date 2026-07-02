import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { EventStore } from "../../src/core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../src/core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../src/core/persistence/repositories/campaignRepository.js";
import {
  generateCampaignId,
  generateSessionId,
  generateEntityId,
  generateRelationId,
} from "../../src/shared/ids.js";
import { InvariantViolationError, EventStoreError } from "../../src/shared/errors.js";

const TEST_BASE_DIR = path.join(__dirname, "../temp_vault_test");

describe("Persistence Layer", () => {
  let eventStore: EventStore;
  let snapshotStore: SnapshotStore;
  let repo: CampaignRepository;
  const campaignId = generateCampaignId();

  beforeEach(async () => {
    // Ensure test base directory is clean
    await fs.mkdir(TEST_BASE_DIR, { recursive: true });
    eventStore = new EventStore(TEST_BASE_DIR);
    snapshotStore = new SnapshotStore(TEST_BASE_DIR);
    repo = new CampaignRepository(eventStore, snapshotStore);
  });

  afterEach(async () => {
    // Cleanup temporary test vault directory
    try {
      await fs.rm(TEST_BASE_DIR, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  describe("EventStore & SnapshotStore Basic I/O", () => {
    it("can append and read back events", async () => {
      const actorId = "usr_dm";
      const payload = {
        id: campaignId,
        title: "Test Campaign",
        system: "generic_fantasy_d20" as const,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          backupOnClose: true,
          lanModeEnabled: false,
          activeQuestsLimit: 5,
        },
      };

      const event = await eventStore.appendEvent(
        campaignId,
        "CampaignCreated",
        actorId,
        payload
      );

      expect(event.sequence).toBe(1);
      expect(event.type).toBe("CampaignCreated");
      expect(event.hash).toBeDefined();

      const events = await eventStore.loadEvents(campaignId);
      expect(events.length).toBe(1);
      expect(events[0].sequence).toBe(1);
      expect(events[0].hash).toBe(event.hash);
    });

    it("detects chain hash corruption", async () => {
      const actorId = "usr_dm";
      await eventStore.appendEvent(campaignId, "VaultCreated", actorId, { name: "test-vault" });
      await eventStore.appendEvent(campaignId, "VaultCreated", actorId, { name: "test-vault-2" });

      const eventsFilePath = eventStore.getEventsFilePath(campaignId);
      let content = await fs.readFile(eventsFilePath, "utf-8");

      // Corrupt a line in events.ndjson by changing a value inside payload
      content = content.replace("test-vault-2", "corrupted-vault-name");
      await fs.writeFile(eventsFilePath, content, "utf-8");

      // Reading should trigger hash mismatch verification error
      await expect(eventStore.loadEvents(campaignId)).rejects.toThrow(EventStoreError);
    });

    it("can handle concurrent writes without corruption", async () => {
      const actorId = "usr_dm";
      const promises = Array.from({ length: 10 }).map((_, i) =>
        eventStore.appendEvent(campaignId, "VaultCreated", actorId, { name: `vault-${i}` })
      );

      const results = await Promise.all(promises);

      const sequences = results.map((r) => r.sequence).sort((a, b) => a - b);
      expect(sequences).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      const loaded = await eventStore.loadEvents(campaignId);
      expect(loaded.length).toBe(10);
    });

    it("repairs a stale append index and keeps full verification explicit", async () => {
      await eventStore.appendEvent(campaignId, "VaultCreated", "usr_dm", { name: "one" });
      const indexPath = eventStore.getIndexFilePath(campaignId);
      const initialIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
      expect(initialIndex).toMatchObject({ sequence: 1 });

      await fs.writeFile(indexPath, JSON.stringify({ ...initialIndex, sequence: 99, offset: 0 }));
      const second = await eventStore.appendEvent(campaignId, "VaultCreated", "usr_dm", { name: "two" });
      expect(second.sequence).toBe(2);
      expect(JSON.parse(await fs.readFile(indexPath, "utf8"))).toMatchObject({
        sequence: 2,
        hash: second.hash,
      });
      await expect(eventStore.verifyAndRebuildIndex(campaignId)).resolves.toMatchObject({
        sequence: 2,
        hash: second.hash,
      });
    });

    it("saves and loads snapshot atomically", async () => {
      const projection = {
        campaign: null,
        players: {},
        entities: {},
        relations: {},
        facts: {},
        sessions: {},
        sessionEvents: {},
        tags: {},
        attachments: {},
        lastSequence: 4,
      };

      await snapshotStore.saveSnapshot(campaignId, 4, projection as any);

      const snapshot = await snapshotStore.loadSnapshot(campaignId);
      expect(snapshot).not.toBeNull();
      expect(snapshot?.sequence).toBe(4);
      expect(snapshot?.projection.lastSequence).toBe(4);

      // Verify no temporary file is left over
      const tempPath = snapshotStore.getTempSnapshotFilePath(campaignId);
      await expect(fs.access(tempPath)).rejects.toThrow();
    });
  });

  describe("CampaignRepository & Invariants", () => {
    it("coordinates events and snapshots", async () => {
      const actorId = "usr_dm";

      // 1. Create a campaign
      const campaignPayload = {
        id: campaignId,
        title: "The Lost Mine",
        system: "dnd_srd_5_2_1" as const,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          backupOnClose: true,
          lanModeEnabled: false,
          activeQuestsLimit: 5,
        },
      };

      const state = await repo.appendEvent(
        campaignId,
        "CampaignCreated",
        actorId,
        campaignPayload
      );
      expect(state.campaign?.title).toBe("The Lost Mine");
      expect(state.lastSequence).toBe(1);

      // 2. Fetch campaign state again (should load from snapshot/event store)
      const fetchedState = await repo.getCampaignState(campaignId);
      expect(fetchedState.campaign?.title).toBe("The Lost Mine");
      expect(fetchedState.lastSequence).toBe(1);
    });

    it("enforces active session invariant (only one active session)", async () => {
      const actorId = "usr_dm";

      // Initialize campaign
      await repo.appendEvent(campaignId, "CampaignCreated", actorId, {
        id: campaignId,
        title: "Campaign",
        system: "custom",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
      });

      const session1Id = generateSessionId();
      await repo.appendEvent(campaignId, "SessionCreated", actorId, {
        id: session1Id,
        campaignId,
        number: 1,
        title: "Session 1",
        status: "planned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Start Session 1 (makes it active)
      await repo.appendEvent(campaignId, "SessionStarted", actorId, {
        id: session1Id,
        startedAt: new Date().toISOString(),
      });

      const session2Id = generateSessionId();
      await repo.appendEvent(campaignId, "SessionCreated", actorId, {
        id: session2Id,
        campaignId,
        number: 2,
        title: "Session 2",
        status: "planned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Starting Session 2 when Session 1 is active should fail invariant check
      await expect(
        repo.appendEvent(campaignId, "SessionStarted", actorId, {
          id: session2Id,
          startedAt: new Date().toISOString(),
        })
      ).rejects.toThrow(InvariantViolationError);
    });

    it("enforces session closing invariant (summary is mandatory)", async () => {
      const actorId = "usr_dm";

      // Initialize campaign
      await repo.appendEvent(campaignId, "CampaignCreated", actorId, {
        id: campaignId,
        title: "Campaign",
        system: "custom",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
      });

      const sessionId = generateSessionId();
      await repo.appendEvent(campaignId, "SessionCreated", actorId, {
        id: sessionId,
        campaignId,
        number: 1,
        title: "Session 1",
        status: "planned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await repo.appendEvent(campaignId, "SessionStarted", actorId, {
        id: sessionId,
        startedAt: new Date().toISOString(),
      });

      // Closing with empty summary should fail
      await expect(
        repo.appendEvent(campaignId, "SessionClosed", actorId, {
          id: sessionId,
          summary: "  ", // blank summary
          endedAt: new Date().toISOString(),
        })
      ).rejects.toThrow(InvariantViolationError);
    });

    it("enforces relation campaign membership invariants", async () => {
      const actorId = "usr_dm";

      // Initialize campaign
      await repo.appendEvent(campaignId, "CampaignCreated", actorId, {
        id: campaignId,
        title: "Campaign",
        system: "custom",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
      });

      const ent1Id = generateEntityId();
      const ent2Id = generateEntityId();

      // Create Entity 1 in campaignId
      await repo.appendEvent(campaignId, "EntityCreated", actorId, {
        id: ent1Id,
        campaignId,
        type: "npc",
        title: "NPC 1",
        status: "known",
        importance: "normal",
        visibility: { mode: "dm_only" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Try to create relation between Entity 1 and non-existent Entity 2
      await expect(
        repo.appendEvent(campaignId, "RelationCreated", actorId, {
          id: generateRelationId(),
          campaignId,
          sourceEntityId: ent1Id,
          targetEntityId: ent2Id,
          type: "ally_of",
          status: "active",
          visibility: { mode: "dm_only" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      ).rejects.toThrow(InvariantViolationError);
    });

    it("quarantines a corrupt snapshot.json and rebuilds projection from scratch", async () => {
      const actorId = "usr_dm";
      await repo.appendEvent(campaignId, "CampaignCreated", actorId, {
        id: campaignId,
        title: "Atomic Campaign",
        system: "custom",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
      });

      await repo.getCampaignState(campaignId);
      const snapshotPath = repo["snapshotStore"].getSnapshotFilePath(campaignId);
      expect(await fs.stat(snapshotPath).then((s) => s.isFile())).toBe(true);

      await fs.writeFile(snapshotPath, "{ corrupt json ...", "utf-8");

      const state = await repo.getCampaignState(campaignId);
      expect(state.campaign?.title).toBe("Atomic Campaign");

      const corruptPath = snapshotPath.replace(/\.json$/, ".corrupt.json");
      expect(await fs.stat(corruptPath).then((s) => s.isFile())).toBe(true);
    });
  });
});
