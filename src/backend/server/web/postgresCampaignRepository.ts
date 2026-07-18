import { createHash } from "node:crypto";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import type { DbTransaction } from "../../db/client.js";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { acquireCampaignAdvisoryLock } from "../../db/advisoryLock.js";
import { HttpError } from "../errors.js";
import { EVENT_SCHEMA_VERSION } from "@shared/appVersion.js";
import { nowIso } from "@shared/dateTime.js";
import { generateEventId } from "@shared/ids.js";
import type { Command } from "@core/application/commands.js";
import { handleCommand } from "@core/application/commandBus.js";
import type { CampaignProjection } from "@core/projections/campaignProjection.js";
import { applyEvent, createEmptyCampaignProjection } from "@core/projections/campaignProjection.js";
import type { CampaignState } from "@core/domain/state.js";
import type { DomainEventType, StoredEvent } from "@core/domain/shared/events.js";
import { storedEventSchema, eventPayloadSchemas } from "@core/domain/shared/events.js";
import { normalizeEventPayload } from "@core/domain/shared/normalizeEventPayload.js";
import { calculateCommandHash, CommandConflictError } from "@core/persistence/repositories/campaignRepository.js";
import { projectDomainEventToActivity } from "@core/projections/activity/projectDomainEventToActivity.js";
import { activityRepository } from "../activity/activityRepository.js";

function computeEventHash(eventWithoutHash: Omit<StoredEvent<unknown>, "hash">): string {
  return createHash("sha256").update(JSON.stringify({
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
  })).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalCommandPayload(command: Command): string {
  const canonicalStringify = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
    if (isRecord(value)) {
      const keys = Object.keys(value).filter((key) => key !== "actorId").sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  };
  return canonicalStringify(command);
}

// Picks the record's identifying field (used only when a snapshot's Maps were
// serialized as arrays instead of plain objects by an older snapshot format).
function pickSerializedRecordId(item: unknown): string {
  if (!isRecord(item)) return "";
  const candidate = item.id ?? item.entityId ?? item.relationId ?? item.factId ?? item.sessionId ?? item.playerId ?? item.notebookId ?? item.notebookItemId ?? item.threadId ?? item.stepId;
  return typeof candidate === "string" ? candidate : "";
}

function mapFromSerialized(value: unknown): Map<string, unknown> {
  if (value instanceof Map) return value;
  if (!value) return new Map();
  if (Array.isArray(value)) {
    return new Map(value.map((item: unknown): [string, unknown] => [pickSerializedRecordId(item), item]));
  }
  if (isRecord(value)) return new Map(Object.entries(value));
  return new Map();
}

function snapshotToProjection(row: typeof schema.campaignSnapshots.$inferSelect | undefined): CampaignProjection | null {
  if (!row) return null;
  const raw = row.snapshot;
  const rawRecord = isRecord(raw) ? raw : undefined;
  const projection = (isRecord(rawRecord?.projection) ? rawRecord.projection : rawRecord) ?? undefined;
  if (!projection) return null;

  // The persisted snapshot JSON has no static schema (it's rehydrated from a
  // jsonb column); trusting its shape here matches how snapshots are written
  // by serializeProjection below.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return {
    campaign: projection.campaign ?? rawRecord?.campaign ?? null,
    players: mapFromSerialized(projection.players),
    invitations: mapFromSerialized(projection.invitations),
    entities: mapFromSerialized(projection.entities),
    relations: mapFromSerialized(projection.relations),
    facts: mapFromSerialized(projection.facts),
    sessions: mapFromSerialized(projection.sessions),
    sessionEvents: mapFromSerialized(projection.sessionEvents),
    tags: mapFromSerialized(projection.tags),
    attachments: mapFromSerialized(projection.attachments),
    canvases: mapFromSerialized(projection.canvases),
    notebooks: mapFromSerialized(projection.notebooks),
    notebookItems: mapFromSerialized(projection.notebookItems),
    storyThreads: mapFromSerialized(projection.storyThreads),
    storySteps: mapFromSerialized(projection.storySteps),
    lastSequence: Number(projection.lastSequence ?? row.sequence ?? 0),
  } as CampaignProjection;
}

function serializeProjection(projection: CampaignProjection) {
  function toPlain<V>(value: Map<string, V>): Record<string, V> {
    return Object.fromEntries(value);
  }
  return {
    campaign: projection.campaign,
    players: toPlain(projection.players),
    invitations: toPlain(projection.invitations),
    entities: toPlain(projection.entities),
    relations: toPlain(projection.relations),
    facts: toPlain(projection.facts),
    sessions: toPlain(projection.sessions),
    sessionEvents: toPlain(projection.sessionEvents),
    tags: toPlain(projection.tags),
    attachments: toPlain(projection.attachments),
    canvases: toPlain(projection.canvases),
    notebooks: toPlain(projection.notebooks),
    notebookItems: toPlain(projection.notebookItems),
    storyThreads: toPlain(projection.storyThreads),
    storySteps: toPlain(projection.storySteps),
    lastSequence: projection.lastSequence,
  };
}

function projectionToCampaignState(campaignId: string, projection: CampaignProjection): CampaignState {
  return {
    campaignId,
    campaign: projection.campaign,
    players: projection.players,
    invitations: projection.invitations,
    entities: projection.entities,
    relations: projection.relations,
    facts: projection.facts,
    sessions: projection.sessions,
    sessionEvents: projection.sessionEvents,
    tags: projection.tags,
    attachments: projection.attachments,
    canvases: projection.canvases,
    notebooks: projection.notebooks,
    notebookItems: projection.notebookItems,
    storyThreads: projection.storyThreads,
    storySteps: projection.storySteps,
  };
}

