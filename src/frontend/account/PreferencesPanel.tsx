import { useEffect, useMemo, useRef, useState } from "react";
import type { AccountPreferences } from "./accountTypes.js";
import type { DeviceOverrides } from "./deviceOverrides.js";
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
    (window as any).__accountCenterDirty = isFormDirty;
    return () => {
      (window as any).__accountCenterDirty = false;
    };
  }, [isFormDirty]);

  useEffect(() => {
    const target = previewElementRef.current;
    if (!target) return;

    const controller = createAppearancePreviewController(target, window);
    previewControllerRef.current = controller;
    controller.apply(preview);

    return () => {
      controller.dispose();
      previewControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    previewControllerRef.current?.apply(preview);
  }, [preview]);

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
              <option key={theme.id} value={theme.id}>{theme.id}</option>
            ))}
          </select>
        </label>
        <label>
          {t("account.appearance.mode")}
          <select
            value={draft.colorMode}
            onChange={(event) => setDraft({
              ...draft,
              colorMode: event.target.value as AccountPreferences["colorMode"],
            })}
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
              <option key={set.id} value={set.id}>{set.id}</option>
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
      <div ref={previewElementRef} className="account-preview">
        <strong>{t("account.appearance.livePreview")}</strong>
        <p>{t("account.appearance.previewText")}</p>
      </div>
      <button type="button" onClick={() => void onSave(draft)}>{t("account.appearance.saveBtn")}</button>
    </section>
  );
}
