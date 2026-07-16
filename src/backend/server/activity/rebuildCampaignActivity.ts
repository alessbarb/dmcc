import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import type { DbClient, DbTransaction } from "../../db/client.js";
import { campaignActivity, domainEvents } from "../../db/schema.js";
import { projectDomainEventToActivity } from "../../../core/projections/activity/projectDomainEventToActivity.js";
import { activityRepository } from "./activityRepository.js";
import { domainEventTypeSchema } from "../../../core/domain/shared/events.js";
import type { StoredEvent } from "../../../core/domain/shared/events.js";

type DbExecutor = DbClient | DbTransaction;

function recordPayload(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : {};
}

export async function rebuildCampaignActivity(tx: DbExecutor, campaignId: string): Promise<void> {
  const client = tx ?? db;

  // 1. Delete derived activities only (source_kind = 'domain_event')
  await client
    .delete(campaignActivity)
    .where(
      and(
        eq(campaignActivity.campaignId, campaignId),
        eq(campaignActivity.sourceKind, "domain_event")
      )
    );

  // 2. Fetch all domain events for the campaign ordered by sequence
  const events = await client
    .select()
    .from(domainEvents)
    .where(eq(domainEvents.campaignId, campaignId))
    .orderBy(domainEvents.sequence);

  // 3. Project and insert
  for (const row of events) {
    const storedEvent: StoredEvent<Record<string, unknown>> = {
      sequence: row.sequence,
      eventId: row.eventId,
      campaignId: row.campaignId,
      type: domainEventTypeSchema.parse(row.type),
      occurredAt: row.occurredAt,
      actorId: row.actorId,
      payload: recordPayload(row.payload),
      schemaVersion: row.schemaVersion,
      commandId: row.commandId || undefined,
      commandHash: row.commandHash || undefined,
      previousHash: row.previousHash || undefined,
      hash: row.hash || undefined,
    };

    const activities = projectDomainEventToActivity(storedEvent);
    for (const activity of activities) {
      await activityRepository.insertActivity(client, activity);
    }
  }
}

export async function rebuildAllCampaignsActivity(tx: DbExecutor): Promise<void> {
  const client = tx ?? db;
  const campaigns = await client
    .select({ campaignId: domainEvents.campaignId })
    .from(domainEvents)
    .groupBy(domainEvents.campaignId);

  for (const c of campaigns) {
    await rebuildCampaignActivity(client, c.campaignId);
  }
}
