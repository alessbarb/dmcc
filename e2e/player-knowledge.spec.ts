import { expect, request as playwrightRequest, test, type APIRequestContext, type APIResponse } from "@playwright/test";
import { randomUUID } from "node:crypto";

type JsonObject = Record<string, any>;

async function json(response: APIResponse): Promise<JsonObject> {
  const body = await response.json().catch(async () => ({ text: await response.text() }));
  expect(response.ok(), JSON.stringify(body, null, 2)).toBe(true);
  return body;
}

async function registerAndLogin(
  request: APIRequestContext,
  account: { email: string; password: string; displayName: string },
): Promise<void> {
  await json(await request.post("/api/auth/register", { data: account }));
  await json(await request.post("/api/auth/login", { data: { email: account.email, password: account.password } }));
}

test.describe("Canonical player knowledge projection", () => {
  test("keeps the DM matrix and player portal aligned for existing party visibility", async ({ request }) => {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const dm = { email: `knowledge-dm-${suffix}@example.com`, password: `dm-${suffix}-password`, displayName: "Knowledge DM" };
    const player = { email: `knowledge-player-${suffix}@example.com`, password: `player-${suffix}-password`, displayName: "Knowledge Player" };
    await registerAndLogin(request, dm);

    const campaign = await json(await request.post("/api/campaigns", {
      data: { title: `Knowledge ${suffix}`, system: "generic_fantasy_d20" },
    }));
    const campaignId = campaign.campaignId as string;
    const visibleEntityId = `ent_known_${suffix}`;
    const hiddenEntityId = `ent_hidden_${suffix}`;

    await json(await request.post(`/api/campaigns/${campaignId}/entities`, {
      data: {
        entityId: visibleEntityId,
        entityType: "clue",
        title: "Known sigil",
        summary: "The sigil opens the eastern gate.",
        visibility: { kind: "party" },
      },
    }));
    await json(await request.post(`/api/campaigns/${campaignId}/entities`, {
      data: {
        entityId: hiddenEntityId,
        entityType: "secret",
        title: "Hidden patron",
        summary: "The patron is the duke.",
        visibility: { kind: "dm_only" },
      },
    }));

    const invitation = await json(await request.post(`/api/campaigns/${campaignId}/invitations`, {
      data: { role: "player", maxUses: 1, expiresInHours: 1 },
    }));

    const playerRequest = await playwrightRequest.newContext({ baseURL: "http://127.0.0.1:4877" });
    try {
      await registerAndLogin(playerRequest, player);
      await json(await playerRequest.post(`/api/invitations/${invitation.invitation.token}/accept`));

      const portal = await json(await playerRequest.get(`/api/campaigns/${campaignId}/player-portal/state`));
      const playerId = portal.playerId as string;
      expect(portal.entities.map((entity: JsonObject) => entity.entityId)).toContain(visibleEntityId);
      expect(portal.entities.map((entity: JsonObject) => entity.entityId)).not.toContain(hiddenEntityId);

      const projection = await json(await request.get(`/api/campaigns/${campaignId}/player-knowledge`));
      const playerProjection = projection.players.find((candidate: JsonObject) => candidate.playerId === playerId);
      expect(playerProjection).toBeTruthy();
      expect(playerProjection.knowledge).toContainEqual(expect.objectContaining({
        targetType: "entity",
        targetId: visibleEntityId,
        visible: true,
        reason: "all_players",
      }));
      expect(playerProjection.knowledge).toContainEqual(expect.objectContaining({
        targetType: "entity",
        targetId: hiddenEntityId,
        visible: false,
        reason: "hidden",
      }));
    } finally {
      await playerRequest.dispose();
    }
  });
});
