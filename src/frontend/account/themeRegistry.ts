import { defaultTheme } from "./defaultTheme.js";
import { fantasyTheme } from "./fantasyTheme.js";
import { sciFiTheme } from "./sciFiTheme.js";
import type { ThemePackageV1 } from "./themeContract.js";
import { assertThemeContrast } from "./themeContrast.js";
import { validateThemePackage } from "./themeValidation.js";

export type ThemePackage = ThemePackageV1;

function assertThemePackage(value: unknown): ThemePackageV1 {
  const result = validateThemePackage(value);
  if (!result.valid) {
    const details = result.issues
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid theme package:\n${details}`);
  }

  assertThemeContrast(result.value);
  return result.value;
}

function strengthenLightPrimary(
  theme: ThemePackageV1,
  foreground: string,
  hover: string,
  active: string,
): ThemePackageV1 {
  return {
    ...theme,
    variants: {
      ...theme.variants,
      light: {
        ...theme.variants.light,
        text: {
          ...theme.variants.light.text,
          link: foreground,
          linkHover: hover,
        },
        accents: {
          ...theme.variants.light.accents,
          primary: {
            ...theme.variants.light.accents.primary,
            foreground,
            hover,
            active,
            backgroundStrong: foreground,
            border: foreground,
          },
        },
      },
    },
  };
}

const accessibleFantasyTheme = strengthenLightPrimary(
  fantasyTheme,
  "hsl(35 72% 32%)",
  "hsl(35 79% 25%)",
  "hsl(34 82% 20%)",
);

const accessibleSciFiTheme = strengthenLightPrimary(
  sciFiTheme,
  "hsl(190 82% 28%)",
  "hsl(191 88% 22%)",
  "hsl(191 91% 18%)",
);

export const themes = new Map<string, ThemePackage>();

export function registerTheme(value: unknown): ThemePackageV1 {
  const theme = assertThemePackage(value);
  if (themes.has(theme.id)) {
    throw new Error(`Theme "${theme.id}" is already registered`);
  }
  themes.set(theme.id, theme);
  return theme;
}

registerTheme(defaultTheme);
registerTheme(accessibleFantasyTheme);
registerTheme(accessibleSciFiTheme);

export function getTheme(id: string): ThemePackage {
  return themes.get(id) ?? defaultTheme;
}
