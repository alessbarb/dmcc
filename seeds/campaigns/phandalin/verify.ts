import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

function values(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

export async function rebuildAndVerify() {
  const rebuildRes = await api("POST", `/api/campaigns/${CMP}/rebuild`, {});
  if (rebuildRes.status !== 200) console.warn("⚠ Rebuild returned", rebuildRes.status);

  const dashRes = await api("GET", `/api/campaigns/${CMP}/dashboard`);
  if (dashRes.status !== 200) throw new Error(`Dashboard failed: ${dashRes.status}`);
  const dash = dashRes.json as any;
  console.log(`✓ Dashboard OK: ${dash.activeQuests?.length ?? 0} active quests`);

  const graphRes = await api("GET", `/api/campaigns/${CMP}/graph`);
  if (graphRes.status !== 200) throw new Error(`Graph failed: ${graphRes.status}`);
  const graph = graphRes.json as any;
  console.log(`✓ Graph OK: ${graph.nodes?.length ?? 0} nodes, ${graph.edges?.length ?? 0} edges`);

  const searchRes = await api("GET", `/api/campaigns/${CMP}/search?q=Phandalin`);
  if (searchRes.status !== 200) throw new Error(`Search failed: ${searchRes.status}`);
  const search = searchRes.json as any;
  console.log(`✓ Search OK: ${search.results?.length ?? 0} results for 'Phandalin'`);

  const timelineRes = await api("GET", `/api/campaigns/${CMP}/timeline`);
  if (timelineRes.status !== 200) throw new Error(`Timeline failed: ${timelineRes.status}`);
  console.log("✓ Timeline OK");

  const visibilityRes = await api("GET", `/api/campaigns/${CMP}/visibility`);
  if (visibilityRes.status !== 200) throw new Error(`Visibility failed: ${visibilityRes.status}`);
  console.log("✓ Visibility OK");

  const whatNowRes = await api("GET", `/api/campaigns/${CMP}/what-now`);
  if (whatNowRes.status !== 200) throw new Error(`What-now failed: ${whatNowRes.status}`);
  console.log("✓ What-now OK");

  const playersRes = await api("GET", `/api/campaigns/${CMP}/players`);
  if (playersRes.status !== 200) throw new Error(`Players failed: ${playersRes.status}`);
  console.log("✓ Players OK");

  const listRes = await api("GET", "/api/campaigns");
  const listed = Array.isArray(listRes.json) && (listRes.json as any[]).some((c) => c?.campaignId === CMP);
  if (!listed) throw new Error(`Campaign ${CMP} was not found in /api/campaigns after seeding`);

  const stateRes = await api("GET", `/api/campaigns/${CMP}`);
  if (stateRes.status !== 200) throw new Error(`State failed: ${stateRes.status}`);
  const state = stateRes.json as any;
  const entities = values(state.entities);
  const sessions = values(state.sessions);
  const sessionEvents = values(state.sessionEvents);
  const facts = values(state.facts);
  const relations = values(state.relations);
  const canvases = values(state.canvases);

  if (entities.length < 120) {
    throw new Error(`Expected at least 120 entities in enhanced Phandalin seed, found ${entities.length}`);
  }
  if (relations.length < 115) {
    throw new Error(`Expected at least 115 relations in enhanced Phandalin seed, found ${relations.length}`);
  }
  if (facts.length < 18) {
    throw new Error(`Expected at least 18 facts, found ${facts.length}`);
  }
  if (canvases.length < 4) {
    throw new Error(`Expected at least 4 canvases, found ${canvases.length}`);
  }

  const partyVisiblePcs = entities.filter((entity: any) => entity?.entityType === "player_character" && entity?.visibility?.kind === "party");
  if (partyVisiblePcs.length < 4) {
    throw new Error(`Expected 4 party-visible pre-made PCs, found ${partyVisiblePcs.length}`);
  }

  const closedSessions = sessions.filter((session: any) => session?.status === "closed");
  const plannedSessions = sessions.filter((session: any) => session?.status === "planned");
  const readyPreparedSessions = plannedSessions.filter((session: any) => session?.prep?.state === "ready");
  if (closedSessions.length < 2 || readyPreparedSessions.length < 6) {
    throw new Error(`Expected 2 closed sessions and 6 ready planned sessions, found closed=${closedSessions.length}, ready planned=${readyPreparedSessions.length}`);
  }
  for (const session of readyPreparedSessions) {
    const prep = session.prep ?? {};
    if ((prep.goals?.length ?? 0) < 2 || (prep.checklist?.length ?? 0) < 3 || (prep.availableClueIds?.length ?? 0) < 3) {
      throw new Error(`Prepared session '${session.title}' is too thin for table use`);
    }
  }
  if (sessionEvents.length < 7) {
    throw new Error(`Expected at least 7 session events in play history, found ${sessionEvents.length}`);
  }

  const secretIds = new Set([
    ids.ENT_SEC_IARNO_GLASSTAFF,
    ids.ENT_SEC_NEZZNAR,
    ids.ENT_SEC_CASTLE_LOCATION,
    ids.ENT_SEC_GUNDREN_MAP,
    ids.ENT_SEC_HALIA_AMBITION,
    ids.ENT_SEC_HARBIN_COWARDICE,
    ids.ENT_SEC_CRAGMAW_BARGAIN,
    ids.ENT_SEC_FORGE_REAL,
    ids.ENT_SEC_DENDRARS_ALIVE,
    ids.ENT_SEC_NOTHIC_HUNGER,
    ids.ENT_SEC_REDBRAND_HOSTAGES,
    ids.ENT_SEC_VYERITH_DOPPELGANGER,
    ids.ENT_SEC_THARDEN_DEAD,
    ids.ENT_SEC_HAMUN_NOT_PRIMARY,
    ids.ENT_SEC_VENOMFANG_MANIPULATES,
    ids.ENT_SEC_AGATHA_KNOWS,
    ids.ENT_SEC_WYVERN_ORCS_PRESSURE,
    ids.ENT_SEC_PHANDALIN_POWER_VACUUM,
  ]);
  const anchorRelationTypes = new Set(["points_to", "unlocks", "confirms"]);
  const anchoredSecrets = new Set(
    relations
      .filter((relation: any) => secretIds.has(relation?.targetEntityId) && anchorRelationTypes.has(relation?.relationType))
      .map((relation: any) => relation.targetEntityId),
  );
  const missingAnchors = [...secretIds].filter((secretId) => !anchoredSecrets.has(secretId));
  if (missingAnchors.length > 0) {
    throw new Error(`Seed has secrets without direct clue anchors: ${missingAnchors.join(", ")}`);
  }

  const entityIds = new Set(entities.map((entity: any) => entity?.entityId).filter(Boolean));
  const relatedIds = new Set<string>();
  for (const relation of relations) {
    if (!entityIds.has(relation.sourceEntityId)) throw new Error(`Relation ${relation.relationId} has missing source ${relation.sourceEntityId}`);
    if (!entityIds.has(relation.targetEntityId)) throw new Error(`Relation ${relation.relationId} has missing target ${relation.targetEntityId}`);
    relatedIds.add(relation.sourceEntityId);
    relatedIds.add(relation.targetEntityId);
  }

  const orphanEntities = entities
    .filter((entity: any) => !relatedIds.has(entity.entityId))
    .map((entity: any) => `${entity.title} (${entity.entityType})`);
  if (orphanEntities.length > 0) {
    throw new Error(`Seed has orphan entities without graph relations: ${orphanEntities.slice(0, 12).join(", ")}`);
  }

  const partyVisibleEntities = entities.filter((entity: any) => entity?.visibility?.kind === "party").length;
  const dmOnlyEntities = entities.filter((entity: any) => (entity?.visibility?.kind ?? "dm_only") === "dm_only").length;
  const byType = entities.reduce((acc: Record<string, number>, entity: any) => {
    acc[entity.entityType] = (acc[entity.entityType] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`✓ State: ${entities.length} entities, ${sessions.length} sessions, ${sessionEvents.length} session events, ${facts.length} facts, ${relations.length} relations, ${canvases.length} canvases`);
  console.log(`✓ Entity mix: ${Object.entries(byType).map(([type, count]) => `${type}=${count}`).join(", ")}`);
  console.log(`✓ Visibility layers: ${partyVisibleEntities} party-visible, ${dmOnlyEntities} DM-only`);
  console.log(`✓ Revelation anchors OK: ${anchoredSecrets.size}/${secretIds.size} secrets have direct clue anchors`);
  console.log("✓ Graph coherence OK: every entity participates in at least one relation");
}
