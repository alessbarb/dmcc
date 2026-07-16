import { describe, expect, it } from "vitest";
import { readDeviceOverrides } from "../../src/frontend/account/deviceOverrides.js";
import { THEME_CONTRACT_VERSION } from "../../src/frontend/account/themeContract.js";
import { getTheme, themes } from "../../src/frontend/account/themeRegistry.js";
import { validateThemePackage } from "../../src/frontend/account/themeValidation.js";
import { getTypographySet } from "../../src/frontend/account/typographyRegistry.js";

describe("account appearance registries", () => {
  it("registers default as a complete v1 theme", () => {
    const theme = getTheme("default");

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
  });

  it("keeps default as the safe fallback", () => {
    expect(getTheme("unknown-theme")).toBe(getTheme("default"));
    expect([...themes.keys()]).toEqual(["default"]);
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
