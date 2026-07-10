import type { FastifyInstance } from "fastify";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, parse } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const KNOWN_CATALOGS = new Set(["avatars", "campaigns", "entities"]);
const THUMB_DIR = "_thumbs";

interface ImageCatalogItem {
  src: string;
  thumb: string;
  name: string;
}

function isImage(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot !== -1 && IMAGE_EXTS.has(name.slice(dot).toLowerCase());
}

function toThumbPath(fileName: string): string {
  const parsed = parse(fileName);
  return `${parsed.name}.webp`;
}

function createCatalogItem(src: string, thumbDir: string, thumbPrefix: string, fileName: string): ImageCatalogItem {
  const thumbFileName = toThumbPath(fileName);
  const thumbFilePath = join(thumbDir, thumbFileName);
  return {
    src,
    thumb: existsSync(thumbFilePath) ? `${thumbPrefix}/${thumbFileName}` : src,
    name: fileName,
  };
}

function scanImageCatalog(
  catalogDir: string,
  publicPrefix: string,
  thumbsCatalogDir: string,
  thumbsPublicPrefix: string,
): Record<string, ImageCatalogItem[]> {
  const groups: Record<string, ImageCatalogItem[]> = {};
  let entries: string[];

  try {
    entries = readdirSync(catalogDir);
  } catch {
    return groups;
  }

  for (const entry of entries) {
    try {
      if (entry === THUMB_DIR) continue;

      const full = join(catalogDir, entry);
      const stat = statSync(full);

      if (stat.isFile() && isImage(entry)) {
        (groups["default"] ??= []).push(
          createCatalogItem(`${publicPrefix}/${entry}`, thumbsCatalogDir, thumbsPublicPrefix, entry),
        );
        continue;
      }

      if (stat.isDirectory()) {
        const subEntries = readdirSync(full).filter(isImage);
        if (subEntries.length > 0) {
          groups[entry] = subEntries.map((fileName) =>
            createCatalogItem(
              `${publicPrefix}/${entry}/${fileName}`,
              join(thumbsCatalogDir, entry),
              `${thumbsPublicPrefix}/${entry}`,
              fileName,
            ),
          );
        }
      }
    } catch {
      // file removed between readdir and stat — skip
    }
  }

  return groups;
}

function listCatalogNames(assetsRoot: string): string[] {
  try {
    return readdirSync(assetsRoot).filter((entry) => {
      if (entry === THUMB_DIR || entry.startsWith(".")) return false;
      try {
        return statSync(join(assetsRoot, entry)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

function scanAllCatalogs(assetsRoot: string): Record<string, ImageCatalogItem[]> {
  const groups: Record<string, ImageCatalogItem[]> = {};

  for (const catalogName of listCatalogNames(assetsRoot)) {
    const catalogGroups = scanImageCatalog(
      join(assetsRoot, catalogName),
      `/assets/${catalogName}`,
      join(assetsRoot, THUMB_DIR, catalogName),
      `/assets/${THUMB_DIR}/${catalogName}`,
    );
    for (const [groupName, paths] of Object.entries(catalogGroups)) {
      groups[`${catalogName} · ${groupName}`] = paths;
    }
  }

  return groups;
}

export async function registerAssetRoutes(
  server: FastifyInstance,
  opts: { assetsDir?: string }
) {
  server.get<{ Querystring: { type?: string } }>("/api/assets/catalog", async (request, reply) => {
    const type = request.query.type;
    if (type !== "all" && !KNOWN_CATALOGS.has(type ?? "")) {
      return reply.status(400).send({ error: "type must be 'all', 'avatars', 'campaigns', or 'entities'" });
    }
    if (!opts.assetsDir) {
      return { groups: {} };
    }

    const assetsRoot = join(opts.assetsDir, "assets");
    if (type === "all" || type === "entities") {
      return { groups: scanAllCatalogs(assetsRoot) };
    }

    const catalogType = type as "avatars" | "campaigns";
    return {
      groups: scanImageCatalog(
        join(assetsRoot, catalogType),
        `/assets/${catalogType}`,
        join(assetsRoot, THUMB_DIR, catalogType),
        `/assets/${THUMB_DIR}/${catalogType}`,
      ),
    };
  });
}
