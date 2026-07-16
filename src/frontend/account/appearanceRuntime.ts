import type { AccountPreferences } from "./accountTypes.js";
import type { DeviceOverrides } from "./deviceOverrides.js";
import {
  DEVICE_PREFERENCES_CHANGED_EVENT,
  readDeviceOverrides,
} from "./deviceOverrides.js";
import { createThemeController, type ThemeController } from "./themeRuntime.js";
import { getTypographySet } from "./typographyRegistry.js";

export type AppearancePreferences = Pick<
  AccountPreferences,
  | "themeId"
  | "colorMode"
  | "typographySetId"
  | "density"
  | "textScale"
  | "enhancedContrast"
  | "reducedMotion"
>;

const DEFAULT_APPEARANCE: AppearancePreferences = {
  themeId: "default",
  colorMode: "system",
  typographySetId: "cinzel-outfit",
  density: "comfortable",
  textScale: 1,
  enhancedContrast: false,
  reducedMotion: false,
};

let documentController: ThemeController | undefined;
let listeningForChanges = false;
let accountAppearance: AppearancePreferences = DEFAULT_APPEARANCE;
let deviceOverrides: DeviceOverrides = {};

function getDocumentController(): ThemeController {
  documentController ??= createThemeController(document.documentElement, window);
  return documentController;
}

function resolveAppearance(): AppearancePreferences {
  return {
    themeId: deviceOverrides.themeId ?? accountAppearance.themeId,
    colorMode: deviceOverrides.colorMode ?? accountAppearance.colorMode,
    typographySetId: deviceOverrides.typographySetId ?? accountAppearance.typographySetId,
    density: deviceOverrides.density ?? accountAppearance.density,
    textScale: deviceOverrides.textScale ?? accountAppearance.textScale,
    enhancedContrast: deviceOverrides.enhancedContrast ?? accountAppearance.enhancedContrast,
    reducedMotion: deviceOverrides.reducedMotion ?? accountAppearance.reducedMotion,
  };
}

function renderAppearance(): void {
  const appearance = resolveAppearance();
  getDocumentController().apply({
    themeId: appearance.themeId,
    colorMode: appearance.colorMode,
  });

  const root = document.documentElement;
  const typography = getTypographySet(appearance.typographySetId);
  root.style.setProperty("--font-display", typography.headingFamily);
  root.style.setProperty("--font-sans", typography.bodyFamily);
  root.style.setProperty("--font-mono", typography.monoFamily);
  root.style.setProperty("--account-text-scale", String(appearance.textScale));
  root.dataset.typography = typography.id;
  root.dataset.density = appearance.density;
  root.dataset.enhancedContrast = String(appearance.enhancedContrast);
  root.dataset.reducedMotion = String(appearance.reducedMotion);
}

function handleDevicePreferencesChanged(event: Event): void {
  applyDeviceAppearance((event as CustomEvent<DeviceOverrides>).detail);
}

function ensureChangeListener(): void {
  if (listeningForChanges) return;
  window.addEventListener(DEVICE_PREFERENCES_CHANGED_EVENT, handleDevicePreferencesChanged);
  listeningForChanges = true;
}

export function applyAccountAppearance(preferences: AppearancePreferences): void {
  accountAppearance = preferences;
  renderAppearance();
}

export function applyDeviceAppearance(overrides: DeviceOverrides): void {
  deviceOverrides = overrides;
  renderAppearance();
}

export function bootstrapDeviceAppearance(storage: Pick<Storage, "getItem"> = localStorage): void {
  ensureChangeListener();
  deviceOverrides = readDeviceOverrides(storage);
  renderAppearance();
}

export function disposeDeviceAppearance(): void {
  documentController?.dispose();
  documentController = undefined;
  accountAppearance = DEFAULT_APPEARANCE;
  deviceOverrides = {};
  if (listeningForChanges) {
    window.removeEventListener(DEVICE_PREFERENCES_CHANGED_EVENT, handleDevicePreferencesChanged);
    listeningForChanges = false;
  }
}
