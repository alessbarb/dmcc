import { useMemo, useState } from "react";
import type { AccountPreferences } from "./accountTypes.js";
import type { DeviceOverrides } from "./deviceOverrides.js";
import { themes } from "./themeRegistry.js";
import { typographySets } from "./typographyRegistry.js";

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
  const [draft, setDraft] = useState(preferences);
  const preview = useMemo(() => ({
    themeId: deviceOverrides.themeId ?? draft.themeId,
    colorMode: deviceOverrides.colorMode ?? draft.colorMode,
    typographySetId: deviceOverrides.typographySetId ?? draft.typographySetId,
  }), [deviceOverrides, draft]);

  return (
    <section aria-labelledby="appearance-title">
      <h2 id="appearance-title">Appearance and accessibility</h2>
      <div className="account-form-grid">
        <label>
          Theme
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
          Mode
          <select
            value={draft.colorMode}
            onChange={(event) => setDraft({
              ...draft,
              colorMode: event.target.value as AccountPreferences["colorMode"],
            })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Font set
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
        Use theme only on this device
      </label>
      <div className="account-preview" data-theme={preview.themeId} data-mode={preview.colorMode}>
        <strong>Live preview</strong>
        <p data-typography={preview.typographySetId}>Campaign notes remain readable and distinct.</p>
      </div>
      <button type="button" onClick={() => void onSave(draft)}>Save appearance</button>
    </section>
  );
}
