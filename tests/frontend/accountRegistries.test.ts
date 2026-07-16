import { describe, expect, it } from "vitest";
import { readDeviceOverrides } from "../../src/frontend/account/deviceOverrides.js";
import { THEME_CONTRACT_VERSION } from "../../src/frontend/account/themeContract.js";
import { getTheme, themes } from "../../src/frontend/account/themeRegistry.js";
import { validateThemePackage } from "../../src/frontend/account/themeValidation.js";
import { getTypographySet } from "../../src/frontend/account/typographyRegistry.js";

const EXPECTED_THEME_IDS = ["default", "fantasy", "sci-fi"];

describe("account appearance registries", () => {
  it("registers every complete v1 theme", () => {
    expect([...themes.keys()]).toEqual(EXPECTED_THEME_IDS);

    for (const theme of themes.values()) {
      expect(theme.contractVersion).toBe(THEME_CONTRACT_VERSION);
      expect(validateThemePackage(theme)).toEqual({
        valid: true,
        value: theme,
        issues: [],
      });
      expect(theme.variants.dark.surfaces.canvas).toBeTruthy();
      expect(theme.variants.light.surfaces.canvas).toBeTruthy();
      expect(theme.variants.dark.identityPalette).toHaveLength(8);
      expect(theme.variants.light.identityPalette).toHaveLength(8);
    }
  });

  it("keeps default as the safe fallback without hiding registered themes", () => {
    expect(getTheme("fantasy").id).toBe("fantasy");
    expect(getTheme("sci-fi").id).toBe("sci-fi");
    expect(getTheme("unknown-theme")).toBe(getTheme("default"));
  });

  it("registers the existing Cinzel and Outfit font pairing", () => {
    expect(getTypographySet("cinzel-outfit").bodyFamily).toContain("Outfit");
  });

  it("allows only presentation fields in device overrides", () => {
    const storage = {
      getItem: () => JSON.stringify({
        themeId: "default",
        colorMode: "dark",
        email: "private@example.com",
      }),
    };
    expect(readDeviceOverrides(storage)).toEqual({ themeId: "default", colorMode: "dark" });
    expect(readDeviceOverrides(storage)).not.toHaveProperty("email");
  });
});
