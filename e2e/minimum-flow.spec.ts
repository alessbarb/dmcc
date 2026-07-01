import { expect, request as playwrightRequest, test, type APIRequestContext, type APIResponse } from "@playwright/test";
import { randomUUID } from "node:crypto";

type JsonObject = Record<string, any>;

const CAMPAIGN_ID = `cmp_e2e_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
const CAMPAIGN_TITLE = `E2E Release ${randomUUID().slice(0, 8)}`;
const ACTOR_ID = "usr_dm";
const NPC_ID = "ent_e2e_npc";
const PLAYER_CHARACTER_ID = "ent_e2e_player_character";
const CLUE_ID = "ent_e2e_clue";
const SECRET_ID = "ent_e2e_secret";
const RELATION_ID = "rel_e2e_reveals";
const SESSION_ID = "sess_e2e_01";

async function readJson(response: APIResponse): Promise<JsonObject> {
  try {
    return await response.json();
  } catch {
    return { text: await response.text() };
  }
}

async function expectStatus(response: APIResponse, expected: number | number[]): Promise<JsonObject> {
  const expectedStatuses = Array.isArray(expected) ? expected : [expected];
  const body = await readJson(response);
  expect(expectedStatuses, JSON.stringify(body, null, 2)).toContain(response.status());
  return body;
}

async function dmHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  await expectStatus(await request.post("/api/auth/register", {
    data: { email: "admin@example.com", password: "correct horse battery" },
  }), 201);
  await expectStatus(await request.post("/api/auth/login", {
    data: { email: "admin@example.com", password: "correct horse battery" },
  }), 200);
  return {};
}

test.describe("Minimum release API flow", () => {
  test("covers campaign, graph, canvas, player portal, rules, export and backup", async ({ request }) => {
    const headers = await dmHeaders(request);

    await expectStatus(await request.get("/api/health"), 200);

    await expectStatus(
      await request.post("/api/campaigns", {
        headers,
        data: {
          campaignId: CAMPAIGN_ID,
          actorId: ACTOR_ID,
          title: CAMPAIGN_TITLE,
          system: "generic_fantasy_d20",
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/entities`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          entityId: NPC_ID,
          entityType: "npc",
          title: "Lord Malvus",
          summary: "Cult leader hiding behind a noble identity.",
          visibility: { kind: "dm_only" },
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/entities`, {
        headers,
        data: {
          entityId: PLAYER_CHARACTER_ID,
          entityType: "player_character",
          title: "E2E Hero",
          summary: "Character controlled by the authenticated player.",
          visibility: { kind: "party" },
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/entities`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          entityId: CLUE_ID,
          entityType: "clue",
          title: "Bloodstained Map",
          summary: "A map that reveals the path to the sunken ruins.",
          visibility: { kind: "party" },
          metadata: { content: "The route is marked with a coded sigil." },
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/entities`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          entityId: SECRET_ID,
          entityType: "secret",
          title: "True Identity of Malvus",
          summary: "Malvus is an alias used by the cult leader.",
          visibility: { kind: "dm_only" },
          metadata: { truth: "His noble lineage is forged." },
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/relations`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          relationId: RELATION_ID,
          sourceEntityId: CLUE_ID,
          targetEntityId: SECRET_ID,
          relationType: "reveals",
          description: "The clue points to the hidden truth.",
          visibility: { kind: "dm_only" },
        },
      }),
      201,
    );

    const graph = await expectStatus(
      await request.get(`/api/campaigns/${CAMPAIGN_ID}/graph`, { headers }),
      200,
    );
    expect(graph.nodes.map((node: JsonObject) => node.id)).toEqual(expect.arrayContaining([NPC_ID, CLUE_ID, SECRET_ID]));
    expect(graph.edges.map((edge: JsonObject) => edge.id)).toContain(RELATION_ID);

    const canvases = await expectStatus(
      await request.get(`/api/campaigns/${CAMPAIGN_ID}/canvases`, { headers }),
      200,
    );
    expect(canvases.length).toBeGreaterThan(0);

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/sessions`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          sessionId: SESSION_ID,
          title: "Session 1",
        },
      }),
      201,
    );

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/sessions/${SESSION_ID}/reveal-clue`, {
        headers,
        data: {
          actorId: ACTOR_ID,
          clueEntityId: CLUE_ID,
          audience: { kind: "party" },
          note: "The party reads the sigil and follows the map.",
        },
      }),
      200,
    );

    const rulesCategories = await expectStatus(await request.get("/api/rules/categories"), 200);
    expect(rulesCategories.categories.length).toBeGreaterThan(0);

    const lan = await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/lan/toggle`, {
        headers,
        data: { enabled: true },
      }),
      200,
    );
    expect(lan.accessCode).toMatch(/^[A-HJ-NP-Z2-9]{10}$/);

    const playerRequest = await playwrightRequest.newContext({ baseURL: "http://127.0.0.1:4877" });
    await expectStatus(await playerRequest.post("/api/auth/register", {
      data: {
        email: "player@example.com",
        password: "different horse battery",
        displayName: "E2E Player",
      },
    }), 201);
    await expectStatus(await playerRequest.post("/api/auth/login", {
      data: { email: "player@example.com", password: "different horse battery" },
    }), 200);
    const join = await expectStatus(
      await playerRequest.post(`/api/campaigns/${CAMPAIGN_ID}/join`, {
        data: {
          accessCode: lan.accessCode,
        },
      }),
      201,
    );
    expect(join.membership.playerId).toEqual(expect.any(String));
    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/player-portal/links`, {
        headers,
        data: {
          playerId: join.membership.playerId,
          characterEntityId: PLAYER_CHARACTER_ID,
        },
      }),
      201,
    );

    const portalState = await expectStatus(
      await playerRequest.get(`/api/campaigns/${CAMPAIGN_ID}/player-portal/state`),
      200,
    );
    expect(portalState.playerId).toBe(join.membership.playerId);

    const playerCampaign = await expectStatus(
      await playerRequest.get(`/api/campaigns/${CAMPAIGN_ID}`),
      200,
    );
    expect(playerCampaign.players).toHaveLength(1);
    expect(playerCampaign.players[0].playerId).toBe(join.membership.playerId);

    await expectStatus(
      await playerRequest.post(`/api/campaigns/${CAMPAIGN_ID}/player-portal/resources`, {
        data: {
          characterEntityId: PLAYER_CHARACTER_ID,
          label: "Inspiration",
          current: 1,
          max: 1,
          recovery: "manual",
        },
      }),
      201,
    );
    await playerRequest.dispose();

    const jsonExport = await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/export/json`, { headers }),
      201,
    );
    expect(jsonExport.path).toEqual(expect.stringContaining("exports"));

    const markdownExport = await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/export/markdown`, { headers }),
      201,
    );
    expect(markdownExport.downloadUrl).toEqual(expect.stringContaining(`/api/campaigns/${CAMPAIGN_ID}/exports/`));

    const backup = await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/backups`, { headers }),
      201,
    );
    expect(backup.backupId).toEqual(expect.stringMatching(/^backup_.*\.json$/));

    const backups = await expectStatus(
      await request.get(`/api/campaigns/${CAMPAIGN_ID}/backups`, { headers }),
      200,
    );
    expect(backups.map((item: JsonObject) => item.backupId)).toContain(backup.backupId);

    await expectStatus(
      await request.post(`/api/campaigns/${CAMPAIGN_ID}/restore`, {
        headers,
        data: { backupId: backup.backupId },
      }),
      200,
    );

    const restoredCampaign = await expectStatus(
      await request.get(`/api/campaigns/${CAMPAIGN_ID}`, { headers }),
      200,
    );
    expect(restoredCampaign.campaign.title).toBe(CAMPAIGN_TITLE);
    expect(restoredCampaign.entities.map((entity: JsonObject) => entity.entityId)).toEqual(
      expect.arrayContaining([NPC_ID, CLUE_ID, SECRET_ID]),
    );
  });
});
