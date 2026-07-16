import type { DeviceOverrides } from "./deviceOverrides.js";
import {
  DEVICE_PREFERENCES_CHANGED_EVENT,
  readDeviceOverrides,
} from "./deviceOverrides.js";
import { createThemeController, type ThemeController } from "./themeRuntime.js";
import { getTypographySet } from "./typographyRegistry.js";

let documentController: ThemeController | undefined;
let listeningForChanges = false;

function getDocumentController(): ThemeController {
  documentController ??= createThemeController(document.documentElement, window);
  return documentController;
}

function handleDevicePreferencesChanged(event: Event): void {
  applyDeviceAppearance((event as CustomEvent<DeviceOverrides>).detail);
}

function ensureChangeListener(): void {
  if (listeningForChanges) return;
  window.addEventListener(DEVICE_PREFERENCES_CHANGED_EVENT, handleDevicePreferencesChanged);
  listeningForChanges = true;
}

export function applyDeviceAppearance(overrides: DeviceOverrides): void {
  getDocumentController().apply({
    themeId: overrides.themeId,
    colorMode: overrides.colorMode,
  });

  const root = document.documentElement;
  const typography = getTypographySet(overrides.typographySetId ?? "cinzel-outfit");
  root.style.setProperty("--font-display", typography.headingFamily);
  root.style.setProperty("--font-sans", typography.bodyFamily);
  root.style.setProperty("--font-mono", typography.monoFamily);
  root.dataset.typography = typography.id;
  root.dataset.density = overrides.density ?? "comfortable";
  root.dataset.enhancedContrast = String(Boolean(overrides.enhancedContrast));
  root.dataset.reducedMotion = String(Boolean(overrides.reducedMotion));

  if (typeof overrides.textScale === "number") {
    root.style.setProperty("--account-text-scale", String(overrides.textScale));
  } else {
    root.style.removeProperty("--account-text-scale");
  }
}

export function bootstrapDeviceAppearance(storage: Pick<Storage, "getItem"> = localStorage): void {
  ensureChangeListener();
  applyDeviceAppearance(readDeviceOverrides(storage));
}

export function disposeDeviceAppearance(): void {
  documentController?.dispose();
  documentController = undefined;
  if (listeningForChanges) {
    window.removeEventListener(DEVICE_PREFERENCES_CHANGED_EVENT, handleDevicePreferencesChanged);
    listeningForChanges = false;
  }
}
