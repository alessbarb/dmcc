import { useEffect, useState } from "react";
import { AccountNav, type AccountModuleId } from "./AccountNav.js";
import {
  fetchAccount,
  fetchPrivacyPreview,
  updateDmProfile,
  updateIdentity,
  updatePlayerProfile,
  updatePreferences,
  type PrivacyPreviews,
} from "./accountClient.js";
import type { AccountAggregate, EditableSocialProfile, ProfileAudience, SocialField } from "./accountTypes.js";
import { DataLifecyclePanel } from "./DataLifecyclePanel.js";
import { readDeviceOverrides, writeDeviceOverrides, type DeviceOverrides } from "./deviceOverrides.js";
import { NotificationsPanel } from "./NotificationsPanel.js";
import { PreferencesPanel } from "./PreferencesPanel.js";
import { PrivacyPreview } from "./PrivacyPreview.js";
import { ProfileEditor } from "./ProfileEditor.js";
import { SecurityPanel } from "./SecurityPanel.js";
import { IdentityEditor } from "./IdentityEditor.js";

const MODULE_IDS: AccountModuleId[] = [
  "account", "dm-profile", "player-profiles", "privacy",
  "appearance", "notifications", "security", "data",
];
const audiences = Object.fromEntries(
  ["displayName", "avatarUrl", "pronouns", "timeZone", "biography", "contact"].map(
    (field) => [field, ["private", "dm", "table", "global"] as ProfileAudience[]]
  )
) as Record<SocialField, ProfileAudience[]>;

export function AccountPage() {
  const [active, setActive] = useState<AccountModuleId>(MODULE_IDS[0]);
  const [aggregate, setAggregate] = useState<AccountAggregate | null>(null);
  const [device, setDevice] = useState<DeviceOverrides>(() => readDeviceOverrides(localStorage));
  const [previews, setPreviews] = useState<PrivacyPreviews | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchAccount().then(setAggregate).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to load account");
    });
  }, []);
  useEffect(() => {
    if (active !== "privacy" || !aggregate) return;
    const profile = aggregate.dmProfile;
    const playerProfile = aggregate.playerProfiles[0];
    if (!profile && !playerProfile) {
      setPreviews({ owner: null, dm: null, table: null, global: null });
      return;
    }
    void fetchPrivacyPreview(
      profile ? "dm" : "player",
      profile ? undefined : playerProfile?.campaignId
    ).then(setPreviews).catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Unable to load privacy preview");
    });
  }, [active, aggregate]);
  const setDeviceOverrides = (value: DeviceOverrides) => {
    setDevice(value);
    writeDeviceOverrides(localStorage, value);
  };

  return (
    <div className="account-center">
      <header><h1>Account and profiles</h1></header>
      <div className="account-layout">
        <AccountNav active={active} onSelect={setActive} />
        <main id={`account-module-${active}`} tabIndex={-1}>
          {error ? <p role="alert">{error}</p> : null}
          {!aggregate && !error ? <p>Loading…</p> : null}
          {aggregate && active === "account" ? (
            <IdentityEditor
              identity={aggregate.account}
              onSave={async (payload) => {
                const saved = await updateIdentity(payload);
                setAggregate({ ...aggregate, account: saved.account });
              }}
            />
          ) : null}
          {aggregate && active === "dm-profile" && aggregate.dmProfile ? (
            <ProfileEditor
              profile={aggregate.dmProfile}
              allowedAudiences={audiences}
              onSave={async (profile) => {
                const saved = await updateDmProfile(profile);
                setAggregate({ ...aggregate, dmProfile: saved });
              }}
              onDiscard={() => setActive("account")}
            />
          ) : null}
          {aggregate && active === "player-profiles" ? aggregate.playerProfiles.map((profile) => (
            <ProfileEditor
              key={profile.campaignId}
              profile={profile}
              allowedAudiences={audiences}
              onSave={async (draft: EditableSocialProfile) => {
                const saved = await updatePlayerProfile(profile.campaignId!, draft);
                setAggregate({
                  ...aggregate,
                  playerProfiles: aggregate.playerProfiles.map((item) =>
                    item.campaignId === saved.campaignId ? saved : item
                  ),
                });
              }}
              onDiscard={() => setActive("account")}
            />
          )) : null}
          {active === "privacy" && previews ? (
            <PrivacyPreview previews={previews} />
          ) : null}
          {aggregate && active === "appearance" ? (
            <PreferencesPanel
              preferences={aggregate.preferences}
              deviceOverrides={device}
              onDeviceChange={setDeviceOverrides}
              onSave={async (preferences) => {
                const saved = await updatePreferences(preferences);
                setAggregate({ ...aggregate, preferences: saved });
              }}
            />
          ) : null}
          {aggregate && active === "notifications" ? (
            <NotificationsPanel
              preferences={aggregate.preferences}
              onChange={(preferences) => setAggregate({ ...aggregate, preferences })}
            />
          ) : null}
          {active === "security" ? <SecurityPanel /> : null}
          {aggregate && active === "data" ? (
            <DataLifecyclePanel confirmationLabel={aggregate.account.email} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
