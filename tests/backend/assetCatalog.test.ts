import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withFakeAssets<T>(fn: (assetsDir: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), "dmcc-assets-"));
  const avatarsDir = join(root, "assets", "avatars", "fantasy");
  const campaignsDir = join(root, "assets", "campaigns", "dark-fantasy");
  const entitiesDir = join(root, "assets", "entities", "npcs");
  const futureCatalogDir = join(root, "assets", "locations", "cities");
  await mkdir(avatarsDir, { recursive: true });
  await mkdir(campaignsDir, { recursive: true });
  await mkdir(entitiesDir, { recursive: true });
  await mkdir(futureCatalogDir, { recursive: true });
  await writeFile(join(root, "assets", "avatars", "default-avatar.png"), "");
  await writeFile(join(root, "assets", "avatars", "fantasy", "aelar.png"), "");
  await writeFile(join(root, "assets", "campaigns", "default-campaign-cover.jpg"), "");
  await writeFile(join(root, "assets", "campaigns", "dark-fantasy", "castle.webp"), "");
  await writeFile(join(root, "assets", "entities", "default-entity.png"), "");
  await writeFile(join(root, "assets", "entities", "npcs", "innkeeper.png"), "");
  await writeFile(join(root, "assets", "locations", "cities", "waterdeep.jpg"), "");
  try {
    return await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("GET /api/assets/catalog", () => {
  it("returns avatar groups with default and named subfolders", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=avatars",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["default"]).toContain("/assets/avatars/default-avatar.png");
      expect(body.groups["fantasy"]).toContain("/assets/avatars/fantasy/aelar.png");
    });
  });

  it("returns campaign groups with default and named subfolders", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=campaigns",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["default"]).toContain("/assets/campaigns/default-campaign-cover.jpg");
      expect(body.groups["dark-fantasy"]).toContain("/assets/campaigns/dark-fantasy/castle.webp");
    });
  });

  it("lets entities use every current and future asset catalog", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=entities",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["entities · default"]).toContain("/assets/entities/default-entity.png");
      expect(body.groups["entities · npcs"]).toContain("/assets/entities/npcs/innkeeper.png");
      expect(body.groups["avatars · fantasy"]).toContain("/assets/avatars/fantasy/aelar.png");
      expect(body.groups["campaigns · dark-fantasy"]).toContain("/assets/campaigns/dark-fantasy/castle.webp");
      expect(body.groups["locations · cities"]).toContain("/assets/locations/cities/waterdeep.jpg");
    });
  });

  it("returns all current and future asset catalogs when requested explicitly", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=all",
      });
      expect(response.statusCode).toBe(200);
      const body = response.json<{ groups: Record<string, string[]> }>();
      expect(body.groups["avatars · fantasy"]).toContain("/assets/avatars/fantasy/aelar.png");
      expect(body.groups["locations · cities"]).toContain("/assets/locations/cities/waterdeep.jpg");
    });
  });

  it("returns 400 for unknown catalog type", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/api/assets/catalog?type=unknown",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  it("discovers image assets from DMCC_PUBLIC_DIR even when the SPA is not built", async () => {
    await withFakeAssets(async (assetsDir) => {
      const previousPublicDir = process.env.DMCC_PUBLIC_DIR;
      process.env.DMCC_PUBLIC_DIR = assetsDir;
      try {
        const server = createServer({ storageMode: "legacy" });
        const response = await server.inject({
          method: "GET",
          url: "/api/assets/catalog?type=campaigns",
        });
        expect(response.statusCode).toBe(200);
        const body = response.json<{ groups: Record<string, string[]> }>();
        expect(body.groups["default"]).toContain("/assets/campaigns/default-campaign-cover.jpg");
        expect(body.groups["dark-fantasy"]).toContain("/assets/campaigns/dark-fantasy/castle.webp");
      } finally {
        if (previousPublicDir === undefined) {
          delete process.env.DMCC_PUBLIC_DIR;
        } else {
          process.env.DMCC_PUBLIC_DIR = previousPublicDir;
        }
      }
    });
  });

  it("registers the asset catalog route in postgres web mode", async () => {
    await withFakeAssets(async (assetsDir) => {
      const previousSessionSecret = process.env.SESSION_SECRET;
      process.env.SESSION_SECRET = "0123456789abcdef0123456789abcdef";

      try {
        const server = createServer({ assetsDir, storageMode: "postgres" });
        const response = await server.inject({
          method: "GET",
          url: "/api/assets/catalog?type=avatars",
        });

        expect(response.statusCode).toBe(200);

        const body = response.json<{ groups: Record<string, string[]> }>();
        expect(body.groups["default"]).toContain("/assets/avatars/default-avatar.png");
        expect(body.groups["fantasy"]).toContain("/assets/avatars/fantasy/aelar.png");
      } finally {
        if (previousSessionSecret === undefined) {
          delete process.env.SESSION_SECRET;
        } else {
          process.env.SESSION_SECRET = previousSessionSecret;
        }
      }
    });
  });

  it("returns empty groups when assetsDir is undefined", async () => {
    const server = createServer({ storageMode: "legacy" });
    const response = await server.inject({
      method: "GET",
      url: "/api/assets/catalog?type=avatars",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ groups: Record<string, string[]> }>();
    expect(body.groups).toEqual({});
  });
});