async function loadEventsTx(tx: DbTransaction, campaignId: string, fromSequence = 1): Promise<StoredEvent<unknown>[]> {
  const rows = await tx
    .select()
    .from(schema.domainEvents)
    .where(and(eq(schema.domainEvents.campaignId, campaignId), gte(schema.domainEvents.sequence, fromSequence)))
    .orderBy(asc(schema.domainEvents.sequence));

  return rows.map((row) => storedEventSchema.parse({
    sequence: row.sequence,
    eventId: row.eventId,
    campaignId: row.campaignId,
    type: row.type,
    payload: row.payload,
    occurredAt: row.occurredAt,
    actorId: row.actorId,
    commandId: row.commandId ?? undefined,
    commandHash: row.commandHash ?? undefined,
    previousHash: row.previousHash ?? undefined,
    hash: row.hash,
    schemaVersion: row.schemaVersion,
  })) as StoredEvent<unknown>[];
}

async function loadProjectionTx(tx: DbTransaction, campaignId: string): Promise<CampaignProjection> {
  const [snapshot] = await tx
    .select()
    .from(schema.campaignSnapshots)
    .where(eq(schema.campaignSnapshots.campaignId, campaignId))
    .limit(1);

  let projection = snapshotToProjection(snapshot) ?? createEmptyCampaignProjection();
  const fromSequence = snapshot ? snapshot.sequence + 1 : 1;
  const events = await loadEventsTx(tx, campaignId, fromSequence);
  for (const event of events) {
    projection = applyEvent(projection, event);
  }
  return projection;
}

async function saveSnapshotTx(tx: DbTransaction, campaignId: string, projection: CampaignProjection): Promise<void> {
  await tx
    .insert(schema.campaignSnapshots)
    .values({
      campaignId,
      sequence: projection.lastSequence,
      snapshot: { projection: serializeProjection(projection) },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.campaignSnapshots.campaignId,
      set: {
        sequence: projection.lastSequence,
        snapshot: { projection: serializeProjection(projection) },
        updatedAt: new Date(),
      },
    });
}

function buildStoredEvent(input: {
  campaignId: string;
  sequence: number;
  type: DomainEventType;
  actorId: string;
  payload: unknown;
  previousHash?: string;
  commandId: string;
  commandHash: string;
}): StoredEvent {
  const occurredAt = nowIso();
  const normalized = normalizeEventPayload(input.type, input.payload, occurredAt);
  const eventWithoutHash: Omit<StoredEvent, "hash"> = {
    sequence: input.sequence,
    eventId: generateEventId(),
    campaignId: input.campaignId,
    type: input.type,
    occurredAt,
    actorId: input.actorId,
    payload: normalized,
    previousHash: input.previousHash,
    schemaVersion: EVENT_SCHEMA_VERSION,
    commandId: input.commandId,
    commandHash: input.commandHash,
  };
  const event = { ...eventWithoutHash, hash: computeEventHash(eventWithoutHash) } as StoredEvent;
  const payloadSchema = eventPayloadSchemas[event.type];
  const parsed = payloadSchema.safeParse(event.payload);
  if (!parsed.success) {
    throw new Error(`Payload schema validation failed for "${event.type}": ${parsed.error.message}`);
  }
  storedEventSchema.parse(event);
  return event;
}

