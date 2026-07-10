export type ImageCatalogGroups = Record<string, string[]>;

export function normalizeImageCatalogResponse(response: unknown): ImageCatalogGroups {
  if (!isRecord(response) || !isRecord(response.groups)) return {};

  return Object.fromEntries(
    Object.entries(response.groups)
      .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
      .map(([group, paths]) => [group, paths.filter((path): path is string => typeof path === "string")]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
