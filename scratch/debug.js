import { createServer } from "../src/backend/server/createServer.js";

const server = createServer();
const res = await server.inject({
  method: "POST",
  url: "/api/campaigns",
  payload: { campaignId: "cmp_api2", actorId: "usr_dm", title: "API Campaign" },
});
console.log("Campaign created:", res.statusCode, res.json());

const resEnt1 = await server.inject({
  method: "POST",
  url: "/api/campaigns/cmp_api2/entities",
  payload: { actorId: "usr_dm", entityId: "ent_a", entityType: "npc", title: "A" }
});
console.log("Entity A created:", resEnt1.statusCode, resEnt1.json());

const resEnt2 = await server.inject({
  method: "POST",
  url: "/api/campaigns/cmp_api2/entities",
  payload: { actorId: "usr_dm", entityId: "ent_clue", entityType: "clue", title: "Sigil" }
});
console.log("Entity Clue created:", resEnt2.statusCode, resEnt2.json());

const resRel = await server.inject({
  method: "POST",
  url: "/api/campaigns/cmp_api2/relations",
  payload: { actorId: "usr_dm", relationId: "rel_one", sourceEntityId: "ent_a", targetEntityId: "ent_clue", relationType: "points_to" }
});
console.log("Relation response:", resRel.statusCode, resRel.json());

const resSess = await server.inject({
  method: "POST",
  url: "/api/campaigns/cmp_api2/sessions",
  payload: { actorId: "usr_dm", sessionId: "sess_one", title: "Session 1" }
});
console.log("Session response:", resSess.statusCode, resSess.json());

