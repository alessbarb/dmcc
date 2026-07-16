import type { ThemeVariant } from "./themeContract.js";
import { getTheme } from "./themeRegistry.js";

export type ColorModePreference = "system" | "light" | "dark";
export type ResolvedColorMode = "light" | "dark";

export type ThemeApplicationTarget = {
  style: Pick<CSSStyleDeclaration, "setProperty" | "removeProperty">;
  setAttribute(name: string, value: string): void;
};

export type ThemeRuntimeEnvironment = {
  matchMedia(query: string): MediaQueryList;
};

export type ThemeSelection = {
  themeId?: string;
  colorMode?: ColorModePreference;
};

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
}

function flattenThemeTokens(
  value: unknown,
  path: string[] = [],
  entries: Array<[string, string]> = [],
): Array<[string, string]> {
  if (typeof value === "string") {
    entries.push([`--theme-${path.map(toKebabCase).join("-")}`, value]);
    return entries;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item !== "string") {
        throw new Error(`Theme token ${path.join(".")}[${index}] must be a string`);
      }
      entries.push([`--theme-${path.map(toKebabCase).join("-")}-${index + 1}`, item]);
    });
    return entries;
  }

  if (typeof value !== "object" || value === null) {
    throw new Error(`Theme token ${path.join(".")} cannot be serialized`);
  }

  for (const [key, child] of Object.entries(value)) {
    flattenThemeTokens(child, [...path, key], entries);
  }
  return entries;
}

export function serializeThemeVariant(variant: ThemeVariant): ReadonlyMap<string, string> {
  return new Map(flattenThemeTokens(variant));
}

export function resolveColorMode(
  preference: ColorModePreference,
  environment: ThemeRuntimeEnvironment,
): ResolvedColorMode {
  if (preference !== "system") return preference;
  return environment.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

export function applyThemeVariant(
  target: ThemeApplicationTarget,
  themeId: string,
  mode: ResolvedColorMode,
  variant: ThemeVariant,
  previousPropertyNames: Iterable<string> = [],
): ReadonlySet<string> {
  const serialized = serializeThemeVariant(variant);
  const nextPropertyNames = new Set(serialized.keys());

  for (const propertyName of previousPropertyNames) {
    if (!nextPropertyNames.has(propertyName)) {
      target.style.removeProperty(propertyName);
    }
  }

  for (const [propertyName, value] of serialized) {
    target.style.setProperty(propertyName, value);
  }

  target.setAttribute("data-theme", themeId);
  target.setAttribute("data-color-mode", mode);
  return nextPropertyNames;
}

export type ThemeController = {
  apply(selection: ThemeSelection): void;
  dispose(): void;
};

export function createThemeController(
  target: ThemeApplicationTarget,
  environment: ThemeRuntimeEnvironment,
): ThemeController {
  let selection: Required<ThemeSelection> = {
    themeId: "default",
    colorMode: "system",
  };
  let appliedProperties = new Set<string>();
  const mediaQuery = environment.matchMedia(DARK_MODE_QUERY);

  const render = () => {
    const theme = getTheme(selection.themeId);
    const resolvedMode = resolveColorMode(selection.colorMode, environment);
    appliedProperties = new Set(applyThemeVariant(
      target,
      theme.id,
      resolvedMode,
      theme.variants[resolvedMode],
      appliedProperties,
    ));
  };

  const handleSystemModeChange = () => {
    if (selection.colorMode === "system") render();
  };

  mediaQuery.addEventListener("change", handleSystemModeChange);

  return {
    apply(nextSelection) {
      selection = {
        themeId: nextSelection.themeId ?? "default",
        colorMode: nextSelection.colorMode ?? "system",
      };
      render();
    },
    dispose() {
      mediaQuery.removeEventListener("change", handleSystemModeChange);
    },
  };
}
