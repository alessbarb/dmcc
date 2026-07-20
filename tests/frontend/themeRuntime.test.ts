import { describe, expect, it } from "vitest";
import { getTheme } from "../../src/frontend/account/themeRegistry.js";
import {
  applyThemeVariant,
  createThemeController,
  resolveColorMode,
  serializeThemeVariant,
} from "../../src/frontend/account/themeRuntime.js";

function createTarget() {
  const properties = new Map<string, string>();
  const attributes = new Map<string, string>();
  return {
    properties,
    attributes,
    target: {
      style: {
        setProperty(name: string, value: string) {
          properties.set(name, value);
        },
        removeProperty(name: string) {
          const previous = properties.get(name) ?? "";
          properties.delete(name);
          return previous;
        },
      },
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
    },
  };
}

function createEnvironment(initialDark = false) {
  let dark = initialDark;
  const listeners = new Set<() => void>();
  const mediaQuery = {
    get matches() {
      return dark;
    },
    addEventListener(_type: string, listener: () => void) {
      listeners.add(listener);
    },
    removeEventListener(_type: string, listener: () => void) {
      listeners.delete(listener);
    },
  } as unknown as MediaQueryList;

  return {
    environment: {
      matchMedia: () => mediaQuery,
    },
    setDark(value: boolean) {
      dark = value;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("theme runtime", () => {
  it("serializes the complete contract into stable CSS custom properties", () => {
    const serialized = serializeThemeVariant(getTheme("default").variants.dark);

    expect(serialized.get("--theme-surfaces-canvas")).toBeTruthy();
    expect(serialized.get("--theme-accents-primary-on-accent")).toBeTruthy();
    expect(serialized.get("--theme-entities-player-foreground")).toBeTruthy();
    expect(serialized.get("--theme-identity-palette-8")).toBeTruthy();
  });

  it("resolves system mode from the environment", () => {
    const light = createEnvironment(false);
    const dark = createEnvironment(true);

    expect(resolveColorMode("system", light.environment)).toBe("light");
    expect(resolveColorMode("system", dark.environment)).toBe("dark");
    expect(resolveColorMode("light", dark.environment)).toBe("light");
  });

  it("applies attributes and removes stale properties", () => {
    const { target, properties, attributes } = createTarget();
    properties.set("--theme-obsolete", "red");

    const applied = applyThemeVariant(
      target,
      "default",
      "dark",
      getTheme("default").variants.dark,
      ["--theme-obsolete"],
    );

    expect(properties.has("--theme-obsolete")).toBe(false);
    expect(applied.has("--theme-surfaces-canvas")).toBe(true);
    expect(attributes.get("data-theme")).toBe("default");
    expect(attributes.get("data-color-mode")).toBe("dark");
  });

  it("reapplies a system theme when the operating-system preference changes", () => {
    const { target, attributes } = createTarget();
    const runtime = createEnvironment(false);
    const controller = createThemeController(target, runtime.environment);

    controller.apply({ themeId: "default", colorMode: "system" });
    expect(attributes.get("data-color-mode")).toBe("light");

    runtime.setDark(true);
    expect(attributes.get("data-color-mode")).toBe("dark");

    controller.dispose();
  });

  it("serializes fantasy theme artwork tokens into CSS custom properties", () => {
    const serialized = serializeThemeVariant(getTheme("fantasy").variants.dark);

    expect(serialized.get("--theme-artwork-app-background-image")).toBe(
      "url('/assets/themes/fantasy/app-background.webp')",
    );
    expect(serialized.get("--theme-artwork-app-background-opacity")).toBe("0.22");
    expect(serialized.get("--theme-artwork-app-background-position")).toBe("center top");
    expect(serialized.get("--theme-artwork-app-background-position-compact")).toBe("58% top");
    expect(serialized.get("--theme-ornaments-panel-corner-primary-mask")).toBe(
      "url('/assets/themes/fantasy/ornaments/panel-corner-primary.svg')",
    );
    expect(serialized.get("--theme-ornaments-primary")).toBe("hsl(165 42% 61%)");
  });

  it("updates artwork and ornaments custom properties when switching from fantasy to default theme", () => {
    const { target, properties } = createTarget();
    const runtime = createEnvironment(true);
    const controller = createThemeController(target, runtime.environment);

    controller.apply({ themeId: "fantasy", colorMode: "dark" });
    expect(properties.get("--theme-artwork-app-background-image")).toBe(
      "url('/assets/themes/fantasy/app-background.webp')",
    );
    expect(properties.get("--theme-ornaments-panel-corner-primary-mask")).toBe(
      "url('/assets/themes/fantasy/ornaments/panel-corner-primary.svg')",
    );

    controller.apply({ themeId: "default", colorMode: "dark" });
    expect(properties.get("--theme-artwork-app-background-image")).toBe(
      "url('/assets/themes/default/app-background.webp')",
    );
    expect(properties.get("--theme-artwork-app-background-opacity")).toBe("0.20");
    expect(properties.get("--theme-ornaments-panel-corner-primary-mask")).toBe(
      "url('/assets/themes/default/ornaments/panel-corner-primary.svg')",
    );

    controller.dispose();
  });
});
