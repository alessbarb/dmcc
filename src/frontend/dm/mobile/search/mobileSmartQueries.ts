import type { MobileCampaignContext, MobileCampaignStateLike, MobileOracleResult } from "../types.js";
import { searchMobileOracle } from "./mobileOracleSearch.js";

export type MobileSmartQueryKind = "unrevealed_clues" | "prepared_secrets" | "active_lies" | "player_theories" | "active_session" | "plain_text";

export function classifyMobileSmartQuery(query: string): MobileSmartQueryKind {
  const value = query.toLocaleLowerCase();
  if (value.includes("pista") && (value.includes("no revel") || value.includes("unrevealed"))) return "unrevealed_clues";
  if (value.includes("secreto") || value.includes("secret")) return "prepared_secrets";
  if (value.includes("mentira") || value.includes("lie")) return "active_lies";
  if (value.includes("teoria") || value.includes("teoría") || value.includes("player theor")) return "player_theories";
  if (value.includes("esta sesion") || value.includes("esta sesión") || value.includes("active session")) return "active_session";
  return "plain_text";
}

export function runMobileSmartQuery(state: MobileCampaignStateLike, query: string, context: MobileCampaignContext = {}): MobileOracleResult[] {
  switch (classifyMobileSmartQuery(query)) {
    case "unrevealed_clues":
      return searchMobileOracle(state, "pistas", context).filter((result) => result.entityType === "clue" && result.status !== "revealed");
    case "prepared_secrets":
      return searchMobileOracle(state, "secretos", context);
    case "active_lies":
      return searchMobileOracle(state, "lie", context);
    case "player_theories":
      return searchMobileOracle(state, "player_theory", context);
    case "active_session":
      return searchMobileOracle(state, "", context);
    case "plain_text":
      return searchMobileOracle(state, query, context);
  }
}
