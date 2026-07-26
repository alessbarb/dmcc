import { create } from "zustand";

const STORAGE_KEY = "dmcc-screen-safe-mode";

function readInitial(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

interface ScreenSafeModeState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
}

/**
 * "Screen-safe mode" (UX audit 2026-07-26, research-driven proposal): a
 * global toggle the DM can flip before sharing their screen, so dm_only
 * content and unrevealed secrets blur out across Library and Canvas
 * instead of relying on the DM remembering not to show those screens.
 * Global (not per-campaign) and persisted, since the whole point is that
 * it survives a route change mid-session.
 */
export const useScreenSafeModeStore = create<ScreenSafeModeState>((set, get) => ({
  enabled: readInitial(),
  toggle: () => {
    const next = !get().enabled;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
    set({ enabled: next });
  },
  setEnabled: (value: boolean) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    }
    set({ enabled: value });
  },
}));
