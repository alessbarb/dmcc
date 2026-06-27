import type { FastifyInstance } from "fastify";
import { join, basename } from "path";
import * as fs from "fs/promises";
import { createId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";
import { assertWithinDir } from "../helpers.js";
import { writeMarkdownCampaignExport } from "../export/markdownCampaignExport.js";

export async function registerExportRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getCampaignDir(campaignId: string, vaultId = "default") {
    return join(dataDir, "vaults", vaultId, "campaigns", campaignId);
  }

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  // Upload Attachment
  server.post<{ Params: { campaignId: string }; Body: { filename: string; base64Content: string } }>(
    "/api/campaigns/:campaignId/attachments",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { filename, base64Content } = request.body;

      if (!filename || !base64Content) {
        reply.code(400);
        return { error: "Filename and base64Content are required" };
      }

      const attachmentsDir = join(getCampaignDir(campaignId, vaultId), "attachments");
      await fs.mkdir(attachmentsDir, { recursive: true });

      const attachmentId = `att_${createId("att").split("_")[1]}`;
      const safeBaseName = basename(filename);
      const rawExtension = safeBaseName.includes(".") ? safeBaseName.split(".").pop() : "bin";
      const extension = /^[a-zA-Z0-9]{1,12}$/.test(rawExtension || "") ? rawExtension! : "bin";
      const savePath = join(attachmentsDir, `${attachmentId}.${extension}`);
      assertWithinDir(savePath, attachmentsDir);

      try {
        const buffer = Buffer.from(base64Content, "base64");
        await fs.writeFile(savePath, buffer);

        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "AddAttachment",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          attachmentId,
          filename,
          mimeType: `application/${extension}`,
          sizeBytes: buffer.length,
        });

        reply.code(201);
        return {
          id: attachmentId,
          campaignId,
          filename,
          mimeType: `application/${extension}`,
          sizeBytes: buffer.length,
          createdAt: new Date().toISOString(),
        };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Import Markdown
  server.post<{ Params: { campaignId: string }; Body: { text: string; title?: string } }>(
    "/api/campaigns/:campaignId/import/markdown",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { text, title } = request.body;

      if (!text || text.trim() === "") {
        reply.code(400);
        return { error: "Markdown text is required" };
      }

      const entityId = `ent_${createId("ent").split("_")[1]}`;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "CreateEntity",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          entityId: entityId as any,
          entityType: "note",
          title: title || `Imported Note ${new Date().toLocaleDateString()}`,
          content: text,
          status: "active",
          importance: "normal",
          visibility: { kind: "dm_only" },
          metadata: {},
        });

        await repo.executeCommand(campaignId as any, {
          type: "RecordImport",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          importId: createId("imp"),
          format: "markdown",
          count: 1,
        });

        reply.code(201);
        return {
          entityId,
          campaignId,
          entityType: "note",
          title: title || `Imported Note ${new Date().toLocaleDateString()}`,
          content: text,
          status: "active",
          importance: "normal",
          visibility: { kind: "dm_only" },
          metadata: {},
          tagIds: [],
          archived: false,
        };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Import JSON
  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/import/json",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const data = request.body as any;

      try {
        const repo = getRepository(vaultId);
        let count = 0;
        if (Array.isArray(data.entities)) {
          for (const e of data.entities) {
            await repo.executeCommand(campaignId as any, {
              type: "CreateEntity",
              campaignId: campaignId as any,
              actorId: "usr_dm",
              entityId: e.entityId || e.id,
              entityType: e.entityType || e.type,
              title: e.title,
              summary: e.summary,
              content: e.content,
              status: e.status,
              importance: e.importance,
              visibility: e.visibility,
              metadata: e.metadata,
            });
            count++;
          }
        }
        if (Array.isArray(data.relations)) {
          for (const r of data.relations) {
            await repo.executeCommand(campaignId as any, {
              type: "CreateRelation",
              campaignId: campaignId as any,
              actorId: "usr_dm",
              relationId: r.relationId || r.id,
              sourceEntityId: r.sourceEntityId,
              targetEntityId: r.targetEntityId,
              relationType: r.relationType,
              description: r.description,
              visibility: r.visibility,
              allowDuplicate: true,
            });
            count++;
          }
        }
        if (Array.isArray(data.facts)) {
          for (const f of data.facts) {
            await repo.executeCommand(campaignId as any, {
              type: "RecordFact",
              campaignId: campaignId as any,
              actorId: "usr_dm",
              factId: f.factId || f.id,
              statement: f.statement,
              kind: f.kind,
              confidence: f.confidence || "confirmed",
              visibility: f.visibility,
              relatedEntityIds: f.relatedEntityIds || [],
              relatedRelationIds: f.relatedRelationIds || [],
              source: f.source || { type: "manual" },
            });
            count++;
          }
        }
        await repo.executeCommand(campaignId as any, {
          type: "RecordImport",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          importId: createId("imp"),
          format: "json",
          count,
        });
        return { ok: true, count };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Export JSON
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/export/json",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);
        const events = await (repo as any)["eventStore"].loadEvents(campaignId as any);

        const exportData = {
          schemaVersion: 1,
          manifest: { campaignId, exportFormat: "json" },
          campaign: state.campaign,
          entities: Array.from(state.entities.values()),
          relations: Array.from(state.relations.values()),
          facts: Array.from(state.facts.values()),
          sessions: Array.from(state.sessions.values()),
          events,
        };

        const exportsDir = join(getCampaignDir(campaignId, vaultId), "exports");
        await fs.mkdir(exportsDir, { recursive: true });
        const exportPath = join(exportsDir, `export_${createId("exp")}.json`);
        await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2), "utf8");

        await repo.executeCommand(campaignId as any, {
          type: "RecordExport",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          exportId: createId("exp"),
          format: "json",
        });

        reply.code(201);
        return { campaignId, format: "json", path: exportPath };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // Create Backup
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/backups",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const events = await (repo as any)["eventStore"].loadEvents(campaignId as any);

        const backupData = { schemaVersion: 1, manifest: { campaignId, backupFormat: "json" }, events };
        const backupsDir = join(getCampaignDir(campaignId, vaultId), "backups");
        await fs.mkdir(backupsDir, { recursive: true });
        const backupFilename = `backup_${createId("bak")}.json`;
        const backupPath = join(backupsDir, backupFilename);
        assertWithinDir(backupPath, backupsDir);
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), "utf8");

        reply.code(201);
        return { campaignId, backupId: backupFilename, path: backupPath };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  // List Backups
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/backups",
    async (request, _reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const backupsDir = join(getCampaignDir(campaignId, vaultId), "backups");
      try {
        const files = await fs.readdir(backupsDir);
        return files
          .filter((f) => f.endsWith(".json") && f.startsWith("backup_"))
          .map((f) => ({ backupId: f }));
      } catch {
        return [];
      }
    }
  );

  // Restore — accepts backupId (filename only)
  server.post<{ Params: { campaignId: string }; Body: { backupId: string } }>(
    "/api/campaigns/:campaignId/restore",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { backupId } = request.body;

      if (!backupId || backupId.includes("/") || backupId.includes("\\") || backupId.includes("..")) {
        reply.code(400);
        return { error: "Invalid backupId" };
      }

      const backupsDir = join(getCampaignDir(campaignId, vaultId), "backups");
      const backupPath = join(backupsDir, basename(backupId));
      assertWithinDir(backupPath, backupsDir);

      try {
        let backupContent: string;
        try {
          backupContent = await fs.readFile(backupPath, "utf8");
        } catch (readErr: any) {
          reply.code(404);
          return { error: `Backup not found: ${readErr.message}` };
        }
        const backup = JSON.parse(backupContent);

        // Validate campaign ownership
        const manifestCampaignId = backup.manifest?.campaignId;
        if (manifestCampaignId && manifestCampaignId !== campaignId) {
          reply.code(400);
          return { error: "Backup does not belong to this campaign" };
        }
        if (Array.isArray(backup.events) && backup.events.some((e: any) => e.campaignId !== campaignId)) {
          reply.code(400);
          return { error: "Backup events belong to a different campaign" };
        }

        const campaignDir = getCampaignDir(campaignId, vaultId);
        const eventsFile = join(campaignDir, "events.ndjson");

        // 1. Create a backup of the current campaign prior to restore
        let currentEvents: any[] = [];
        try {
          const content = await fs.readFile(eventsFile, "utf8");
          currentEvents = content.split("\n").filter(Boolean).map(line => JSON.parse(line));
        } catch {
          // Ignored if no events exist yet
        }

        if (currentEvents.length > 0) {
          const autoBackupData = {
            schemaVersion: 1,
            manifest: { campaignId, backupFormat: "json", description: "Auto-backup before restore" },
            events: currentEvents
          };
          const autoBackupFilename = `backup_pre_restore_${createId("bak")}.json`;
          const autoBackupPath = join(backupsDir, autoBackupFilename);
          assertWithinDir(autoBackupPath, backupsDir);
          await fs.writeFile(autoBackupPath, JSON.stringify(autoBackupData, null, 2), "utf8");
        }

        // 2. Write the new events
        const ndjson = backup.events.map((e: any) => JSON.stringify(e)).join("\n") + "\n";
        await fs.writeFile(eventsFile, ndjson, "utf8");

        // 3. Rebuild snapshot
        const repo = getRepository(vaultId);
        await repo.rebuildSnapshot(campaignId as any);

        // 4. Record the restore as a domain event
        await repo.executeCommand(campaignId as any, {
          type: "RestoreBackup",
          campaignId: campaignId as any,
          actorId: "dm",
          backupId,
        });

        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: `Failed to restore campaign: ${err.message}` };
      }
    }
  );

  // Export Markdown Vault
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/export/markdown",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);
        const events = await (repo as any)["eventStore"].loadEvents(campaignId as any);

        const exportsDir = join(getCampaignDir(campaignId, vaultId), "exports");
        await fs.mkdir(exportsDir, { recursive: true });
        const exportId = `export_md_${createId("exp")}`;
        const exportMdDir = join(exportsDir, basename(exportId));
        assertWithinDir(exportMdDir, exportsDir);

        const result = await writeMarkdownCampaignExport({
          state,
          events,
          exportDir: exportMdDir,
          campaignId,
          exportId,
        });

        await repo.executeCommand(campaignId as any, {
          type: "RecordExport",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          exportId,
          format: "markdown",
        });

        reply.code(201);
        return result;
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  server.get<{ Params: { campaignId: string; exportId: string } }>(
    "/api/campaigns/:campaignId/exports/:exportId/download",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const exportId = request.params.exportId;

      if (!exportId || basename(exportId) !== exportId || exportId.includes("..")) {
        reply.code(400);
        return { error: "Invalid exportId" };
      }

      const exportsDir = join(getCampaignDir(campaignId, vaultId), "exports");
      const exportDir = join(exportsDir, basename(exportId));
      const primaryFile = "Campaña completa.md";
      const primaryPath = join(exportDir, primaryFile);
      assertWithinDir(exportDir, exportsDir);
      assertWithinDir(primaryPath, exportDir);

      try {
        const markdown = await fs.readFile(primaryPath, "utf8");
        reply
          .header("content-type", "text/markdown; charset=utf-8")
          .header("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(primaryFile)}`);
        return markdown;
      } catch {
        reply.code(404);
        return { error: "Export not found" };
      }
    }
  );
}
