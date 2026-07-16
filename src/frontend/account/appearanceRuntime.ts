import type { DeviceOverrides } from "./deviceOverrides.js";
import { readDeviceOverrides } from "./deviceOverrides.js";
import { createThemeController, type ThemeController } from "./themeRuntime.js";

let documentController: ThemeController | undefined;

function getDocumentController(): ThemeController {
  documentController ??= createThemeController(document.documentElement, window);
  return documentController;
}

export function applyDeviceAppearance(overrides: DeviceOverrides): void {
  getDocumentController().apply({
    themeId: overrides.themeId,
    colorMode: overrides.colorMode,
  });

  const root = document.documentElement;
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
  applyDeviceAppearance(readDeviceOverrides(storage));
}

export function disposeDeviceAppearance(): void {
  documentController?.dispose();
  documentController = undefined;
}
