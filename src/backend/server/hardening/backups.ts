import * as fs from "fs/promises";
import { join, basename } from "path";
import { createId } from "@shared/ids.js";
import type { CampaignId } from "@shared/ids.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { storedEventSchema } from "@core/domain/shared/events.js";
import {
  APP_VERSION,
  BACKUP_FORMAT_VERSION,
  BACKUP_SCHEMA_VERSION,
  EVENT_SCHEMA_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
  PROJECTION_SCHEMA_VERSION,
} from "@shared/appVersion.js";
import { assertWithinDir } from "../helpers.js";

export type BackupReason =
  | "manual"
  | "auto-before-import"
  | "auto-before-restore"
  | "auto-before-delete"
  | "auto-before-rebuild";

export interface CampaignBackupManifest {
  app: "dmcc";
  appVersion: string;
  backupFormat: "json";
  backupFormatVersion: number;
  schemaVersion: number;
  eventSchemaVersion: number;
  snapshotSchemaVersion: number;
  projectionSchemaVersion: number;
  campaignId: string;
  vaultId: string;
  backupId: string;
  reason: BackupReason;
  description?: string;
  createdAt: string;
  eventCount: number;
  lastSequence: number;
}

export interface CampaignBackupFile {
  schemaVersion: number;
  backupVersion: number;
  manifest: CampaignBackupManifest;
  events: unknown[];
}

export interface CampaignBackupSummary {
  backupId: string;
  path: string;
  reason: BackupReason | "legacy" | "unknown";
  description?: string;
  createdAt: string | null;
  eventCount: number | null;
  lastSequence: number | null;
  schemaVersion: number | null;
  backupVersion: number | null;
  appVersion: string | null;
}

function getCampaignDir(dataDir: string, vaultId: string, campaignId: string): string {
  return join(dataDir, "vaults", vaultId, "campaigns", campaignId);
}

export function getBackupsDir(dataDir: string, vaultId: string, campaignId: string): string {
  return join(getCampaignDir(dataDir, vaultId, campaignId), "backups");
}

function safeTimestamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function buildBackupFilename(reason: BackupReason): string {
  const prefixByReason: Record<BackupReason, string> = {
    manual: "backup",
    "auto-before-import": "backup_pre_import",
    "auto-before-restore": "backup_pre_restore",
    "auto-before-delete": "backup_pre_delete",
    "auto-before-rebuild": "backup_pre_rebuild",
  };
  return `${prefixByReason[reason]}_${safeTimestamp()}_${createId("bak")}.json`;
}

export async function createCampaignBackup(args: {
  dataDir: string;
  vaultId: string;
  campaignId: string;
  reason: BackupReason;
  description?: string;
  retainAutoBackups?: number;
}): Promise<CampaignBackupSummary> {
  const { dataDir, vaultId, campaignId, reason, description } = args;
  const events = await new EventStore(dataDir, vaultId).loadEvents(campaignId as CampaignId);
  const backupsDir = getBackupsDir(dataDir, vaultId, campaignId);
  await fs.mkdir(backupsDir, { recursive: true });

  const backupId = buildBackupFilename(reason);
  const backupPath = join(backupsDir, backupId);
  const tempPath = `${backupPath}.tmp`;
  assertWithinDir(backupPath, backupsDir);
  assertWithinDir(tempPath, backupsDir);

  const manifest: CampaignBackupManifest = {
    app: "dmcc",
    appVersion: APP_VERSION,
    backupFormat: "json",
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    eventSchemaVersion: EVENT_SCHEMA_VERSION,
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    projectionSchemaVersion: PROJECTION_SCHEMA_VERSION,
    campaignId,
    vaultId,
    backupId,
    reason,
    description,
    createdAt: new Date().toISOString(),
    eventCount: events.length,
    lastSequence: events.at(-1)?.sequence ?? 0,
  };
  const backup: CampaignBackupFile = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    backupVersion: BACKUP_FORMAT_VERSION,
    manifest,
    events,
  };

  await fs.writeFile(tempPath, JSON.stringify(backup, null, 2), "utf8");
  await fs.rename(tempPath, backupPath);

  if (reason !== "manual") {
    await pruneAutoBackups(dataDir, vaultId, campaignId, args.retainAutoBackups ?? 20);
  }

  return manifestToSummary(manifest, backupPath);
}

function manifestToSummary(manifest: CampaignBackupManifest, backupPath: string): CampaignBackupSummary {
  return {
    backupId: manifest.backupId,
    path: backupPath,
    reason: manifest.reason,
    description: manifest.description,
    createdAt: manifest.createdAt,
    eventCount: manifest.eventCount,
    lastSequence: manifest.lastSequence,
    schemaVersion: manifest.schemaVersion,
    backupVersion: manifest.backupFormatVersion,
    appVersion: manifest.appVersion,
  };
}

