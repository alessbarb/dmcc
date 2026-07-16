import { describe, expect, it } from "vitest";
import {
  THEME_CONTRACT_VERSION,
  type ThemePackageV1,
} from "../../src/frontend/account/themeContract.js";
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

function createValidTheme(): ThemePackageV1 {
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
  } as ThemePackageV1;
}

describe("theme contract v1", () => {
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
    const versionedTheme = theme as ThemePackageV1 & { contractVersion: number };
    versionedTheme.contractVersion = 2;
    theme.variants.dark.text.primary = " ";

    const result = validateThemePackage(theme);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toEqual(expect.arrayContaining([
        {
          path: "theme.contractVersion",
          message: "Expected contract version 1",
        },
        {
          path: "theme.variants.dark.text.primary",
          message: "Expected a non-empty string",
        },
      ]));
    }
  });
});
