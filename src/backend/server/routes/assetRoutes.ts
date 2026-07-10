import type { FastifyInstance } from "fastify";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

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

export async function registerAssetRoutes(
  server: FastifyInstance,
  opts: { assetsDir?: string }
) {
  server.get<{ Querystring: { type?: string } }>("/api/assets/catalog", async (request, reply) => {
    const type = request.query.type;
    if (type !== "avatars" && type !== "campaigns" && type !== "entities") {
      return reply.status(400).send({ error: "type must be 'avatars', 'campaigns', or 'entities'" });
    }
    if (!opts.assetsDir) {
      return { groups: {} };
    }
    const assetsSubdir = join(opts.assetsDir, "assets", type);
    const groups = scanImageCatalog(assetsSubdir, `/assets/${type}`);
    return { groups };
  });
}
