import { useEffect, useMemo, useState } from "react";
import type {
  EditableSocialProfile,
  ProfileAudience,
  PublicationState,
  SocialField,
} from "./accountTypes.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { isDirty } from "./accountState.js";

const FIELDS: SocialField[] = [
  "displayName", "avatarUrl", "pronouns", "timeZone", "biography", "contact",
];

const PROFILE_AUDIENCES: readonly ProfileAudience[] = ["private", "dm", "table", "global"];
function isProfileAudience(value: string): value is ProfileAudience {
  return (PROFILE_AUDIENCES as readonly string[]).includes(value);
}

const PUBLICATION_STATES: readonly PublicationState[] = ["private", "unlisted", "published"];
function isPublicationState(value: string): value is PublicationState {
  return (PUBLICATION_STATES as readonly string[]).includes(value);
}

declare global {
  interface Window {
    __accountCenterDirty?: boolean;
  }
}

export function ProfileEditor({
  profile,
  allowedAudiences,
  onSave,
  onDiscard,
  profileType = "player",
  contextLabel,
}: {
  profile: EditableSocialProfile;
  allowedAudiences: Record<SocialField, ProfileAudience[]>;
  onSave(profile: EditableSocialProfile): Promise<void>;
  onDiscard(): void;
  profileType?: "dm" | "player";
  contextLabel?: string;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState("");

  const isFormDirty = isDirty(profile, draft);

  useEffect(() => {
    window.__accountCenterDirty = isFormDirty;
    return () => {
      window.__accountCenterDirty = false;
    };
  }, [isFormDirty]);

  const visibleSummary = useMemo(
    () => FIELDS.filter((field) => draft.visibility[field] !== "private").length,
    [draft]
  );

  return (
    <section className="account-section-stack">
      <div className="account-split-hero">
        <div className="account-helper-card">
          <span className="account-role-pill">{profileType === "dm" ? t("account.profile.dmPill") : t("account.profile.playerPill")}</span>
          <h3>{draft.displayName || (profileType === "dm" ? t("account.profile.unnamedDm") : t("account.profile.unnamedPlayer"))}</h3>
          <p>
            {profileType === "dm"
              ? t("account.profile.dmDescription")
              : t("account.profile.playerDescription", { context: contextLabel || t("account.profile.defaultContext") })}
          </p>
        </div>
        <div className="account-helper-card muted">
          <h3>{t("account.profile.visibility.title")}</h3>
          <ul className="account-bullet-list compact">
            <li>{t("account.profile.visibility.fieldsVisible", { count: String(visibleSummary) })}</li>
            <li>{t("account.profile.publication")}: <strong>{t(`account.profile.publicationOptions.${draft.publicationState}`)}</strong></li>
            <li>{t("account.profile.publicHandle")}: <strong>{draft.publicHandle || t("account.profile.visibility.none")}</strong></li>
          </ul>
        </div>
      </div>

      <form
        className="account-profile-editor"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus(t("account.profile.saving"));
          void onSave(draft).then(() => setStatus(t("account.profile.saved"))).catch((error) => {
            setStatus(error instanceof Error ? error.message : t("account.profile.saveFailed"));
          });
        }}
      >
        <div className="account-profile-grid">
          {FIELDS.map((field) => (
            <div className="account-profile-field" key={field}>
              <label>
                {t(`account.profile.${field}`)}
                {field === "biography" ? (
                  <textarea
                    value={draft[field] ?? ""}
                    onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                  />
                ) : (
                  <input
                    value={draft[field] ?? ""}
                    onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                  />
                )}
              </label>
              <label>
                {t("account.profile.visibleTo")}
                <select
                  value={draft.visibility[field]}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (!isProfileAudience(value)) return;
                    setDraft({
                      ...draft,
                      visibility: {
                        ...draft.visibility,
                        [field]: value,
                      },
                    });
                  }}
                >
                  {allowedAudiences[field].map((audience) => (
                    <option value={audience} key={audience}>
                      {t(`account.profile.audiences.${audience}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="account-profile-footer-grid">
          <label>
            {t("account.profile.publicHandle")}
            <input
              value={draft.publicHandle ?? ""}
              onChange={(event) => setDraft({ ...draft, publicHandle: event.target.value })}
            />
          </label>
          <label>
            {t("account.profile.publication")}
            <select
              value={draft.publicationState}
              onChange={(event) => {
                const { value } = event.target;
                if (!isPublicationState(value)) return;
                setDraft({ ...draft, publicationState: value });
              }}
            >
              <option value="private">{t("account.profile.publicationOptions.private")}</option>
              <option value="unlisted">{t("account.profile.publicationOptions.unlisted")}</option>
              <option value="published">{t("account.profile.publicationOptions.published")}</option>
            </select>
          </label>
        </div>

        <div className="account-form-actions">
          <button type="submit">{t("account.profile.saveBtn")}</button>
          <button type="button" className="btn-secondary" onClick={onDiscard}>{t("account.profile.discardBtn")}</button>
        </div>
        <p aria-live="polite">{status}</p>
      </form>
    </section>
  );
}