async function summarizeBackupFile(backupsDir: string, filename: string): Promise<CampaignBackupSummary> {
  const backupPath = join(backupsDir, filename);
  assertWithinDir(backupPath, backupsDir);
  try {
    const content = await fs.readFile(backupPath, "utf8");
    const parsed = JSON.parse(content);
    const manifest = parsed?.manifest;
    if (manifest?.backupId) {
      return {
        backupId: basename(manifest.backupId),
        path: backupPath,
        reason: manifest.reason ?? "unknown",
        description: manifest.description,
        createdAt: manifest.createdAt ?? null,
        eventCount: typeof manifest.eventCount === "number" ? manifest.eventCount : Array.isArray(parsed.events) ? parsed.events.length : null,
        lastSequence: typeof manifest.lastSequence === "number" ? manifest.lastSequence : null,
        schemaVersion: typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : null,
        backupVersion: typeof parsed.backupVersion === "number" ? parsed.backupVersion : manifest.backupFormatVersion ?? null,
        appVersion: manifest.appVersion ?? null,
      };
    }
    return {
      backupId: filename,
      path: backupPath,
      reason: "legacy",
      createdAt: null,
      eventCount: Array.isArray(parsed.events) ? parsed.events.length : null,
      lastSequence: Array.isArray(parsed.events) && parsed.events.length ? parsed.events.at(-1)?.sequence ?? null : null,
      schemaVersion: typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : null,
      backupVersion: typeof parsed.backupVersion === "number" ? parsed.backupVersion : null,
      appVersion: null,
    };
  } catch {
    const stat = await fs.stat(backupPath).catch(() => null);
    return {
      backupId: filename,
      path: backupPath,
      reason: "unknown",
      createdAt: stat?.mtime?.toISOString?.() ?? null,
      eventCount: null,
      lastSequence: null,
      schemaVersion: null,
      backupVersion: null,
      appVersion: null,
    };
  }
}

export async function listCampaignBackups(args: {
  dataDir: string;
  vaultId: string;
  campaignId: string;
}): Promise<CampaignBackupSummary[]> {
  const backupsDir = getBackupsDir(args.dataDir, args.vaultId, args.campaignId);
  try {
    const files = await fs.readdir(backupsDir);
    const summaries = await Promise.all(
      files
        .filter((file) => file.endsWith(".json") && file.startsWith("backup"))
        .map((file) => summarizeBackupFile(backupsDir, file)),
    );
    return summaries.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch (error: any) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function readBackupForCampaign(args: {
  dataDir: string;
  vaultId: string;
  campaignId: string;
  backupId: string;
}): Promise<CampaignBackupFile> {
  const backupId = basename(args.backupId);
  if (!backupId || backupId !== args.backupId || backupId.includes("..")) {
    throw new Error("Invalid backupId");
  }
  const backupsDir = getBackupsDir(args.dataDir, args.vaultId, args.campaignId);
  const backupPath = join(backupsDir, backupId);
  assertWithinDir(backupPath, backupsDir);

  const content = await fs.readFile(backupPath, "utf8");
  const backup = JSON.parse(content);
  if (!Array.isArray(backup.events)) {
    throw new Error("Backup does not contain an events array");
  }

  const manifestCampaignId = backup.manifest?.campaignId;
  if (manifestCampaignId && manifestCampaignId !== args.campaignId) {
    throw new Error("Backup does not belong to this campaign");
  }

  for (let index = 0; index < backup.events.length; index += 1) {
    const rawEvent = backup.events[index];
    const parsed = storedEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      throw new Error(`Invalid event at backup index ${index}: ${parsed.error.message}`);
    }
    if (parsed.data.campaignId && parsed.data.campaignId !== args.campaignId) {
      throw new Error("Backup events belong to a different campaign");
    }
  }

  return backup as CampaignBackupFile;
}

export async function writeEventsFromBackup(args: {
  dataDir: string;
  vaultId: string;
  campaignId: string;
  backup: CampaignBackupFile;
}): Promise<void> {
  const campaignDir = getCampaignDir(args.dataDir, args.vaultId, args.campaignId);
  await fs.mkdir(campaignDir, { recursive: true });
  const eventsFile = join(campaignDir, "events.ndjson");
  const tempFile = `${eventsFile}.restore.tmp`;
  assertWithinDir(eventsFile, campaignDir);
  assertWithinDir(tempFile, campaignDir);
  const ndjson = args.backup.events.map((event) => JSON.stringify(event)).join("\n") + "\n";
  await fs.writeFile(tempFile, ndjson, "utf8");
  await fs.rename(tempFile, eventsFile);
}

export async function pruneAutoBackups(
  dataDir: string,
  vaultId: string,
  campaignId: string,
  keep: number,
): Promise<void> {
  const backups = await listCampaignBackups({ dataDir, vaultId, campaignId });
  const autoBackups = backups.filter((backup) => String(backup.reason).startsWith("auto-"));
  const extras = autoBackups.slice(Math.max(keep, 0));
  for (const backup of extras) {
    const backupsDir = getBackupsDir(dataDir, vaultId, campaignId);
    const backupPath = join(backupsDir, basename(backup.backupId));
    assertWithinDir(backupPath, backupsDir);
    await fs.rm(backupPath, { force: true });
  }
}
