import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

async function withTempDataDir<T>(
  fn: (dataDir: string) => Promise<T>,
): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-api-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function readCampaignEvents(dataDir: string, campaignId: string) {
  const text = await readFile(
    join(
      dataDir,
      "vaults",
      "default",
      "campaigns",
      campaignId,
      "events.ndjson",
    ),
    "utf8",
  );
  return text
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

async function readCampaignSnapshot(dataDir: string, campaignId: string) {
  const text = await readFile(
    join(
      dataDir,
      "vaults",
      "default",
      "campaigns",
      campaignId,
      "snapshot.json",
    ),
    "utf8",
  );
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
        payload: {
          campaignId: "cmp_api",
          actorId: "usr_dm",
          title: "API Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        campaignId: "cmp_api",
        title: "API Campaign",
      });
    });
  });

  it("lists persisted campaigns from snapshots", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_list",
          actorId: "usr_dm",
          title: "Listed Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const response = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        expect.objectContaining({
          campaignId: "cmp_list",
          title: "Listed Campaign",
          archived: false,
        }),
      ]);
    });
  });

  it("creates entities through the local API", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_api",
          actorId: "usr_dm",
          title: "API Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_api/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_api",
          entityType: "npc",
          title: "Mira",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        entityId: "ent_api",
        title: "Mira",
        visibility: { kind: "dm_only" },
      });
    });
  });
});

