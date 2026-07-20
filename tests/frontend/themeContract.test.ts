import { describe, expect, it } from "vitest";
import {
  THEME_CONTRACT_VERSION,
  type ThemePackage,
} from "../../src/frontend/account/themeContract.js";
import { getTheme } from "../../src/frontend/account/themeRegistry.js";
import {
  THEME_VARIANT_SHAPE,
  validateThemePackage,
} from "../../src/frontend/account/themeValidation.js";

function materializeShape(shape: unknown): unknown {
  if (shape === "string") return "var(--test-token)";
  if (shape === "identityPalette") {
    return Array.from({ length: 8 }, (_, index) => `hsl(${index * 40} 60% 50%)`);
  }
  if (typeof shape !== "object" || shape === null || Array.isArray(shape)) {
    throw new Error("Unsupported test shape");
  }
  return Object.fromEntries(
    Object.entries(shape).map(([key, child]) => [key, materializeShape(child)]),
  );
}

function createValidTheme(): ThemePackage {
  const variant = materializeShape(THEME_VARIANT_SHAPE);
  return {
    id: "test-theme",
    contractVersion: THEME_CONTRACT_VERSION,
    labelKey: "account.appearance.themeTest",
    supportsEnhancedContrast: true,
    variants: {
      light: structuredClone(variant),
      dark: structuredClone(variant),
    },
  } as ThemePackage;
}

describe("theme contract", () => {
  it("accepts a complete light and dark package", () => {
    const theme = createValidTheme();
    expect(validateThemePackage(theme)).toEqual({
      valid: true,
      value: theme,
      issues: [],
    });
  });

  it("rejects a missing token with its full path", () => {
    const theme = createValidTheme();
    const surfaces = theme.variants.dark.surfaces as typeof theme.variants.dark.surfaces & {
      raised?: string;
    };
    delete surfaces.raised;

    const result = validateThemePackage(theme);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({
        path: "theme.variants.dark.surfaces.raised",
        message: "Missing required property",
      });
    }
  });

  it("rejects unknown properties instead of silently accepting extensions", () => {
    const theme = createValidTheme();
    Object.assign(theme.variants.light.surfaces, { abyss: "black" });

    const result = validateThemePackage(theme);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({
        path: "theme.variants.light.surfaces.abyss",
        message: "Unknown property",
      });
    }
  });

  it("requires exactly eight non-empty identity colors", () => {
    const theme = createValidTheme();
    const variant = theme.variants.light as typeof theme.variants.light & {
      identityPalette: string[];
    };
    variant.identityPalette = ["red", "blue"];

    const result = validateThemePackage(theme);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({
        path: "theme.variants.light.identityPalette",
        message: "Expected exactly 8 identity colors",
      });
    }
  });

  it("rejects unsupported contract versions and empty values", () => {
    const theme = createValidTheme();
    const versionedTheme = theme as ThemePackage & { contractVersion: number };
    versionedTheme.contractVersion = 99;
    theme.variants.dark.text.primary = " ";

    const result = validateThemePackage(theme);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(expect.arrayContaining([
        {
          path: "theme.contractVersion",
          message: "Expected contract version 2",
        },
        {
          path: "theme.variants.dark.text.primary",
          message: "Expected a non-empty string",
        },
      ]));
    }
  });

  it("ensures all registered themes expose complete artwork and ornaments configuration", () => {
    const themeModules = [
      getTheme("default"),
      getTheme("fantasy"),
      getTheme("sci-fi"),
    ];

    for (const theme of themeModules) {
      for (const mode of ["light", "dark"] as const) {
        expect(theme.variants[mode].artwork).toEqual({
          appBackgroundImage: expect.any(String),
          appBackgroundPosition: expect.any(String),
          appBackgroundPositionCompact: expect.any(String),
          appBackgroundSize: expect.any(String),
          appBackgroundSizeCompact: expect.any(String),
          appBackgroundOpacity: expect.any(String),
          appBackgroundVeil: expect.any(String),
        });

        expect(theme.variants[mode].ornaments).toEqual({
          panelCornerPrimaryMask: expect.any(String),
          panelCornerSecondaryMask: expect.any(String),
          panelEdgeAccentMask: expect.any(String),
          narrativeDividerMask: expect.any(String),
          ambientMarkMask: expect.any(String),

          primary: expect.any(String),
          secondary: expect.any(String),
          highlight: expect.any(String),

          panelCornerPrimaryOpacity: expect.any(String),
          panelCornerSecondaryOpacity: expect.any(String),
          panelEdgeAccentOpacity: expect.any(String),
          narrativeDividerOpacity: expect.any(String),
          ambientMarkOpacity: expect.any(String),

          panelCornerPrimarySize: expect.any(String),
          panelCornerSecondarySize: expect.any(String),
          panelEdgeAccentSize: expect.any(String),
          narrativeDividerSize: expect.any(String),
          ambientMarkSize: expect.any(String),
        });
      }
    }
  });
});
