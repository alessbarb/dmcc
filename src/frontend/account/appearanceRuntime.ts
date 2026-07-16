import { fetchAccount } from "./accountClient.js";
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

export function resolveAppearancePreferences(
  account: AppearancePreferences,
  overrides: DeviceOverrides,
): AppearancePreferences {
  return {
    themeId: overrides.themeId ?? account.themeId,
    colorMode: overrides.colorMode ?? account.colorMode,
    typographySetId: overrides.typographySetId ?? account.typographySetId,
    density: overrides.density ?? account.density,
    textScale: overrides.textScale ?? account.textScale,
    enhancedContrast: overrides.enhancedContrast ?? account.enhancedContrast,
    reducedMotion: overrides.reducedMotion ?? account.reducedMotion,
  };
}

function renderAppearance(): void {
  const appearance = resolveAppearancePreferences(accountAppearance, deviceOverrides);
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

function applyDeviceAppearance(overrides: DeviceOverrides): void {
  deviceOverrides = overrides;
  renderAppearance();
}

export function bootstrapDeviceAppearance(storage: Pick<Storage, "getItem"> = localStorage): void {
  ensureChangeListener();
  deviceOverrides = readDeviceOverrides(storage);
  renderAppearance();
}

export async function hydrateAccountAppearance(): Promise<void> {
  try {
    const aggregate = await fetchAccount();
    applyAccountAppearance(aggregate.preferences);
  } catch {
    // Public and signed-out routes intentionally keep the bootstrapped local appearance.
  }
}
