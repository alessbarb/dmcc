import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-premade-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function setupDm(server: any, email: string, secret: string) {
  const response = await server.inject({
    method: "POST",
    url: "/api/auth/dm/setup",
    payload: { email, secret, displayName: email.split("@")[0] },
    headers: { "x-vault-id": "default" },
  });
  expect(response.statusCode).toBe(200);
  return response.json() as { dmSessionToken: string; dm: { dmId: string; email: string } };
}

describe("premade campaign templates", () => {
  it("lists bundled templates for an authenticated DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "dm@example.com", "secret-aaaa");

      const response = await server.inject({
        method: "GET",
        url: "/api/premade-campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().templates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ templateId: "oracle-triple-eclipse" }),
          expect.objectContaining({ templateId: "phandalin-starter" }),
        ]),
      );

      await server.close();
    });
  });


  it("serves a full premade template for read-only preview without importing it", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "preview@example.com", "secret-preview");

      const response = await server.inject({
        method: "GET",
        url: "/api/premade-campaigns/phandalin-starter",
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        templateId: "phandalin-starter",
        title: expect.any(String),
      });
      expect(response.json().title).toBe("Shadows over Phandalin");
      expect(response.json().locale).toBe("en");
      expect(response.json().entities.length).toBeGreaterThan(5);
      expect(response.json().sessions.length).toBeGreaterThan(0);

      const spanish = await server.inject({
        method: "GET",
        url: "/api/premade-campaigns/phandalin-starter?locale=es",
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(spanish.statusCode).toBe(200);
      expect(spanish.json().title).toBe("Las Sombras sobre Phandalin");
      expect(spanish.json().locale).toBe("es");

      const campaigns = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });

      expect(campaigns.statusCode).toBe(200);
      expect(campaigns.json()).toEqual([]);

      await server.close();
    });
  });

  it("imports a premade template as an isolated campaign owned by the current DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmA = await setupDm(server, "a@example.com", "secret-aaaa");
      const dmB = await setupDm(server, "b@example.com", "secret-bbbb");

      const imported = await server.inject({
        method: "POST",
        url: "/api/premade-campaigns/phandalin-starter/import",
        payload: { title: "Mi Phandalin" },
        headers: { "x-vault-id": "default", "x-dm-token": dmA.dmSessionToken },
      });

      expect(imported.statusCode, imported.body).toBe(201);
      const body = imported.json();
      expect(body).toMatchObject({ title: "Mi Phandalin", templateId: "phandalin-starter" });
      expect(body.campaignId).toMatch(/^cmp_/);

      const state = await server.inject({
        method: "GET",
        url: `/api/campaigns/${body.campaignId}`,
        headers: { "x-vault-id": "default", "x-dm-token": dmA.dmSessionToken },
      });
      expect(state.statusCode).toBe(200);
      expect(state.json().campaign.title).toBe("Mi Phandalin");
      expect(state.json().campaign.metadata).toMatchObject({
        createdFromTemplateId: "phandalin-starter",
        createdFromTemplateTitle: expect.any(String),
        importMode: "full",
      });
      expect(state.json().entities.length).toBeGreaterThan(5);
      expect(state.json().sessions.length).toBeGreaterThan(0);

      const listA = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dmA.dmSessionToken },
      });
      expect(listA.json().map((campaign: any) => campaign.campaignId)).toContain(body.campaignId);

      const listB = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(listB.json()).toEqual([]);

      const forbidden = await server.inject({
        method: "GET",
        url: `/api/campaigns/${body.campaignId}`,
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(forbidden.statusCode).toBe(403);

      await server.close();
    });
  }, 20000);
  it("renames an imported premade campaign and keeps the template origin", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "rename@example.com", "secret-rename");

      const imported = await server.inject({
        method: "POST",
        url: "/api/premade-campaigns/oracle-triple-eclipse/import",
        payload: { title: "Oráculo de los viernes", importMode: "sessions" },
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(imported.statusCode, imported.body).toBe(201);
      const campaignId = imported.json().campaignId;

      const renamed = await server.inject({
        method: "PATCH",
        url: `/api/campaigns/${campaignId}`,
        payload: { title: "Oráculo con la familia", summary: "Mesa familiar de prueba" },
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(renamed.statusCode).toBe(200);
      expect(renamed.json().campaign).toMatchObject({ title: "Oráculo con la familia", summary: "Mesa familiar de prueba" });
      expect(renamed.json().campaign.metadata).toMatchObject({ createdFromTemplateId: "oracle-triple-eclipse" });

      await server.close();
    });
  }, 20000);

  it("imports oracle with correct entity and canvas counts", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "oracle@example.com", "secret-oracle");

      const imported = await server.inject({
        method: "POST",
        url: "/api/premade-campaigns/oracle-triple-eclipse/import",
        payload: { title: "My Oracle" },
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(imported.statusCode).toBe(201);

      const state = await server.inject({
        method: "GET",
        url: `/api/campaigns/${imported.json().campaignId}`,
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(state.statusCode).toBe(200);
      expect(state.json().entities.length).toBeGreaterThanOrEqual(108);
      expect(state.json().sessions.length).toBeGreaterThanOrEqual(8);
      const pcs = state.json().entities.filter((e: any) => e.entityType === "player_character");
      expect(pcs.length).toBeGreaterThanOrEqual(4);

      await server.close();
    });
  }, 20000);

  it("imports phandalin sessions as preparation without historical events", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "ph@example.com", "secret-ph");

      const imported = await server.inject({
        method: "POST",
        url: "/api/premade-campaigns/phandalin-starter/import",
        payload: { title: "My Phandalin" },
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      const campaignId = imported.json().campaignId;

      const state = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campaignId}`,
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(state.json().sessions.length).toBeGreaterThanOrEqual(8);
      for (const session of state.json().sessions) {
        expect(session.events ?? []).toHaveLength(0);
      }

      await server.close();
    });
  }, 20000);

  it("serves oracle in Spanish with entity titles", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dm = await setupDm(server, "es@example.com", "secret-es");

      const response = await server.inject({
        method: "GET",
        url: "/api/premade-campaigns/oracle-triple-eclipse?locale=es",
        headers: { "x-vault-id": "default", "x-dm-token": dm.dmSessionToken },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().locale).toBe("es");
      for (const entity of response.json().entities) {
        expect(entity.title).toBeTruthy();
      }

      await server.close();
    });
  });

  it("imports a premade campaign and registers DM campaign membership immediately", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      server.allowLegacyTestAuth = false;

      // Register and login DM
      const vaultId = "default";
      const email = "dm_import@example.com";
      const password = "secure-password-dm-import";
      const registerRes = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        headers: { "x-vault-id": vaultId },
        payload: { email, password, displayName: "DM Importer" },
      });
      expect(registerRes.statusCode).toBe(201);

      const loginRes = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        headers: { "x-vault-id": vaultId },
        payload: { email, password },
      });
      expect(loginRes.statusCode).toBe(200);

      const cookieStr = loginRes.headers["set-cookie"];
      const cookie = (Array.isArray(cookieStr) ? cookieStr[0] : String(cookieStr)).split(";")[0];

      // Import premade campaign
      const importRes = await server.inject({
        method: "POST",
        url: "/api/premade-campaigns/phandalin-starter/import",
        headers: { cookie, "x-vault-id": vaultId },
        payload: { title: "Session Auth Phandalin" },
      });
      expect(importRes.statusCode, importRes.body).toBe(201);
      const campaignId = importRes.json().campaignId;

      // Access campaign details immediately using session cookie (should be 200)
      const campaignRes = await server.inject({
        method: "GET",
        url: `/api/campaigns/${campaignId}`,
        headers: { cookie, "x-vault-id": vaultId },
      });
      expect(campaignRes.statusCode).toBe(200);
      expect(campaignRes.json().campaign.title).toBe("Session Auth Phandalin");

      await server.close();
    });
  }, 20000);
});
