import { useEffect, useMemo, useState } from "react";
import type { AccountAggregate } from "./accountTypes.js";
import { useTranslation } from "../shared/i18n/useTranslation.js";
import { ImagePickerButton } from "../shared/components/ImagePickerButton.js";

type PrivateIdentity = AccountAggregate["account"];

function getInitials(name?: string, email?: string) {
  const source = (name?.trim() || email?.trim() || "U").replace(/\s+/g, " ");
  const words = source.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
}

export function IdentityEditor({
  identity,
  onSave,
}: {
  identity: PrivateIdentity;
  onSave(payload: Record<string, unknown>): Promise<void>;
}) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(identity.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl ?? "");
  const [email, setEmail] = useState(identity.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState("");
  const emailChanged = email.trim().toLowerCase() !== identity.email.toLowerCase();

  const isFormDirty =
    displayName !== (identity.displayName ?? "") ||
    avatarUrl !== (identity.avatarUrl ?? "") ||
    emailChanged;

  useEffect(() => {
    window.__accountCenterDirty = isFormDirty;
    return () => {
      window.__accountCenterDirty = false;
    };
  }, [isFormDirty]);

  const previewName = useMemo(() => displayName.trim() || identity.displayName || "Unnamed user", [displayName, identity.displayName]);
  const previewEmail = email.trim() || identity.email;

  return (
    <section aria-labelledby="private-identity-title" className="account-section-stack">
      <div className="account-split-hero">
        <div className="account-profile-preview-card">
          <div className="account-avatar-shell large">
            {avatarUrl ? (
              <img src={avatarUrl} alt={previewName} className="account-avatar-image" />
            ) : (
              <span className="account-avatar-fallback">{getInitials(previewName, previewEmail)}</span>
            )}
          </div>
          <div className="account-profile-preview-copy">
            <span className="account-role-pill">Private account</span>
            <h2 id="private-identity-title">{previewName}</h2>
            <p>{previewEmail}</p>
            <small>{t("account.identity.subtitle")}</small>
          </div>
        </div>

        <div className="account-helper-card">
          <h3>What lives here</h3>
          <ul className="account-bullet-list">
            <li>Your sign-in email and display name.</li>
            <li>Your private avatar — reused as the base for DM and player profiles.</li>
            <li>Email changes require your current password.</li>
          </ul>
        </div>
      </div>

      <form
        className="account-form-grid account-form-card"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus(t("account.identity.saving"));
          void onSave({
            displayName,
            avatarUrl,
            email,
            ...(emailChanged ? { currentPassword } : {}),
          }).then(() => {
            setCurrentPassword("");
            setStatus(t("account.identity.saved"));
          }).catch((cause) => {
            setStatus(cause instanceof Error ? cause.message : t("account.identity.saveFailed"));
          });
        }}
      >
        <label>
          {t("account.identity.displayName")}
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <div className="form-group">
          <label className="form-label">{t("account.identity.avatarUrl")}</label>
          <ImagePickerButton
            value={avatarUrl}
            onChange={setAvatarUrl}
            catalog="avatars"
            defaultImage="/assets/avatars/default-avatar.webp"
            shape="circle"
          />
        </div>
        <label className="account-field-span-2">
          {t("account.identity.email")}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {emailChanged ? (
          <label className="account-field-span-2">
            {t("account.identity.currentPassword")}
            <input
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
        ) : null}
        <div className="account-form-actions account-field-span-2">
          <button type="submit">{t("account.identity.saveBtn")}</button>
        </div>
      </form>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
