import { describe, expect, it } from "vitest";
import { formatRuleCategory } from "../../src/frontend/shared/presentation/formatRuleCategory.js";
import { RULE_CATEGORY_IDS } from "../../src/shared/rules/categories.js";

describe("formatRuleCategory", () => {
  it("translates a known category value in English", () => {
    expect(formatRuleCategory(RULE_CATEGORY_IDS.spellcasting, "en")).toBe("Spellcasting");
  });

  it("translates a known category value in Spanish", () => {
    expect(formatRuleCategory(RULE_CATEGORY_IDS.magicItems, "es")).toBe("Objetos Mágicos");
  });

  it("translates a known category value in every supported locale", () => {
    const expected: Record<string, string> = {
      en: "Monsters",
      es: "Monstruos",
      fr: "Monstres",
      de: "Monster",
      it: "Mostri",
      pt: "Monstros",
    };
    for (const [locale, label] of Object.entries(expected)) {
      expect(formatRuleCategory(RULE_CATEGORY_IDS.monsters, locale as never)).toBe(label);
    }
  });

  it("falls back to the raw value for an unknown category", () => {
    expect(formatRuleCategory("Not A Real Category", "en")).toBe("Not A Real Category");
  });
});
