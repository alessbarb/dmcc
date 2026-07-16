import type { Entity, Fact, Relation, Session } from "../../../shared/stores/campaignStore.js";
import type { MobileCampaignStateLike, MobileEntitySummary, MobileFactSummary, MobileRelationSummary, MobileSessionSummary } from "../types.js";

export const activeItems = <T>(items: T[] | undefined): T[] => (items ?? []).filter((item) => !("archived" in (item as object)) || !(item as { archived?: boolean }).archived);

export const toEntitySummary = (entity: Entity): MobileEntitySummary => ({
  id: entity.entityId,
  title: entity.title,
  subtitle: entity.subtitle,
  entityType: entity.entityType,
  status: entity.status,
  importance: entity.importance,
  visibility: entity.visibility,
});

const toFactSummary = (fact: Fact): MobileFactSummary => ({
  id: fact.factId,
  statement: fact.statement,
  kind: fact.kind,
  confidence: fact.confidence,
  visibility: fact.visibility,
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

const buildRelationSummaries = (state: MobileCampaignStateLike, entityId: string): MobileRelationSummary[] => {
  const entitiesById = new Map((state.entities ?? []).map((entity) => [entity.entityId, entity]));
  return activeItems(state.relations)
    .filter((relation) => relation.sourceEntityId === entityId || relation.targetEntityId === entityId)
    .map((relation: Relation) => {
      const outgoing = relation.sourceEntityId === entityId;
      const targetEntityId = outgoing ? relation.targetEntityId : relation.sourceEntityId;
      return {
        id: relation.relationId,
        sourceEntityId: relation.sourceEntityId,
        targetEntityId: relation.targetEntityId,
        targetTitle: entitiesById.get(targetEntityId)?.title ?? targetEntityId,
        relationType: relation.relationType,
        direction: outgoing ? "outgoing" : "incoming",
        visibility: relation.visibility,
        status: relation.status,
      };
    });
};
