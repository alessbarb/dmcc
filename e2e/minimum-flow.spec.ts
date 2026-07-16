import { expect, request as playwrightRequest, test, type APIRequestContext, type APIResponse } from "@playwright/test";
import { randomUUID } from "node:crypto";

type JsonObject = Record<string, any>;

function commandRequestOptions(data?: JsonObject): { data?: JsonObject; headers: Record<string, string> } {
  return {
    ...(data === undefined ? {} : { data }),
    headers: { "Idempotency-Key": randomUUID() },
  };
}

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

async function registerAndLogin(
  request: APIRequestContext,
  account: { email: string; password: string; displayName: string },
): Promise<void> {
  await expectStatus(await request.post("/api/auth/register", { data: account }), 201);
  await expectStatus(await request.post("/api/auth/login", {
    data: { email: account.email, password: account.password },
  }), 200);
}

test.describe("Minimum release web API flow", () => {
  test("covers campaigns, graph, canvas, invitations, live table, player portal, rules, hub, and premades", async ({ request }) => {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const dmAccount = {
      email: `dm-${suffix}@example.com`,
      password: `dm-password-${suffix}`,
      displayName: "E2E Dungeon Master",
    };
    const playerAccount = {
      email: `player-${suffix}@example.com`,
      password: `player-password-${suffix}`,
      displayName: "E2E Player",
    };
    const campaignTitle = `E2E Release ${suffix}`;
    const npcId = `ent_npc_${suffix}`;
    const playerCharacterId = `ent_pc_${suffix}`;
    const clueId = `ent_clue_${suffix}`;
    const secretId = `ent_secret_${suffix}`;
    const relationId = `rel_reveals_${suffix}`;
    const canvasId = `canvas_${suffix}`;

    await registerAndLogin(request, dmAccount);
    await expectStatus(await request.get("/api/health"), 200);

    const initialDashboard = await expectStatus(await request.get("/api/dm/dashboard"), 200);
    expect(initialDashboard.campaigns).toEqual([]);

    const premades = await expectStatus(await request.get("/api/campaign-templates?locale=en"), 200);
    expect(premades.templates.length).toBeGreaterThan(0);
    const firstPremade = premades.templates[0];
    const premadeDetail = await expectStatus(
      await request.get(`/api/campaign-templates/${encodeURIComponent(firstPremade.templateId)}?locale=en`),
      200,
    );
    expect(premadeDetail.templateId).toBe(firstPremade.templateId);

    const createdCampaign = await expectStatus(await request.post("/api/campaigns", commandRequestOptions({
        title: campaignTitle,
        system: "custom",
    })), 201);
    const campaignId = createdCampaign.campaignId;
    expect(campaignId).toEqual(expect.stringMatching(/^cmp_/));

    const dashboardAfterCreate = await expectStatus(await request.get("/api/dm/dashboard"), 200);
    expect(dashboardAfterCreate.campaigns.map((campaign: JsonObject) => campaign.campaignId)).toContain(campaignId);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/entities`, commandRequestOptions({
        entityId: npcId,
        entityType: "npc",
        title: "Lord Malvus",
        summary: "Cult leader hiding behind a noble identity.",
        visibility: { kind: "dm_only" },
    })), 200);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/entities`, commandRequestOptions({
        entityId: playerCharacterId,
        entityType: "player_character",
        title: "E2E Hero",
        summary: "Character controlled by the authenticated player.",
        visibility: { kind: "party" },
        metadata: { isPremade: true },
    })), 200);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/entities`, commandRequestOptions({
        entityId: clueId,
        entityType: "clue",
        title: "Bloodstained Map",
        summary: "A map that reveals the path to the sunken ruins.",
        visibility: { kind: "party" },
        metadata: { content: "The route is marked with a coded sigil." },
    })), 200);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/entities`, commandRequestOptions({
        entityId: secretId,
        entityType: "secret",
        title: "True Identity of Malvus",
        summary: "Malvus is an alias used by the cult leader.",
        visibility: { kind: "dm_only" },
        metadata: { truth: "His noble lineage is forged." },
    })), 200);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/relations`, commandRequestOptions({
        relationId,
        sourceEntityId: clueId,
        targetEntityId: secretId,
        relationType: "reveals",
        description: "The clue points to the hidden truth.",
        visibility: { kind: "dm_only" },
    })), 200);

    const entitiesResponse = await expectStatus(await request.get(`/api/campaigns/${campaignId}/entities`), 200);
    expect(entitiesResponse.entities.map((entity: JsonObject) => entity.entityId)).toEqual(
      expect.arrayContaining([npcId, clueId, secretId]),
    );
    const relationsResponse = await expectStatus(await request.get(`/api/campaigns/${campaignId}/relations`), 200);
    expect(relationsResponse.relations.map((relation: JsonObject) => relation.relationId)).toContain(relationId);

    await expectStatus(await request.post(`/api/campaigns/${campaignId}/canvases`, commandRequestOptions({ canvasId, title: "E2E Canvas", kind: "custom" })), 200);
    const canvasResponse = await expectStatus(await request.get(`/api/campaigns/${campaignId}/canvases`), 200);
    expect(canvasResponse.canvases.map((canvas: JsonObject) => canvas.canvasId)).toContain(canvasId);

    const rulesCategories = await expectStatus(await request.get("/api/rules/categories"), 200);
    expect(rulesCategories.categories.length).toBeGreaterThan(0);
    const rulesSearch = await expectStatus(await request.get("/api/rules/search?category=Glosario%20de%20Reglas"), 200);
    expect(Array.isArray(rulesSearch.results)).toBe(true);

    const invitationResult = await expectStatus(await request.post(`/api/campaigns/${campaignId}/invitations`, commandRequestOptions({ role: "player", maxUses: 1, expiresInHours: 1 })), 201);
    expect(invitationResult.invitation.invitationId).toMatch(/^inv_/);
    expect(invitationResult.invitation.url).toContain("/invitations/");
    expect(invitationResult.invitation.token).toEqual(expect.any(String));

    const listedInvitations = await expectStatus(await request.get(`/api/campaigns/${campaignId}/invitations`), 200);
    expect(listedInvitations.invitations).toContainEqual(
      expect.objectContaining({
        invitationId: invitationResult.invitation.invitationId,
        status: "active",
      }),
    );

    await expectStatus(
      await request.post(`/api/campaigns/${campaignId}/invitations/${invitationResult.invitation.invitationId}/revoke`, commandRequestOptions()),
      200,
    );
    const revokedInvitations = await expectStatus(await request.get(`/api/campaigns/${campaignId}/invitations`), 200);
    expect(revokedInvitations.invitations).toContainEqual(
      expect.objectContaining({
        invitationId: invitationResult.invitation.invitationId,
        status: "revoked",
      }),
    );

    const playerInvitationResult = await expectStatus(await request.post(`/api/campaigns/${campaignId}/invitations`, commandRequestOptions({ role: "player", maxUses: 1, expiresInHours: 1 })), 201);

    const liveTableResult = await expectStatus(await request.post(`/api/campaigns/${campaignId}/live-tables`, commandRequestOptions({ durationHours: 1 })), 201);
    expect(liveTableResult.liveTable.shortCode).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);

    const playerRequest = await playwrightRequest.newContext({ baseURL: "http://127.0.0.1:4877" });
    try {
      await registerAndLogin(playerRequest, playerAccount);

      const invitation = await expectStatus(
        await playerRequest.get(`/api/invitations/${playerInvitationResult.invitation.token}`),
        200,
      );
      expect(invitation.campaign.campaignId).toBe(campaignId);

      const acceptance = await expectStatus(
        await playerRequest.post(`/api/invitations/${playerInvitationResult.invitation.token}/accept`, commandRequestOptions()),
        200,
      );
      expect(acceptance.campaignId).toBe(campaignId);

      const portalState = await expectStatus(
        await playerRequest.get(`/api/campaigns/${campaignId}/player-portal/state`),
        200,
      );
      expect(portalState.playerId).toEqual(expect.any(String));
      expect(portalState.linkedCharacter).toBeNull();
      expect(portalState.entities.map((entity: JsonObject) => entity.entityId)).toContain(clueId);
      expect(portalState.entities.map((entity: JsonObject) => entity.entityId)).not.toContain(secretId);

      const knowledgeProjection = await expectStatus(
        await request.get(`/api/campaigns/${campaignId}/player-knowledge`),
        200,
      );
      const playerKnowledge = knowledgeProjection.players.find(
        (candidate: JsonObject) => candidate.playerId === portalState.playerId,
      );
      expect(playerKnowledge).toBeTruthy();
      expect(playerKnowledge.knowledge).toContainEqual(expect.objectContaining({
        targetType: "entity",
        targetId: clueId,
        visible: true,
        reason: "all_players",
      }));
      expect(playerKnowledge.knowledge).toContainEqual(expect.objectContaining({
        targetType: "entity",
        targetId: secretId,
        visible: false,
        reason: "hidden",
      }));

      const dmSummary = await expectStatus(
        await request.get(`/api/campaigns/${campaignId}/player-portal/dm-character-summary`),
        200,
      );
      expect(dmSummary.players).toContainEqual(expect.objectContaining({ playerId: portalState.playerId }));
      expect(dmSummary.availableCharacters).toContainEqual(expect.objectContaining({ entityId: playerCharacterId }));

      await expectStatus(await request.post(`/api/campaigns/${campaignId}/player-portal/links`, commandRequestOptions({ playerId: portalState.playerId, characterEntityId: playerCharacterId })), 200);

      const linkedPortalState = await expectStatus(
        await playerRequest.get(`/api/campaigns/${campaignId}/player-portal/state`),
        200,
      );
      expect(linkedPortalState.link).toEqual({ characterEntityId: playerCharacterId });
      expect(linkedPortalState.linkedCharacter).toEqual(expect.objectContaining({
        entityId: playerCharacterId,
        title: "E2E Hero",
      }));

      await expectStatus(await request.delete(`/api/campaigns/${campaignId}/player-portal/links/${portalState.playerId}`, commandRequestOptions()), 200);
      const unlinkedPortalState = await expectStatus(
        await playerRequest.get(`/api/campaigns/${campaignId}/player-portal/state`),
        200,
      );
      expect(unlinkedPortalState.link).toBeNull();
      expect(unlinkedPortalState.linkedCharacter).toBeNull();

      await expectStatus(await playerRequest.post(`/api/campaigns/${campaignId}/player-portal/notes`, commandRequestOptions({ title: "E2E note", content: "Remember the bloodstained map.", visibility: "private" })), 200);

      const liveJoin = await expectStatus(
        await playerRequest.post(`/api/live-tables/${liveTableResult.liveTable.shortCode}/join`, commandRequestOptions()),
        200,
      );
      expect(liveJoin.campaignId).toBe(campaignId);
    } finally {
      await playerRequest.dispose();
    }

    const currentLiveTable = await expectStatus(
      await request.get(`/api/campaigns/${campaignId}/live-tables/current`),
      200,
    );
    expect(currentLiveTable.liveTable.liveTableId).toBe(liveTableResult.liveTable.liveTableId);

    await expectStatus(
      await request.post(`/api/campaigns/${campaignId}/live-tables/${liveTableResult.liveTable.liveTableId}/close`, commandRequestOptions()),
      200,
    );

    const restoredCampaign = await expectStatus(await request.get(`/api/campaigns/${campaignId}`), 200);
    expect(restoredCampaign.campaign.title).toBe(campaignTitle);
    expect(restoredCampaign.players).toHaveLength(1);
    expect(restoredCampaign.entities.map((entity: JsonObject) => entity.entityId)).toEqual(
      expect.arrayContaining([npcId, playerCharacterId, clueId, secretId]),
    );
  });
});
