export interface CampaignHistoryEntry {
  activityId: string;
  campaignId: string;
  sourceKind: "domain_event" | "operation";
  sourceId: string;
  type: string;
  category: "session" | "content" | "knowledge" | "story" | "people" | "collaboration" | "operation";
  data: Record<string, any>;
  actorUserId?: string | null;
  sessionId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  occurredAt: string; // ISO String
}

export interface ActivityFilter {
  category?: string;
  actorUserId?: string;
  sessionId?: string;
  targetType?: string;
  targetId?: string;
  cursor?: string; // encoded occurred_at + activity_id
  limit?: number; // default 50, max 100
}
