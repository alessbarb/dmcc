import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import { homedir } from "os";
import type { StoredEvent, DomainEventType } from "../../domain/shared/events.js";
import { storedEventSchema, eventPayloadSchemas } from "../../domain/shared/events.js";
import type { CampaignId } from "@shared/ids.js";
import { generateEventId } from "@shared/ids.js";
import { EventStoreError } from "@shared/errors.js";
import { nowIso } from "@shared/dateTime.js";
import { EVENT_SCHEMA_VERSION } from "@shared/appVersion.js";
import { assertWithinDir } from "@backend/server/helpers.js";
import { normalizeEventPayload } from "../../domain/shared/normalizeEventPayload.js";
import { requestContextStore } from "../context.js";

export function computeEventHash(eventWithoutHash: Omit<StoredEvent, "hash">): string {
  const hash = createHash("sha256");
  const data = JSON.stringify({
    sequence: eventWithoutHash.sequence,
    eventId: eventWithoutHash.eventId,
    campaignId: eventWithoutHash.campaignId,
    type: eventWithoutHash.type,
    occurredAt: eventWithoutHash.occurredAt,
    actorId: eventWithoutHash.actorId,
    payload: eventWithoutHash.payload,
    previousHash: eventWithoutHash.previousHash,
    schemaVersion: eventWithoutHash.schemaVersion,
    commandId: eventWithoutHash.commandId,
    commandHash: eventWithoutHash.commandHash,
  });
  hash.update(data);
  return hash.digest("hex");
}

export function normalizePayload(type: string, payload: any, occurredAt = nowIso()): any {
  return normalizeEventPayload(type, payload, occurredAt);
}

const writeQueues = new Map<string, Promise<any>>();

type EventAppendIndex = {
  sequence: number;
  hash?: string;
  offset: number;
};

export class EventStore {
  private baseDir: string;
  private vaultId: string;
  private commandIndices = new Map<string, Map<string, { commandHash: string; firstSequence: number; lastSequence: number }>>();

  constructor(baseDir?: string, vaultId = "default") {
    if (!/^[a-zA-Z0-9_-]+$/.test(vaultId)) {
      throw new Error("Invalid vault ID format");
    }
    this.baseDir = baseDir || path.join(homedir(), "Documents", "DMCampaignCompanion");
    this.vaultId = vaultId;
  }

