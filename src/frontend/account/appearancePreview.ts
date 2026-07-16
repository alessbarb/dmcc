import { getTypographySet } from "./typographyRegistry.js";
import {
  createThemeController,
  type ColorModePreference,
  type ThemeApplicationTarget,
  type ThemeController,
  type ThemeRuntimeEnvironment,
} from "./themeRuntime.js";

export type AppearancePreviewSelection = {
  themeId: string;
  colorMode: ColorModePreference;
  typographySetId: string;
};

export type AppearancePreviewController = {
  apply(selection: AppearancePreviewSelection): void;
  dispose(): void;
};

export function createAppearancePreviewController(
  target: ThemeApplicationTarget,
  environment: ThemeRuntimeEnvironment,
): AppearancePreviewController {
  const themeController: ThemeController = createThemeController(target, environment);

  return {
    apply(selection) {
      themeController.apply({
        themeId: selection.themeId,
        colorMode: selection.colorMode,
      });

      const typography = getTypographySet(selection.typographySetId);
      target.style.setProperty("--font-display", typography.headingFamily);
      target.style.setProperty("--font-sans", typography.bodyFamily);
      target.style.setProperty("--font-mono", typography.monoFamily);
      target.style.setProperty("--typography-scale", String(typography.scale));
      target.setAttribute("data-typography", typography.id);
    },
    dispose() {
      themeController.dispose();
    },
  };
}
