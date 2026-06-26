import type { EventStore } from "../eventStore/eventStore.js";
import type { SnapshotStore } from "../snapshotStore/snapshotStore.js";
import type {
  CampaignProjection} from "../../projections/campaignProjection.js";
import {
  createEmptyCampaignProjection,
  applyEvent,
} from "../../projections/campaignProjection.js";
import type { CampaignId } from "../../shared/ids.js";
import type { DomainEventType } from "../../domain/shared/events.js";
import { InvariantViolationError } from "../../shared/errors.js";
import type { Command } from "../../application/commands.js";
import { handleCommand } from "../../application/commandBus.js";
import type { CampaignState } from "../../domain/state.js";

export class CampaignRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly snapshotStore: SnapshotStore
  ) {}

  /**
   * Loads the current campaign state projection, utilizing snapshots and reading any subsequent events.
   */
  public async getCampaignState(campaignId: CampaignId): Promise<CampaignProjection> {
    // 1. Try to load snapshot
    const snapshot = await this.snapshotStore.loadSnapshot(campaignId);
    let projection = snapshot ? snapshot.projection : createEmptyCampaignProjection();
    const startSequence = snapshot ? snapshot.sequence : 0;

    // 2. Load all events
    const allEvents = await this.eventStore.loadEvents(campaignId);

    // 3. Filter for events occurred after snapshot
    const newEvents = allEvents.filter((e) => e.sequence > startSequence);

    // 4. Fold new events into projection
    for (const event of newEvents) {
      projection = applyEvent(projection, event);
    }

    // 5. If new events were processed, save snapshot to optimize future loads
    if (newEvents.length > 0) {
      await this.snapshotStore.saveSnapshot(campaignId, projection.lastSequence, projection);
    }

    return projection;
  }

  /**
   * Rebuilds the entire projection from scratch using the event log and overwrites the snapshot.
   */
  public async rebuildSnapshot(campaignId: CampaignId): Promise<CampaignProjection> {
    const allEvents = await this.eventStore.loadEvents(campaignId);
    let projection = createEmptyCampaignProjection();

    for (const event of allEvents) {
      projection = applyEvent(projection, event);
    }

    await this.snapshotStore.saveSnapshot(campaignId, projection.lastSequence, projection);
    return projection;
  }

  /**
   * Appends an event to the campaign's event log after verifying domain invariants.
   */
  public async appendEvent<T>(
    campaignId: CampaignId,
    type: DomainEventType,
    actorId: string,
    payload: T
  ): Promise<CampaignProjection> {
    // 1. Load current projection state to check invariants
    const projection = await this.getCampaignState(campaignId);

    // 2. Enforce domain invariants
    this.checkInvariants(projection, campaignId, type, payload);

    // 3. Append the event to eventStore
    const event = await this.eventStore.appendEvent(campaignId, type, actorId, payload);

    // 4. Apply the new event to our existing projection
    const updatedProjection = applyEvent(projection, event);

    // 5. Save snapshot (either on every write or periodically)
    // To ensure files on disk are always up-to-date in this local-first app, we save snapshot on every write.
    await this.snapshotStore.saveSnapshot(
      campaignId,
      updatedProjection.lastSequence,
      updatedProjection
    );

    return updatedProjection;
  }

  /**
   * Executes a domain command through the command bus, then persists the resulting event.
   * This is the preferred write path for all domain mutations.
   */
  public async executeCommand(campaignId: CampaignId, command: Command): Promise<CampaignProjection> {
    const projection = await this.getCampaignState(campaignId);
    const state = projectionToCampaignState(campaignId, projection);
    const result = handleCommand(state, command);
    const event = result.event;
    return this.appendEvent(campaignId, event.type as DomainEventType, event.actorId, event.payload);
  }

  /**
   * Verifies domain invariants before executing state-mutating events.
   */
  private checkInvariants(
    projection: CampaignProjection,
    campaignId: CampaignId,
    type: DomainEventType,
    payload: any
  ): void {
    switch (type) {
      case "SessionStarted": {
        const id = payload.id || payload.sessionId;
        const activeSession = Array.from(projection.sessions.values()).find(
          (s) => s.status === "active" && s.sessionId !== id
        );
        if (activeSession) {
          throw new InvariantViolationError(
            `Cannot start session: Session #${activeSession.number} ("${activeSession.title}") is already active.`
          );
        }
        break;
      }

      case "SessionClosed": {
        if (!payload.summary || payload.summary.trim() === "") {
          throw new InvariantViolationError("Closing a session requires a summary.");
        }
        break;
      }

      case "RelationCreated": {
        const { sourceEntityId, targetEntityId } = payload;
        const source = projection.entities.get(sourceEntityId);
        const target = projection.entities.get(targetEntityId);

        if (!source) {
          throw new InvariantViolationError(
            `Relation source entity "${sourceEntityId}" does not exist.`
          );
        }
        if (!target) {
          throw new InvariantViolationError(
            `Relation target entity "${targetEntityId}" does not exist.`
          );
        }

        if (source.campaignId !== campaignId || target.campaignId !== campaignId) {
          throw new InvariantViolationError(
            "Relations must connect two entities belonging to the same campaign."
          );
        }
        break;
      }

      case "EntityCreated": {
        if (!payload.title || payload.title.trim() === "") {
          throw new InvariantViolationError("Entity title must not be empty.");
        }
        const type = payload.entityType || payload.type;
        if (!type) {
          throw new InvariantViolationError("Entity type must be specified.");
        }
        const visibility = payload.visibility;
        const kind = visibility?.kind || visibility?.mode;
        if (!visibility || !kind) {
          throw new InvariantViolationError("Entity visibility rule must be specified.");
        }
        break;
      }

      case "FactCreated": {
        if (!payload.statement || payload.statement.trim() === "") {
          throw new InvariantViolationError("Fact statement must not be empty.");
        }
        if (!payload.kind) {
          throw new InvariantViolationError("Fact kind must be specified.");
        }
        if (!payload.source) {
          throw new InvariantViolationError("Fact source must be specified.");
        }
        break;
      }
    }
  }
}

function projectionToCampaignState(campaignId: CampaignId, projection: CampaignProjection): CampaignState {
  return {
    campaignId,
    campaign: projection.campaign,
    players: projection.players,
    entities: projection.entities,
    relations: projection.relations,
    facts: projection.facts,
    sessions: projection.sessions,
    sessionEvents: projection.sessionEvents,
    tags: projection.tags,
    attachments: projection.attachments,
    canvases: projection.canvases,
  };
}
