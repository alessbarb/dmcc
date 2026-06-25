import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-api-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function readCampaignEvents(dataDir: string, campaignId: string) {
  const text = await readFile(join(dataDir, "vaults", "default", "campaigns", campaignId, "events.ndjson"), "utf8");
  return text.trim().split("\n").map((line) => JSON.parse(line));
}

async function readCampaignSnapshot(dataDir: string, campaignId: string) {
  const text = await readFile(join(dataDir, "vaults", "default", "campaigns", campaignId, "snapshot.json"), "utf8");
  return JSON.parse(text);
}

describe("createServer", () => {
  it("serves health endpoint", async () => {
    const server = createServer();
    const response = await server.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, app: "dm-campaign-companion" });
  });

  it("creates campaigns through the local API", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: "cmp_api", actorId: "usr_dm", title: "API Campaign" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ campaignId: "cmp_api", title: "API Campaign" });
    });
  });

  it("creates entities through the local API", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: "cmp_api", actorId: "usr_dm", title: "API Campaign" },
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_api/entities",
        payload: { actorId: "usr_dm", entityId: "ent_api", entityType: "npc", title: "Mira" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ entityId: "ent_api", title: "Mira", visibility: { kind: "dm_only" } });
    });
  });
});

describe("persistent campaign API", () => {
  it("flushes campaign and entity commands to the campaign event log before success", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_disk", actorId: "usr_dm", title: "Disk Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_disk/entities", payload: { actorId: "usr_dm", entityId: "ent_disk", entityType: "npc", title: "Mira" } });

      const events = await readCampaignEvents(dataDir, "cmp_disk");

      expect(events.map((event) => event.sequence)).toEqual([1, 2]);
      expect(events.map((event) => event.type)).toEqual(["CampaignCreated", "EntityCreated"]);
    });
  });

  it("creates relation, fact, session, close-session, and reveal-clue events through API routes", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_api2", actorId: "usr_dm", title: "API Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/entities", payload: { actorId: "usr_dm", entityId: "ent_a", entityType: "npc", title: "A" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/entities", payload: { actorId: "usr_dm", entityId: "ent_clue", entityType: "clue", title: "Sigil", metadata: { content: "Sigil content" } } });

      expect((await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/relations", payload: { actorId: "usr_dm", relationId: "rel_one", sourceEntityId: "ent_a", targetEntityId: "ent_clue", relationType: "points_to" } })).statusCode).toBe(201);
      expect((await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/facts", payload: { actorId: "usr_dm", factId: "fact_one", statement: "The sigil is old.", kind: "canon", confidence: "confirmed", relatedEntityIds: ["ent_clue"], source: { kind: "manual" } } })).statusCode).toBe(201);
      expect((await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/sessions", payload: { actorId: "usr_dm", sessionId: "sess_one", title: "Session 1" } })).statusCode).toBe(201);
      expect((await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/sessions/sess_one/reveal-clue", payload: { actorId: "usr_dm", clueEntityId: "ent_clue", audience: { kind: "party" }, note: "Found in cellar" } })).statusCode).toBe(200);
      expect((await server.inject({ method: "POST", url: "/api/campaigns/cmp_api2/sessions/sess_one/close", payload: { actorId: "usr_dm", summary: "Session closed." } })).statusCode).toBe(200);

      const events = await readCampaignEvents(dataDir, "cmp_api2");
      expect(events.map((event) => event.type)).toEqual([
        "CampaignCreated",
        "EntityCreated",
        "EntityCreated",
        "RelationCreated",
        "FactCreated",
        "SessionStarted",
        "VisibilityChanged",
        "SessionClosed",
      ]);
    });
  });


  it("updates snapshot.json from persisted API command events", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_snapshot_api", actorId: "usr_dm", title: "Snapshot Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_snapshot_api/entities", payload: { actorId: "usr_dm", entityId: "ent_snapshot_api", entityType: "npc", title: "Mira Snapshot" } });

      const snapshot = await readCampaignSnapshot(dataDir, "cmp_snapshot_api");

      expect(snapshot).toMatchObject({
        schemaVersion: 1,
        lastSequence: 2,
        campaign: { campaignId: "cmp_snapshot_api", title: "Snapshot Campaign" },
        entities: [{ entityId: "ent_snapshot_api", title: "Mira Snapshot" }],
      });
    });
  });

  it("persists commands against a campaign reopened from disk", async () => {
    await withTempDataDir(async (dataDir) => {
      const firstServer = createServer({ dataDir });
      await firstServer.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_reopen_write", actorId: "usr_dm", title: "Reopen Write" } });

      const secondServer = createServer({ dataDir });
      await secondServer.inject({ method: "GET", url: "/api/campaigns/cmp_reopen_write" });
      const response = await secondServer.inject({
        method: "POST",
        url: "/api/campaigns/cmp_reopen_write/entities",
        payload: { actorId: "usr_dm", entityId: "ent_after_reopen", entityType: "npc", title: "After Reopen" },
      });

      const snapshot = await readCampaignSnapshot(dataDir, "cmp_reopen_write");
      expect(response.statusCode).toBe(201);
      expect(snapshot.lastSequence).toBe(2);
      expect(snapshot.entities).toMatchObject([{ entityId: "ent_after_reopen", title: "After Reopen" }]);
    });
  });

  it("reopens campaign state from persisted events in a fresh server", async () => {
    await withTempDataDir(async (dataDir) => {
      const firstServer = createServer({ dataDir });
      await firstServer.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_reload", actorId: "usr_dm", title: "Reloadable" } });
      await firstServer.inject({ method: "POST", url: "/api/campaigns/cmp_reload/entities", payload: { actorId: "usr_dm", entityId: "ent_reload", entityType: "npc", title: "Persisted NPC" } });

      const secondServer = createServer({ dataDir });
      const response = await secondServer.inject({ method: "GET", url: "/api/campaigns/cmp_reload" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ campaign: { title: "Reloadable" }, entities: [{ entityId: "ent_reload", title: "Persisted NPC" }] });
    });
  });



  it("writes complete JSON exports and local backup artifacts", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_export", actorId: "usr_dm", title: "Export Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_export/entities", payload: { actorId: "usr_dm", entityId: "ent_export", entityType: "npc", title: "Exported NPC" } });

      const exportResponse = await server.inject({ method: "POST", url: "/api/campaigns/cmp_export/export/json" });
      const backupResponse = await server.inject({ method: "POST", url: "/api/campaigns/cmp_export/backups" });

      expect(exportResponse.statusCode).toBe(201);
      expect(exportResponse.json()).toMatchObject({ campaignId: "cmp_export", format: "json" });
      const exported = JSON.parse(await readFile(exportResponse.json().path, "utf8"));
      expect(exported).toMatchObject({
        schemaVersion: 1,
        manifest: { campaignId: "cmp_export", exportFormat: "json" },
        campaign: { campaignId: "cmp_export", title: "Export Campaign" },
        entities: [{ entityId: "ent_export", title: "Exported NPC" }],
      });
      expect(exported.events.map((event: { type: string }) => event.type)).toEqual(["CampaignCreated", "EntityCreated"]);

      expect(backupResponse.statusCode).toBe(201);
      expect(backupResponse.json()).toMatchObject({ campaignId: "cmp_export" });
      expect(backupResponse.json().path).toContain(join("vaults", "default", "campaigns", "cmp_export", "backups"));
      expect((await stat(backupResponse.json().path)).isFile()).toBe(true);
      const backup = JSON.parse(await readFile(backupResponse.json().path, "utf8"));
      expect(backup).toMatchObject({ schemaVersion: 1, manifest: { campaignId: "cmp_export", backupFormat: "json" } });
      expect(backup.events.map((event: { type: string }) => event.type)).toEqual(["CampaignCreated", "EntityCreated", "ExportCompleted"]);
    });
  });


  it("writes navigable Markdown export artifacts", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_markdown", actorId: "usr_dm", title: "Markdown Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_markdown/entities", payload: { actorId: "usr_dm", entityId: "ent_markdown_npc", entityType: "npc", title: "Mira Markdown", summary: "A careful ally." } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_markdown/entities", payload: { actorId: "usr_dm", entityId: "ent_markdown_quest", entityType: "quest", title: "Find the Gate", status: "active" } });

      const response = await server.inject({ method: "POST", url: "/api/campaigns/cmp_markdown/export/markdown" });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ campaignId: "cmp_markdown", format: "markdown" });
      const exportPath = response.json().path;
      expect(exportPath).toContain(join("vaults", "default", "campaigns", "cmp_markdown", "exports"));
      expect(await readFile(join(exportPath, "README.md"), "utf8")).toContain("# Markdown Campaign");
      expect(await readFile(join(exportPath, "Dashboard.md"), "utf8")).toContain("## Active Quests");
      expect(await readFile(join(exportPath, "NPCs", "Mira Markdown.md"), "utf8")).toContain("A careful ally.");
      expect(JSON.parse(await readFile(join(exportPath, "Graph.json"), "utf8"))).toMatchObject({ nodes: [{ id: "ent_markdown_npc" }, { id: "ent_markdown_quest" }] });
    });
  });


  it("restores campaign state from a local backup artifact", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_restore", actorId: "usr_dm", title: "Restore Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_restore/entities", payload: { actorId: "usr_dm", entityId: "ent_before_backup", entityType: "npc", title: "Before Backup" } });
      const backupId = (await server.inject({ method: "POST", url: "/api/campaigns/cmp_restore/backups" })).json().backupId;
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_restore/entities", payload: { actorId: "usr_dm", entityId: "ent_after_backup", entityType: "npc", title: "After Backup" } });

      const restoreResponse = await server.inject({ method: "POST", url: "/api/campaigns/cmp_restore/restore", payload: { backupId } });
      const campaign = await server.inject({ method: "GET", url: "/api/campaigns/cmp_restore" });
      const events = await readCampaignEvents(dataDir, "cmp_restore");
      const snapshot = await readCampaignSnapshot(dataDir, "cmp_restore");

      expect(restoreResponse.statusCode).toBe(200);
      expect(campaign.json().entities).toMatchObject([{ entityId: "ent_before_backup", title: "Before Backup" }]);
      expect(campaign.json().entities.map((entity: { entityId: string }) => entity.entityId)).not.toContain("ent_after_backup");
      expect(events.map((event) => event.type)).toEqual(["CampaignCreated", "EntityCreated"]);
      expect(snapshot.entities).toMatchObject([{ entityId: "ent_before_backup", title: "Before Backup" }]);
    });
  });

  it("serves dashboard and what-now projections from deterministic campaign state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_orientation", actorId: "usr_dm", title: "Orientation Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_orientation/entities", payload: { actorId: "usr_dm", entityId: "ent_quest", entityType: "quest", title: "Find the Well", status: "active", importance: "high" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_orientation/entities", payload: { actorId: "usr_dm", entityId: "ent_clue", entityType: "clue", title: "Old Sigil", status: "pending", importance: "critical", metadata: { content: "Old Sigil content" } } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_orientation/entities", payload: { actorId: "usr_dm", entityId: "ent_secret", entityType: "secret", title: "Mira is cursed", status: "hidden", importance: "critical", metadata: { truth: "Mira is cursed truth" } } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_orientation/entities", payload: { actorId: "usr_dm", entityId: "ent_consequence", entityType: "consequence", title: "Mayor retaliates", status: "pending", importance: "high" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_orientation/entities", payload: { actorId: "usr_dm", entityId: "ent_next", entityType: "scene", title: "Return to the cellar", status: "next", importance: "normal" } });

      const dashboard = await server.inject({ method: "GET", url: "/api/campaigns/cmp_orientation/dashboard" });
      const whatNow = await server.inject({ method: "GET", url: "/api/campaigns/cmp_orientation/what-now" });

      expect(dashboard.statusCode).toBe(200);
      expect(dashboard.json()).toMatchObject({
        campaignId: "cmp_orientation",
        activeQuests: [{ entityId: "ent_quest", title: "Find the Well" }],
        criticalSecrets: [{ entityId: "ent_secret", title: "Mira is cursed" }],
        pendingConsequences: [{ entityId: "ent_consequence", title: "Mayor retaliates" }],
      });
      expect(whatNow.statusCode).toBe(200);
      expect(whatNow.json()).toMatchObject({
        campaignId: "cmp_orientation",
        recommendedFocus: [{ entityId: "ent_quest", title: "Find the Well" }, { entityId: "ent_next", title: "Return to the cellar" }, { entityId: "ent_clue", title: "Old Sigil" }, { entityId: "ent_consequence", title: "Mayor retaliates" }],
        pendingClues: [{ entityId: "ent_clue", title: "Old Sigil" }],
        hiddenCriticalSecrets: [{ entityId: "ent_secret", title: "Mira is cursed" }],
        unresolvedConsequences: [{ entityId: "ent_consequence", title: "Mayor retaliates" }],
      });
    });
  });

  it("serves graph, timeline, visibility, and search projections from campaign state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_proj", actorId: "usr_dm", title: "Projection Campaign" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_proj/entities", payload: { actorId: "usr_dm", entityId: "ent_npc", entityType: "npc", title: "Mira" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_proj/entities", payload: { actorId: "usr_dm", entityId: "ent_clue", entityType: "clue", title: "Sigil", metadata: { content: "Sigil content" } } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_proj/relations", payload: { actorId: "usr_dm", relationId: "rel_proj", sourceEntityId: "ent_npc", targetEntityId: "ent_clue", relationType: "points_to" } });

      const graph = await server.inject({ method: "GET", url: "/api/campaigns/cmp_proj/graph" });
      const timeline = await server.inject({ method: "GET", url: "/api/campaigns/cmp_proj/timeline" });
      const visibility = await server.inject({ method: "GET", url: "/api/campaigns/cmp_proj/visibility" });
      const search = await server.inject({ method: "GET", url: "/api/campaigns/cmp_proj/search?q=sigil" });

      expect(graph.json()).toMatchObject({ nodes: [{ id: "ent_npc" }, { id: "ent_clue" }], edges: [{ id: "rel_proj", source: "ent_npc", target: "ent_clue" }] });
      expect(timeline.json().events.map((event: { type: string }) => event.type)).toContain("RelationCreated");
      expect(visibility.json().dmOnlyEntityIds).toEqual(["ent_npc", "ent_clue"]);
      expect(visibility.json().summary).toMatchObject({ total: 2, partyKnowsCount: 0, dmOnlyCount: 2 });
      expect(search.json().results).toMatchObject([{ entityId: "ent_clue", entityType: "clue", title: "Sigil" }]);
    });
  });

  it("rejects duplicate relations with 409 and allows bypass with ?force=true", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_dup", actorId: "usr_dm", title: "Dup Test" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_dup/entities", payload: { actorId: "usr_dm", entityId: "ent_a", entityType: "npc", title: "A" } });
      await server.inject({ method: "POST", url: "/api/campaigns/cmp_dup/entities", payload: { actorId: "usr_dm", entityId: "ent_b", entityType: "npc", title: "B" } });
      // First relation succeeds
      const first = await server.inject({ method: "POST", url: "/api/campaigns/cmp_dup/relations", payload: { actorId: "usr_dm", relationId: "rel_1", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "ally_of" } });
      expect(first.statusCode).toBe(201);
      // Second identical relation → 409
      const dup = await server.inject({ method: "POST", url: "/api/campaigns/cmp_dup/relations", payload: { actorId: "usr_dm", relationId: "rel_2", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "ally_of" } });
      expect(dup.statusCode).toBe(409);
      expect(dup.json().duplicate).toBe(true);
      // With ?force=true → 201
      const forced = await server.inject({ method: "POST", url: "/api/campaigns/cmp_dup/relations?force=true", payload: { actorId: "usr_dm", relationId: "rel_3", sourceEntityId: "ent_a", targetEntityId: "ent_b", relationType: "ally_of" } });
      expect(forced.statusCode).toBe(201);
    });
  });

  it("creates, updates, and archives player profiles", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_ply", actorId: "usr_dm", title: "Player Test" } });

      const create = await server.inject({ method: "POST", url: "/api/campaigns/cmp_ply/players", payload: { actorId: "usr_dm", playerId: "ply_1", name: "Alice", displayName: "Alice the Bold", email: null } });
      expect(create.statusCode).toBe(201);

      const list = await server.inject({ method: "GET", url: "/api/campaigns/cmp_ply/players" });
      expect(list.json()).toHaveLength(1);
      expect(list.json()[0].displayName).toBe("Alice the Bold");

      const update = await server.inject({ method: "PATCH", url: "/api/campaigns/cmp_ply/players/ply_1", payload: { actorId: "usr_dm", displayName: "Alice the Brave" } });
      expect(update.statusCode).toBe(200);

      const archive = await server.inject({ method: "DELETE", url: "/api/campaigns/cmp_ply/players/ply_1", payload: { actorId: "usr_dm" } });
      expect(archive.statusCode).toBe(200);

      const afterArchive = await server.inject({ method: "GET", url: "/api/campaigns/cmp_ply/players" });
      expect(afterArchive.json()).toHaveLength(0);
    });
  });

  describe("Security and Authorization Audits", () => {
    it("rejects player access to DM-only endpoints", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_sec", actorId: "usr_dm", title: "Security Test" } });

        // Player tries to access dashboard
        const dashboard = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_sec/dashboard",
          headers: { "x-role": "player", "x-player-id": "ply_1" }
        });
        expect(dashboard.statusCode).toBe(403);

        // Player tries to export json
        const exportRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_sec/export/json",
          headers: { "x-role": "player" }
        });
        expect(exportRes.statusCode).toBe(403);
      });
    });

    it("masks accessCode inside lan-status for players and observers", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: { campaignId: "cmp_lan", actorId: "usr_dm", title: "LAN Test" }
        });

        // Query status as player
        const resPlayer = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-role": "player" }
        });
        expect(resPlayer.statusCode).toBe(200);
        expect(resPlayer.json().accessCode).toBeNull();

        const toggle = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_lan/lan/toggle",
          headers: { "x-role": "dm" },
          payload: { enabled: true },
        });
        expect(toggle.statusCode).toBe(200);
        const generatedCode = toggle.json().accessCode;
        expect(generatedCode).toMatch(/^\d{6}$/);

        const resPlayerAfterEnable = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-role": "player" }
        });
        expect(resPlayerAfterEnable.statusCode).toBe(200);
        expect(resPlayerAfterEnable.json().accessCode).toBeNull();

        // Query status as DM
        const resDM = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-role": "dm" } // defaults to dm in test env
        });
        expect(resDM.statusCode).toBe(200);
        expect(resDM.json().accessCode).toBe(generatedCode);
      });
    });

    it("prevents vaultId path traversal and rejects invalid campaignId format", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });

        const badVault = await server.inject({
          method: "GET",
          url: "/api/campaigns",
          headers: { "x-vault-id": "../bad_vault" }
        });
        expect(badVault.statusCode).toBe(400);

        const badCmp = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_bad$/dashboard"
        });
        expect(badCmp.statusCode).toBe(400);
      });
    });

    it("verifies backup campaign ownership and does auto-backup before restore", async () => {
      await withTempDataDir(async (dataDir) => {
        const { copyFile, mkdir } = await import("node:fs/promises");
        const server = createServer({ dataDir });
        await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_a", actorId: "usr_dm", title: "Campaign A" } });
        await server.inject({ method: "POST", url: "/api/campaigns", payload: { campaignId: "cmp_b", actorId: "usr_dm", title: "Campaign B" } });

        // Create backup of A
        const backupRes = await server.inject({ method: "POST", url: "/api/campaigns/cmp_a/backups" });
        expect(backupRes.statusCode).toBe(201);
        const backupId = backupRes.json().backupId;

        // Copy the backup file of cmp_a to cmp_b's backups folder so B's restore can find it but reject it on campaignId mismatch
        const pathA = backupRes.json().path;
        const dirB = join(dataDir, "vaults", "default", "campaigns", "cmp_b", "backups");
        await mkdir(dirB, { recursive: true });
        const pathB = join(dirB, backupId);
        await copyFile(pathA, pathB);

        // Try restoring backup of A to campaign B (should be rejected)
        const restoreBad = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_b/restore",
          payload: { backupId }
        });
        expect(restoreBad.statusCode).toBe(400);
        expect(restoreBad.json().error).toContain("Backup does not belong to this campaign");

        // Restore to A (should work and create a backup beforehand)
        const restoreOk = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_a/restore",
          payload: { backupId }
        });
        expect(restoreOk.statusCode).toBe(200);

        // Check if a pre-restore backup was generated
        const backupsList = await server.inject({ method: "GET", url: "/api/campaigns/cmp_a/backups" });
        expect(backupsList.json().some((b: any) => b.backupId.startsWith("backup_pre_restore_"))).toBe(true);
      });
    });
  });
});
