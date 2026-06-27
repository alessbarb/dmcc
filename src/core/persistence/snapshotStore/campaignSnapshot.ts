export interface CampaignSnapshot {
  schemaVersion: number;
  lastSequence: number;
  campaign: any;
  entities: any[];
  relations: any[];
  facts: any[];
  sessions: any[];
  players: any[];
}

/**
   * Rebuilds the campaign snapshot representation from raw campaign events.
   */
export function rebuildCampaignSnapshot(events: any[]): CampaignSnapshot {
  let campaign: any = null;
  const entities: any[] = [];
  const relations: any[] = [];
  const facts: any[] = [];
  const sessions: any[] = [];
  const players: any[] = [];

  for (const event of events) {
    const { type, payload } = event;
    switch (type) {
      case "CampaignCreated":
        campaign = { ...payload };
        break;
      case "CampaignUpdated":
        if (campaign) {
          campaign = { ...campaign, ...payload };
        }
        break;
      case "EntityCreated":
        entities.push({ ...payload });
        break;
      case "EntityUpdated": {
        const index = entities.findIndex((e) => e.entityId === payload.entityId);
        if (index !== -1) {
          entities[index] = { ...entities[index], ...payload };
        }
        break;
      }
      case "EntityArchived": {
        const index = entities.findIndex((e) => e.entityId === payload.entityId);
        if (index !== -1) {
          entities[index] = { ...entities[index], archived: true };
        }
        break;
      }
      case "RelationCreated":
        relations.push({ ...payload });
        break;
      case "RelationUpdated": {
        const index = relations.findIndex((r) => r.relationId === payload.relationId);
        if (index !== -1) {
          relations[index] = { ...relations[index], ...payload };
        }
        break;
      }
      case "RelationArchived": {
        const index = relations.findIndex((r) => r.relationId === payload.relationId);
        if (index !== -1) {
          relations[index] = { ...relations[index], archived: true };
        }
        break;
      }
      case "FactCreated":
        facts.push({ ...payload });
        break;
      case "FactUpdated": {
        const index = facts.findIndex((f) => f.factId === payload.factId);
        if (index !== -1) {
          facts[index] = { ...facts[index], ...payload };
        }
        break;
      }
      case "FactArchived": {
        const index = facts.findIndex((f) => f.factId === payload.factId);
        if (index !== -1) {
          facts[index] = { ...facts[index], archived: true };
        }
        break;
      }
      case "SessionCreated":
        sessions.push({ ...payload });
        break;
      case "SessionStarted": {
        const id = payload.id || payload.sessionId;
        const index = sessions.findIndex((s) => s.sessionId === id);
        if (index !== -1) {
          sessions[index] = { ...sessions[index], status: "active", startedAt: payload.startedAt };
        } else {
          sessions.push({ sessionId: id, ...payload, status: "active" });
        }
        break;
      }
      case "SessionClosed": {
        const id = payload.id || payload.sessionId;
        const index = sessions.findIndex((s) => s.sessionId === id);
        if (index !== -1) {
          sessions[index] = { ...sessions[index], status: "closed", summary: payload.summary, endedAt: payload.endedAt };
        }
        break;
      }
      case "VisibilityChanged": {
        const { targetId, targetType, visibility } = payload;
        if (targetType === "entity") {
          const index = entities.findIndex((e) => e.entityId === targetId);
          if (index !== -1) {
            entities[index].visibility = visibility;
          }
        } else if (targetType === "relation") {
          const index = relations.findIndex((r) => r.relationId === targetId);
          if (index !== -1) {
            relations[index].visibility = visibility;
          }
        } else if (targetType === "fact") {
          const index = facts.findIndex((f) => f.factId === targetId);
          if (index !== -1) {
            facts[index].visibility = visibility;
          }
        }
        break;
      }
      case "PlayerProfileCreated":
        players.push({ ...payload });
        break;
      case "PlayerProfileUpdated": {
        const index = players.findIndex((p) => p.playerId === payload.playerId);
        if (index !== -1) {
          players[index] = { ...players[index], ...payload };
        }
        break;
      }
      case "PlayerProfileArchived": {
        const index = players.findIndex((p) => p.playerId === payload.playerId);
        if (index !== -1) {
          players[index] = { ...players[index], archived: true };
        }
        break;
      }
    }
  }

  const lastSequence = events.length > 0 ? events[events.length - 1].sequence : 0;

  return {
    schemaVersion: 1,
    lastSequence,
    campaign,
    entities,
    relations,
    facts,
    sessions,
    players,
  };
}
