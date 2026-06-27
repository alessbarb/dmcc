export type SeedMode = "create" | "replace" | "dry-run";

export const BASE = (process.env.DMCC_BASE_URL ?? "http://localhost:4877").replace(/\/+$/, "");
export const CAMPAIGN_TITLE = "La Sombra del Oráculo";
export const DEFAULT_CAMPAIGN_ID = "cmp_seed_oracle_shadow";
export const CMP = process.env.DMCC_CAMPAIGN_ID?.trim() || DEFAULT_CAMPAIGN_ID;
export const MODE = parseSeedMode(process.env.DMCC_SEED_MODE ?? "create");
export const CONFIRMATION = process.env.DMCC_SEED_CONFIRM?.trim() ?? "";

function parseSeedMode(value: string): SeedMode {
  if (value === "create" || value === "replace" || value === "dry-run") return value;
  throw new Error(`Invalid DMCC_SEED_MODE '${value}'. Use create, replace, or dry-run.`);
}
