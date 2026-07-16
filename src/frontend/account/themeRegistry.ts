import { defaultTheme } from "./defaultTheme.js";
import type { ThemePackageV1 } from "./themeContract.js";
import { validateThemePackage } from "./themeValidation.js";

export type ThemePackage = ThemePackageV1;

function assertThemePackage(value: unknown): ThemePackageV1 {
  const result = validateThemePackage(value);
  if (result.valid) return result.value;

  const details = result.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid theme package:\n${details}`);
}

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

export function getTheme(id: string): ThemePackage {
  return themes.get(id) ?? defaultTheme;
}
