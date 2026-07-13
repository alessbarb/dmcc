import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBlocker } from "@tanstack/react-router";
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
import { useTranslation } from "../shared/i18n/useTranslation.js";

declare global {
  interface Window {
    __accountCenterDirty?: boolean;
  }
}

const MODULE_IDS: AccountModuleId[] = [
  "account", "dm-profile", "player-profiles", "privacy",
  "appearance", "notifications", "security", "data",
];

const ALL_AUDIENCES: ProfileAudience[] = ["private", "dm", "table", "global"];

const audiences: Record<SocialField, ProfileAudience[]> = {
  displayName: ALL_AUDIENCES,
  avatarUrl: ALL_AUDIENCES,
  pronouns: ALL_AUDIENCES,
  timeZone: ALL_AUDIENCES,
  biography: ALL_AUDIENCES,
  contact: ALL_AUDIENCES,
};

const MODULE_DESCRIPTIONS: Record<AccountModuleId, string> = {
  account: "Private identity, sign-in email and your base account details.",
  "dm-profile": "How you appear when acting as DM across campaigns.",
  "player-profiles": "Per-campaign player profiles, one identity for each table you join.",
  privacy: "Preview what each audience can actually see.",
  appearance: "Theme, typography and accessibility preferences for this workspace.",
  notifications: "Internal alerts and campaign-related signal preferences.",
  security: "Password, recovery codes and active sessions.",
  data: "Export or permanently remove your personal account data.",
};

function getInitials(name?: string, email?: string) {
  const source = (name?.trim() || email?.trim() || "U").replace(/\s+/g, " ");
  const words = source.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}

function getRoleSummary(aggregate: AccountAggregate) {
  const activeMemberships = aggregate.memberships.filter((membership) => !membership.revokedAt);
  const dmCount = activeMemberships.filter((membership) => membership.role === "dm").length;
  const playerCount = activeMemberships.filter((membership) => membership.role === "player").length;
  if (dmCount > 0 && playerCount > 0) return "DM · Player";
  if (dmCount > 0) return "DM";
  if (playerCount > 0) return "Player";
  return "Member";
}

export type AccountPageProps = {
  surface?: "page" | "modal";
  onRequestClose?: () => void;
};

