import { getTheme } from "./themeRegistry.js";
import { getTypographySet } from "./typographyRegistry.js";

const DEVICE_PREFERENCES_KEY = "dmcc.account.device-preferences.v1";
export const DEVICE_PREFERENCES_CHANGED_EVENT = "dmcc:device-preferences-changed";

export type DeviceOverrides = {
  themeId?: string;
  colorMode?: "system" | "light" | "dark";
  typographySetId?: string;
  density?: "comfortable" | "compact";
  textScale?: number;
  enhancedContrast?: boolean;
  reducedMotion?: boolean;
  interfaceSounds?: boolean;
};

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "setItem">;

export function readDeviceOverrides(storage: ReadStorage): DeviceOverrides {
  try {
    const parsed = JSON.parse(storage.getItem(DEVICE_PREFERENCES_KEY) ?? "{}");
    const result: DeviceOverrides = {};
    if (typeof parsed.themeId === "string") result.themeId = getTheme(parsed.themeId).id;
    if (["system", "light", "dark"].includes(parsed.colorMode)) result.colorMode = parsed.colorMode;
    if (typeof parsed.typographySetId === "string") {
      result.typographySetId = getTypographySet(parsed.typographySetId).id;
    }
    if (["comfortable", "compact"].includes(parsed.density)) result.density = parsed.density;
    if (typeof parsed.textScale === "number" && parsed.textScale >= 0.8 && parsed.textScale <= 1.5) {
      result.textScale = parsed.textScale;
    }
    for (const key of ["enhancedContrast", "reducedMotion", "interfaceSounds"] as const) {
      if (typeof parsed[key] === "boolean") result[key] = parsed[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function writeDeviceOverrides(storage: WriteStorage, value: DeviceOverrides): void {
  storage.setItem(DEVICE_PREFERENCES_KEY, JSON.stringify(value));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<DeviceOverrides>(DEVICE_PREFERENCES_CHANGED_EVENT, {
      detail: value,
    }));
  }
}
