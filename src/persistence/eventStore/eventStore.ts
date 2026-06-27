import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import { homedir } from "os";
import type { StoredEvent, DomainEventType } from "../../domain/shared/events.js";
import { storedEventSchema, eventPayloadSchemas } from "../../domain/shared/events.js";
import type { CampaignId } from "../../shared/ids.js";
import { generateEventId } from "../../shared/ids.js";
import { EventStoreError } from "../../shared/errors.js";
import { nowIso } from "../../shared/dateTime.js";
import { assertWithinDir } from "../../server/helpers.js";

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
  });
  hash.update(data);
  return hash.digest("hex");
}

export function normalizePayload(type: string, payload: any): any {
  if (!payload) return payload;
  const newPayload = { ...payload };
  const now = new Date().toISOString();

  // Normalize Entity fields
  if (type === "EntityCreated" || type === "EntityUpdated" || type === "EntityArchived") {
    newPayload.entityId = newPayload.entityId || newPayload.id;
    newPayload.id = newPayload.entityId;
    newPayload.entityType = newPayload.entityType || newPayload.type;
    newPayload.type = newPayload.entityType;
  }
  if (type === "EntityCreated") {
    newPayload.createdAt = newPayload.createdAt || now;
    newPayload.updatedAt = newPayload.updatedAt || now;
  }

  // Normalize Relation fields
  if (type === "RelationCreated" || type === "RelationUpdated" || type === "RelationArchived") {
    newPayload.relationId = newPayload.relationId || newPayload.id;
    newPayload.id = newPayload.relationId;
  }
  if (type === "RelationCreated") {
    newPayload.createdAt = newPayload.createdAt || now;
    newPayload.updatedAt = newPayload.updatedAt || now;
  }

  // Normalize Fact fields
  if (type === "FactCreated" || type === "FactUpdated" || type === "FactArchived") {
    newPayload.factId = newPayload.factId || newPayload.id;
    newPayload.id = newPayload.factId;
  }
  if (type === "FactCreated") {
    newPayload.createdAt = newPayload.createdAt || now;
    newPayload.updatedAt = newPayload.updatedAt || now;
  }

  // Normalize Session fields
  if (type === "SessionCreated" || type === "SessionStarted" || type === "SessionClosed") {
    newPayload.sessionId = newPayload.sessionId || newPayload.id;
    newPayload.id = newPayload.sessionId;
  }
  if (type === "SessionCreated" || type === "SessionStarted" || type === "SessionClosed") {
    newPayload.createdAt = newPayload.createdAt || now;
    newPayload.updatedAt = newPayload.updatedAt || now;
  }

  // Normalize visibility — canonical field is `kind`; drop legacy `mode`
  // Only applies when visibility is an object (domain VisibilityRule), not a portal string enum.
  if (newPayload.visibility && typeof newPayload.visibility === "object") {
    const canonicalKind = newPayload.visibility.kind || newPayload.visibility.mode || "dm_only";
    const { mode: _mode, ...rest } = newPayload.visibility;
    newPayload.visibility = { ...rest, kind: canonicalKind };
  }

  return newPayload;
}

const writeQueues = new Map<string, Promise<any>>();

export class EventStore {
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

  public getEventsFilePath(campaignId: CampaignId): string {
    return path.join(this.getCampaignDir(campaignId), "events.ndjson");
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
    payload: T
  ): Promise<StoredEvent<T>> {
    const filePath = this.getEventsFilePath(campaignId);
    const prev = writeQueues.get(filePath) ?? Promise.resolve();
    const next = prev.then(() => this._appendEventInner(campaignId, type, actorId, payload));
    writeQueues.set(filePath, next.catch(() => {}));
    return next;
  }

  private async _appendEventInner<T>(
    campaignId: CampaignId,
    type: DomainEventType,
    actorId: string,
    payload: T
  ): Promise<StoredEvent<T>> {
    const normalized = normalizePayload(type, payload);
    const events = await this.loadEvents(campaignId);
    const lastEvent = events[events.length - 1];
    const sequence = events.length + 1;
    const previousHash = lastEvent ? lastEvent.hash : undefined;
    const eventId = generateEventId();
    const occurredAt = nowIso();

    const eventWithoutHash: Omit<StoredEvent<T>, "hash"> = {
      sequence,
      eventId,
      campaignId,
      type,
      occurredAt,
      actorId,
      payload: normalized,
      previousHash,
      schemaVersion: 1,
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
    } catch (writeError: any) {
      throw new EventStoreError(`Failed to write event to disk: ${writeError.message}`);
    }

    return finalEvent;
  }
}
