import type { Entity, Session } from "../../../shared/stores/campaignStore.js";
import type { MobileCampaignStateLike, MobileEntitySummary, MobileSessionSummary } from "../types.js";

function isArchived(item: unknown): boolean {
  return typeof item === "object" && item !== null && "archived" in item && Boolean(item.archived);
}

export const activeItems = <T>(items: T[] | undefined): T[] => (items ?? []).filter((item) => !isArchived(item));

export const toEntitySummary = (entity: Entity): MobileEntitySummary => ({
  id: entity.entityId,
  title: entity.title,
  subtitle: entity.subtitle,
  entityType: entity.entityType,
  status: entity.status,
  importance: entity.importance,
  visibility: entity.visibility,
});

export const toSessionSummary = (session: Session): MobileSessionSummary => ({
  id: session.sessionId,
  title: session.title,
  status: session.status,
  summary: session.summary,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
});

export const findActiveSession = (state: MobileCampaignStateLike, preferredSessionId?: string): Session | undefined => {
  const sessions = activeItems(state.sessions);
  return sessions.find((session) => session.sessionId === preferredSessionId)
    ?? sessions.find((session) => session.status === "active" || session.status === "in_progress")
    ?? sessions.find((session) => !session.endedAt);
};
