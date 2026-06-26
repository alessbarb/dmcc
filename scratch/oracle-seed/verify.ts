// Generated seed content module. Edit directly; kept split by campaign data typology.
import { api } from "./client.ts";
import { CMP } from "./config.ts";

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
  console.log(`✓ State: ${entities.length} entities, ${sessions.length} sessions, ${facts.length} facts, ${relations.length} relations`);
}
