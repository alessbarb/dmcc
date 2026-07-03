import type { FastifyInstance } from "fastify";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function isImage(name: string): boolean {
  const dot = name.lastIndexOf(".");
  return dot !== -1 && IMAGE_EXTS.has(name.slice(dot).toLowerCase());
}

function scanAvatars(avatarsDir: string): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  let entries: string[];
  try {
    entries = readdirSync(avatarsDir);
  } catch {
    return groups;
  }
  for (const entry of entries) {
    const full = join(avatarsDir, entry);
    const stat = statSync(full);
    if (stat.isFile() && isImage(entry)) {
      (groups["default"] ??= []).push(`/assets/avatars/${entry}`);
    } else if (stat.isDirectory()) {
      const subEntries = readdirSync(full).filter(isImage);
      if (subEntries.length > 0) {
        groups[entry] = subEntries.map((f) => `/assets/avatars/${entry}/${f}`);
      }
    }
  }
  return groups;
}

function scanCampaigns(campaignsDir: string): Record<string, string[]> {
  let entries: string[];
  try {
    entries = readdirSync(campaignsDir).filter(isImage);
  } catch {
    return {};
  }
  if (entries.length === 0) return {};
  return { all: entries.map((f) => `/assets/campaigns/${f}`) };
}

export async function registerAssetRoutes(
  server: FastifyInstance,
  opts: { assetsDir?: string }
) {
  server.get<{ Querystring: { type?: string } }>("/api/assets/catalog", async (request, reply) => {
    const type = request.query.type;
    if (type !== "avatars" && type !== "campaigns") {
      return reply.status(400).send({ error: "type must be 'avatars' or 'campaigns'" });
    }
    if (!opts.assetsDir) {
      return { groups: {} };
    }
    const assetsSubdir = join(opts.assetsDir, "assets", type);
    const groups =
      type === "avatars"
        ? scanAvatars(assetsSubdir)
        : scanCampaigns(assetsSubdir);
    return { groups };
  });
}