describe("persistent campaign API", () => {
  it("flushes campaign and entity commands to the campaign event log before success", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_disk",
          actorId: "usr_dm",
          title: "Disk Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_disk/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_disk",
          entityType: "npc",
          title: "Mira",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const events = await readCampaignEvents(dataDir, "cmp_disk");

      expect(events.map((event) => event.sequence)).toEqual([1, 2, 3]);
      expect(events.map((event) => event.type)).toEqual([
        "CampaignCreated",
        "CanvasCreated",
        "EntityCreated",
      ]);
    });
  });

  it("creates relation, fact, session, close-session, and reveal-clue events through API routes", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_api2",
          actorId: "usr_dm",
          title: "API Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_api2/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_a",
          entityType: "npc",
          title: "A",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_api2/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_clue",
          entityType: "clue",
          title: "Sigil",
          metadata: { content: "Sigil content" },
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(
        (
          await server.inject({
            method: "POST",
            url: "/api/campaigns/cmp_api2/relations",
            payload: {
              actorId: "usr_dm",
              relationId: "rel_one",
              sourceEntityId: "ent_a",
              targetEntityId: "ent_clue",
              relationType: "points_to",
            },
            headers: { "x-dm-token": getDmToken(server) },
          })
        ).statusCode,
      ).toBe(201);
      expect(
        (
          await server.inject({
            method: "POST",
            url: "/api/campaigns/cmp_api2/facts",
            payload: {
              actorId: "usr_dm",
              factId: "fact_one",
              statement: "The sigil is old.",
              kind: "canon",
              confidence: "confirmed",
              relatedEntityIds: ["ent_clue"],
              source: { kind: "manual" },
            },
            headers: { "x-dm-token": getDmToken(server) },
          })
        ).statusCode,
      ).toBe(201);
      expect(
        (
          await server.inject({
            method: "POST",
            url: "/api/campaigns/cmp_api2/sessions",
            payload: {
              actorId: "usr_dm",
              sessionId: "sess_one",
              title: "Session 1",
            },
            headers: { "x-dm-token": getDmToken(server) },
          })
        ).statusCode,
      ).toBe(201);
      expect(
        (
          await server.inject({
            method: "POST",
            url: "/api/campaigns/cmp_api2/sessions/sess_one/reveal-clue",
            payload: {
              actorId: "usr_dm",
              clueEntityId: "ent_clue",
              audience: { kind: "party" },
              note: "Found in cellar",
            },
            headers: { "x-dm-token": getDmToken(server) },
          })
        ).statusCode,
      ).toBe(200);
      expect(
        (
          await server.inject({
            method: "POST",
            url: "/api/campaigns/cmp_api2/sessions/sess_one/close",
            payload: { actorId: "usr_dm", summary: "Session closed." },
            headers: { "x-dm-token": getDmToken(server) },
          })
        ).statusCode,
      ).toBe(200);

      const events = await readCampaignEvents(dataDir, "cmp_api2");
      expect(events.map((event) => event.type)).toEqual([
        "CampaignCreated",
        "CanvasCreated",
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

  it("deletes campaigns only after exact title confirmation", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_delete",
          actorId: "usr_dm",
          title: "Delete Me",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_delete/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_delete",
          entityType: "npc",
          title: "Mira",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const campaignDir = join(
        dataDir,
        "vaults",
        "default",
        "campaigns",
        "cmp_delete",
      );
      expect((await stat(campaignDir)).isDirectory()).toBe(true);

      const rejected = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_delete",
        payload: { confirmTitle: "Wrong title" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(rejected.statusCode).toBe(400);
      expect((await stat(campaignDir)).isDirectory()).toBe(true);

      const removed = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_delete",
        payload: { confirmTitle: "Delete Me" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(removed.statusCode).toBe(200);
      expect(removed.json()).toMatchObject({
        ok: true,
        campaignId: "cmp_delete",
      });
      await expect(stat(campaignDir)).rejects.toMatchObject({ code: "ENOENT" });

      const list = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(
        list
          .json()
          .map((campaign: { campaignId: string }) => campaign.campaignId),
      ).not.toContain("cmp_delete");
    });
  });

  it("updates snapshot.json from persisted API command events", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_snapshot_api",
          actorId: "usr_dm",
          title: "Snapshot Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_snapshot_api/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_snapshot_api",
          entityType: "npc",
          title: "Mira Snapshot",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const snapshot = await readCampaignSnapshot(dataDir, "cmp_snapshot_api");

      expect(snapshot).toMatchObject({
        schemaVersion: 1,
        lastSequence: 3,
        campaign: {
          campaignId: "cmp_snapshot_api",
          title: "Snapshot Campaign",
        },
        entities: [{ entityId: "ent_snapshot_api", title: "Mira Snapshot" }],
      });
    });
  });

  it("persists commands against a campaign reopened from disk", async () => {
    await withTempDataDir(async (dataDir) => {
      const firstServer = createServer({ dataDir });
      await firstServer.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_reopen_write",
          actorId: "usr_dm",
          title: "Reopen Write",
        },
        headers: { "x-dm-token": getDmToken(firstServer) },
      });

      const secondServer = createServer({ dataDir });
      await secondServer.inject({
        method: "GET",
        url: "/api/campaigns/cmp_reopen_write",
        headers: { "x-dm-token": getDmToken(secondServer) },
      });
      const response = await secondServer.inject({
        method: "POST",
        url: "/api/campaigns/cmp_reopen_write/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_after_reopen",
          entityType: "npc",
          title: "After Reopen",
        },
        headers: { "x-dm-token": getDmToken(secondServer) },
      });

      const snapshot = await readCampaignSnapshot(dataDir, "cmp_reopen_write");
      expect(response.statusCode).toBe(201);
      expect(snapshot.lastSequence).toBe(3);
      expect(snapshot.entities).toMatchObject([
        { entityId: "ent_after_reopen", title: "After Reopen" },
      ]);
    });
  });

  it("reopens campaign state from persisted events in a fresh server", async () => {
    await withTempDataDir(async (dataDir) => {
      const firstServer = createServer({ dataDir });
      await firstServer.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_reload",
          actorId: "usr_dm",
          title: "Reloadable",
        },
        headers: { "x-dm-token": getDmToken(firstServer) },
      });
      await firstServer.inject({
        method: "POST",
        url: "/api/campaigns/cmp_reload/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_reload",
          entityType: "npc",
          title: "Persisted NPC",
        },
        headers: { "x-dm-token": getDmToken(firstServer) },
      });

      const secondServer = createServer({ dataDir });
      const response = await secondServer.inject({
        method: "GET",
        url: "/api/campaigns/cmp_reload",
        headers: { "x-dm-token": getDmToken(secondServer) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        campaign: { title: "Reloadable" },
        entities: [{ entityId: "ent_reload", title: "Persisted NPC" }],
      });
    });
  });

  it("writes complete JSON exports and local backup artifacts", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_export",
          actorId: "usr_dm",
          title: "Export Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_export/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_export",
          entityType: "npc",
          title: "Exported NPC",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const exportResponse = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_export/export/json",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const backupResponse = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_export/backups",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(exportResponse.statusCode).toBe(201);
      expect(exportResponse.json()).toMatchObject({
        campaignId: "cmp_export",
        format: "json",
      });
      const exported = JSON.parse(
        await readFile(exportResponse.json().path, "utf8"),
      );
      expect(exported).toMatchObject({
        schemaVersion: 1,
        manifest: { campaignId: "cmp_export", exportFormat: "json" },
        campaign: { campaignId: "cmp_export", title: "Export Campaign" },
        entities: [{ entityId: "ent_export", title: "Exported NPC" }],
      });
      expect(
        exported.events.map((event: { type: string }) => event.type),
      ).toEqual(["CampaignCreated", "CanvasCreated", "EntityCreated"]);

      expect(backupResponse.statusCode).toBe(201);
      expect(backupResponse.json()).toMatchObject({ campaignId: "cmp_export" });
      expect(backupResponse.json().path).toContain(
        join("vaults", "default", "campaigns", "cmp_export", "backups"),
      );
      expect((await stat(backupResponse.json().path)).isFile()).toBe(true);
      const backup = JSON.parse(
        await readFile(backupResponse.json().path, "utf8"),
      );
      expect(backup).toMatchObject({
        schemaVersion: 1,
        manifest: { campaignId: "cmp_export", backupFormat: "json" },
      });
      expect(
        backup.events.map((event: { type: string }) => event.type),
      ).toEqual([
        "CampaignCreated",
        "CanvasCreated",
        "EntityCreated",
        "ExportCompleted",
      ]);
    });
  });

  it("writes navigable Markdown export artifacts", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_markdown",
          actorId: "usr_dm",
          title: "Markdown Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_markdown_npc",
          entityType: "npc",
          title: "Mira Markdown",
          summary: "A careful ally.",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_markdown_quest",
          entityType: "quest",
          title: "Find the Gate",
          status: "active",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/relations",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_markdown",
          sourceEntityId: "ent_markdown_npc",
          targetEntityId: "ent_markdown_quest",
          relationType: "custom:employs",
          description: "Mira protects the route to the gate.",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/relations",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_markdown_sells",
          sourceEntityId: "ent_markdown_npc",
          targetEntityId: "ent_markdown_quest",
          relationType: "custom:sells_info",
          description: "Mira trades secrets about the gate.",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/facts",
        payload: {
          actorId: "usr_dm",
          factId: "fact_markdown",
          statement: "The gate opens at midnight.",
          kind: "dm_secret",
          confidence: "confirmed",
          relatedEntityIds: ["ent_markdown_quest"],
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_markdown/export/markdown",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        campaignId: "cmp_markdown",
        format: "markdown",
        primaryFile: "Campaña completa.md",
      });
      const exportPath = response.json().path;
      expect(exportPath).toContain(
        join("vaults", "default", "campaigns", "cmp_markdown", "exports"),
      );
      expect(response.json().downloadUrl).toBe(
        `/api/campaigns/cmp_markdown/exports/${response.json().exportId}/download`,
      );
      expect(await readFile(join(exportPath, "README.md"), "utf8")).toContain(
        "# Markdown Campaign",
      );
      expect(
        await readFile(join(exportPath, "Dashboard.md"), "utf8"),
      ).toContain("## Active Quests");
      expect(
        await readFile(join(exportPath, "NPCs", "Mira Markdown.md"), "utf8"),
      ).toContain("A careful ally.");
      const primaryMarkdown = await readFile(
        join(exportPath, "Campaña completa.md"),
        "utf8",
      );
      expect(primaryMarkdown).toContain(
        "Booklet de campaña para Director de Juego",
      );
      expect(primaryMarkdown).toContain("Apéndice A — Índice de entidades");
      expect(primaryMarkdown).toContain("Lo que saben los jugadores");
      expect(primaryMarkdown).toContain("Lo que solo sabe el DM");
      expect(primaryMarkdown).toContain("Secreto del DM");
      expect(primaryMarkdown).not.toContain("custom:employs");
      expect(primaryMarkdown).not.toContain("custom:sells_info");
      expect(primaryMarkdown).not.toContain("sells info");
      const relationsMarkdown = await readFile(
        join(exportPath, "03 Relaciones.md"),
        "utf8",
      );
      expect(relationsMarkdown).toContain("financia o emplea");
      expect(relationsMarkdown).toContain("vende información");
      expect(relationsMarkdown).toContain(
        "Mira protects the route to the gate.",
      );
      expect(relationsMarkdown).toContain(
        "Mira trades secrets about the gate.",
      );
      expect(relationsMarkdown).not.toContain("custom:employs");
      expect(relationsMarkdown).not.toContain("custom:sells_info");
      expect(relationsMarkdown).not.toContain("sells info");
      expect(
        await readFile(join(exportPath, "04 Hechos.md"), "utf8"),
      ).toContain("The gate opens at midnight.");
      expect(
        await readFile(join(exportPath, "Apéndice técnico.md"), "utf8"),
      ).toContain("Exportación técnica completa para DM");
      expect(
        JSON.parse(
          await readFile(
            join(exportPath, "Datos", "campaign-state.json"),
            "utf8",
          ),
        ).entities,
      ).toHaveLength(2);
      expect(
        await readFile(join(exportPath, "Datos", "events.ndjson"), "utf8"),
      ).toContain("CampaignCreated");
      const graphJson = JSON.parse(
        await readFile(join(exportPath, "Datos", "graph.json"), "utf8"),
      );
      expect(graphJson.edges).toContainEqual(
        expect.objectContaining({
          id: "rel_markdown",
          source: "ent_markdown_npc",
          target: "ent_markdown_quest",
        }),
      );
      expect(graphJson.edges).toContainEqual(
        expect.objectContaining({
          id: "rel_markdown_sells",
          source: "ent_markdown_npc",
          target: "ent_markdown_quest",
        }),
      );
      expect(
        JSON.parse(await readFile(join(exportPath, "Graph.json"), "utf8")),
      ).toMatchObject({
        nodes: [{ id: "ent_markdown_npc" }, { id: "ent_markdown_quest" }],
      });

      const unauthenticatedDownload = await server.inject({
        method: "GET",
        url: response.json().downloadUrl,
      });
      expect([401, 403]).toContain(unauthenticatedDownload.statusCode);

      const download = await server.inject({
        method: "GET",
        url: response.json().downloadUrl,
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(download.statusCode).toBe(200);
      expect(download.body).toContain("# Markdown Campaign");

      const traversal = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_markdown/exports/..%2Fbad/download",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect([400, 404]).toContain(traversal.statusCode);
    });
  });

  it("restores campaign state from a local backup artifact", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_restore",
          actorId: "usr_dm",
          title: "Restore Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_restore/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_before_backup",
          entityType: "npc",
          title: "Before Backup",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      const backupId = (
        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_restore/backups",
          headers: { "x-dm-token": getDmToken(server) },
        })
      ).json().backupId;
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_restore/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_after_backup",
          entityType: "npc",
          title: "After Backup",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const restoreResponse = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_restore/restore",
        payload: { backupId },
        headers: { "x-dm-token": getDmToken(server) },
      });
      const campaign = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_restore",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const events = await readCampaignEvents(dataDir, "cmp_restore");
      const snapshot = await readCampaignSnapshot(dataDir, "cmp_restore");

      expect(restoreResponse.statusCode).toBe(200);
      expect(campaign.json().entities).toMatchObject([
        { entityId: "ent_before_backup", title: "Before Backup" },
      ]);
      expect(
        campaign
          .json()
          .entities.map((entity: { entityId: string }) => entity.entityId),
      ).not.toContain("ent_after_backup");
      expect(events.map((event) => event.type)).toEqual([
        "CampaignCreated",
        "CanvasCreated",
        "EntityCreated",
        "SettingsUpdated",
      ]);
      expect(snapshot.entities).toMatchObject([
        { entityId: "ent_before_backup", title: "Before Backup" },
      ]);
    });
  });

  it("serves dashboard and what-now projections from deterministic campaign state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_orientation",
          actorId: "usr_dm",
          title: "Orientation Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_orientation/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_quest",
          entityType: "quest",
          title: "Find the Well",
          status: "active",
          importance: "high",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_orientation/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_clue",
          entityType: "clue",
          title: "Old Sigil",
          status: "pending",
          importance: "critical",
          metadata: { content: "Old Sigil content" },
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_orientation/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_secret",
          entityType: "secret",
          title: "Mira is cursed",
          status: "hidden",
          importance: "critical",
          metadata: { truth: "Mira is cursed truth" },
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_orientation/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_consequence",
          entityType: "consequence",
          title: "Mayor retaliates",
          status: "pending",
          importance: "high",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_orientation/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_next",
          entityType: "scene",
          title: "Return to the cellar",
          status: "next",
          importance: "normal",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const dashboard = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_orientation/dashboard",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const whatNow = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_orientation/what-now",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(dashboard.statusCode).toBe(200);
      expect(dashboard.json()).toMatchObject({
        campaignId: "cmp_orientation",
        activeQuests: [{ entityId: "ent_quest", title: "Find the Well" }],
        criticalSecrets: [{ entityId: "ent_secret", title: "Mira is cursed" }],
        pendingConsequences: [
          { entityId: "ent_consequence", title: "Mayor retaliates" },
        ],
      });
      expect(whatNow.statusCode).toBe(200);
      const whatNowJson = whatNow.json();
      expect(whatNowJson).toMatchObject({
        campaignId: "cmp_orientation",
        pendingClues: [{ entityId: "ent_clue", title: "Old Sigil" }],
        hiddenCriticalSecrets: [
          { entityId: "ent_secret", title: "Mira is cursed" },
        ],
        unresolvedConsequences: [
          { entityId: "ent_consequence", title: "Mayor retaliates" },
        ],
      });
      expect(whatNowJson.recommendedFocus.slice(0, 4)).toMatchObject([
        { entityId: "ent_quest", title: "Find the Well" },
        { entityId: "ent_next", title: "Return to the cellar" },
        { entityId: "ent_clue", title: "Old Sigil" },
        { entityId: "ent_consequence", title: "Mayor retaliates" },
      ]);
      expect(whatNowJson.recommendedFocus).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ entityId: "ent_secret", title: "Mira is cursed" }),
        ]),
      );
    });
  });

  it("serves graph, timeline, visibility, and search projections from campaign state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_proj",
          actorId: "usr_dm",
          title: "Projection Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_proj/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_npc",
          entityType: "npc",
          title: "Mira",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_proj/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_clue",
          entityType: "clue",
          title: "Sigil",
          metadata: { content: "Sigil content" },
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_proj/relations",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_proj",
          sourceEntityId: "ent_npc",
          targetEntityId: "ent_clue",
          relationType: "points_to",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const graph = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_proj/graph",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const timeline = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_proj/timeline",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const visibility = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_proj/visibility",
        headers: { "x-dm-token": getDmToken(server) },
      });
      const search = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_proj/search?q=sigil",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(graph.json()).toMatchObject({
        nodes: [{ id: "ent_npc" }, { id: "ent_clue" }],
        edges: [{ id: "rel_proj", source: "ent_npc", target: "ent_clue" }],
      });
      expect(
        timeline.json().events.map((event: { type: string }) => event.type),
      ).toContain("RelationCreated");
      expect(visibility.json().dmOnlyEntityIds).toEqual([
        "ent_npc",
        "ent_clue",
      ]);
      expect(visibility.json().summary).toMatchObject({
        total: 2,
        partyKnowsCount: 0,
        dmOnlyCount: 2,
      });
      expect(search.json().results).toMatchObject([
        { entityId: "ent_clue", entityType: "clue", title: "Sigil" },
      ]);
    });
  });

  it("rejects duplicate relations with 409 and allows bypass with ?force=true", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_dup",
          actorId: "usr_dm",
          title: "Dup Test",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_dup/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_a",
          entityType: "npc",
          title: "A",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_dup/entities",
        payload: {
          actorId: "usr_dm",
          entityId: "ent_b",
          entityType: "npc",
          title: "B",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      // First relation succeeds
      const first = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_dup/relations",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_1",
          sourceEntityId: "ent_a",
          targetEntityId: "ent_b",
          relationType: "ally_of",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(first.statusCode).toBe(201);
      // Second identical relation → 409
      const dup = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_dup/relations",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_2",
          sourceEntityId: "ent_a",
          targetEntityId: "ent_b",
          relationType: "ally_of",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(dup.statusCode).toBe(409);
      expect(dup.json().duplicate).toBe(true);
      // With ?force=true → 201
      const forced = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_dup/relations?force=true",
        payload: {
          actorId: "usr_dm",
          relationId: "rel_3",
          sourceEntityId: "ent_a",
          targetEntityId: "ent_b",
          relationType: "ally_of",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(forced.statusCode).toBe(201);
    });
  });

  it("creates, updates, and archives player profiles", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_ply",
          actorId: "usr_dm",
          title: "Player Test",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const create = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_ply/players",
        payload: {
          actorId: "usr_dm",
          playerId: "ply_1",
          name: "Alice",
          displayName: "Alice the Bold",
          email: null,
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(create.statusCode).toBe(201);

      const list = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_ply/players",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(list.json()).toHaveLength(1);
      expect(list.json()[0].displayName).toBe("Alice the Bold");

      const update = await server.inject({
        method: "PATCH",
        url: "/api/campaigns/cmp_ply/players/ply_1",
        payload: { actorId: "usr_dm", displayName: "Alice the Brave" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(update.statusCode).toBe(200);

      const archive = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_ply/players/ply_1",
        payload: { actorId: "usr_dm" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(archive.statusCode).toBe(200);

      const afterArchive = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_ply/players",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(afterArchive.json()).toHaveLength(0);
    });
  });

  describe("Security and Authorization Audits", () => {
    it("rejects player access to DM-only endpoints", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: {
            campaignId: "cmp_sec",
            actorId: "usr_dm",
            title: "Security Test",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });

        // Player tries to access dashboard
        const dashboard = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_sec/dashboard",
          headers: { "x-role": "player", "x-player-id": "ply_1" },
        });
        expect(dashboard.statusCode).toBe(403);

        // Player tries to export json
        const exportRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_sec/export/json",
          headers: { "x-role": "player" },
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
          payload: {
            campaignId: "cmp_lan",
            actorId: "usr_dm",
            title: "LAN Test",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });

        // Query status as player
        const resPlayer = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-role": "player" },
        });
        expect(resPlayer.statusCode).toBe(200);
        expect(resPlayer.json().accessCode).toBeNull();

        const toggle = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_lan/lan/toggle",
          headers: { "x-dm-token": getDmToken(server) },
          payload: { enabled: true },
        });
        expect(toggle.statusCode).toBe(200);
        const generatedCode = toggle.json().accessCode;
        expect(generatedCode).toMatch(/^\d{6}$/);

        const resPlayerAfterEnable = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-role": "player" },
        });
        expect(resPlayerAfterEnable.statusCode).toBe(200);
        expect(resPlayerAfterEnable.json().accessCode).toBeNull();

        // Query status as DM
        const resDM = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(resDM.statusCode).toBe(200);
        expect(resDM.json().accessCode).toBe(generatedCode);

        const resDevOrigin = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          headers: {
            "x-dm-token": getDmToken(server),
            origin: "http://localhost:5173",
          },
        });
        expect(resDevOrigin.statusCode).toBe(200);
        expect(resDevOrigin.json().joinUrl).toContain(":5173/join/cmp_lan");
      });
    });

    it("redirects dev LAN join requests from backend port to Vite UI port when the built SPA is absent", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });

        const res = await server.inject({
          method: "GET",
          url: "/join/cmp_lan_dev",
          headers: { host: "192.168.0.33:4877" },
        });

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe("http://192.168.0.33:5173/join/cmp_lan_dev");
      });
    });

    it("prevents vaultId path traversal and rejects invalid campaignId format", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });

        const badVault = await server.inject({
          method: "GET",
          url: "/api/campaigns",
          headers: {
            "x-vault-id": "../bad_vault",
            "x-dm-token": getDmToken(server),
          },
        });
        expect(badVault.statusCode).toBe(400);

        const badCmp = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_bad$/dashboard",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(badCmp.statusCode).toBe(400);
      });
    });

    it("verifies backup campaign ownership and does auto-backup before restore", async () => {
      await withTempDataDir(async (dataDir) => {
        const { copyFile, mkdir } = await import("node:fs/promises");
        const server = createServer({ dataDir });
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: {
            campaignId: "cmp_a",
            actorId: "usr_dm",
            title: "Campaign A",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: {
            campaignId: "cmp_b",
            actorId: "usr_dm",
            title: "Campaign B",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });

        // Create backup of A
        const backupRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_a/backups",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(backupRes.statusCode).toBe(201);
        const backupId = backupRes.json().backupId;

        // Copy the backup file of cmp_a to cmp_b's backups folder so B's restore can find it but reject it on campaignId mismatch
        const pathA = backupRes.json().path;
        const dirB = join(
          dataDir,
          "vaults",
          "default",
          "campaigns",
          "cmp_b",
          "backups",
        );
        await mkdir(dirB, { recursive: true });
        const pathB = join(dirB, backupId);
        await copyFile(pathA, pathB);

        // Try restoring backup of A to campaign B (should be rejected)
        const restoreBad = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_b/restore",
          payload: { backupId },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(restoreBad.statusCode).toBe(400);
        expect(restoreBad.json().error).toContain(
          "Backup does not belong to this campaign",
        );

        // Restore to A (should work and create a backup beforehand)
        const restoreOk = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_a/restore",
          payload: { backupId },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(restoreOk.statusCode).toBe(200);

        // Check if a pre-restore backup was generated
        const backupsList = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_a/backups",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(
          backupsList
            .json()
            .some((b: any) => b.backupId.startsWith("backup_pre_restore_")),
        ).toBe(true);
      });
    });
  });
});
