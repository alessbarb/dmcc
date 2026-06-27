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
import {
  createCampaignBackup,
  listCampaignBackups,
  readBackupForCampaign,
  writeEventsFromBackup,
} from "../hardening/backups.js";
import { VERSION_INFO } from "@shared/appVersion.js";

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
        await createCampaignBackup({
          dataDir,
          vaultId,
          campaignId,
          reason: "auto-before-import",
          description: "Auto-backup before markdown import",
        });
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
        await createCampaignBackup({
          dataDir,
          vaultId,
          campaignId,
          reason: "auto-before-import",
          description: "Auto-backup before JSON import",
        });
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
          schemaVersion: VERSION_INFO.backupSchemaVersion,
          manifest: {
            app: "dmcc",
            ...VERSION_INFO,
            campaignId,
            vaultId,
            exportFormat: "json",
            createdAt: new Date().toISOString(),
          },
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
        const backup = await createCampaignBackup({
          dataDir,
          vaultId,
          campaignId,
          reason: "manual",
          description: "Manual campaign backup",
        });
        reply.code(201);
        return { campaignId, ...backup };
      } catch (err: any) {
        reply.code(404);
        return { error: `Campaign not found or backup failed: ${err.message}` };
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
      return listCampaignBackups({ dataDir, vaultId, campaignId });
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
        let backup;
        try {
          backup = await readBackupForCampaign({ dataDir, vaultId, campaignId, backupId });
        } catch (readErr: any) {
          const message = String(readErr.message ?? "");
          const isValidationError =
            message === "Invalid backupId" ||
            message.includes("does not belong") ||
            message.includes("different campaign") ||
            message.includes("does not contain") ||
            message.includes("Invalid event");
          reply.code(isValidationError ? 400 : 404);
          return { error: message };
        }

        const autoBackup = await createCampaignBackup({
          dataDir,
          vaultId,
          campaignId,
          reason: "auto-before-restore",
          description: `Auto-backup before restoring ${backupId}`,
        });

        await writeEventsFromBackup({ dataDir, vaultId, campaignId, backup });

        const repo = getRepository(vaultId);
        await repo.rebuildSnapshot(campaignId as any);

        await repo.executeCommand(campaignId as any, {
          type: "RestoreBackup",
          campaignId: campaignId as any,
          actorId: "dm",
          backupId,
        });

        return { ok: true, campaignId, restoredFrom: backupId, autoBackup };
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
