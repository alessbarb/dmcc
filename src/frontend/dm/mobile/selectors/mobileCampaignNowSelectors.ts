import type { Entity } from "../../../shared/stores/campaignStore.js";
import type { MobileCampaignContext, MobileCampaignNowViewModel, MobileCampaignStateLike, MobileRevelationSummary, MobileSessionEventSummary } from "../types.js";
import { activeItems, findActiveSession, toEntitySummary, toSessionSummary } from "./mobileSharedSelectors.js";

const isPendingReveal = (entity: Entity): boolean => entity.visibility?.kind === "dm_only" || entity.entityType === "clue" || entity.entityType === "secret";

export function selectMobileCampaignNow(state: MobileCampaignStateLike, context: MobileCampaignContext = {}): MobileCampaignNowViewModel {
  const activeSession = findActiveSession(state, context.activeSessionId);
  const entities = activeItems(state.entities);
  const sessionEntityIds = new Set([
    ...(activeSession?.prep?.involvedEntityIds ?? []),
    ...(activeSession?.prep?.sceneIds ?? []),
    ...(activeSession?.prep?.availableClueIds ?? []),
    ...(activeSession?.prep?.secretsAtRiskIds ?? []),
  ]);
  const currentScene = entities.find((entity) => entity.entityType === "scene" && sessionEntityIds.has(entity.entityId))
    ?? entities.find((entity) => entity.entityType === "scene" && entity.lastSeenSessionId === activeSession?.sessionId);
  const nearbyEntities = entities
    .filter((entity) => sessionEntityIds.has(entity.entityId) || entity.lastSeenSessionId === activeSession?.sessionId || entity.firstSeenSessionId === activeSession?.sessionId)
    .filter((entity) => entity.entityId !== currentScene?.entityId)
    .slice(0, 12)
    .map(toEntitySummary);
  const availableClues = entities.filter((entity) => entity.entityType === "clue" && (sessionEntityIds.has(entity.entityId) || entity.status !== "revealed")).slice(0, 8).map(toEntitySummary);
  const preparedSecrets = entities.filter((entity) => entity.entityType === "secret" && (sessionEntityIds.has(entity.entityId) || entity.visibility?.kind === "dm_only")).slice(0, 8).map(toEntitySummary);
  const activeThreats = entities.filter((entity) => ["front", "creature", "consequence"].includes(entity.entityType) && !["resolved", "archived"].includes(entity.status)).slice(0, 8).map(toEntitySummary);
  const activeClocks = entities.filter((entity) => entity.entityType === "clock" && !["resolved", "archived"].includes(entity.status)).slice(0, 8).map(toEntitySummary);
  const recentNotes: MobileSessionEventSummary[] = (state.sessionEvents ?? []).slice(-5).reverse().map((event) => ({
    id: String(event.sessionEventId ?? event.id),
    title: String(event.title ?? event.type ?? "Nota de sesión"),
    createdAt: typeof event.createdAt === "string" ? event.createdAt : undefined,
    content: typeof event.content === "string" ? event.content : typeof event.text === "string" ? event.text : undefined,
  }));
  const pendingRevelations: MobileRevelationSummary[] = [
    ...entities.filter(isPendingReveal).slice(0, 8).map((entity) => ({ id: entity.entityId, title: entity.title, kind: "entity" as const, visibility: entity.visibility })),
    ...activeItems(state.facts).filter((fact) => fact.kind === "dm_secret" || fact.visibility?.kind === "dm_only").slice(0, 8).map((fact) => ({ id: fact.factId, title: fact.statement, kind: "fact" as const, visibility: fact.visibility })),
  ].slice(0, 10);

  return {
    campaignTitle: state.campaign?.title ?? "Campaña",
    activeSession: activeSession ? toSessionSummary(activeSession) : undefined,
    currentScene: currentScene ? toEntitySummary(currentScene) : undefined,
    nearbyEntities,
    availableClues,
    preparedSecrets,
    activeThreats,
    activeClocks,
    recentNotes,
    pendingRevelations,
  };
}
