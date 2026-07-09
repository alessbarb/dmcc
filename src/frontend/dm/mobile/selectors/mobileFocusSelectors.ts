import type { MobileCampaignContext, MobileCampaignStateLike, MobileFocusViewModel } from "../types.js";
import { activeItems, buildRelationSummaries, toFactSummary, toSessionSummary } from "./mobileSharedSelectors.js";

export type MobileFocusTarget = { kind: "entity"; entityId: string } | { kind: "fact"; factId: string };

export function selectMobileFocus(state: MobileCampaignStateLike, target: MobileFocusTarget, context: MobileCampaignContext = {}): MobileFocusViewModel | null {
  if (target.kind === "entity") {
    const entity = activeItems(state.entities).find((item) => item.entityId === target.entityId);
    if (!entity) return null;
    const relatedFacts = activeItems(state.facts).filter((fact) => fact.relatedEntityIds?.includes(entity.entityId)).map(toFactSummary);
    const relatedSessions = activeItems(state.sessions).filter((session) => [entity.createdInSessionId, entity.firstSeenSessionId, entity.lastSeenSessionId].includes(session.sessionId) || session.prep?.involvedEntityIds?.includes(entity.entityId)).map(toSessionSummary);
    return {
      id: entity.entityId,
      kind: "entity",
      title: entity.title,
      subtitle: entity.subtitle,
      summary: entity.summary,
      contentPreview: entity.content,
      entityType: entity.entityType,
      imageUrl: typeof entity.metadata?.imageUrl === "string" ? entity.metadata.imageUrl : undefined,
      visibility: entity.visibility,
      status: entity.status,
      importance: ["low", "normal", "high", "critical"].includes(entity.importance) ? entity.importance as MobileFocusViewModel["importance"] : undefined,
      appearsInActiveSession: Boolean(context.activeSessionId && [entity.createdInSessionId, entity.firstSeenSessionId, entity.lastSeenSessionId].includes(context.activeSessionId)),
      relatedEntities: buildRelationSummaries(state, entity.entityId),
      relatedFacts,
      relatedSessions,
      pendingRevelations: entity.visibility?.kind === "dm_only" ? [{ id: entity.entityId, title: entity.title, kind: "entity", visibility: entity.visibility }] : [],
      quickActions: [
        { kind: "record_session_note", label: "Nota", payload: { entityId: entity.entityId } },
        { kind: "reveal", label: "Revelar", payload: { entityId: entity.entityId }, requiresConfirmation: true },
        { kind: "change_status", label: "Estado", payload: { entityId: entity.entityId } },
        { kind: "connect", label: "Conectar", payload: { sourceEntityId: entity.entityId } },
        { kind: "view_in_constellation", label: "Constelación", payload: { entityId: entity.entityId, canvasId: context.activeCanvasId } },
      ],
    };
  }

  const fact = activeItems(state.facts).find((item) => item.factId === target.factId);
  if (!fact) return null;
  return {
    id: fact.factId,
    kind: "fact",
    title: fact.statement,
    subtitle: fact.kind,
    visibility: fact.visibility,
    status: fact.confidence,
    appearsInActiveSession: false,
    relatedEntities: fact.relatedEntityIds.flatMap((entityId) => buildRelationSummaries(state, entityId)).slice(0, 8),
    relatedFacts: [toFactSummary(fact)],
    relatedSessions: [],
    pendingRevelations: fact.visibility?.kind === "dm_only" || fact.kind === "dm_secret" ? [{ id: fact.factId, title: fact.statement, kind: "fact", visibility: fact.visibility }] : [],
    quickActions: [
      { kind: "record_session_note", label: "Nota", payload: { factId: fact.factId } },
      { kind: "reveal", label: "Revelar", payload: { factId: fact.factId }, requiresConfirmation: true },
    ],
  };
}
