import type { StoredEvent } from "../domain/shared/events.js";
import { normalizeEventPayload } from "../domain/shared/normalizeEventPayload.js";

export interface CampaignProjection {
  campaign: any | null;
  players: Map<string, any>;
  invitations: Map<string, any>;
  entities: Map<string, any>;
  relations: Map<string, any>;
  facts: Map<string, any>;
  sessions: Map<string, any>;
  sessionEvents: Map<string, any>;
  tags: Map<string, any>;
  attachments: Map<string, any>;
  canvases: Map<string, any>;
  lastSequence: number;
}

export function createEmptyCampaignProjection(): CampaignProjection {
  return {
    campaign: null,
    players: new Map(),
    invitations: new Map(),
    entities: new Map(),
    relations: new Map(),
    facts: new Map(),
    sessions: new Map(),
    sessionEvents: new Map(),
    tags: new Map(),
    attachments: new Map(),
    canvases: new Map(),
    lastSequence: 0,
  };
}

export function applyEvent(
  projection: CampaignProjection,
  event: StoredEvent
): CampaignProjection {
  const next = {
    ...projection,
    players: new Map(projection.players),
    invitations: new Map(projection.invitations ?? new Map()),
    entities: new Map(projection.entities),
    relations: new Map(projection.relations),
    facts: new Map(projection.facts),
    sessions: new Map(projection.sessions),
    sessionEvents: new Map(projection.sessionEvents),
    tags: new Map(projection.tags),
    attachments: new Map(projection.attachments),
    canvases: new Map(projection.canvases),
    lastSequence: event.sequence,
  };

  const { type, occurredAt } = event;
  const payload = normalizeEventPayload(event.type, event.payload, event.occurredAt);

  // Normalize Entity fields
  if (type === "EntityCreated" || type === "EntityUpdated" || type === "EntityArchived") {
    payload.entityId = payload.entityId || payload.id;
    payload.id = payload.entityId;
    payload.entityType = payload.entityType || payload.type;
    payload.type = payload.entityType;
  }

  // Normalize Relation fields
  if (type === "RelationCreated" || type === "RelationUpdated" || type === "RelationArchived") {
    payload.relationId = payload.relationId || payload.id;
    payload.id = payload.relationId;
  }

  // Normalize Fact fields
  if (type === "FactCreated" || type === "FactUpdated" || type === "FactArchived") {
    payload.factId = payload.factId || payload.id;
    payload.id = payload.factId;
  }

  // Normalize Session fields
  if (type === "SessionCreated" || type === "SessionStarted" || type === "SessionPrepUpdated" || type === "SessionClosed" || type === "SessionCancelled" || type === "SessionArchived") {
    payload.sessionId = payload.sessionId || payload.id;
    payload.id = payload.sessionId;
  }

  // Normalize visibility — canonical field is `kind`; drop legacy `mode`
  if (payload.visibility) {
    const canonicalKind = payload.visibility.kind || payload.visibility.mode || "dm_only";
    const { mode: _mode, ...rest } = payload.visibility;
    payload.visibility = { ...rest, kind: canonicalKind };
  }

  switch (type) {
    case "CampaignCreated": {
      payload.campaignId = payload.campaignId || payload.id;
      payload.id = payload.campaignId;
      next.campaign = { ...payload };
      break;
    }
    case "CampaignUpdated": {
      if (next.campaign) {
        next.campaign = {
          ...next.campaign,
          ...payload,
          updatedAt: occurredAt,
        };
      }
      break;
    }
    case "PlayerProfileCreated": {
      const id = payload.id || payload.playerId;
      next.players.set(id, { ...payload });
      break;
    }
    case "PlayerProfileUpdated": {
      const id = payload.id || payload.playerId;
      const existing = next.players.get(id);
      if (existing) {
        next.players.set(id, {
          ...existing,
          ...payload,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "PlayerProfileArchived": {
      const id = payload.id || payload.playerId;
      const existing = next.players.get(id);
      if (existing) {
        next.players.set(id, {
          ...existing,
          archived: true,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "PlayerInvitationCreated": {
      next.invitations.set(payload.inviteId, { ...payload, status: "pending" });
      break;
    }
    case "PlayerInvitationConsumed": {
      const inv = next.invitations.get(payload.inviteId);
      if (inv) {
        next.invitations.set(payload.inviteId, {
          ...inv,
          status: "consumed",
          consumedByPlayerId: payload.playerId,
          consumedAt: occurredAt,
        });
      }
      break;
    }
    case "PlayerInvitationRevoked": {
      const inv = next.invitations.get(payload.inviteId);
      if (inv) {
        next.invitations.set(payload.inviteId, {
          ...inv,
          status: "revoked",
          revokedAt: occurredAt,
        });
      }
      break;
    }
    case "EntityCreated": {
      const id = payload.entityId;
      next.entities.set(id, { ...payload });
      break;
    }
    case "EntityUpdated": {
      const id = payload.entityId;
      const existing = next.entities.get(id);
      if (existing) {
        next.entities.set(id, {
          ...existing,
          ...payload,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "EntityArchived": {
      const id = payload.entityId || payload.id;
      const existing = next.entities.get(id);
      if (existing) {
        next.entities.set(id, {
          ...existing,
          archived: true,
          status: "archived",
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "RelationCreated": {
      const id = payload.relationId;
      next.relations.set(id, { ...payload });
      break;
    }
    case "RelationUpdated": {
      const id = payload.relationId;
      const existing = next.relations.get(id);
      if (existing) {
        next.relations.set(id, {
          ...existing,
          ...payload,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "RelationArchived": {
      const id = payload.relationId || payload.id;
      const existing = next.relations.get(id);
      if (existing) {
        next.relations.set(id, {
          ...existing,
          archived: true,
          status: "retconned",
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "FactCreated": {
      const id = payload.factId;
      next.facts.set(id, { ...payload });
      break;
    }
    case "FactUpdated": {
      const id = payload.factId;
      const existing = next.facts.get(id);
      if (existing) {
        next.facts.set(id, {
          ...existing,
          ...payload,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "FactArchived": {
      const id = payload.factId || payload.id;
      const existing = next.facts.get(id);
      if (existing) {
        next.facts.set(id, {
          ...existing,
          archived: true,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "VisibilityChanged": {
      const { targetId, targetType, visibility } = payload;
      if (targetType === "entity") {
        const existing = next.entities.get(targetId);
        if (existing) {
          next.entities.set(targetId, {
            ...existing,
            visibility: {
              ...visibility,
              kind: visibility.kind || visibility.mode || "dm_only",
            },
            updatedAt: occurredAt,
          });
        }
      } else if (targetType === "relation") {
        const existing = next.relations.get(targetId);
        if (existing) {
          next.relations.set(targetId, {
            ...existing,
            visibility: {
              ...visibility,
              kind: visibility.kind || visibility.mode || "dm_only",
            },
            updatedAt: occurredAt,
          });
        }
      } else if (targetType === "fact") {
        const existing = next.facts.get(targetId);
        if (existing) {
          next.facts.set(targetId, {
            ...existing,
            visibility: {
              ...visibility,
              kind: visibility.kind || visibility.mode || "dm_only",
            },
            updatedAt: occurredAt,
          });
        }
      }
      break;
    }
    case "SessionCreated": {
      const id = payload.sessionId;
      next.sessions.set(id, { ...payload, status: payload.status || "planned" });
      break;
    }
    case "SessionPrepUpdated": {
      const id = payload.sessionId || payload.id;
      const existing = next.sessions.get(id);
      if (existing) {
        next.sessions.set(id, {
          ...existing,
          ...payload,
          status: payload.status || existing.status,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "SessionStarted": {
      const id = payload.sessionId || payload.id;
      const existing = next.sessions.get(id);
      if (existing) {
        next.sessions.set(id, {
          ...existing,
          status: "active",
          startedAt: payload.startedAt,
          updatedAt: occurredAt,
        });
      } else {
        next.sessions.set(id, {
          sessionId: id,
          id,
          status: "active",
          startedAt: payload.startedAt,
          title: payload.title || "Session",
          archived: false,
          createdAt: occurredAt,
          updatedAt: occurredAt,
        });
      }
      if (next.campaign) {
        next.campaign = {
          ...next.campaign,
          currentSessionId: id,
          updatedAt: occurredAt,
        };
      }
      break;
    }
    case "SessionClosed": {
      const id = payload.sessionId || payload.id;
      const existing = next.sessions.get(id);
      if (existing) {
        next.sessions.set(id, {
          ...existing,
          status: "closed",
          summary: payload.summary,
          playerSummary: payload.playerSummary,
          endedAt: payload.endedAt,
          updatedAt: occurredAt,
        });
      }
      if (next.campaign && next.campaign.currentSessionId === id) {
        next.campaign = {
          ...next.campaign,
          currentSessionId: undefined,
          updatedAt: occurredAt,
        };
      }
      break;
    }
    case "SessionCancelled":
    case "SessionArchived": {
      const id = payload.sessionId || payload.id;
      const existing = next.sessions.get(id);
      if (existing) {
        next.sessions.set(id, {
          ...existing,
          ...payload,
          updatedAt: occurredAt,
        });
      }
      if (next.campaign && next.campaign.currentSessionId === id) {
        next.campaign = {
          ...next.campaign,
          currentSessionId: undefined,
          updatedAt: occurredAt,
        };
      }
      break;
    }
    case "SessionEventRecorded": {
      next.sessionEvents.set(payload.id, { ...payload });
      break;
    }
    case "AttachmentAdded": {
      next.attachments.set(payload.id, { ...payload });
      break;
    }
    case "AttachmentRemoved": {
      next.attachments.delete(payload.id);
      break;
    }
    case "TagCreated": {
      next.tags.set(payload.id, { ...payload });
      break;
    }
    case "TagUpdated": {
      const id = payload.id;
      const existing = next.tags.get(id);
      if (existing) {
        next.tags.set(id, {
          ...existing,
          ...payload,
        });
      }
      break;
    }
    case "SettingsUpdated": {
      if (next.campaign) {
        next.campaign = {
          ...next.campaign,
          settings: {
            ...next.campaign.settings,
            ...payload,
          },
          updatedAt: occurredAt,
        };
      }
      break;
    }
    case "CanvasCreated": {
      const { id } = payload;
      next.canvases.set(id, { ...payload, nodes: payload.nodes || [], edges: payload.edges || [] });
      break;
    }
    case "CanvasUpdated": {
      const { canvasId, title, viewport, description } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        next.canvases.set(canvasId, {
          ...existing,
          ...(title !== undefined && { title }),
          ...(viewport !== undefined && { viewport }),
          ...(description !== undefined && { description }),
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasArchived": {
      const { canvasId } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        next.canvases.set(canvasId, {
          ...existing,
          archived: true,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasNodePlaced": {
      const { canvasId, node } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        next.canvases.set(canvasId, {
          ...existing,
          nodes: [...existing.nodes, node],
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasNodeUpdated": {
      const { canvasId, nodeId, updates } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const nodes = existing.nodes.map((n: any) =>
          n.id === nodeId ? { ...n, ...updates, updatedAt: occurredAt } : n
        );
        next.canvases.set(canvasId, {
          ...existing,
          nodes,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasNodesLayoutUpdated": {
      const { canvasId, nodeUpdates } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const nodes = existing.nodes.map((n: any) => {
          const update = nodeUpdates.find((up: any) => up.nodeId === n.id);
          if (update) {
            return {
              ...n,
              x: update.x,
              y: update.y,
              ...(update.width !== undefined && { width: update.width }),
              ...(update.height !== undefined && { height: update.height }),
              ...(update.parentId !== undefined && { parentId: update.parentId ?? undefined }),
              ...(update.groupId !== undefined && { groupId: update.groupId ?? undefined }),
              updatedAt: occurredAt,
            };
          }
          return n;
        });
        next.canvases.set(canvasId, {
          ...existing,
          nodes,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasNodeRemoved": {
      const { canvasId, nodeId } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const nodes = existing.nodes.filter((n: any) => n.id !== nodeId);
        const edges = existing.edges.filter(
          (e: any) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
        );
        next.canvases.set(canvasId, {
          ...existing,
          nodes,
          edges,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasEdgeAdded": {
      const { canvasId, edge } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        next.canvases.set(canvasId, {
          ...existing,
          edges: [...existing.edges, edge],
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasEdgeUpdated": {
      const { canvasId, edgeId, updates } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const edges = existing.edges.map((e: any) =>
          e.id === edgeId ? { ...e, ...updates, updatedAt: occurredAt } : e
        );
        next.canvases.set(canvasId, {
          ...existing,
          edges,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasEdgeRemoved": {
      const { canvasId, edgeId } = payload;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const edges = existing.edges.filter((e: any) => e.id !== edgeId);
        next.canvases.set(canvasId, {
          ...existing,
          edges,
          updatedAt: occurredAt,
        });
      }
      break;
    }
    case "CanvasNoteConvertedToEntity": {
      const { canvasId, nodeId, entity } = payload;
      if (entity) next.entities.set(entity.entityId, entity);
      const entityId = payload.entityId ?? entity?.entityId;
      const existing = next.canvases.get(canvasId);
      if (existing) {
        const nodes = existing.nodes.map((n: any) =>
          n.id === nodeId
            ? {
                ...n,
                kind: "entity",
                entityId,
                text: undefined,
                title: undefined,
                updatedAt: occurredAt,
              }
            : n
        );
        next.canvases.set(canvasId, {
          ...existing,
          nodes,
          updatedAt: occurredAt,
        });
      }
      break;
    }
  }

  return next;
}

export function rebuildCampaignProjection(events: StoredEvent[]): CampaignProjection {
  let projection = createEmptyCampaignProjection();
  for (const event of events) {
    projection = applyEvent(projection, event);
  }
  return projection;
}
