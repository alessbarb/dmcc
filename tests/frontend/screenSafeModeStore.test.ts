import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useScreenSafeModeStore } from "../../src/frontend/shared/stores/screenSafeModeStore.js";

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
  };
}

describe("useScreenSafeModeStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    useScreenSafeModeStore.setState({ enabled: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts disabled by default", () => {
    expect(useScreenSafeModeStore.getState().enabled).toBe(false);
  });

  it("toggle() flips the enabled flag", () => {
    useScreenSafeModeStore.getState().toggle();
    expect(useScreenSafeModeStore.getState().enabled).toBe(true);
    useScreenSafeModeStore.getState().toggle();
    expect(useScreenSafeModeStore.getState().enabled).toBe(false);
  });

  it("persists the flag to localStorage across toggles", () => {
    useScreenSafeModeStore.getState().toggle();
    expect(localStorage.getItem("dmcc-screen-safe-mode")).toBe("1");
    useScreenSafeModeStore.getState().toggle();
    expect(localStorage.getItem("dmcc-screen-safe-mode")).toBe("0");
  });

  it("setEnabled() sets an explicit value", () => {
    useScreenSafeModeStore.getState().setEnabled(true);
    expect(useScreenSafeModeStore.getState().enabled).toBe(true);
  });
});
