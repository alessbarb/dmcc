import { describe, expect, it } from "vitest";
import { getContrastRatio, validateThemeContrast } from "../../src/frontend/account/themeContrast.js";
import { getTheme, themes } from "../../src/frontend/account/themeRegistry.js";

const EXPECTED_THEME_IDS = ["default", "fantasy", "sci-fi"];

describe("theme contrast", () => {
  it("calculates WCAG contrast ratios for supported opaque colors", () => {
    expect(getContrastRatio("hsl(0 0% 100%)", "hsl(0 0% 0%)")).toBeCloseTo(21, 5);
    expect(getContrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("keeps every registered theme above critical contrast thresholds", () => {
    expect([...themes.keys()]).toEqual(EXPECTED_THEME_IDS);
    for (const theme of themes.values()) {
      expect(validateThemeContrast(theme), theme.id).toEqual([]);
    }
  });

  it("falls back to default without hiding registered packages", () => {
    expect(getTheme("fantasy").id).toBe("fantasy");
    expect(getTheme("sci-fi").id).toBe("sci-fi");
    expect(getTheme("missing").id).toBe("default");
  });
});
