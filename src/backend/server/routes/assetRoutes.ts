import type { FastifyInstance } from "fastify";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const KNOWN_CATALOGS = new Set(["avatars", "campaigns", "entities"]);

function isImage(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot !== -1 && IMAGE_EXTS.has(name.slice(dot).toLowerCase());
}

function scanImageCatalog(catalogDir: string, publicPrefix: string): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  let entries: string[];

  try {
    entries = readdirSync(catalogDir);
  } catch {
    return groups;
  }

  for (const entry of entries) {
    try {
      const full = join(catalogDir, entry);
      const stat = statSync(full);

      if (stat.isFile() && isImage(entry)) {
        (groups["default"] ??= []).push(`${publicPrefix}/${entry}`);
        continue;
      }

      if (stat.isDirectory()) {
        const subEntries = readdirSync(full).filter(isImage);
        if (subEntries.length > 0) {
          groups[entry] = subEntries.map((fileName) => `${publicPrefix}/${entry}/${fileName}`);
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

function scanAllCatalogs(assetsRoot: string): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const catalogName of listCatalogNames(assetsRoot)) {
    const catalogGroups = scanImageCatalog(join(assetsRoot, catalogName), `/assets/${catalogName}`);
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
    const groups = type === "all" || type === "entities"
      ? scanAllCatalogs(assetsRoot)
      : scanImageCatalog(join(assetsRoot, type), `/assets/${type}`);
    return { groups };
  });
}
