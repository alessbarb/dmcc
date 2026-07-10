export interface ImageCatalogItem {
  src: string;
  thumb: string;
  name: string;
}

export type ImageCatalogGroups = Record<string, ImageCatalogItem[]>;

/**
 * Normalizes untrusted asset catalog payloads before the UI calls Object.* helpers.
 */
export function normalizeImageCatalogResponse(response: unknown): ImageCatalogGroups {
  if (!isRecord(response) || !isRecord(response.groups)) return {};
  return normalizeImageCatalogGroups(response.groups);
}

export function normalizeImageCatalogGroups(groups: unknown): ImageCatalogGroups {
  if (!isRecord(groups)) return {};

  return Object.fromEntries(
    Object.entries(groups)
      .filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]))
      .map(([group, entries]) => [group, entries.map(normalizeImageCatalogEntry).filter(isImageCatalogItem)]),
  );
}

function normalizeImageCatalogEntry(entry: unknown): ImageCatalogItem | null {
  if (typeof entry === "string") {
    return {
      src: entry,
      thumb: entry,
      name: entry.split("/").pop() ?? entry,
    };
  }

  if (!isRecord(entry) || typeof entry.src !== "string") return null;

  return {
    src: entry.src,
    thumb: typeof entry.thumb === "string" ? entry.thumb : entry.src,
    name: typeof entry.name === "string" ? entry.name : entry.src.split("/").pop() ?? entry.src,
  };
}

function isImageCatalogItem(value: ImageCatalogItem | null): value is ImageCatalogItem {
  return value !== null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
