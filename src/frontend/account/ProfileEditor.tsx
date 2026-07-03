import { useEffect, useMemo, useState } from "react";
import type {
  EditableSocialProfile,
  ProfileAudience,
  SocialField,
} from "./accountTypes.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { isDirty } from "./accountState.js";

const FIELDS: SocialField[] = [
  "displayName", "avatarUrl", "pronouns", "timeZone", "biography", "contact",
];

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
    (window as any).__accountCenterDirty = isFormDirty;
    return () => {
      (window as any).__accountCenterDirty = false;
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
          <span className="account-role-pill">{profileType === "dm" ? "DM profile" : "Player profile"}</span>
          <h3>{draft.displayName || (profileType === "dm" ? "Unnamed DM" : "Unnamed player")}</h3>
          <p>
            {profileType === "dm"
              ? "This is your reusable public-facing DM identity."
              : `This identity is only used for ${contextLabel || "this campaign"}.`}
          </p>
        </div>
        <div className="account-helper-card muted">
          <h3>Visibility snapshot</h3>
          <ul className="account-bullet-list compact">
            <li>{visibleSummary} profile fields visible beyond private mode.</li>
            <li>Publication: <strong>{draft.publicationState}</strong></li>
            <li>Handle: <strong>{draft.publicHandle || "—"}</strong></li>
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
                {t(`account.profile.${field}` as any)}
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
                  onChange={(event) => setDraft({
                    ...draft,
                    visibility: {
                      ...draft.visibility,
                      [field]: event.target.value as ProfileAudience,
                    },
                  })}
                >
                  {allowedAudiences[field].map((audience) => (
                    <option value={audience} key={audience}>
                      {t(`account.profile.audiences.${audience}` as any)}
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
              onChange={(event) => setDraft({
                ...draft,
                publicationState: event.target.value as EditableSocialProfile["publicationState"],
              })}
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
