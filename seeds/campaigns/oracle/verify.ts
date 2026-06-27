// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

// ---------------------------------------------------------------------------
// Rebuild & verify
// ---------------------------------------------------------------------------

export async function rebuildAndVerify() {
  const rebuildRes = await api("POST", `/api/campaigns/${CMP}/rebuild`, {});
  if (rebuildRes.status !== 200) {
    console.warn("⚠ Rebuild returned", rebuildRes.status);
  }

  const dashRes = await api("GET", `/api/campaigns/${CMP}/dashboard`);
  if (dashRes.status !== 200) throw new Error(`Dashboard failed: ${dashRes.status}`);
  const dash = dashRes.json as any;
  console.log(`✓ Dashboard OK: ${dash.activeQuests?.length ?? 0} active quests`);

  const graphRes = await api("GET", `/api/campaigns/${CMP}/graph`);
  if (graphRes.status !== 200) throw new Error(`Graph failed: ${graphRes.status}`);
  const graph = graphRes.json as any;
  console.log(`✓ Graph OK: ${graph.nodes?.length ?? 0} nodes, ${graph.edges?.length ?? 0} edges`);

  const searchRes = await api("GET", `/api/campaigns/${CMP}/search?q=Oráculo`);
  if (searchRes.status !== 200) throw new Error(`Search failed: ${searchRes.status}`);
  const search = searchRes.json as any;
  console.log(`✓ Search OK: ${search.results?.length ?? 0} results for 'Oráculo'`);

  await api("GET", `/api/campaigns/${CMP}/timeline`);
  console.log("✓ Timeline OK");

  await api("GET", `/api/campaigns/${CMP}/visibility`);
  console.log("✓ Visibility OK");

  await api("GET", `/api/campaigns/${CMP}/what-now`);
  console.log("✓ What-now OK");

  await api("GET", `/api/campaigns/${CMP}/players`);
  console.log("✓ Players OK");

  const listRes = await api("GET", "/api/campaigns");
  const listed = Array.isArray(listRes.json) && (listRes.json as any[]).some((c) => c?.campaignId === CMP);
  if (!listed) throw new Error(`Campaign ${CMP} was not found in /api/campaigns after seeding`);

  const stateRes = await api("GET", `/api/campaigns/${CMP}`);
  if (stateRes.status !== 200) throw new Error(`State failed: ${stateRes.status}`);
  const state = stateRes.json as any;
  const entities = Array.isArray(state.entities) ? state.entities : Object.values(state.entities ?? {});
  const sessions = Array.isArray(state.sessions) ? state.sessions : Object.values(state.sessions ?? {});
  const facts    = Array.isArray(state.facts)    ? state.facts    : Object.values(state.facts    ?? {});
  const relations= Array.isArray(state.relations) ? state.relations : Object.values(state.relations ?? {});
  if (sessions.length !== 0) {
    throw new Error(`Seed must not create sessions, but state contains ${sessions.length}`);
  }

  const secretIds = new Set([
    ids.ENT_SEC_ORACLE_FRAUD,
    ids.ENT_SEC_VANTIS_FUNDING,
    ids.ENT_SEC_DIVINE_VOICE,
    ids.ENT_SEC_LYRA_SUSPECTS,
    ids.ENT_SEC_KAEL_EVIDENCE,
    ids.ENT_SEC_ARCHIVE_FIRE,
    ids.ENT_SEC_SENRA_DEFECT,
    ids.ENT_SEC_DORIAN_SPY,
    ids.ENT_SEC_ORIGINAL_ORACLE,
    ids.ENT_SEC_VAULT_LOCATION,
    ids.ENT_SEC_PROPHECY_COUNT,
    ids.ENT_SEC_CONSEJO_CORRUPTION,
    ids.ENT_SEC_CAPTAIN_ESCAPE,
    ids.ENT_SEC_SENRA_EXIT_CODE,
    ids.ENT_SEC_WIDOW_SON,
  ]);
  const anchorRelationTypes = new Set(["points_to", "unlocks", "confirms"]);
  const anchoredSecrets = new Set(
    relations
      .filter((r: any) => secretIds.has(r?.targetEntityId) && anchorRelationTypes.has(r?.relationType))
      .map((r: any) => r.targetEntityId),
  );
  const missingAnchors = [...secretIds].filter((secretId) => !anchoredSecrets.has(secretId));
  if (missingAnchors.length > 0) {
    throw new Error(`Seed has secrets without clue anchors: ${missingAnchors.join(", ")}`);
  }

  console.log(`✓ State: ${entities.length} entities, ${sessions.length} sessions, ${facts.length} facts, ${relations.length} relations`);
  console.log(`✓ Revelation anchors OK: ${anchoredSecrets.size}/${secretIds.size} secrets have direct clue anchors`);
}
