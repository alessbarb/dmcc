import { describe, expect, it } from "vitest";
import {
  resolveAppearancePreferences,
  type AppearancePreferences,
} from "../../src/frontend/account/appearanceRuntime.js";

const account: AppearancePreferences = {
  themeId: "default",
  colorMode: "dark",
  typographySetId: "cinzel-outfit",
  density: "comfortable",
  textScale: 1.1,
  enhancedContrast: true,
  reducedMotion: false,
};

describe("appearance runtime precedence", () => {
  it("keeps account preferences when a device field has no override", () => {
    expect(resolveAppearancePreferences(account, {})).toEqual(account);
  });

  it("overrides only fields explicitly configured for the device", () => {
    expect(resolveAppearancePreferences(account, {
      colorMode: "light",
      density: "compact",
      reducedMotion: true,
    })).toEqual({
      ...account,
      colorMode: "light",
      density: "compact",
      reducedMotion: true,
    });
  });

  it("preserves explicit false and numeric override values", () => {
    expect(resolveAppearancePreferences(account, {
      enhancedContrast: false,
      textScale: 0.8,
    })).toEqual({
      ...account,
      enhancedContrast: false,
      textScale: 0.8,
    });
  });
});
