import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import type { EntityType, EntityImportance } from "@core/domain/entity/types.js";
import type { RelationType } from "@core/domain/relation/types.js";
import type { FactKind, FactConfidence } from "@core/domain/fact/types.js";
import type { FactSource } from "@core/domain/fact/fact.js";
import { join, basename } from "path";
import * as fs from "fs/promises";
import { createId } from "@shared/ids.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
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
import { sendCommandError } from "../commandHttp.js";

const ATTACHMENT_MAX_DECODED_BYTES = 10 * 1024 * 1024;
const ATTACHMENT_BODY_LIMIT_BYTES = Math.ceil((ATTACHMENT_MAX_DECODED_BYTES * 4) / 3) + 4096;
function isValidBase64Content(base64Content: string): boolean {
  if (base64Content.length === 0 || base64Content.length % 4 !== 0) {
    return false;
  }

  const firstPaddingIndex = base64Content.indexOf("=");
  const contentLength = firstPaddingIndex === -1 ? base64Content.length : firstPaddingIndex;
  if (firstPaddingIndex !== -1 && !/^(?:=|==)$/.test(base64Content.slice(firstPaddingIndex))) {
    return false;
  }

  for (let index = 0; index < contentLength; index += 1) {
    const code = base64Content.charCodeAt(index);
    const isUppercase = code >= 65 && code <= 90;
    const isLowercase = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    if (!isUppercase && !isLowercase && !isDigit && base64Content[index] !== "+" && base64Content[index] !== "/") {
      return false;
    }
  }

  return true;
}

function getBase64DecodedLength(base64Content: string): number | undefined {
  if (!isValidBase64Content(base64Content)) {
    return undefined;
  }

  const padding = base64Content.endsWith("==") ? 2 : base64Content.endsWith("=") ? 1 : 0;
  return (base64Content.length / 4) * 3 - padding;
}

function validateAttachmentPayload(args: { base64Content: string; sizeBytes?: number }): { ok: true; decodedLength: number } | { ok: false; statusCode: 400 | 413; error: string } {
  const decodedLength = getBase64DecodedLength(args.base64Content);

  if (decodedLength === undefined) {
    return { ok: false, statusCode: 400, error: "base64Content must be valid padded base64" };
  }

  if (args.base64Content.length > ATTACHMENT_BODY_LIMIT_BYTES || decodedLength > ATTACHMENT_MAX_DECODED_BYTES) {
    return { ok: false, statusCode: 413, error: "Attachment payload is too large" };
  }

  if (args.sizeBytes !== undefined) {
    if (!Number.isSafeInteger(args.sizeBytes) || args.sizeBytes < 0) {
      return { ok: false, statusCode: 400, error: "sizeBytes must be a non-negative safe integer" };
    }

    if (args.sizeBytes > ATTACHMENT_MAX_DECODED_BYTES) {
      return { ok: false, statusCode: 413, error: "Attachment payload is too large" };
    }

    if (args.sizeBytes !== decodedLength) {
      return { ok: false, statusCode: 400, error: "sizeBytes does not match decoded base64Content length" };
    }
  }

  return { ok: true, decodedLength };
}

