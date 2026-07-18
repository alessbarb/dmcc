import type { Relation } from "../../../shared/stores/campaignStore.js";
import type { MobileCampaignContext, MobileCampaignStateLike, MobileOracleResult } from "../types.js";
import { activeItems } from "../selectors/mobileSharedSelectors.js";

const normalize = (value: string): string => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const matches = (query: string, ...values: Array<string | undefined>): boolean => values.some((value) => value ? normalize(value).includes(query) : false);
const visibilityKind = (visibility: unknown): MobileOracleResult["visibility"] => {
  const kind = typeof visibility === "object" && visibility && "kind" in visibility ? String((visibility as { kind: unknown }).kind) : undefined;
  if (kind === "dm_only" || kind === "public" || kind === "players") return kind;
  return undefined;
};
const IMPORTANCE_LEVELS = ["low", "normal", "high", "critical"] as const;
function isImportanceLevel(value: string): value is (typeof IMPORTANCE_LEVELS)[number] {
  return (IMPORTANCE_LEVELS as readonly string[]).includes(value);
}
const importance = (value: string | undefined): MobileOracleResult["importance"] =>
  value !== undefined && isImportanceLevel(value) ? value : undefined;

export function searchMobileOracle(state: MobileCampaignStateLike, query: string, context: MobileCampaignContext = {}): MobileOracleResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const results: MobileOracleResult[] = [];
  const entityById = new Map((state.entities ?? []).map((entity) => [entity.entityId, entity]));
  const isClueQuery = ["pista", "pistas", "clue", "clues"].includes(normalizedQuery);
  const isSecretQuery = ["secreto", "secretos", "secret", "secrets"].includes(normalizedQuery);
  const isRumorQuery = ["rumor", "rumores", "rumors"].includes(normalizedQuery);

  for (const entity of activeItems(state.entities)) {
    const activeSessionHit = context.activeSessionId && [entity.createdInSessionId, entity.firstSeenSessionId, entity.lastSeenSessionId].includes(context.activeSessionId);
    const typeHit = matches(normalizedQuery, entity.entityType, entity.status) || (isClueQuery && entity.entityType === "clue") || (isSecretQuery && entity.entityType === "secret") || (isRumorQuery && entity.entityType === "rumor");
    if (activeSessionHit || typeHit || matches(normalizedQuery, entity.title, entity.subtitle, entity.summary, entity.content)) {
      results.push({
        id: entity.entityId,
        kind: "entity",
        title: entity.title,
        subtitle: entity.subtitle ?? entity.entityType,
        description: entity.summary,
        entityType: entity.entityType,
        visibility: visibilityKind(entity.visibility),
        status: entity.status,
        importance: importance(entity.importance),
        relatedCount: activeItems(state.relations).filter((relation) => relation.sourceEntityId === entity.entityId || relation.targetEntityId === entity.entityId).length,
        primaryAction: { kind: "open_focus", label: "Abrir carta", payload: { kind: "entity", entityId: entity.entityId } },
        secondaryActions: [
          { kind: "focus_in_constellation", label: "Ver en constelación", payload: { entityId: entity.entityId, canvasId: context.activeCanvasId } },
          { kind: "record_note", label: "Nota", payload: { entityId: entity.entityId } },
        ],
      });
    }
  }

  for (const fact of activeItems(state.facts)) {
    if ((isSecretQuery && fact.kind === "dm_secret") || (isRumorQuery && fact.kind === "rumor") || matches(normalizedQuery, fact.statement, fact.kind, fact.confidence)) {
      results.push({
        id: fact.factId,
        kind: "fact",
        title: fact.statement,
        subtitle: fact.kind,
        visibility: visibilityKind(fact.visibility),
        status: fact.confidence,
        relatedCount: fact.relatedEntityIds?.length ?? 0,
        primaryAction: { kind: "open_focus", label: "Abrir fact", payload: { kind: "fact", factId: fact.factId } },
      });
    }
  }

  for (const relation of activeItems(state.relations) as Relation[]) {
    const source = entityById.get(relation.sourceEntityId);
    const target = entityById.get(relation.targetEntityId);
    if (matches(normalizedQuery, relation.relationType, relation.description, source?.title, target?.title)) {
      results.push({
        id: relation.relationId,
        kind: "relation",
        title: `${source?.title ?? relation.sourceEntityId} → ${target?.title ?? relation.targetEntityId}`,
        subtitle: relation.relationType,
        description: relation.description,
        visibility: visibilityKind(relation.visibility),
        status: relation.status,
        primaryAction: { kind: "open_focus", label: "Abrir relación", payload: { kind: "relation", relationId: relation.relationId } },
      });
    }
  }

  for (const session of activeItems(state.sessions)) {
    if (matches(normalizedQuery, session.title, session.summary, session.status, session.prep?.summary, session.prep?.notes)) {
      results.push({
        id: session.sessionId,
        kind: "session",
        title: session.title,
        subtitle: session.status,
        description: session.summary,
        primaryAction: { kind: "open_session", label: "Abrir sesión", payload: { sessionId: session.sessionId } },
      });
    }
  }

  return results.slice(0, 50);
}
