import { describe, expect, it } from "vitest";
import { createAppearancePreviewController } from "../../src/frontend/account/appearancePreview.js";

type Listener = () => void;

function createHarness(initialDark = false) {
  const properties = new Map<string, string>();
  const attributes = new Map<string, string>();
  const listeners = new Set<Listener>();
  let dark = initialDark;

  const target = {
    style: {
      setProperty(name: string, value: string) {
        properties.set(name, value);
      },
      removeProperty(name: string) {
        properties.delete(name);
        return "";
      },
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
  };

  const mediaQuery = {
    get matches() {
      return dark;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener(_type: string, listener: Listener) {
      listeners.add(listener);
    },
    removeEventListener(_type: string, listener: Listener) {
      listeners.delete(listener);
    },
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return true;
    },
  } as MediaQueryList;

  return {
    target,
    environment: {
      matchMedia: () => mediaQuery,
    },
    properties,
    attributes,
    setDark(next: boolean) {
      dark = next;
      listeners.forEach((listener) => listener());
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

describe("appearance preview", () => {
  it("applies theme and typography only to its isolated target", () => {
    const harness = createHarness();
    const unrelatedProperties = new Map<string, string>();
    const controller = createAppearancePreviewController(
      harness.target,
      harness.environment,
    );

    controller.apply({
      themeId: "default",
      colorMode: "light",
      typographySetId: "cinzel-outfit",
    });

    expect(harness.attributes.get("data-theme")).toBe("default");
    expect(harness.attributes.get("data-color-mode")).toBe("light");
    expect(harness.attributes.get("data-typography")).toBe("cinzel-outfit");
    expect(harness.properties.get("--theme-surfaces-canvas")).toBeTruthy();
    expect(harness.properties.get("--font-display")).toContain("Cinzel");
    expect(harness.properties.get("--font-sans")).toContain("Outfit");
    expect(unrelatedProperties.size).toBe(0);
  });

  it("tracks system mode and releases its media listener", () => {
    const harness = createHarness(false);
    const controller = createAppearancePreviewController(
      harness.target,
      harness.environment,
    );

    controller.apply({
      themeId: "default",
      colorMode: "system",
      typographySetId: "cinzel-outfit",
    });
    expect(harness.attributes.get("data-color-mode")).toBe("light");

    harness.setDark(true);
    expect(harness.attributes.get("data-color-mode")).toBe("dark");

    controller.dispose();
    expect(harness.listenerCount()).toBe(0);
  });
});
