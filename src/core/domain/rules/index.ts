import type { RuleSystem } from "./types.js";
import { genericRules } from "./generic.js";
import { dnd521Rules } from "./dnd521.js";

export * from "./types.js";
export { genericRules } from "./generic.js";
export { dnd521Rules } from "./dnd521.js";

export function getRuleSystem(systemCode?: string): RuleSystem {
  switch (systemCode) {
    case "dnd_5e":
      return dnd521Rules;
    default:
      return genericRules;
  }
}
