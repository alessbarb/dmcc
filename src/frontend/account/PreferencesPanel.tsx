import { useEffect, useMemo, useRef, useState } from "react";
import type { AccountPreferences } from "./accountTypes.js";
import type { DeviceOverrides } from "./deviceOverrides.js";
import { applyAccountAppearance } from "./appearanceRuntime.js";
import {
  createAppearancePreviewController,
  type AppearancePreviewController,
} from "./appearancePreview.js";
import { themes } from "./themeRegistry.js";
import { typographySets } from "./typographyRegistry.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { isDirty } from "./accountState.js";

type Props = {
  preferences: AccountPreferences;
  deviceOverrides: DeviceOverrides;
  onSave(preferences: AccountPreferences): Promise<void>;
  onDeviceChange(overrides: DeviceOverrides): void;
};

const THEME_FALLBACK_LABELS: Record<string, string> = {
  default: "Default",
  fantasy: "Fantasy",
  "sci-fi": "Sci-fi",
};

function translatedLabel(
  translate: (key: string) => string,
  key: string,
  fallback: string,
): string {
  const translated = translate(key);
  return translated === key ? fallback : translated;
}

export function PreferencesPanel({
  preferences,
  deviceOverrides,
  onSave,
  onDeviceChange,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(preferences);
  const previewElementRef = useRef<HTMLDivElement | null>(null);
  const previewControllerRef = useRef<AppearancePreviewController | null>(null);
  const preview = useMemo(() => ({
    themeId: deviceOverrides.themeId ?? draft.themeId,
    colorMode: deviceOverrides.colorMode ?? draft.colorMode,
    typographySetId: deviceOverrides.typographySetId ?? draft.typographySetId,
  }), [deviceOverrides, draft]);

  const isFormDirty = isDirty(preferences, draft);

  useEffect(() => {
    setDraft(preferences);
    applyAccountAppearance(preferences);
  }, [preferences]);

  useEffect(() => {
    window.__accountCenterDirty = isFormDirty;
    return () => {
      window.__accountCenterDirty = false;
    };
  }, [isFormDirty]);

  useEffect(() => {
    const target = previewElementRef.current;
    if (!target) return;

    const controller = createAppearancePreviewController(target, window);
    previewControllerRef.current = controller;

    return () => {
      controller.dispose();
      previewControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    previewControllerRef.current?.apply(preview);
  }, [preview]);

  const savePreferences = async () => {
    await onSave(draft);
    applyAccountAppearance(draft);
  };

  return (
    <section aria-labelledby="appearance-title">
      <h2 id="appearance-title">{t("account.appearance.title")}</h2>
      <div className="account-form-grid">
        <label>
          {t("account.appearance.theme")}
          <select
            value={draft.themeId}
            onChange={(event) => setDraft({ ...draft, themeId: event.target.value })}
          >
            {[...themes.values()].map((theme) => (
              <option key={theme.id} value={theme.id}>
                {translatedLabel(t, theme.labelKey, THEME_FALLBACK_LABELS[theme.id] ?? theme.id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("account.appearance.mode")}
          <select
            value={draft.colorMode}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "system" || value === "light" || value === "dark") {
                setDraft({ ...draft, colorMode: value });
              }
            }}
          >
            <option value="system">{t("account.appearance.modeOptions.system")}</option>
            <option value="light">{t("account.appearance.modeOptions.light")}</option>
            <option value="dark">{t("account.appearance.modeOptions.dark")}</option>
          </select>
        </label>
        <label>
          {t("account.appearance.fontSet")}
          <select
            value={draft.typographySetId}
            onChange={(event) => setDraft({ ...draft, typographySetId: event.target.value })}
          >
            {[...typographySets.values()].map((set) => (
              <option key={set.id} value={set.id}>
                {translatedLabel(t, set.labelKey, set.id === "cinzel-outfit" ? "Cinzel + Outfit" : set.id)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="account-checkbox">
        <input
          type="checkbox"
          checked={Boolean(deviceOverrides.themeId)}
          onChange={(event) => onDeviceChange({
            ...deviceOverrides,
            themeId: event.target.checked ? draft.themeId : undefined,
          })}
        />
        {t("account.appearance.deviceOverride")}
      </label>
      <div
        ref={previewElementRef}
        className="account-preview"
        style={{
          padding: "1rem",
          border: "1px solid var(--theme-borders-default)",
          borderRadius: "var(--theme-shapes-radius-panel)",
          background: "var(--theme-surfaces-base)",
          color: "var(--theme-text-primary)",
          boxShadow: "var(--theme-shadows-medium)",
          fontFamily: "var(--font-sans)",
          fontSize: "calc(1rem * var(--typography-scale, 1))",
        }}
      >
        <strong style={{ fontFamily: "var(--font-display)" }}>
          {t("account.appearance.livePreview")}
        </strong>
        <p style={{ color: "var(--theme-text-secondary)" }}>
          {t("account.appearance.previewText")}
        </p>
      </div>
      <button type="button" onClick={() => void savePreferences()}>
        {t("account.appearance.saveBtn")}
      </button>
    </section>
  );
}
