import * as fs from "fs/promises";
import * as path from "path";
import { homedir } from "os";
import type { CampaignId } from "../../shared/ids.js";
import type { CampaignProjection } from "../../projections/campaignProjection.js";

import { assertWithinDir } from "../../server/helpers.js";

export interface CampaignSnapshot {
  sequence: number;
  campaignId: CampaignId;
  projection: CampaignProjection;
}

export class SnapshotStore {
  private baseDir: string;
  private vaultId: string;

  constructor(baseDir?: string, vaultId = "default") {
    if (!/^[a-zA-Z0-9_-]+$/.test(vaultId)) {
      throw new Error("Invalid vault ID format");
    }
    this.baseDir = baseDir || path.join(homedir(), "Documents", "DMCampaignCompanion");
    this.vaultId = vaultId;
  }

  public getCampaignDir(campaignId: CampaignId): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
      throw new Error("Invalid campaign ID format");
    }
    const targetDir = path.join(this.baseDir, "vaults", this.vaultId, "campaigns", campaignId);
    assertWithinDir(targetDir, path.join(this.baseDir, "vaults", this.vaultId, "campaigns"));
    return targetDir;
  }

  public getSnapshotFilePath(campaignId: CampaignId): string {
    return path.join(this.getCampaignDir(campaignId), "snapshot.json");
  }

  public getTempSnapshotFilePath(campaignId: CampaignId): string {
    return path.join(this.getCampaignDir(campaignId), "snapshot.tmp.json");
  }

  /**
   * Saves a projection snapshot atomically to disk.
   */
  public async saveSnapshot(
    campaignId: CampaignId,
    sequence: number,
    projection: CampaignProjection
  ): Promise<void> {
    const campaignDir = this.getCampaignDir(campaignId);
    await fs.mkdir(campaignDir, { recursive: true });

    const toPlain = (val: any) => {
      if (val instanceof Map) {
        return Object.fromEntries(val);
      }
      return val || {};
    };

    // Convert Map properties to plain objects for JSON serialization
    const serializedProjection = {
      campaign: projection.campaign,
      players: toPlain(projection.players),
      entities: toPlain(projection.entities),
      relations: toPlain(projection.relations),
      facts: toPlain(projection.facts),
      sessions: toPlain(projection.sessions),
      sessionEvents: toPlain(projection.sessionEvents),
      tags: toPlain(projection.tags),
      attachments: toPlain(projection.attachments),
      lastSequence: projection.lastSequence,
    };

    const getValues = (val: any) => {
      if (!val) return [];
      if (val instanceof Map) {
        return Array.from(val.values());
      }
      if (typeof val.values === "function") {
        return Array.from(val.values());
      }
      return Object.values(val);
    };

    const snapshot = {
      schemaVersion: 1,
      lastSequence: sequence,
      sequence,
      campaignId,
      campaign: projection.campaign,
      entities: getValues(projection.entities),
      relations: getValues(projection.relations),
      facts: getValues(projection.facts),
      sessions: getValues(projection.sessions),
      players: getValues(projection.players),
      projection: serializedProjection,
    };

    const tempPath = this.getTempSnapshotFilePath(campaignId);
    const finalPath = this.getSnapshotFilePath(campaignId);

    // 1. Write to temporary file
    await fs.writeFile(tempPath, JSON.stringify(snapshot, null, 2), "utf-8");

    // 2. Rename atomically to the final file path
    await fs.rename(tempPath, finalPath);
  }

  /**
   * Loads a snapshot from disk if it exists. Returns null if not found.
   */
  public async loadSnapshot(campaignId: CampaignId): Promise<CampaignSnapshot | null> {
    const finalPath = this.getSnapshotFilePath(campaignId);
    try {
      const fileContent = await fs.readFile(finalPath, "utf-8");
      const parsed = JSON.parse(fileContent);

      // Rehydrate plain JSON structures back into Map instances
      const p = parsed.projection;
      if (p) {
        parsed.projection = {
          campaign: p.campaign,
          players: new Map(Object.entries(p.players || {})),
          entities: new Map(Object.entries(p.entities || {})),
          relations: new Map(Object.entries(p.relations || {})),
          facts: new Map(Object.entries(p.facts || {})),
          sessions: new Map(Object.entries(p.sessions || {})),
          sessionEvents: new Map(Object.entries(p.sessionEvents || {})),
          tags: new Map(Object.entries(p.tags || {})),
          attachments: new Map(Object.entries(p.attachments || {})),
          lastSequence: p.lastSequence || 0,
        };
      } else {
        const toMap = (arr: any[], idKey: string) => {
          const map = new Map();
          if (Array.isArray(arr)) {
            for (const item of arr) {
              const id = item[idKey] || item.id;
              if (id) map.set(id, item);
            }
          }
          return map;
        };
        parsed.projection = {
          campaign: parsed.campaign || null,
          players: toMap(parsed.players, "playerId"),
          entities: toMap(parsed.entities, "entityId"),
          relations: toMap(parsed.relations, "relationId"),
          facts: toMap(parsed.facts, "factId"),
          sessions: toMap(parsed.sessions, "sessionId"),
          sessionEvents: new Map(),
          tags: new Map(),
          attachments: new Map(),
          lastSequence: parsed.lastSequence || parsed.sequence || 0,
        };
      }

      return parsed as CampaignSnapshot;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return null;
      }
      // Snapshot exists but is corrupt — quarantine and rebuild from events
      const corruptPath = finalPath.replace(/\.json$/, ".corrupt.json");
      try {
        await fs.rename(finalPath, corruptPath);
        process.stderr.write(
          `[dmcc] Corrupt snapshot for campaign ${campaignId} moved to ${corruptPath}. Rebuilding from events.\n`
        );
      } catch {
        // rename failed — proceed with rebuild anyway
      }
      return null;
    }
  }

  /**
   * Deletes the snapshot file if present.
   */
  public async deleteSnapshot(campaignId: CampaignId): Promise<void> {
    const finalPath = this.getSnapshotFilePath(campaignId);
    try {
      await fs.unlink(finalPath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
}
