import { defaultTheme } from "./defaultTheme.js";
import { fantasyTheme } from "./fantasyTheme.js";
import { sciFiTheme } from "./sciFiTheme.js";
import type { ThemePackage } from "./themeContract.js";
import { assertThemeContrast } from "./themeContrast.js";
import { validateThemePackage } from "./themeValidation.js";

function assertThemePackage(value: unknown): ThemePackage {
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

export const themes = new Map<string, ThemePackage>();

function registerTheme(value: unknown): ThemePackage {
  const theme = assertThemePackage(value);
  if (themes.has(theme.id)) {
    throw new Error(`Theme "${theme.id}" is already registered`);
  }
  themes.set(theme.id, theme);
  return theme;
}

registerTheme(defaultTheme);
registerTheme(fantasyTheme);
registerTheme(sciFiTheme);

export function getTheme(id: string): ThemePackage {
  return themes.get(id) ?? defaultTheme;
}
