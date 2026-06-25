import type { Campaign } from "./campaign/campaign.js";
import type { Entity } from "./entity/entity.js";
import type { Relation } from "./relation/relation.js";
import type { Fact } from "./fact/fact.js";
import type { Session } from "./session/session.js";

export interface CampaignState {
  campaignId: string;
  campaign: Campaign | null;
  players: Map<string, any>;
  entities: Map<string, Entity>;
  relations: Map<string, Relation>;
  facts: Map<string, Fact>;
  sessions: Map<string, Session>;
  sessionEvents: Map<string, any>;
}

export function createCampaignState(campaignId: string): CampaignState {
  return {
    campaignId,
    campaign: null,
    players: new Map(),
    entities: new Map(),
    relations: new Map(),
    facts: new Map(),
    sessions: new Map(),
    sessionEvents: new Map(),
  };
}
