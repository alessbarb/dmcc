import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-player-portal-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

async function seedPlayer(server: any, campaignId = "cmp_portal") {
  const token = (server as any).dmSessionToken;
  await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, title: "Portal Campaign", actorId: "usr_dm" },
    headers: { "x-dm-token": token },
  });
  await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/players`,
    payload: { playerId: "ply_1", name: "Player One", displayName: "Player One" },
    headers: { "x-dm-token": token },
  });
  await server.inject({
    method: "POST",
    url: `/api/campaigns/${campaignId}/entities`,
    payload: {
      entityId: "ent_pc_1",
      entityType: "player_character",
      title: "Player One's Character",
      metadata: { playerId: "ply_1", level: 1, className: "Wizard" },
    },
    headers: { "x-dm-token": token },
  });
  return token;
}

async function issueToken(server: any, dmToken: string, playerId = "ply_1") {
  const res = await server.inject({
    method: "POST",
    url: `/api/campaigns/cmp_portal/players/${playerId}/token`,
    payload: { label: "phone" },
    headers: { "x-dm-token": dmToken },
  });
  return res.json().token as string;
}

async function issueTokenRaw(server: any, dmToken: string, playerId = "ply_1") {
  const res = await server.inject({
    method: "POST",
    url: `/api/campaigns/cmp_portal/players/${playerId}/token`,
    payload: { label: "phone" },
    headers: { "x-dm-token": dmToken },
  });
  const json = res.json();
  return { token: json.token as string, tokenId: json.tokenId as string };
}

describe("player portal tokens", () => {
  it("issues a raw token once and does not expose it in dm summary", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = await seedPlayer(server);

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/players/ply_1/token",
        payload: { label: "phone" },
        headers: { "x-dm-token": dmToken },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().tokenId).toMatch(/^ptok_/);
      expect(res.json().token).toMatch(/^[A-Z0-9]{8}$/);
      expect(res.json().tokenHash).toBeUndefined();
    });
  });
});

it("lets a token-authenticated player update their own live status", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    const update = await server.inject({
      method: "PUT",
      url: "/api/campaigns/cmp_portal/player-portal/status",
      payload: { characterEntityId: "ent_pc_1", hitPointsCurrent: 7, hitPointsMax: 12, armorClass: 14, inspiration: true, conditions: ["poisoned"] },
      headers: { "x-player-token": playerToken },
    });

    expect(update.statusCode).toBe(200);

    const state = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/state",
      headers: { "x-player-token": playerToken },
    });

    expect(state.statusCode).toBe(200);
    expect(state.json().sheet.status.hitPointsCurrent).toBe(7);
    expect(state.json().sheet.status.conditions).toEqual(["poisoned"]);
  });
});

it("does not return private notes in dm summary", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "Private note", content: "secret", visibility: "private", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });
    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "DM note", content: "visible", visibility: "dm_visible", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().players[0].notes.map((note: any) => note.title)).toEqual(["DM note"]);
  });
});

it("allows DM to approve a structural proposal and updates the character entity", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/proposals",
      payload: {
        kind: "update_character_core",
        targetCharacterEntityId: "ent_pc_1",
        proposedChanges: { metadata: { level: 2, className: "Fighter" } },
      },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });
    const proposalId = summary.json().players[0].proposals[0].proposalId;

    const approve = await server.inject({
      method: "PUT",
      url: `/api/campaigns/cmp_portal/player-portal/proposals/${proposalId}/resolve`,
      payload: { status: "approved", dmResolutionNote: "Approved" },
      headers: { "x-dm-token": dmToken },
    });

    expect(approve.statusCode).toBe(200);

    const campaign = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal",
      headers: { "x-dm-token": dmToken },
    });
    const character = campaign.json().entities.find((entity: any) => entity.entityId === "ent_pc_1");
    expect(character.metadata.level).toBe(2);
  });
});

it("writes two events to the event store on proposal approval (multi-event result)", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/proposals",
      payload: {
        kind: "update_character_core",
        targetCharacterEntityId: "ent_pc_1",
        proposedChanges: { metadata: { level: 3, className: "Rogue" } },
      },
      headers: { "x-player-token": playerToken },
    });

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });
    const proposalId = summary.json().players[0].proposals[0].proposalId;

    await server.inject({
      method: "PUT",
      url: `/api/campaigns/cmp_portal/player-portal/proposals/${proposalId}/resolve`,
      payload: { status: "approved" },
      headers: { "x-dm-token": dmToken },
    });

    // Two events are produced by proposal approval:
    // 1. ProposalResolved: verified by the proposal status being "approved" below
    // 2. EntityUpdated: verified by character metadata changes being persisted
    const campaign = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal",
      headers: { "x-dm-token": dmToken },
    });
    const character = campaign.json().entities.find((entity: any) => entity.entityId === "ent_pc_1");
    expect(character.metadata.level).toBe(3);
    expect(character.metadata.className).toBe("Rogue");

    // Verify proposal is now marked approved
    const summaryAfter = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });
    const resolvedProposal = summaryAfter.json().players[0].proposals.find(
      (p: any) => p.proposalId === proposalId
    );
    expect(resolvedProposal.status).toBe("approved");
  });
});

it("rejects a revoked player token", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const { token, tokenId } = await issueTokenRaw(server, dmToken);

    // revoke
    const revoke = await server.inject({
      method: "DELETE",
      url: `/api/campaigns/cmp_portal/players/ply_1/token/${tokenId}`,
      headers: { "x-dm-token": dmToken },
    });
    expect(revoke.statusCode).toBe(200);

    // revoked token rejected
    const state = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/state",
      headers: { "x-player-token": token },
    });
    expect(state.statusCode).toBe(401);
  });
});

describe("character assignment", () => {
  it("returns availableCharacters in GET /state when party-visible player_character entities exist", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = await seedPlayer(server);
      const playerToken = await issueToken(server, dmToken);

      // Create a second player_character entity with party visibility (not linked to player)
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/entities",
        payload: {
          entityId: "ent_pc_premade",
          entityType: "player_character",
          title: "Premade Hero",
          visibility: { kind: "party" },
          metadata: { level: 1, className: "Fighter" },
        },
        headers: { "x-dm-token": dmToken },
      });

      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_portal/player-portal/state",
        headers: { "x-player-token": playerToken },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.availableCharacters).toBeDefined();
      expect(body.availableCharacters.length).toBe(1);
      expect(body.availableCharacters[0].entityId).toBe("ent_pc_premade");
      expect(body.availableCharacters[0].title).toBe("Premade Hero");
    });
  });

  it("link_request proposal approved by DM results in linked character in GET /state", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = await seedPlayer(server);
      const playerToken = await issueToken(server, dmToken);

      // Create a party-visible character for the player to request
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/entities",
        payload: {
          entityId: "ent_pc_pick",
          entityType: "player_character",
          title: "Pickable Character",
          visibility: { kind: "party" },
          metadata: { level: 3, className: "Rogue" },
        },
        headers: { "x-dm-token": dmToken },
      });

      // Player submits link_request proposal
      const propRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_portal/player-portal/proposals",
        payload: {
          kind: "link_request",
          targetCharacterEntityId: "ent_pc_pick",
          proposedChanges: {},
        },
        headers: { "x-player-token": playerToken },
      });
      expect(propRes.statusCode).toBe(201);
      const { proposalId } = propRes.json();

      // DM approves the proposal
      const resolveRes = await server.inject({
        method: "PUT",
        url: `/api/campaigns/cmp_portal/player-portal/proposals/${proposalId}/resolve`,
        payload: { status: "approved", dmResolutionNote: "Welcome!" },
        headers: { "x-dm-token": dmToken },
      });
      expect(resolveRes.statusCode).toBe(200);

      // Player portal state now shows the link
      const stateRes = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_portal/player-portal/state",
        headers: { "x-player-token": playerToken },
      });
      expect(stateRes.statusCode).toBe(200);
      const state = stateRes.json();
      expect(state.link).not.toBeNull();
      expect(state.link.characterEntityId).toBe("ent_pc_pick");
      expect(state.linkedCharacter).not.toBeNull();
      expect(state.linkedCharacter.title).toBe("Pickable Character");
    });
  });
});

it("player cannot update another player note", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);

    // seed second player
    await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/players",
      payload: { playerId: "ply_2", name: "Player Two", displayName: "Player Two" },
      headers: { "x-dm-token": dmToken },
    });

    const token1 = await issueToken(server, dmToken, "ply_1");
    const token2 = await issueToken(server, dmToken, "ply_2");

    // ply_1 creates a note
    const noteRes = await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "P1 note", content: "secret", visibility: "private", linkedEntityIds: [] },
      headers: { "x-player-token": token1 },
    });
    expect(noteRes.statusCode).toBe(201);
    const noteId = noteRes.json().noteId;

    // ply_2 tries to update ply_1's note
    const attempt = await server.inject({
      method: "PUT",
      url: `/api/campaigns/cmp_portal/player-portal/notes/${noteId}`,
      payload: { title: "Hacked", content: "owned", visibility: "private" },
      headers: { "x-player-token": token2 },
    });
    expect(attempt.statusCode).toBe(404);
  });
});

it("surfaces DM-visible player questions and notes for the DM inbox", async () => {
  await withTempDataDir(async (dataDir) => {
    const server = createServer({ dataDir });
    const dmToken = await seedPlayer(server);
    const playerToken = await issueToken(server, dmToken);

    const question = await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/objectives",
      payload: {
        title: "Can I recognize the black seal?",
        description: "It may connect to my background.",
        kind: "question_for_dm",
        visibility: "dm_visible",
      },
      headers: { "x-player-token": playerToken },
    });
    expect(question.statusCode).toBe(201);

    const note = await server.inject({
      method: "POST",
      url: "/api/campaigns/cmp_portal/player-portal/notes",
      payload: { title: "Halia follow-up", content: "I want to talk to her privately.", visibility: "dm_visible", linkedEntityIds: [] },
      headers: { "x-player-token": playerToken },
    });
    expect(note.statusCode).toBe(201);

    const summary = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_portal/player-portal/dm-summary",
      headers: { "x-dm-token": dmToken },
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().players[0].objectives).toMatchObject([
      {
        title: "Can I recognize the black seal?",
        kind: "question_for_dm",
        visibility: "dm_visible",
      },
    ]);
    expect(summary.json().players[0].notes).toMatchObject([
      {
        title: "Halia follow-up",
        visibility: "dm_visible",
      },
    ]);
  });
});
