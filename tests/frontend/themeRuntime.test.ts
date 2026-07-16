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
});
