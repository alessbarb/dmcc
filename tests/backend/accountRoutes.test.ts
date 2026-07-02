import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
import {
  addCampaignMembership,
  upsertDmProfile,
  upsertPlayerProfile,
} from "../../src/backend/server/userAuthStore.js";

const cleanup: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((fn) => fn()));
});

async function authenticatedServer() {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-account-routes-"));
  const server = createServer({ dataDir });
  cleanup.push(async () => {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  });
  await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      email: "owner@example.com",
      password: "correct horse battery",
      displayName: "Owner",
    },
  });
  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email: "owner@example.com", password: "correct horse battery" },
  });
  return {
    server,
    cookie: String(login.headers["set-cookie"]).split(";")[0],
    dataDir,
    userId: login.json().user.userId as string,
  };
}

const validVisibility = {
  displayName: "table",
  avatarUrl: "table",
  pronouns: "table",
  timeZone: "table",
  biography: "table",
  contact: "dm",
};

describe("account routes", () => {
  it("returns only the signed-in owner's account aggregate", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().account.email).toBe("owner@example.com");
    expect(response.json().preferences.themeId).toBe("default");
    expect(JSON.stringify(response.json())).not.toContain("passwordHash");
  });

  it("rejects stale preference updates", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/preferences",
      headers: { cookie, origin: "http://localhost" , host: "localhost" },
      payload: { version: 0, themeId: "default", colorMode: "dark" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("requires the current password to change email and revokes every other session", async () => {
    const { server, cookie } = await authenticatedServer();
    const secondLogin = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "owner@example.com", password: "correct horse battery" },
    });
    expect(secondLogin.statusCode, secondLogin.body).toBe(200);
    const currentCookie = String(secondLogin.headers["set-cookie"]).split(";")[0];

    const denied = await server.inject({
      method: "PUT",
      url: "/api/account/identity",
      headers: { cookie: currentCookie, origin: "http://localhost", host: "localhost" },
      payload: { email: "new@example.com", currentPassword: "wrong password" },
    });
    expect(denied.statusCode, denied.body).toBe(403);

    const changed = await server.inject({
      method: "PUT",
      url: "/api/account/identity",
      headers: { cookie: currentCookie, origin: "http://localhost", host: "localhost" },
      payload: { email: "new@example.com", currentPassword: "correct horse battery" },
    });
    expect(changed.statusCode).toBe(200);
    expect(changed.json().account.email).toBe("new@example.com");

    const oldSession = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie },
    });
    const currentSession = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie: currentCookie },
    });
    expect(oldSession.statusCode).toBe(401);
    expect(currentSession.statusCode).toBe(200);
  });

  it("rejects originless account mutations from non-loopback clients", async () => {
    const { server, cookie } = await authenticatedServer();
    const response = await server.inject({
      method: "PUT",
      url: "/api/account/identity",
      headers: { cookie },
      remoteAddress: "192.168.1.25",
      payload: { displayName: "Should not change" },
    });
    expect(response.statusCode).toBe(403);
  });

  it("revokes every session owned by the signed-in account", async () => {
    const { server, cookie } = await authenticatedServer();
    const response = await server.inject({
      method: "DELETE",
      url: "/api/account/sessions",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
    });
    expect(response.statusCode).toBe(200);

    const signedOut = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie },
    });
    expect(signedOut.statusCode).toBe(401);
  });

  it("updates the owner's DM profile", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/dm",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Keeper Alex",
        biography: "Runs investigative fantasy.",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().profile.displayName).toBe("Keeper Alex");
  });

  it("cannot edit a player profile without an active membership", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/player/cmp_other",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Player Alex",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("derives playerId from the active campaign membership", async () => {
    const { server, cookie, dataDir, userId } = await authenticatedServer();
    await addCampaignMembership(join(dataDir, "vaults", "default"), {
      campaignId: "cmp_member",
      userId,
      role: "player",
      playerId: "ply_owned",
    });

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/player/cmp_member",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        playerId: "ply_attacker_selected",
        displayName: "Player Alex",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().profile.playerId).toBe("ply_owned");
  });

  it("serves a published global projection only to authenticated vault users", async () => {
    const { server, cookie } = await authenticatedServer();
    await server.inject({
      method: "PUT",
      url: "/api/account/profiles/dm",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Public Alex",
        biography: "Private notes",
        publicHandle: "alex-public",
        visibility: { ...validVisibility, displayName: "global", biography: "private" },
        publicationState: "published",
      },
    });

    const anonymous = await server.inject({
      method: "GET",
      url: "/api/profiles/alex-public",
    });
    const authenticated = await server.inject({
      method: "GET",
      url: "/api/profiles/alex-public",
      headers: { cookie },
    });

    expect(anonymous.statusCode).toBe(401);
    expect(authenticated.statusCode).toBe(200);
    expect(authenticated.json()).toEqual({
      profile: { publicHandle: "alex-public", displayName: "Public Alex" },
    });
  });

  it("previews the owner's profile for every audience without returning credentials", async () => {
    const { server, cookie } = await authenticatedServer();
    await server.inject({
      method: "PUT",
      url: "/api/account/profiles/dm",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Alex",
        publicHandle: "alex-preview",
        visibility: { ...validVisibility, displayName: "global" },
        publicationState: "unlisted",
      },
    });

    const response = await server.inject({
      method: "GET",
      url: "/api/account/privacy/preview?profile=dm",
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.json().previews).sort()).toEqual(["dm", "global", "owner", "table"]);
    expect(JSON.stringify(response.json())).not.toContain("email");
  });

  it("projects campaign member profiles according to the requester's active role", async () => {
    const { server, cookie, dataDir, userId } = await authenticatedServer();
    const vaultDir = join(dataDir, "vaults", "default");
    await addCampaignMembership(vaultDir, {
      campaignId: "cmp_profiles",
      userId,
      role: "dm",
    });
    await upsertDmProfile(vaultDir, userId, 0, {
      displayName: "Keeper Alex",
      contact: "keeper@example.com",
      visibility: { ...validVisibility, displayName: "table", contact: "dm" },
      publicationState: "private",
    });

    await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "player@example.com",
        password: "correct horse battery",
        displayName: "Player",
      },
    });
    const playerLogin = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "player@example.com", password: "correct horse battery" },
    });
    const playerCookie = String(playerLogin.headers["set-cookie"]).split(";")[0];
    const playerUserId = playerLogin.json().user.userId as string;
    await addCampaignMembership(vaultDir, {
      campaignId: "cmp_profiles",
      userId: playerUserId,
      role: "player",
      playerId: "ply_profiles",
    });
    await upsertPlayerProfile(vaultDir, playerUserId, "cmp_profiles", 0, {
      displayName: "Rook",
      contact: "rook@example.com",
      visibility: { ...validVisibility, displayName: "table", contact: "dm" },
      publicationState: "private",
    });

    const dmView = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_profiles/member-profiles",
      headers: { cookie },
    });
    const tableView = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_profiles/member-profiles",
      headers: { cookie: playerCookie },
    });
    const unrelated = await server.inject({
      method: "GET",
      url: "/api/campaigns/cmp_other/member-profiles",
      headers: { cookie: playerCookie },
    });

    expect(dmView.statusCode, dmView.body).toBe(200);
    expect(dmView.json().profiles).toEqual(expect.arrayContaining([
      expect.objectContaining({
        role: "player",
        userId: playerUserId,
        profile: { displayName: "Rook", contact: "rook@example.com" },
      }),
    ]));
    expect(tableView.statusCode).toBe(200);
    expect(tableView.json().profiles).toEqual(expect.arrayContaining([
      expect.objectContaining({
        role: "dm",
        userId,
        profile: { displayName: "Keeper Alex" },
      }),
    ]));
    expect(JSON.stringify(tableView.json())).not.toContain("keeper@example.com");
    expect(unrelated.statusCode).toBe(403);
  });

  it("lists safe session metadata and revokes other owned sessions", async () => {
    const { server, cookie } = await authenticatedServer();
    const secondLogin = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "owner@example.com", password: "correct horse battery" },
    });
    const secondCookie = String(secondLogin.headers["set-cookie"]).split(";")[0];

    const listed = await server.inject({
      method: "GET",
      url: "/api/account/sessions",
      headers: { cookie: secondCookie },
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.json().sessions).toHaveLength(2);
    expect(listed.json().sessions).toContainEqual(expect.objectContaining({
      current: true,
      sessionRef: expect.any(String),
      createdAt: expect.any(String),
      lastSeenAt: expect.any(String),
    }));
    expect(JSON.stringify(listed.json())).not.toContain("sessionIdHash");

    const revoked = await server.inject({
      method: "DELETE",
      url: "/api/account/sessions/others",
      headers: { cookie: secondCookie, origin: "http://localhost", host: "localhost" },
    });
    const oldSession = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie },
    });
    const currentSession = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie: secondCookie },
    });

    expect(revoked.statusCode).toBe(200);
    expect(oldSession.statusCode).toBe(401);
    expect(currentSession.statusCode).toBe(200);
  });
});
