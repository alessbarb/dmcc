import { useState } from "react";
import type {
  EditableSocialProfile,
  ProfileAudience,
  SocialField,
} from "./accountTypes.js";

const FIELDS: SocialField[] = [
  "displayName", "avatarUrl", "pronouns", "timeZone", "biography", "contact",
];

export function ProfileEditor({
  profile,
  allowedAudiences,
  onSave,
  onDiscard,
}: {
  profile: EditableSocialProfile;
  allowedAudiences: Record<SocialField, ProfileAudience[]>;
  onSave(profile: EditableSocialProfile): Promise<void>;
  onDiscard(): void;
}) {
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState("");
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setStatus("Saving…");
      void onSave(draft).then(() => setStatus("Saved")).catch((error) => {
        setStatus(error instanceof Error ? error.message : "Save failed");
      });
    }}>
      {FIELDS.map((field) => (
        <div className="account-profile-field" key={field}>
          <label>
            {field}
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
            Visible to
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
                <option value={audience} key={audience}>{audience}</option>
              ))}
            </select>
          </label>
        </div>
      ))}
      <label>
        Public handle
        <input
          value={draft.publicHandle ?? ""}
          onChange={(event) => setDraft({ ...draft, publicHandle: event.target.value })}
        />
      </label>
      <label>
        Publication
        <select
          value={draft.publicationState}
          onChange={(event) => setDraft({
            ...draft,
            publicationState: event.target.value as EditableSocialProfile["publicationState"],
          })}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="published">Published</option>
        </select>
      </label>
      <div>
        <button type="submit">Save profile</button>
        <button type="button" onClick={onDiscard}>Discard</button>
      </div>
      <p aria-live="polite">{status}</p>
    </form>
  );
}
