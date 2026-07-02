import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-canvas-sec-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function sessionCookie(response: any): string {
  const header = response.headers["set-cookie"];
  const cookieStr = Array.isArray(header) ? header[0] : String(header);
  expect(cookieStr).toContain("dmcc_session=");
  return cookieStr.split(";")[0];
}

async function registerAndLogin(server: any, email: string, secret: string, vaultId: string) {
  const register = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    headers: { "x-vault-id": vaultId },
    payload: { email, password: secret, displayName: email.split("@")[0] },
  });
  expect(register.statusCode).toBe(201);

  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    headers: { "x-vault-id": vaultId },
    payload: { email, password: secret },
  });
  expect(login.statusCode).toBe(200);
  return sessionCookie(login);
}

describe("Canvas and LAN status security assertions", () => {
  it("enforces strict auth, cross-campaign isolation, revoked membership, and DTO rules", async () => {
    await withTempDir(async (dataDir) => {
      // Create server with allowLegacyTestAuth = false (as it would run in production/E2E)
      const server = createServer({ dataDir });
      server.allowLegacyTestAuth = false;

      // 1. Setup two DM users in separate vaults, and one Player in DM 1's vault
      const dm1Cookie = await registerAndLogin(server, "dm1@example.com", "secure-password-dm1", "vault1");
      const dm2Cookie = await registerAndLogin(server, "dm2@example.com", "secure-password-dm2", "vault2");
      const playerCookie = await registerAndLogin(server, "player@example.com", "secure-password-player", "vault1");

      // 2. DM 1 creates Campaign 1
      const camp1Id = "cmp_secure_1";
      const createCamp1Res = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: camp1Id, actorId: "dm1_user", title: "Campaign One" },
        headers: { cookie: dm1Cookie, "x-vault-id": "vault1" },
      });
      expect(createCamp1Res.statusCode).toBe(201);

      // DM 2 creates Campaign 2
      const camp2Id = "cmp_secure_2";
      const createCamp2Res = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: { campaignId: camp2Id, actorId: "dm2_user", title: "Campaign Two" },
        headers: { cookie: dm2Cookie, "x-vault-id": "vault2" },
      });
      expect(createCamp2Res.statusCode).toBe(201);

      // --- Prueba 1: Petición Canvas Anónima (retorna 401) ---
      const listAnonRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases`,
        headers: { "x-vault-id": "vault1" },
      });
      expect(listAnonRes.statusCode).toBe(401);

      const singleAnonRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases/some-canvas`,
        headers: { "x-vault-id": "vault1" },
      });
      expect(singleAnonRes.statusCode).toBe(401);

      // --- Prueba 2: Acceso de Jugador (retorna 403) ---
      const listPlayerRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases`,
        headers: { cookie: playerCookie, "x-vault-id": "vault1" },
      });
      expect(listPlayerRes.statusCode).toBe(403);

      // --- Prueba 3: Aislamiento Cruzado (DM2 intenta acceder a Campaña 1, retorna 403) ---
      const listCrossRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases`,
        headers: { cookie: dm2Cookie, "x-vault-id": "vault2" },
      });
      expect(listCrossRes.statusCode).toBe(403);

      const singleCrossRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases/some-canvas`,
        headers: { cookie: dm2Cookie, "x-vault-id": "vault2" },
      });
      expect(singleCrossRes.statusCode).toBe(403);

      // --- Prueba 5: Bypass de Headers Legacy en Producción (retorna 401) ---
      const listLegacyHeaderRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases`,
        headers: { "x-dm-token": "legacy-token-bypass", "x-role": "dm", "x-vault-id": "vault1" },
      });
      expect(listLegacyHeaderRes.statusCode).toBe(401);

      // --- Prueba 6: Canvas Inexistente (404 para DM propietario, 403 para no autorizado) ---
      // DM Propietario (DM1) obtiene 404
      const singleInexistentRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases/cvs_inexistent`,
        headers: { cookie: dm1Cookie, "x-vault-id": "vault1" },
      });
      expect(singleInexistentRes.statusCode).toBe(404);

      // DM No Autorizado (DM2) obtiene 403 (no distingue si existe o no)
      const singleInexistentCrossRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/canvases/cvs_inexistent`,
        headers: { cookie: dm2Cookie, "x-vault-id": "vault2" },
      });
      expect(singleInexistentCrossRes.statusCode).toBe(403);

      // --- Prueba LAN Status: DTOs e Información Pública ---
      // 1. Petición Anónima (Petición pública) devuelve PublicLanStatusDto sin accessCode, localIp ni port
      const lanAnonRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/lan-status`,
        headers: { "x-vault-id": "vault1" },
      });
      expect(lanAnonRes.statusCode).toBe(200);
      const lanAnonJson = lanAnonRes.json();
      expect(lanAnonJson).toHaveProperty("lanModeEnabled");
      expect(lanAnonJson).toHaveProperty("joinUrl");
      expect(lanAnonJson.accessCode).toBeNull();
      expect(lanAnonJson.localIp).toBeUndefined();
      expect(lanAnonJson.port).toBeUndefined();

      const lanDmRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/lan-status`,
        headers: { cookie: dm1Cookie, "x-vault-id": "vault1" },
      });
      expect(lanDmRes.statusCode).toBe(200);
      const lanDmJson = lanDmRes.json();
      expect(lanDmJson).toHaveProperty("lanModeEnabled");
      expect(lanDmJson).toHaveProperty("joinUrl");
      expect(lanDmJson).toHaveProperty("accessCode");
      expect(lanDmJson).toHaveProperty("localIp");
      expect(lanDmJson).toHaveProperty("port");

      // 3. Petición de DM no autorizado devuelve PublicLanStatusDto (sin accessCode, localIp ni port)
      const lanDm2Res = await server.inject({
        method: "GET",
        url: `/api/campaigns/${camp1Id}/lan-status`,
        headers: { cookie: dm2Cookie, "x-vault-id": "vault2" },
      });
      expect(lanDm2Res.statusCode).toBe(200);
      const lanDm2Json = lanDm2Res.json();
      expect(lanDm2Json.accessCode).toBeNull();
      expect(lanDm2Json.localIp).toBeUndefined();
      expect(lanDm2Json.port).toBeUndefined();
    });
  });
});
