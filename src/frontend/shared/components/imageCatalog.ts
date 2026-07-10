export type ImageCatalogGroups = Record<string, string[]>;

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
      .map(([group, paths]) => [group, paths.filter((path): path is string => typeof path === "string")]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
