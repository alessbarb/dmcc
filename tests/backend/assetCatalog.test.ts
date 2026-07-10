import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

interface CatalogItem {
  src: string;
  thumb: string;
  name: string;
}

async function withFakeAssets<T>(fn: (assetsDir: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), "dmcc-assets-"));
  const avatarsDir = join(root, "assets", "avatars", "fantasy");
  const avatarsThumbDir = join(root, "assets", ".thumbs", "avatars", "fantasy");
  const campaignsDir = join(root, "assets", "campaigns", "dark-fantasy");
  const campaignsThumbDir = join(root, "assets", ".thumbs", "campaigns", "dark-fantasy");
  const entitiesDir = join(root, "assets", "entities", "npcs");
  const entitiesThumbDir = join(root, "assets", ".thumbs", "entities", "npcs");
  const futureCatalogDir = join(root, "assets", "locations", "cities");
  const futureThumbDir = join(root, "assets", ".thumbs", "locations", "cities");
  await mkdir(avatarsDir, { recursive: true });
  await mkdir(avatarsThumbDir, { recursive: true });
  await mkdir(campaignsDir, { recursive: true });
  await mkdir(campaignsThumbDir, { recursive: true });
  await mkdir(entitiesDir, { recursive: true });
  await mkdir(entitiesThumbDir, { recursive: true });
  await mkdir(futureCatalogDir, { recursive: true });
  await mkdir(futureThumbDir, { recursive: true });
  await writeFile(join(root, "assets", "avatars", "default-avatar.png"), "");
  await writeFile(join(root, "assets", "avatars", "fantasy", "aelar.png"), "");
  await writeFile(join(root, "assets", ".thumbs", "avatars", "fantasy", "aelar.webp"), "fake-webp");
  await writeFile(join(root, "assets", "campaigns", "default-campaign-cover.jpg"), "");
  await writeFile(join(root, "assets", "campaigns", "dark-fantasy", "castle.webp"), "");
  await writeFile(join(root, "assets", ".thumbs", "campaigns", "dark-fantasy", "castle.webp"), "fake-webp");
  await writeFile(join(root, "assets", "entities", "default-entity.png"), "");
  await writeFile(join(root, "assets", "entities", "npcs", "innkeeper.png"), "");
  await writeFile(join(root, "assets", ".thumbs", "entities", "npcs", "innkeeper.webp"), "fake-webp");
  await writeFile(join(root, "assets", "locations", "cities", "waterdeep.jpg"), "");
  await writeFile(join(root, "assets", ".thumbs", "locations", "cities", "waterdeep.webp"), "fake-webp");
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
      const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
      expect(body.groups["default"]).toContainEqual({
        src: "/assets/avatars/default-avatar.png",
        thumb: "/assets/avatars/default-avatar.png",
        name: "default-avatar.png",
      });
      expect(body.groups["fantasy"]).toContainEqual({
        src: "/assets/avatars/fantasy/aelar.png",
        thumb: "/assets/.thumbs/avatars/fantasy/aelar.webp",
        name: "aelar.png",
      });
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
      const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
      expect(body.groups["default"]).toContainEqual({
        src: "/assets/campaigns/default-campaign-cover.jpg",
        thumb: "/assets/campaigns/default-campaign-cover.jpg",
        name: "default-campaign-cover.jpg",
      });
      expect(body.groups["dark-fantasy"]).toContainEqual({
        src: "/assets/campaigns/dark-fantasy/castle.webp",
        thumb: "/assets/.thumbs/campaigns/dark-fantasy/castle.webp",
        name: "castle.webp",
      });
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
      const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
      expect(body.groups["entities · default"]).toContainEqual({
        src: "/assets/entities/default-entity.png",
        thumb: "/assets/entities/default-entity.png",
        name: "default-entity.png",
      });
      expect(body.groups["entities · npcs"]).toContainEqual({
        src: "/assets/entities/npcs/innkeeper.png",
        thumb: "/assets/.thumbs/entities/npcs/innkeeper.webp",
        name: "innkeeper.png",
      });
      expect(body.groups["avatars · fantasy"]).toContainEqual({
        src: "/assets/avatars/fantasy/aelar.png",
        thumb: "/assets/.thumbs/avatars/fantasy/aelar.webp",
        name: "aelar.png",
      });
      expect(body.groups["campaigns · dark-fantasy"]).toContainEqual({
        src: "/assets/campaigns/dark-fantasy/castle.webp",
        thumb: "/assets/.thumbs/campaigns/dark-fantasy/castle.webp",
        name: "castle.webp",
      });
      expect(body.groups["locations · cities"]).toContainEqual({
        src: "/assets/locations/cities/waterdeep.jpg",
        thumb: "/assets/.thumbs/locations/cities/waterdeep.webp",
        name: "waterdeep.jpg",
      });
      expect(body.groups).not.toHaveProperty(".thumbs · avatars");
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
      const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
      expect(body.groups["avatars · fantasy"]).toContainEqual({
        src: "/assets/avatars/fantasy/aelar.png",
        thumb: "/assets/.thumbs/avatars/fantasy/aelar.webp",
        name: "aelar.png",
      });
      expect(body.groups["locations · cities"]).toContainEqual({
        src: "/assets/locations/cities/waterdeep.jpg",
        thumb: "/assets/.thumbs/locations/cities/waterdeep.webp",
        name: "waterdeep.jpg",
      });
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
        const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
        expect(body.groups["default"]).toContainEqual({
          src: "/assets/campaigns/default-campaign-cover.jpg",
          thumb: "/assets/campaigns/default-campaign-cover.jpg",
          name: "default-campaign-cover.jpg",
        });
        expect(body.groups["dark-fantasy"]).toContainEqual({
          src: "/assets/campaigns/dark-fantasy/castle.webp",
          thumb: "/assets/.thumbs/campaigns/dark-fantasy/castle.webp",
          name: "castle.webp",
        });
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

        const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
        expect(body.groups["default"]).toContainEqual({
          src: "/assets/avatars/default-avatar.png",
          thumb: "/assets/avatars/default-avatar.png",
          name: "default-avatar.png",
        });
        expect(body.groups["fantasy"]).toContainEqual({
          src: "/assets/avatars/fantasy/aelar.png",
          thumb: "/assets/.thumbs/avatars/fantasy/aelar.webp",
          name: "aelar.png",
        });
      } finally {
        if (previousSessionSecret === undefined) {
          delete process.env.SESSION_SECRET;
        } else {
          process.env.SESSION_SECRET = previousSessionSecret;
        }
      }
    });
  });

  it("serves hidden thumbnail files explicitly", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/assets/.thumbs/avatars/fantasy/aelar.webp",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("image/webp");
      expect(response.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
      expect(response.body).toBe("fake-webp");
    });
  });

  it("blocks thumbnail path traversal", async () => {
    await withFakeAssets(async (assetsDir) => {
      const server = createServer({ assetsDir, storageMode: "legacy" });
      const response = await server.inject({
        method: "GET",
        url: "/assets/.thumbs/../../avatars/fantasy/aelar.webp",
      });

      expect([400, 404]).toContain(response.statusCode);
    });
  });

  it("returns empty groups when assetsDir is undefined", async () => {
    const server = createServer({ storageMode: "legacy" });
    const response = await server.inject({
      method: "GET",
      url: "/api/assets/catalog?type=avatars",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ groups: Record<string, CatalogItem[]> }>();
    expect(body.groups).toEqual({});
  });
});