export function AccountPage({ surface = "page", onRequestClose }: AccountPageProps = {}) {
  const { t } = useTranslation();
  useBlocker({
    shouldBlockFn: () => {
      if (surface === "modal") return false;
      const isDirty = Boolean(window.__accountCenterDirty);
      if (isDirty) {
        return !window.confirm(t("account.confirmDiscard"));
      }
      return false;
    },
  });

  const [active, setActive] = useState<AccountModuleId>(MODULE_IDS[0]);
  const [aggregate, setAggregate] = useState<AccountAggregate | null>(null);
  const [device, setDevice] = useState<DeviceOverrides>(() => readDeviceOverrides(localStorage));
  const [previews, setPreviews] = useState<PrivacyPreviews | null>(null);
  const [error, setError] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  useEffect(() => {
    setEditingCampaignId(null);
  }, [active]);

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

  const activeMemberships = aggregate
    ? aggregate.memberships.filter(
        (m) => m.role === "player" && !m.revokedAt && m.campaignStatus !== "archived" && m.campaignStatus !== "deleted"
      )
    : [];

  const archivedMemberships = aggregate
    ? aggregate.memberships.filter(
        (m) => m.role === "player" && (Boolean(m.revokedAt) || m.campaignStatus === "archived" || m.campaignStatus === "deleted")
      )
    : [];

  const dmMemberships = aggregate
    ? aggregate.memberships.filter(
        (m) => m.role === "dm" && !m.revokedAt && m.campaignStatus !== "archived" && m.campaignStatus !== "deleted"
      )
    : [];

  const stats = useMemo(() => {
    if (!aggregate) return [] as Array<{ label: string; value: string }>;
    return [
      { label: "DM campaigns", value: String(dmMemberships.length) },
      { label: "Player campaigns", value: String(activeMemberships.length) },
      { label: "Player profiles", value: String(aggregate.playerProfiles.length) },
      { label: "Archived links", value: String(archivedMemberships.length) },
    ];
  }, [aggregate, dmMemberships.length, activeMemberships.length, archivedMemberships.length]);

  const moduleTitle = useMemo(() => {
    const labels: Record<AccountModuleId, string> = {
      account: t("account.nav.account"),
      "dm-profile": t("account.nav.dmProfile"),
      "player-profiles": t("account.nav.playerProfiles"),
      privacy: t("account.nav.privacy"),
      appearance: t("account.nav.appearance"),
      notifications: t("account.nav.notifications"),
      security: t("account.nav.security"),
      data: t("account.nav.data"),
    };
    return labels[active];
  }, [active, t]);

  return (
    <div className={`account-center ${surface === "modal" ? "account-center--modal" : ""}`}>
      <header className="account-page-header">
        <div>
          <p className="account-page-eyebrow">DM Campaign Companion</p>
          <h1>{t("account.title")}</h1>
          <p className="account-page-subtitle">
            A single account for your private identity, your DM presence and your player-facing profiles.
          </p>
        </div>
        <div className="account-header-actions">
          {aggregate ? (
            <>
              <button type="button" className="btn-secondary" onClick={() => setActive("security")}>Security</button>
              <button type="button" className="btn-secondary" onClick={() => setActive("data")}>Your data</button>
            </>
          ) : null}
          {surface === "modal" && onRequestClose ? (
            <button
              type="button"
              className="account-modal-close"
              onClick={onRequestClose}
              aria-label="Close account management"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </header>

      {aggregate ? (
        <section className="account-overview-card" aria-label="Account overview">
          <div className="account-overview-identity">
            <div className="account-avatar-shell">
              {aggregate.account.avatarUrl ? (
                <img src={aggregate.account.avatarUrl} alt={aggregate.account.displayName || aggregate.account.email} className="account-avatar-image" />
              ) : (
                <span className="account-avatar-fallback">{getInitials(aggregate.account.displayName, aggregate.account.email)}</span>
              )}
            </div>
            <div className="account-overview-copy">
              <div className="account-overview-row">
                <h2>{aggregate.account.displayName || aggregate.account.email}</h2>
                <span className="account-role-pill">{getRoleSummary(aggregate)}</span>
              </div>
              <p>{aggregate.account.email}</p>
              <div className="account-quick-links">
                <button type="button" className="account-quick-link" onClick={() => setActive("account")}>Private identity</button>
                <button type="button" className="account-quick-link" onClick={() => setActive("dm-profile")}>DM profile</button>
                <button type="button" className="account-quick-link" onClick={() => setActive("player-profiles")}>Player profiles</button>
                <button type="button" className="account-quick-link" onClick={() => setActive("privacy")}>Privacy preview</button>
              </div>
            </div>
          </div>
          <div className="account-stat-grid">
            {stats.map((item) => (
              <div key={item.label} className="account-stat-card">
                <span className="account-stat-value">{item.value}</span>
                <span className="account-stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="account-layout">
        <aside className="account-sidebar">
          <AccountNav
            active={active}
            onSelect={(id) => {
              if (window.__accountCenterDirty) {
                if (!window.confirm(t("account.confirmDiscard"))) {
                  return;
                }
              }
              setActive(id);
            }}
          />
          {aggregate ? (
            <section className="account-sidebar-card" aria-label="Membership summary">
              <h3>Current footprint</h3>
              <ul className="account-mini-list">
                <li><span>DM campaigns</span><strong>{dmMemberships.length}</strong></li>
                <li><span>Player campaigns</span><strong>{activeMemberships.length}</strong></li>
                <li><span>Archived / revoked</span><strong>{archivedMemberships.length}</strong></li>
                <li><span>DM profile</span><strong>{aggregate.dmProfile ? "Ready" : "Pending"}</strong></li>
              </ul>
            </section>
          ) : null}
        </aside>

        <main id={`account-module-${active}`} tabIndex={-1} className="account-main-shell">
          <div className="account-module-header">
            <div>
              <p className="account-module-eyebrow">Settings module</p>
              <h2>{moduleTitle}</h2>
              <p>{MODULE_DESCRIPTIONS[active]}</p>
            </div>
          </div>

          {error ? <p role="alert">{error}</p> : null}
          {!aggregate && !error ? <p>{t("account.loading")}</p> : null}

          {aggregate && active === "account" ? (
            <IdentityEditor
              identity={aggregate.account}
              onSave={async (payload) => {
                const saved = await updateIdentity(payload);
                setAggregate({ ...aggregate, account: saved.account });
              }}
            />
          ) : null}

          {aggregate && active === "dm-profile" ? (
            aggregate.dmProfile ? (
              <ProfileEditor
                profile={aggregate.dmProfile}
                allowedAudiences={audiences}
                profileType="dm"
                onSave={async (profile) => {
                  const saved = await updateDmProfile(profile);
                  setAggregate({ ...aggregate, dmProfile: saved });
                }}
                onDiscard={() => setActive("account")}
              />
            ) : (
              <div className="account-empty-state">
                <p>Prepare your public-facing DM profile before receiving a DM membership.</p>
                <button
                  type="button"
                  onClick={() => {
                    const defaultDmProfile: EditableSocialProfile = {
                      displayName: aggregate.account.displayName || "DM",
                      avatarUrl: "",
                      pronouns: "",
                      timeZone: "",
                      biography: "",
                      contact: "",
                      visibility: {
                        displayName: "global",
                        avatarUrl: "global",
                        pronouns: "global",
                        timeZone: "global",
                        biography: "global",
                        contact: "global",
                      },
                      publicationState: "private",
                      version: 0,
                    };
                    setAggregate({
                      ...aggregate,
                      dmProfile: defaultDmProfile,
                    });
                  }}
                >
                  Create DM Profile
                </button>
              </div>
            )
          ) : null}

          {aggregate && active === "player-profiles" ? (
            editingCampaignId ? (
              <div className="account-campaign-edit">
                <div className="account-editor-header">
                  <button type="button" className="btn-secondary" onClick={() => setEditingCampaignId(null)}>
                    &larr; {t("account.profile.backToList")}
                  </button>
                </div>
                <ProfileEditor
                  profile={
                    aggregate.playerProfiles.find(p => p.campaignId === editingCampaignId) || {
                      campaignId: editingCampaignId,
                      playerId: aggregate.memberships.find(m => m.campaignId === editingCampaignId)?.playerId || "",
                      displayName: aggregate.account.displayName || "Player",
                      avatarUrl: "",
                      pronouns: "",
                      timeZone: "",
                      biography: "",
                      contact: "",
                      visibility: {
                        displayName: "table",
                        avatarUrl: "table",
                        pronouns: "table",
                        timeZone: "table",
                        biography: "table",
                        contact: "dm",
                      },
                      publicationState: "private",
                      version: 0,
                    }
                  }
                  allowedAudiences={audiences}
                  profileType="player"
                  contextLabel={aggregate.memberships.find(m => m.campaignId === editingCampaignId)?.campaignTitle || editingCampaignId}
                  onSave={async (draft: EditableSocialProfile) => {
                    const saved = await updatePlayerProfile(editingCampaignId, draft);
                    setAggregate({
                      ...aggregate,
                      playerProfiles: aggregate.playerProfiles.some(p => p.campaignId === editingCampaignId)
                        ? aggregate.playerProfiles.map((item) => item.campaignId === saved.campaignId ? saved : item)
                        : [...aggregate.playerProfiles, saved],
                    });
                    setEditingCampaignId(null);
                  }}
                  onDiscard={() => setEditingCampaignId(null)}
                />
              </div>
            ) : (
              <div className="account-campaigns-list">
                <h3>{t("account.profile.activeTitle")}</h3>
                {activeMemberships.length === 0 ? (
                  <p>{t("account.profile.noActive")}</p>
                ) : (
                  <ul className="account-card-list">
                    {activeMemberships.map((membership) => {
                      const profile = aggregate.playerProfiles.find(p => p.campaignId === membership.campaignId);
                      return (
                        <li key={membership.campaignId} className="account-card">
                          <div className="account-card-info">
                            <div className="account-card-topline">
                              <strong>{membership.campaignTitle || membership.campaignId}</strong>
                              <span className={`account-card-badge ${profile ? "ready" : "pending"}`}>{profile ? "Profile ready" : "Profile missing"}</span>
                            </div>
                            {profile ? (
                              <span className="account-card-meta">
                                {profile.displayName} {profile.pronouns ? `(${profile.pronouns})` : ""}
                              </span>
                            ) : (
                              <span className="account-card-meta italic">No profile created</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingCampaignId(membership.campaignId)}
                          >
                            {profile ? t("account.profile.editBtn") : t("account.profile.createBtn")}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {archivedMemberships.length > 0 ? (
                  <div className="account-archived-section">
                    <h3>{t("account.profile.archivedSection")}</h3>
                    <ul className="account-card-list archived">
                      {archivedMemberships.map((membership) => {
                        const profile = aggregate.playerProfiles.find(p => p.campaignId === membership.campaignId);
                        const statusLabel = membership.revokedAt
                          ? t("account.profile.revoked")
                          : t("account.profile.archived");
                        return (
                          <li key={membership.campaignId} className="account-card archived">
                            <div className="account-card-info">
                              <div className="account-card-topline">
                                <strong>{membership.campaignTitle || membership.campaignId}</strong>
                                <span className="account-card-badge danger">{statusLabel}</span>
                              </div>
                              {profile ? (
                                <span className="account-card-meta text-muted">
                                  {profile.displayName} {profile.pronouns ? `(${profile.pronouns})` : ""}
                                </span>
                              ) : null}
                            </div>
                            {profile ? (
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setEditingCampaignId(membership.campaignId)}
                              >
                                {t("account.profile.editBtn")}
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          ) : null}

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
              memberships={aggregate.memberships}
              onSave={async (preferences) => {
                const saved = await updatePreferences(preferences);
                setAggregate({ ...aggregate, preferences: saved });
              }}
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
