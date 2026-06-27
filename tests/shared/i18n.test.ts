import { describe, expect, it } from "vitest";
import { es } from "../../src/shared/i18n/dictionaries/es.js";
import { en } from "../../src/shared/i18n/dictionaries/en.js";
import { createTranslator, formatEntityType, formatVisibility } from "../../src/shared/i18n/index.js";
import { extractPlaceholders } from "../../src/shared/i18n/interpolation.js";

function getAllKeysAndValues(obj: Record<string, any>, prefix = ""): Array<{ key: string; val: string }> {
  let results: Array<{ key: string; val: string }> = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "string") {
      results.push({ key: fullKey, val: obj[k] });
    } else if (typeof obj[k] === "object" && obj[k] !== null) {
      results = results.concat(getAllKeysAndValues(obj[k], fullKey));
    }
  }
  return results;
}

describe("i18n system & dictionary parity", () => {
  const esEntries = getAllKeysAndValues(es);
  const enEntries = getAllKeysAndValues(en);
  const esKeys = esEntries.map((e) => e.key).sort();
  const enKeys = enEntries.map((e) => e.key).sort();

  it("has exact 1:1 key parity between Spanish and English dictionaries", () => {
    expect(enKeys).toEqual(esKeys);
  });

  it("contains no empty translation strings", () => {
    for (const entry of esEntries) {
      expect(entry.val.trim().length, `Empty value for ES key '${entry.key}'`).toBeGreaterThan(0);
    }
    for (const entry of enEntries) {
      expect(entry.val.trim().length, `Empty value for EN key '${entry.key}'`).toBeGreaterThan(0);
    }
  });

  it("matches exact interpolation placeholders between languages", () => {
    const esMap = new Map(esEntries.map((e) => [e.key, e.val]));
    const enMap = new Map(enEntries.map((e) => [e.key, e.val]));

    for (const key of esKeys) {
      const esVal = esMap.get(key)!;
      const enVal = enMap.get(key)!;
      const esPlaceholders = extractPlaceholders(esVal);
      const enPlaceholders = extractPlaceholders(enVal);
      expect(enPlaceholders, `Placeholder mismatch for key '${key}'`).toEqual(esPlaceholders);
    }
  });

  it("resolves translations accurately with createTranslator", () => {
    const trEs = createTranslator("es");
    const trEn = createTranslator("en");

    expect(trEs.t("common.save")).toBe("Guardar");
    expect(trEn.t("common.save")).toBe("Save");
  });

  it("formats domain entity types and visibility appropriately", () => {
    expect(formatEntityType("npc", "es")).toBe("Personaje No Jugador (PNJ)");
    expect(formatEntityType("npc", "en")).toBe("Non-Player Character (NPC)");
    expect(formatVisibility("dm_only", "es")).toBe("Solo DM");
    expect(formatVisibility("dm_only", "en")).toBe("DM Only");
  });
});