  public async getCommandIndex(campaignId: CampaignId): Promise<Map<string, { commandHash: string; firstSequence: number; lastSequence: number }>> {
    let indexMap = this.commandIndices.get(campaignId);
    if (indexMap) return indexMap;

    indexMap = new Map();
    const filePath = path.join(this.getCampaignDir(campaignId), "command-index.ndjson");
    try {
      const content = await fs.readFile(filePath, "utf8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          indexMap.set(parsed.commandId, {
            commandHash: parsed.commandHash,
            firstSequence: parsed.firstSequence,
            lastSequence: parsed.lastSequence
          });
        } catch {
          throw new Error("corrupt command index line");
        }
      }
    } catch (error: any) {
      indexMap = await this.rebuildCommandIndexFromEvents(campaignId);
    }

    this.commandIndices.set(campaignId, indexMap);
    return indexMap;
  }

  public async rebuildCommandIndexFromEvents(campaignId: CampaignId): Promise<Map<string, { commandHash: string; firstSequence: number; lastSequence: number }>> {
    const indexMap = new Map<string, { commandHash: string; firstSequence: number; lastSequence: number }>();
    const events = await this.loadEvents(campaignId);

    const commandGroups = new Map<string, { commandHash: string; sequences: number[] }>();
    for (const event of events) {
      if (event.commandId && event.commandHash) {
        let group = commandGroups.get(event.commandId);
        if (!group) {
          group = { commandHash: event.commandHash, sequences: [] };
          commandGroups.set(event.commandId, group);
        }
        group.sequences.push(event.sequence);
      }
    }

    const filePath = path.join(this.getCampaignDir(campaignId), "command-index.ndjson");
    const tempPath = `${filePath}.tmp`;
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    let ndjson = "";
    for (const [commandId, group] of commandGroups.entries()) {
      const firstSequence = Math.min(...group.sequences);
      const lastSequence = Math.max(...group.sequences);

      indexMap.set(commandId, {
        commandHash: group.commandHash,
        firstSequence,
        lastSequence
      });

      ndjson += JSON.stringify({
        commandId,
        commandHash: group.commandHash,
        firstSequence,
        lastSequence
      }) + "\n";
    }

    await fs.writeFile(tempPath, ndjson, "utf8");
    await fs.rename(tempPath, filePath);

    return indexMap;
  }

  public async appendCommandIndexEntry(campaignId: CampaignId, entry: { commandId: string; commandHash: string; firstSequence: number; lastSequence: number }): Promise<void> {
    const indexMap = await this.getCommandIndex(campaignId);
    indexMap.set(entry.commandId, {
      commandHash: entry.commandHash,
      firstSequence: entry.firstSequence,
      lastSequence: entry.lastSequence
    });

    const filePath = path.join(this.getCampaignDir(campaignId), "command-index.ndjson");
    const ndjsonLine = JSON.stringify(entry) + "\n";
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, ndjsonLine, "utf8");
  }

  public getCampaignDir(campaignId: CampaignId): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(campaignId)) {
      throw new Error("Invalid campaign ID format");
    }
    const targetDir = path.join(this.baseDir, "vaults", this.vaultId, "campaigns", campaignId);
    assertWithinDir(targetDir, path.join(this.baseDir, "vaults", this.vaultId, "campaigns"));
    return targetDir;
  }

  public getEventsFilePath(campaignId: CampaignId): string {
    return path.join(this.getCampaignDir(campaignId), "events.ndjson");
  }

  public getIndexFilePath(campaignId: CampaignId): string {
    return path.join(this.getCampaignDir(campaignId), "events.index.json");
  }

  private async writeIndex(campaignId: CampaignId, index: EventAppendIndex): Promise<void> {
    const indexPath = this.getIndexFilePath(campaignId);
    const temporaryPath = `${indexPath}.tmp`;
    await fs.mkdir(path.dirname(indexPath), { recursive: true });
    await fs.writeFile(temporaryPath, JSON.stringify(index), "utf8");
    await fs.rename(temporaryPath, indexPath);
  }

  public async verifyAndRebuildIndex(campaignId: CampaignId): Promise<EventAppendIndex> {
    const events = await this.loadEvents(campaignId);
    const filePath = this.getEventsFilePath(campaignId);
    const offset = await fs.stat(filePath).then((stat) => stat.size).catch(() => 0);
    const last = events.at(-1);
    const index = { sequence: last?.sequence ?? 0, hash: last?.hash, offset };
    await this.writeIndex(campaignId, index);
    return index;
  }

  private async getAppendIndex(campaignId: CampaignId): Promise<EventAppendIndex> {
    const filePath = this.getEventsFilePath(campaignId);
    const fileSize = await fs.stat(filePath).then((stat) => stat.size).catch(() => 0);
    try {
      const index = JSON.parse(await fs.readFile(this.getIndexFilePath(campaignId), "utf8")) as EventAppendIndex;
      if (!Number.isInteger(index.sequence) || index.sequence < 0 || index.offset !== fileSize) {
        throw new Error("stale index");
      }
      if (index.sequence === 0 && fileSize === 0) return index;
      const handle = await fs.open(filePath, "r");
      try {
        const length = Math.min(fileSize, 64 * 1024);
        const buffer = Buffer.alloc(length);
        await handle.read(buffer, 0, length, fileSize - length);
        const lines = buffer.toString("utf8").trim().split("\n");
        const last = storedEventSchema.parse(JSON.parse(lines.at(-1) ?? ""));
        if (last.sequence !== index.sequence || last.hash !== index.hash || computeEventHash(last) !== last.hash) {
          throw new Error("index tip mismatch");
        }
      } finally {
        await handle.close();
      }
      return index;
    } catch {
      return this.verifyAndRebuildIndex(campaignId);
    }
  }

  /**
   * Loads all events for a campaign and validates their integrity.
   */
  public async loadEvents(campaignId: CampaignId): Promise<StoredEvent[]> {
    const filePath = this.getEventsFilePath(campaignId);

    let fileContent = "";

    try {
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new EventStoreError(`Failed to read event log file: ${error.message}`);
    }

    const lines = fileContent.split("\n");
    const events: StoredEvent[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const rawObj = JSON.parse(line);
        const parsed = storedEventSchema.parse(rawObj);
        events.push(parsed);
      } catch (err: any) {
        throw new EventStoreError(
          `Event corruption at line ${i + 1} of events.ndjson: ${err.message}`
        );
      }
    }

    // Verify hash chain and sequence numbers
    let lastHash = "";
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedSequence = i + 1;

      if (event.sequence !== expectedSequence) {
        throw new EventStoreError(
          `Out-of-sequence event: expected sequence ${expectedSequence}, got ${event.sequence}`
        );
      }

      if (i > 0 && event.previousHash !== lastHash) {
        throw new EventStoreError(
          `Hash chain broken at sequence ${event.sequence}: expected previousHash "${lastHash}", got "${event.previousHash}"`
        );
      }

      const calculatedHash = computeEventHash(event);
      if (event.hash !== calculatedHash) {
        throw new EventStoreError(
          `Hash verification failed at sequence ${event.sequence}: expected "${calculatedHash}", got "${event.hash}"`
        );
      }

      lastHash = event.hash;
    }

    return events;
  }

  /**
   * Appends a new event to the campaign's event log.
   */
  public async appendEvent<T>(
    campaignId: CampaignId,
    type: DomainEventType,
    actorId: string,
    payload: T,
    options?: { commandId?: string; commandHash?: string }
  ): Promise<StoredEvent<T>> {
    const filePath = this.getEventsFilePath(campaignId);
    const prev = writeQueues.get(filePath) ?? Promise.resolve();
    const next = prev.then(() => this._appendEventInner(campaignId, type, actorId, payload, options));
    const queued = next.catch(() => {}).finally(() => {
      if (writeQueues.get(filePath) === queued) writeQueues.delete(filePath);
    });
    writeQueues.set(filePath, queued);
    return next;
  }

  public async appendEvents(
    campaignId: CampaignId,
    events: Array<{ type: DomainEventType; actorId: string; payload: any }>,
    options?: { commandId?: string; commandHash?: string }
  ): Promise<StoredEvent[]> {
    const filePath = this.getEventsFilePath(campaignId);
    const previous = writeQueues.get(filePath) ?? Promise.resolve();
    const next = previous.then(async () => {
      const stored: StoredEvent[] = [];
      for (const event of events) {
        stored.push(await this._appendEventInner(campaignId, event.type, event.actorId, event.payload, options));
      }
      return stored;
    });
    const queued = next.catch(() => {}).finally(() => {
      if (writeQueues.get(filePath) === queued) writeQueues.delete(filePath);
    });
    writeQueues.set(filePath, queued);
    return next;
  }

  private async _appendEventInner<T>(
    campaignId: CampaignId,
    type: DomainEventType,
    actorId: string,
    payload: T,
    options?: { commandId?: string; commandHash?: string }
  ): Promise<StoredEvent<T>> {
    const context = requestContextStore.getStore();
    const commandId = options?.commandId ?? context?.commandId;
    const commandHash = options?.commandHash;

    const occurredAt = nowIso();
    const normalized = normalizeEventPayload(type, payload, occurredAt);
    const index = await this.getAppendIndex(campaignId);
    const sequence = index.sequence + 1;
    const previousHash = index.hash;
    const eventId = generateEventId();

    const eventWithoutHash: Omit<StoredEvent<T>, "hash"> = {
      sequence,
      eventId,
      campaignId,
      type,
      occurredAt,
      actorId,
      payload: normalized,
      previousHash,
      schemaVersion: EVENT_SCHEMA_VERSION,
      ...(commandId && { commandId }),
      ...(commandHash && { commandHash }),
    };

    const hash = computeEventHash(eventWithoutHash);
    const finalEvent: StoredEvent<T> = {
      ...eventWithoutHash,
      hash,
    };

    // Validate the complete event structure before writing
    try {
      storedEventSchema.parse(finalEvent);
    } catch (validationError: any) {
      throw new EventStoreError(`Invalid event payload structure: ${validationError.message}`);
    }

    // Strict validation: throw on mismatch.
    const payloadSchema = (eventPayloadSchemas as Record<string, any>)[type];
    if (payloadSchema) {
      const result = payloadSchema.safeParse(normalized);
      if (!result.success) {
        throw new EventStoreError(
          `Payload schema validation failed for "${type}": ${result.error.message}`
        );
      }
    }

    const filePath = this.getEventsFilePath(campaignId);
    const ndjsonLine = JSON.stringify(finalEvent) + "\n";

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.appendFile(filePath, ndjsonLine, "utf-8");
      await this.writeIndex(campaignId, {
        sequence,
        hash,
        offset: index.offset + Buffer.byteLength(ndjsonLine, "utf8"),
      });
    } catch (writeError: any) {
      throw new EventStoreError(`Failed to write event to disk: ${writeError.message}`);
    }

    return finalEvent;
  }
}