async function projectReadModelsTx(tx: DbTransaction, events: StoredEvent[]): Promise<void> {
  for (const event of events) {
    // Project and write campaign activity
    const activities = projectDomainEventToActivity(event);
    for (const activity of activities) {
      await activityRepository.insertActivity(tx, activity);
    }

    // event.payload is `any` via StoredEvent's deliberately untyped generic default (see
    // events.ts); each switch case below duck-types the specific event payload it expects.
    const payload = event.payload;
    switch (event.type) {
      case "CampaignCreated": {
        const metadata = {
          ...(payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata) ? payload.metadata : {}),
          ...(typeof payload.system === "string" && payload.system.trim().length > 0 ? { system: payload.system.trim() } : {}),
          ...(typeof payload.coverUrl === "string" && payload.coverUrl.trim().length > 0 ? { coverUrl: payload.coverUrl.trim() } : {}),
        };
        await tx
          .update(schema.campaigns)
          .set({
            title: payload.title,
            summary: payload.summary ?? null,
            metadata,
            updatedAt: new Date(),
          })
          .where(eq(schema.campaigns.campaignId, event.campaignId ?? payload.campaignId));
        break;
      }
      case "CampaignUpdated": {
        await tx
          .update(schema.campaigns)
          .set({
            ...(payload.title !== undefined && { title: payload.title }),
            ...(payload.summary !== undefined && { summary: payload.summary }),
            ...(payload.status !== undefined && { status: payload.status }),
            updatedAt: new Date(),
          })
          .where(eq(schema.campaigns.campaignId, event.campaignId ?? payload.campaignId ?? payload.id));
        break;
      }
      case "EntityCreated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const entityId = payload.entityId ?? payload.id;
        const entityType = payload.entityType ?? payload.type;
        const visibility = payload.visibility ?? "dm_only";
        await tx.insert(schema.campaignEntities).values({
          campaignId,
          entityId,
          type: entityType,
          name: payload.title ?? payload.name,
          publicSummary: payload.summary ?? null,
          dmSummary: payload.content ?? null,
          status: payload.status ?? "active",
          importance: payload.importance ?? "normal",
          tags: payload.tagIds ?? [],
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [schema.campaignEntities.campaignId, schema.campaignEntities.entityId],
          set: {
            type: entityType,
            name: payload.title ?? payload.name,
            publicSummary: payload.summary ?? null,
            dmSummary: payload.content ?? null,
            status: payload.status ?? "active",
            importance: payload.importance ?? "normal",
            tags: payload.tagIds ?? [],
            updatedAt: new Date(),
          },
        });
        await upsertVisibilityGrant(tx, campaignId, "entity", entityId, visibility);
        if (entityType === "clue") {
          await upsertClueReadModel(tx, {
            campaignId,
            clueId: entityId,
            entityId,
            title: payload.title ?? payload.name ?? "Clue",
            publicSummary: payload.summary ?? null,
            dmSummary: payload.content ?? null,
            status: visibilityScopeOf(visibility) === "dm_only" ? "hidden" : "revealed",
            visibilityScope: visibilityScopeOf(visibility),
          });
        }
        if (entityType === "player_character") {
          await upsertCharacterReadModel(tx, {
            campaignId,
            characterId: entityId,
            entityId,
            name: payload.title ?? payload.name ?? "Character",
            publicSummary: payload.summary ?? null,
            dmSummary: payload.content ?? null,
            status: payload.status ?? "active",
          });
        }
        break;
      }
      case "EntityUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const entityId = payload.entityId ?? payload.id;
        await tx.update(schema.campaignEntities).set({
          ...(payload.title !== undefined && { name: payload.title }),
          ...(payload.summary !== undefined && { publicSummary: payload.summary }),
          ...(payload.content !== undefined && { dmSummary: payload.content }),
          ...(payload.status !== undefined && { status: payload.status }),
          updatedAt: new Date(),
        }).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, entityId),
        ));

        const [existingEntity] = await tx.select().from(schema.campaignEntities).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, entityId),
        )).limit(1);
        if (existingEntity?.type === "clue") {
          await upsertClueReadModel(tx, {
            campaignId,
            clueId: entityId,
            entityId,
            title: payload.title ?? existingEntity.name,
            publicSummary: payload.summary ?? existingEntity.publicSummary,
            dmSummary: payload.content ?? existingEntity.dmSummary,
            status: payload.status ?? existingEntity.status ?? "hidden",
            visibilityScope: existingEntity.status === "revealed" ? "all_players" : "dm_only",
          });
        }
        if (existingEntity?.type === "player_character") {
          await upsertCharacterReadModel(tx, {
            campaignId,
            characterId: entityId,
            entityId,
            name: payload.title ?? existingEntity.name,
            publicSummary: payload.summary ?? existingEntity.publicSummary,
            dmSummary: payload.content ?? existingEntity.dmSummary,
            status: payload.status ?? existingEntity.status ?? "active",
          });
        }
        break;
      }
      case "EntityArchived": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const entityId = payload.entityId ?? payload.id;
        await tx.update(schema.campaignEntities).set({ status: "archived", updatedAt: new Date() }).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, entityId),
        ));
        await tx.update(schema.campaignClues).set({ status: "archived", updatedAt: new Date() }).where(and(
          eq(schema.campaignClues.campaignId, campaignId),
          eq(schema.campaignClues.entityId, entityId),
        ));
        await tx.update(schema.characters).set({ status: "archived", updatedAt: new Date() }).where(and(
          eq(schema.characters.campaignId, campaignId),
          eq(schema.characters.entityId, entityId),
        ));
        break;
      }
      case "FactCreated": {
        const factId = payload.factId ?? payload.id;
        await tx.insert(schema.campaignFacts).values({
          campaignId: event.campaignId ?? payload.campaignId,
          factId,
          subjectEntityId: payload.relatedEntityIds?.[0] ?? payload.subjectEntityId ?? "",
          kind: payload.kind,
          contentPublic: payload.kind === "dm_secret" ? null : payload.statement,
          contentDm: payload.statement,
          confidence: payload.confidence ?? "confirmed",
          source: payload.source?.kind ?? payload.source ?? null,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: [schema.campaignFacts.campaignId, schema.campaignFacts.factId],
          set: {
            kind: payload.kind,
            contentPublic: payload.kind === "dm_secret" ? null : payload.statement,
            contentDm: payload.statement,
            updatedAt: new Date(),
          },
        });
        await upsertVisibilityGrant(tx, event.campaignId ?? payload.campaignId, "fact", factId, payload.kind === "dm_secret" ? "dm_only" : (payload.visibility?.kind ?? "all_players"));
        break;
      }
      case "RelationCreated": {
        const relationId = payload.relationId ?? payload.id;
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignRelations).values({
          campaignId,
          relationId,
          sourceEntityId: payload.sourceEntityId,
          targetEntityId: payload.targetEntityId,
          type: payload.relationType ?? payload.type,
          publicSummary: payload.description ?? null,
          dmSummary: payload.dmSummary ?? null,
          visibility: visibilityScopeOf(payload.visibility, "dm_only"),
          createdAt: new Date(),
        }).onConflictDoUpdate({
          target: [schema.campaignRelations.campaignId, schema.campaignRelations.relationId],
          set: {
            publicSummary: payload.description ?? null,
            dmSummary: payload.dmSummary ?? null,
            visibility: visibilityScopeOf(payload.visibility, "dm_only"),
          },
        });
        await upsertVisibilityGrant(tx, campaignId, "relation", relationId, payload.visibility ?? "dm_only");
        break;
      }
      case "RelationUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const relationId = payload.relationId ?? payload.id;
        await tx.update(schema.campaignRelations).set({
          ...(payload.description !== undefined && { publicSummary: payload.description }),
          ...(payload.dmSummary !== undefined && { dmSummary: payload.dmSummary }),
          ...(payload.relationType !== undefined && { type: payload.relationType }),
          ...(payload.type !== undefined && { type: payload.type }),
          ...(payload.visibility !== undefined && { visibility: visibilityScopeOf(payload.visibility, "dm_only") }),
        }).where(and(
          eq(schema.campaignRelations.campaignId, campaignId),
          eq(schema.campaignRelations.relationId, relationId),
        ));
        if (payload.visibility !== undefined) {
          await upsertVisibilityGrant(tx, campaignId, "relation", relationId, payload.visibility, "dm_only");
        }
        break;
      }
      case "RelationArchived": {
        await tx.update(schema.campaignRelations).set({ visibility: "dm_only" }).where(and(
          eq(schema.campaignRelations.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignRelations.relationId, payload.relationId ?? payload.id),
        ));
        break;
      }
      case "FactUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const factId = payload.factId ?? payload.id;
        await tx.update(schema.campaignFacts).set({
          ...(payload.kind !== undefined && { kind: payload.kind }),
          ...(payload.statement !== undefined && { contentPublic: payload.kind === "dm_secret" ? null : payload.statement, contentDm: payload.statement }),
          ...(payload.confidence !== undefined && { confidence: payload.confidence }),
          updatedAt: new Date(),
        }).where(and(
          eq(schema.campaignFacts.campaignId, campaignId),
          eq(schema.campaignFacts.factId, factId),
        ));
        if (payload.visibility !== undefined || payload.kind === "dm_secret") {
          await upsertVisibilityGrant(tx, campaignId, "fact", factId, payload.kind === "dm_secret" ? "dm_only" : payload.visibility, "all_players");
        }
        break;
      }
      case "FactArchived": {
        await tx.update(schema.campaignFacts).set({ status: "archived", updatedAt: new Date() }).where(and(
          eq(schema.campaignFacts.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignFacts.factId, payload.factId ?? payload.id),
        ));
        break;
      }
      case "VisibilityChanged": {
        await upsertVisibilityGrant(tx, event.campaignId ?? payload.campaignId, payload.targetType, payload.targetId, payload.visibility, "dm_only");
        if (payload.targetType === "entity") {
          await tx.update(schema.campaignEntities).set({ updatedAt: new Date() }).where(and(
            eq(schema.campaignEntities.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignEntities.entityId, payload.targetId),
          ));
          await tx.update(schema.campaignClues).set({
            visibilityScope: visibilityScopeOf(payload.visibility, "dm_only"),
            status: visibilityScopeOf(payload.visibility, "dm_only") === "dm_only" ? "hidden" : "revealed",
            updatedAt: new Date(),
          }).where(and(
            eq(schema.campaignClues.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignClues.entityId, payload.targetId),
          ));
        }
        break;
      }
      case "ClueRevealed": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const scope = visibilityScopeOf(payload.visibility, "all_players");
        await tx.update(schema.campaignEntities).set({ status: "revealed", updatedAt: new Date() }).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, payload.clueEntityId),
        ));
        const [entity] = await tx.select().from(schema.campaignEntities).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, payload.clueEntityId),
        )).limit(1);
        await upsertClueReadModel(tx, {
          campaignId,
          clueId: payload.clueEntityId,
          entityId: payload.clueEntityId,
          title: entity?.name ?? "Revealed clue",
          publicSummary: payload.note ?? entity?.publicSummary ?? null,
          dmSummary: entity?.dmSummary ?? null,
          status: "revealed",
          visibilityScope: scope,
          revealedInSessionId: payload.sessionId ?? null,
        });
        await upsertVisibilityGrant(tx, campaignId, "entity", payload.clueEntityId, payload.visibility, "all_players");
        break;
      }
      case "PlayerProfileCreated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        const profileId = payload.playerId ?? payload.id;
        await tx.insert(schema.playerProfiles).values({
          profileId,
          campaignId,
          displayName: payload.displayName ?? payload.name ?? "Player",
          status: payload.archived ? "archived" : "active",
          linkedCharacterId: payload.linkedCharacterId ?? null,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: schema.playerProfiles.profileId,
          set: {
            displayName: payload.displayName ?? payload.name ?? "Player",
            status: payload.archived ? "archived" : "active",
            linkedCharacterId: payload.linkedCharacterId ?? null,
            updatedAt: new Date(),
          },
        });
        break;
      }
      case "PlayerProfileUpdated": {
        await tx.update(schema.playerProfiles).set({
          ...(payload.displayName !== undefined && { displayName: payload.displayName }),
          ...(payload.linkedCharacterId !== undefined && { linkedCharacterId: payload.linkedCharacterId }),
          updatedAt: new Date(),
        }).where(eq(schema.playerProfiles.profileId, payload.playerId ?? payload.id));
        break;
      }
      case "PlayerProfileArchived": {
        await tx.update(schema.playerProfiles).set({ status: "archived", updatedAt: new Date() }).where(eq(schema.playerProfiles.profileId, payload.playerId ?? payload.id));
        break;
      }
      case "PlayerCharacterLinked": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.update(schema.playerProfiles).set({ linkedCharacterId: payload.characterEntityId, updatedAt: new Date() }).where(eq(schema.playerProfiles.profileId, payload.playerId));
        const [entity] = await tx.select().from(schema.campaignEntities).where(and(
          eq(schema.campaignEntities.campaignId, campaignId),
          eq(schema.campaignEntities.entityId, payload.characterEntityId),
        )).limit(1);
        await upsertCharacterReadModel(tx, {
          campaignId,
          characterId: payload.characterEntityId,
          entityId: payload.characterEntityId,
          playerProfileId: payload.playerId,
          name: entity?.name ?? "Character",
          publicSummary: entity?.publicSummary ?? null,
          dmSummary: entity?.dmSummary ?? null,
          status: "active",
        });
        break;
      }
      case "PlayerCharacterUnlinked": {
        await tx.update(schema.playerProfiles).set({ linkedCharacterId: null, updatedAt: new Date() }).where(eq(schema.playerProfiles.profileId, payload.playerId));
        await tx.update(schema.characters).set({ playerProfileId: null, updatedAt: new Date() }).where(and(
          eq(schema.characters.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.characters.playerProfileId, payload.playerId),
        ));
        break;
      }
      case "SessionCreated":
      case "SessionPrepUpdated":
      case "SessionStarted":
      case "SessionClosed":
      case "SessionCancelled": {
        const sessionId = payload.sessionId ?? payload.id;
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignSessions).values({
          campaignId,
          sessionId,
          number: payload.number ?? 1,
          title: payload.title ?? "Session",
          recapDm: payload.summary ?? payload.recapDm ?? null,
          recapPublic: payload.publicSummary ?? payload.recapPublic ?? null,
          status: sessionReadStatus(payload.status),
          plannedDate: payload.scheduledAt ?? payload.plannedDate ?? null,
          playedDate: payload.endedAt ?? payload.startedAt ?? payload.playedDate ?? null,
          notes: payload.notes ?? null,
          createdAt: new Date(),
        }).onConflictDoUpdate({
          target: [schema.campaignSessions.campaignId, schema.campaignSessions.sessionId],
          set: {
            number: payload.number ?? 1,
            title: payload.title ?? "Session",
            recapDm: payload.summary ?? payload.recapDm ?? null,
            recapPublic: payload.publicSummary ?? payload.recapPublic ?? null,
            status: sessionReadStatus(payload.status),
            plannedDate: payload.scheduledAt ?? payload.plannedDate ?? null,
            playedDate: payload.endedAt ?? payload.startedAt ?? payload.playedDate ?? null,
            notes: payload.notes ?? null,
          },
        });
        break;
      }

      case "NotebookCreated":
      case "NotebookUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignNotebooks).values({
          campaignId,
          notebookId: payload.notebookId,
          parentNotebookId: payload.parentNotebookId ?? null,
          title: payload.title,
          description: payload.description ?? null,
          icon: payload.icon ?? null,
          sortOrder: payload.sortOrder ?? 0,
          archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignNotebooks.campaignId, schema.campaignNotebooks.notebookId],
          set: {
            parentNotebookId: payload.parentNotebookId ?? null,
            title: payload.title,
            description: payload.description ?? null,
            icon: payload.icon ?? null,
            sortOrder: payload.sortOrder ?? 0,
            archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "NotebookArchived": {
        await tx.update(schema.campaignNotebooks).set({
          archivedAt: new Date(event.occurredAt),
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignNotebooks.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotebooks.notebookId, payload.notebookId),
        ));
        break;
      }
      case "NotebookItemAdded": {
        await tx.insert(schema.campaignNotebookItems).values({
          campaignId: event.campaignId ?? payload.campaignId,
          notebookItemId: payload.notebookItemId,
          notebookId: payload.notebookId,
          targetType: payload.targetType,
          targetId: payload.targetId,
          sortOrder: payload.sortOrder ?? 0,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignNotebookItems.campaignId, schema.campaignNotebookItems.notebookItemId],
          set: {
            notebookId: payload.notebookId,
            targetType: payload.targetType,
            targetId: payload.targetId,
            sortOrder: payload.sortOrder ?? 0,
          },
        });
        break;
      }
      case "NotebookItemRemoved": {
        await tx.delete(schema.campaignNotebookItems).where(and(
          eq(schema.campaignNotebookItems.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotebookItems.notebookItemId, payload.notebookItemId),
        ));
        break;
      }
      case "NotebookItemsReordered": {
        for (const [sortOrder, notebookItemId] of (payload.orderedItemIds ?? []).entries()) {
          await tx.update(schema.campaignNotebookItems).set({ sortOrder }).where(and(
            eq(schema.campaignNotebookItems.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignNotebookItems.notebookId, payload.notebookId),
            eq(schema.campaignNotebookItems.notebookItemId, notebookItemId),
          ));
        }
        break;
      }
      case "StoryThreadCreated":
      case "StoryThreadUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignStoryThreads).values({
          campaignId,
          threadId: payload.threadId,
          title: payload.title,
          summary: payload.summary ?? null,
          status: payload.status ?? "planned",
          sortOrder: payload.sortOrder ?? 0,
          archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignStoryThreads.campaignId, schema.campaignStoryThreads.threadId],
          set: {
            title: payload.title,
            summary: payload.summary ?? null,
            status: payload.status ?? "planned",
            sortOrder: payload.sortOrder ?? 0,
            archivedAt: payload.archivedAt ? new Date(payload.archivedAt) : null,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "StoryThreadArchived": {
        await tx.update(schema.campaignStoryThreads).set({ archivedAt: new Date(event.occurredAt), updatedAt: new Date(event.occurredAt) }).where(and(
          eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreads.threadId, payload.threadId),
        ));
        break;
      }
      case "StoryThreadActivated":
      case "StoryThreadResolved":
      case "StoryThreadDiscarded": {
        const status = event.type === "StoryThreadActivated" ? "active" : event.type === "StoryThreadResolved" ? "resolved" : "discarded";
        await tx.update(schema.campaignStoryThreads).set({ status, updatedAt: new Date(event.occurredAt) }).where(and(
          eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreads.threadId, payload.threadId),
        ));
        break;
      }
      case "StoryThreadReordered": {
        for (const [sortOrder, threadId] of (payload.orderedThreadIds ?? []).entries()) {
          await tx.update(schema.campaignStoryThreads).set({ sortOrder, updatedAt: new Date(event.occurredAt) }).where(and(
            eq(schema.campaignStoryThreads.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignStoryThreads.threadId, threadId),
          ));
        }
        break;
      }
      case "StoryStepCreated":
      case "StoryStepUpdated": {
        const campaignId = event.campaignId ?? payload.campaignId;
        await tx.insert(schema.campaignStorySteps).values({
          campaignId,
          stepId: payload.stepId,
          threadId: payload.threadId,
          title: payload.title,
          intent: payload.intent ?? null,
          expectedOutcome: payload.expectedOutcome ?? null,
          actualOutcome: payload.actualOutcome ?? null,
          status: payload.status ?? "planned",
          resolutionKind: payload.resolutionKind ?? null,
          sceneEntityId: payload.sceneEntityId ?? null,
          plannedSessionId: payload.plannedSessionId ?? null,
          plannedSessionOrder: payload.plannedSessionOrder ?? null,
          resolvedSessionId: payload.resolvedSessionId ?? null,
          sortOrder: payload.sortOrder ?? 0,
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignStorySteps.campaignId, schema.campaignStorySteps.stepId],
          set: {
            threadId: payload.threadId,
            title: payload.title,
            intent: payload.intent ?? null,
            expectedOutcome: payload.expectedOutcome ?? null,
            actualOutcome: payload.actualOutcome ?? null,
            status: payload.status ?? "planned",
            resolutionKind: payload.resolutionKind ?? null,
            sceneEntityId: payload.sceneEntityId ?? null,
            plannedSessionId: payload.plannedSessionId ?? null,
            plannedSessionOrder: payload.plannedSessionOrder ?? null,
            resolvedSessionId: payload.resolvedSessionId ?? null,
            sortOrder: payload.sortOrder ?? 0,
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "StoryStepScheduled":
      case "StoryStepDeferred": {
        await tx.update(schema.campaignStorySteps).set({
          plannedSessionId: payload.plannedSessionId,
          plannedSessionOrder: payload.plannedSessionOrder,
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepUnscheduled": {
        await tx.update(schema.campaignStorySteps).set({
          plannedSessionId: null,
          plannedSessionOrder: null,
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepMarkedReady": {
        await tx.update(schema.campaignStorySteps).set({
          status: "ready",
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepActivated": {
        await tx.update(schema.campaignStorySteps).set({
          status: "active",
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepReconciled": {
        await tx.update(schema.campaignStorySteps).set({
          status: payload.status,
          resolutionKind: payload.resolutionKind,
          actualOutcome: payload.actualOutcome ?? null,
          resolvedSessionId: payload.resolvedSessionId,
          plannedSessionId: null,
          plannedSessionOrder: null,
          updatedAt: new Date(event.occurredAt),
        }).where(and(
          eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStorySteps.stepId, payload.stepId),
        ));
        break;
      }
      case "StoryStepsReordered": {
        for (const [sortOrder, stepId] of (payload.orderedStepIds ?? []).entries()) {
          await tx.update(schema.campaignStorySteps).set({ sortOrder, updatedAt: new Date(event.occurredAt) }).where(and(
            eq(schema.campaignStorySteps.campaignId, event.campaignId ?? payload.campaignId),
            eq(schema.campaignStorySteps.threadId, payload.threadId),
            eq(schema.campaignStorySteps.stepId, stepId),
          ));
        }
        break;
      }
      case "EntityLinkedToStoryThread": {
        await tx.insert(schema.campaignStoryThreadEntities).values({
          campaignId: event.campaignId ?? payload.campaignId,
          threadId: payload.threadId,
          entityId: payload.entityId,
        }).onConflictDoNothing();
        break;
      }
      case "EntityUnlinkedFromStoryThread": {
        await tx.delete(schema.campaignStoryThreadEntities).where(and(
          eq(schema.campaignStoryThreadEntities.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryThreadEntities.threadId, payload.threadId),
          eq(schema.campaignStoryThreadEntities.entityId, payload.entityId),
        ));
        break;
      }
      case "EntityLinkedToStoryStep": {
        await tx.insert(schema.campaignStoryStepEntities).values({
          campaignId: event.campaignId ?? payload.campaignId,
          stepId: payload.stepId,
          entityId: payload.entityId,
        }).onConflictDoNothing();
        break;
      }
      case "EntityUnlinkedFromStoryStep": {
        await tx.delete(schema.campaignStoryStepEntities).where(and(
          eq(schema.campaignStoryStepEntities.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignStoryStepEntities.stepId, payload.stepId),
          eq(schema.campaignStoryStepEntities.entityId, payload.entityId),
        ));
        break;
      }
      case "PlayerPortalNoteCreated": {
        await tx.insert(schema.campaignNotes).values({
          campaignId: event.campaignId ?? payload.campaignId,
          noteId: payload.noteId,
          authorUserId: event.actorId,
          authorPlayerId: payload.playerId,
          content: [payload.title, payload.content].filter(Boolean).join("\n\n"),
          visibilityScope: payload.visibility === "dm_visible" ? "dm_visible" : "private",
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).onConflictDoUpdate({
          target: [schema.campaignNotes.campaignId, schema.campaignNotes.noteId],
          set: {
            content: [payload.title, payload.content].filter(Boolean).join("\n\n"),
            visibilityScope: payload.visibility === "dm_visible" ? "dm_visible" : "private",
            updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
          },
        });
        break;
      }
      case "PlayerPortalNoteUpdated": {
        await tx.update(schema.campaignNotes).set({
          ...(payload.title !== undefined || payload.content !== undefined ? { content: [payload.title, payload.content].filter(Boolean).join("\n\n") } : {}),
          ...(payload.visibility !== undefined && { visibilityScope: payload.visibility === "dm_visible" ? "dm_visible" : "private" }),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).where(and(
          eq(schema.campaignNotes.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotes.noteId, payload.noteId),
        ));
        break;
      }
      case "PlayerPortalNoteArchived": {
        await tx.update(schema.campaignNotes).set({ visibilityScope: "archived", updatedAt: new Date(payload.archivedAt ?? event.occurredAt) }).where(and(
          eq(schema.campaignNotes.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignNotes.noteId, payload.noteId),
        ));
        break;
      }
      case "PlayerPortalObjectiveCreated": {
        await upsertObjectiveReadModel(tx, {
          campaignId: event.campaignId ?? payload.campaignId,
          objectiveId: payload.objectiveId,
          playerId: payload.playerId,
          title: payload.title,
          description: payload.description ?? null,
          kind: payload.kind ?? "personal",
          status: payload.status ?? "open",
          visibilityScope: payload.visibility === "dm_visible" ? "dm_visible" : "private",
          linkedEntityIds: payload.linkedEntityIds ?? [],
          sourceType: "player",
          createdAt: new Date(payload.createdAt ?? event.occurredAt),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        });
        break;
      }
      case "PlayerPortalObjectiveUpdated": {
        await tx.update(schema.campaignObjectives).set({
          ...(payload.title !== undefined && { title: payload.title }),
          ...(payload.description !== undefined && { description: payload.description }),
          ...(payload.kind !== undefined && { kind: payload.kind }),
          ...(payload.status !== undefined && { status: payload.status }),
          ...(payload.visibility !== undefined && { visibilityScope: payload.visibility === "dm_visible" ? "dm_visible" : "private" }),
          ...(payload.linkedEntityIds !== undefined && { linkedEntityIds: payload.linkedEntityIds }),
          updatedAt: new Date(payload.updatedAt ?? event.occurredAt),
        }).where(and(
          eq(schema.campaignObjectives.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignObjectives.objectiveId, payload.objectiveId),
        ));
        break;
      }
      case "PlayerPortalObjectiveArchived": {
        await tx.update(schema.campaignObjectives).set({ status: "archived", updatedAt: new Date(payload.archivedAt ?? event.occurredAt) }).where(and(
          eq(schema.campaignObjectives.campaignId, event.campaignId ?? payload.campaignId),
          eq(schema.campaignObjectives.objectiveId, payload.objectiveId),
        ));
        break;
      }
    }
  }
}

function visibilityScopeOf(rawVisibility: unknown, fallback = "dm_only"): string {
  const raw = isRecord(rawVisibility) ? rawVisibility : undefined;
  const kind = typeof rawVisibility === "string" ? rawVisibility : raw?.kind ?? raw?.mode ?? fallback;
  if (kind === "public") return "public";
  if (kind === "players" || kind === "all_players") return "all_players";
  if (kind === "specific_user" || kind === "specific_player") return kind;
  return "dm_only";
}

async function upsertVisibilityGrant(tx: DbTransaction, campaignId: string, targetType: string, targetId: string, rawVisibility: unknown, fallback = "dm_only") {
  const raw = isRecord(rawVisibility) ? rawVisibility : undefined;
  const scope = visibilityScopeOf(rawVisibility, fallback);
  await tx.delete(schema.visibilityGrants).where(and(
    eq(schema.visibilityGrants.campaignId, campaignId),
    eq(schema.visibilityGrants.targetType, targetType),
    eq(schema.visibilityGrants.targetId, targetId),
  ));

  if (scope === "specific_user" && typeof raw?.userId === "string") {
    await tx.insert(schema.visibilityGrants).values({ campaignId, targetType, targetId, scope, userId: raw.userId });
    return;
  }

  if (scope === "specific_player") {
    const playerIds = Array.isArray(raw?.playerIds)
      ? raw.playerIds.filter((id): id is string => typeof id === "string")
      : (typeof raw?.playerId === "string" ? [raw.playerId] : []);
    if (playerIds.length > 0) {
      await tx.insert(schema.visibilityGrants).values(playerIds.map((playerId: string) => ({ campaignId, targetType, targetId, scope, playerId })));
      return;
    }
  }

  if (scope === "public" || scope === "all_players") {
    await tx.insert(schema.visibilityGrants).values({ campaignId, targetType, targetId, scope });
  }

  // "dm_only" (and specific_player/specific_user with no resolved id) has no
  // row to store: absence of a grant means hidden by default.
}

function sessionReadStatus(status: string | undefined): string {
  if (status === "active") return "live";
  if (status === "closed" || status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "planned";
}

async function upsertClueReadModel(tx: DbTransaction, input: {
  campaignId: string;
  clueId: string;
  entityId?: string | null;
  title: string;
  publicSummary?: string | null;
  dmSummary?: string | null;
  status: string;
  visibilityScope: string;
  revealedInSessionId?: string | null;
}) {
  await tx.insert(schema.campaignClues).values({
    campaignId: input.campaignId,
    clueId: input.clueId,
    entityId: input.entityId ?? null,
    title: input.title,
    publicSummary: input.publicSummary ?? null,
    dmSummary: input.dmSummary ?? null,
    status: input.status,
    visibilityScope: input.visibilityScope,
    revealedInSessionId: input.revealedInSessionId ?? null,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [schema.campaignClues.campaignId, schema.campaignClues.clueId],
    set: {
      entityId: input.entityId ?? null,
      title: input.title,
      publicSummary: input.publicSummary ?? null,
      dmSummary: input.dmSummary ?? null,
      status: input.status,
      visibilityScope: input.visibilityScope,
      revealedInSessionId: input.revealedInSessionId ?? null,
      updatedAt: new Date(),
    },
  });
}

async function upsertCharacterReadModel(tx: DbTransaction, input: {
  campaignId: string;
  characterId: string;
  playerProfileId?: string | null;
  entityId?: string | null;
  name: string;
  status: string;
  publicSummary?: string | null;
  dmSummary?: string | null;
}) {
  await tx.insert(schema.characters).values({
    campaignId: input.campaignId,
    characterId: input.characterId,
    playerProfileId: input.playerProfileId ?? null,
    entityId: input.entityId ?? null,
    name: input.name,
    status: input.status,
    publicSummary: input.publicSummary ?? null,
    dmSummary: input.dmSummary ?? null,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [schema.characters.campaignId, schema.characters.characterId],
    set: {
      playerProfileId: input.playerProfileId ?? null,
      entityId: input.entityId ?? null,
      name: input.name,
      status: input.status,
      publicSummary: input.publicSummary ?? null,
      dmSummary: input.dmSummary ?? null,
      updatedAt: new Date(),
    },
  });
}

async function upsertObjectiveReadModel(tx: DbTransaction, input: {
  campaignId: string;
  objectiveId: string;
  playerId?: string | null;
  title: string;
  description?: string | null;
  kind: string;
  status: string;
  visibilityScope: string;
  linkedEntityIds: string[];
  sourceType: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  await tx.insert(schema.campaignObjectives).values(input).onConflictDoUpdate({
    target: [schema.campaignObjectives.campaignId, schema.campaignObjectives.objectiveId],
    set: {
      playerId: input.playerId ?? null,
      title: input.title,
      description: input.description ?? null,
      kind: input.kind,
      status: input.status,
      visibilityScope: input.visibilityScope,
      linkedEntityIds: input.linkedEntityIds,
      sourceType: input.sourceType,
      updatedAt: input.updatedAt,
    },
  });
}

export class PostgresCampaignRepository {
  async getCampaignState(campaignId: string): Promise<CampaignProjection> {
    return db.transaction((tx) => loadProjectionTx(tx, campaignId));
  }

  async getSerializedCampaignState(campaignId: string): Promise<ReturnType<typeof serializeProjection>> {
    const projection = await db.transaction((tx) => loadProjectionTx(tx, campaignId));
    return serializeProjection(projection);
  }

  async loadEvents(campaignId: string): Promise<StoredEvent<unknown>[]> {
    return db.transaction((tx) => loadEventsTx(tx, campaignId));
  }

  async executeCommand(campaignId: string, command: Command, options?: { commandId?: string; actorUserId?: string; tx?: DbTransaction }): Promise<CampaignProjection> {
    const commandId = options?.commandId;
    if (!commandId) {
      throw new HttpError("Missing Idempotency-Key header", 400);
    }

    // Not every Command variant declares a top-level `campaignId` (e.g. DuplicateCampaign
    // uses sourceCampaignId/newCampaignId instead), so spreading it in is structurally wider
    // than any single variant; the assertion re-narrows back to the union. Downstream
    // handlers only read the fields their own variant declares, so this is behavior-preserving.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const normalizedCommand = { ...command, campaignId } as Command;
    const commandHash = createHash("sha256").update(canonicalCommandPayload(normalizedCommand)).digest("hex") || calculateCommandHash(normalizedCommand);

    const executeWithTx = async (tx: DbTransaction) => {
      await acquireCampaignAdvisoryLock(tx, campaignId);

      const [existing] = await tx
        .select()
        .from(schema.commandIndex)
        .where(and(eq(schema.commandIndex.campaignId, campaignId), eq(schema.commandIndex.commandId, commandId)))
        .limit(1);

      if (existing) {
        if (existing.commandHash !== commandHash) throw new CommandConflictError(commandId);
        return loadProjectionTx(tx, campaignId);
      }

      const projection = await loadProjectionTx(tx, campaignId);
      const state = projectionToCampaignState(campaignId, projection);
      const result = handleCommand(state, normalizedCommand);

      const [tip] = await tx
        .select({ sequence: schema.domainEvents.sequence, hash: schema.domainEvents.hash })
        .from(schema.domainEvents)
        .where(eq(schema.domainEvents.campaignId, campaignId))
        .orderBy(desc(schema.domainEvents.sequence))
        .limit(1);

      let sequence = tip?.sequence ?? 0;
      let previousHash: string | undefined = tip?.hash ?? undefined;
      const storedEvents: StoredEvent<unknown>[] = [];

      for (const domainEvent of result.events) {
        sequence += 1;
        const storedEvent = buildStoredEvent({
          campaignId,
          sequence,
          type: domainEvent.type as DomainEventType,
          actorId: domainEvent.actorId,
          payload: domainEvent.payload,
          previousHash,
          commandId,
          commandHash,
        });
        previousHash = storedEvent.hash;
        storedEvents.push(storedEvent);
      }

      if (storedEvents.length > 0) {
        await tx.insert(schema.domainEvents).values(storedEvents.map((event) => ({
          campaignId: event.campaignId ?? campaignId,
          sequence: event.sequence,
          eventId: event.eventId,
          type: event.type,
          payload: event.payload,
          occurredAt: event.occurredAt,
          actorUserId: options?.actorUserId,
          actorId: event.actorId,
          commandId,
          commandHash,
          previousHash: event.previousHash,
          hash: event.hash ?? "",
          schemaVersion: event.schemaVersion,
        })));
      }

      let updatedProjection = projection;
      for (const event of storedEvents) {
        updatedProjection = applyEvent(updatedProjection, event);
      }
      await saveSnapshotTx(tx, campaignId, updatedProjection);
      await projectReadModelsTx(tx, storedEvents);

      await tx.insert(schema.commandIndex).values({
        campaignId,
        commandId,
        commandHash,
        firstSequence: storedEvents[0]?.sequence ?? sequence,
        lastSequence: storedEvents.at(-1)?.sequence ?? sequence,
        resultJson: { eventCount: storedEvents.length, lastSequence: storedEvents.at(-1)?.sequence ?? sequence },
      });

      return updatedProjection;
    };

    if (options?.tx) {
      return executeWithTx(options.tx);
    }
    return db.transaction(async (tx) => executeWithTx(tx));
  }
}