export async function registerExportRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getCampaignDir(campaignId: string, vaultId = "default") {
    return join(dataDir, "vaults", vaultId, "campaigns", campaignId);
  }

  const getRepository = makeRepositoryFactory(dataDir);

  // Upload Attachment
  server.post<{ Params: { campaignId: string }; Body: { filename: string; base64Content: string; sizeBytes?: number } }>(
    "/api/campaigns/:campaignId/attachments",
    { bodyLimit: ATTACHMENT_BODY_LIMIT_BYTES },
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { filename, base64Content, sizeBytes } = request.body;

      if (!filename || !base64Content) {
        reply.code(400);
        return { error: "Filename and base64Content are required" };
      }

      const validation = validateAttachmentPayload({ base64Content, sizeBytes });
      if (!validation.ok) {
        reply.code(validation.statusCode);
        return { error: validation.error };
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
        await repo.executeCommand(campaignId, {
          type: "AddAttachment",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
        if (sendCommandError(reply, err)) return;
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Import Markdown
  server.post<{ Params: { campaignId: string }; Body: { text: string; title?: string } }>(
    "/api/campaigns/:campaignId/import/markdown",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
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
        await repo.executeCommand(campaignId, {
          type: "CreateEntity",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          entityId: entityId,
          entityType: "note",
          title: title || `Imported Note ${new Date().toLocaleDateString()}`,
          content: text,
          status: "active",
          importance: "normal",
          visibility: { kind: "dm_only" },
          metadata: {},
        });

        await repo.executeCommand(campaignId, {
          type: "RecordImport",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
        if (sendCommandError(reply, err)) return;
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  type ImportEntityRecord = { entityId?: string; id?: string; entityType?: string; type?: string; title: string; summary?: string; content?: string; status?: string; importance?: string; visibility?: VisibilityRule; metadata?: Record<string, unknown> };
  type ImportRelationRecord = { relationId?: string; id?: string; sourceEntityId: string; targetEntityId: string; relationType: string; description?: string; visibility?: VisibilityRule };
  type ImportFactRecord = { factId?: string; id?: string; statement: string; kind: string; confidence?: string; visibility?: VisibilityRule; relatedEntityIds?: string[]; relatedRelationIds?: string[]; source?: FactSource };
  type ImportJsonBody = { entities?: ImportEntityRecord[]; relations?: ImportRelationRecord[]; facts?: ImportFactRecord[] };

  // Import JSON
  server.post<{ Params: { campaignId: string }; Body: ImportJsonBody }>(
    "/api/campaigns/:campaignId/import/json",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const data = request.body;

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
            await repo.executeCommand(campaignId, {
              type: "CreateEntity",
              campaignId: campaignId,
              actorId: getRequestActorId(request, server.dmSessionToken),
              entityId: e.entityId || e.id,
              entityType: (e.entityType || e.type) as EntityType,
              title: e.title,
              summary: e.summary,
              content: e.content,
              status: e.status,
              importance: e.importance as EntityImportance | undefined,
              visibility: e.visibility,
              metadata: e.metadata,
            });
            count++;
          }
        }
        if (Array.isArray(data.relations)) {
          for (const r of data.relations) {
            await repo.executeCommand(campaignId, {
              type: "CreateRelation",
              campaignId: campaignId,
              actorId: getRequestActorId(request, server.dmSessionToken),
              relationId: r.relationId || r.id,
              sourceEntityId: r.sourceEntityId,
              targetEntityId: r.targetEntityId,
              relationType: r.relationType as RelationType,
              description: r.description,
              visibility: r.visibility,
              allowDuplicate: true,
            });
            count++;
          }
        }
        if (Array.isArray(data.facts)) {
          for (const f of data.facts) {
            await repo.executeCommand(campaignId, {
              type: "RecordFact",
              campaignId: campaignId,
              actorId: getRequestActorId(request, server.dmSessionToken),
              factId: f.factId || f.id,
              statement: f.statement,
              kind: f.kind as FactKind,
              confidence: (f.confidence || "confirmed") as FactConfidence,
              visibility: f.visibility,
              relatedEntityIds: f.relatedEntityIds || [],
              relatedRelationIds: f.relatedRelationIds || [],
              source: (f.source as FactSource | undefined) ?? { kind: "manual" as const },
            });
            count++;
          }
        }
        await repo.executeCommand(campaignId, {
          type: "RecordImport",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          importId: createId("imp"),
          format: "json",
          count,
        });
        return { ok: true, count };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  // Export JSON
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/export/json",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);

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

        await repo.executeCommand(campaignId, {
          type: "RecordExport",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
      assertDM(request, server.dmSessionToken);
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
        if (sendCommandError(reply, err)) return;
        reply.code(404);
        return { error: `Campaign not found or backup failed: ${err.message}` };
      }
    }
  );

  // List Backups
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/backups",
    async (request, _reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      return listCampaignBackups({ dataDir, vaultId, campaignId });
    }
  );

  // Restore — accepts backupId (filename only)
  server.post<{ Params: { campaignId: string }; Body: { backupId: string } }>(
    "/api/campaigns/:campaignId/restore",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
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
        await repo.rebuildSnapshot(campaignId);

        // Audit event is best-effort: the restore is already complete at this point.
        // A failure here must not roll back the restore or return 500 to the client.
        try {
          await repo.executeCommand(campaignId, {
            type: "RestoreBackup",
            campaignId: campaignId,
            actorId: getRequestActorId(request, server.dmSessionToken),
            backupId,
          });
        } catch (auditErr: any) {
          server.log.error({ err: auditErr, campaignId, backupId }, "RestoreBackup: audit event write failed after successful restore");
        }

        return { ok: true, campaignId, restoredFrom: backupId, autoBackup };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(500);
        return { error: `Failed to restore campaign: ${err.message}` };
      }
    }
  );

  // Export Markdown Vault
  server.post<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/export/markdown",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);
        const events = await repo.loadEvents(campaignId);

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

        await repo.executeCommand(campaignId, {
          type: "RecordExport",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
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
      assertDM(request, server.dmSessionToken);
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
