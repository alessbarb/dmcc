import { useState } from "react";
import type { AccountAggregate } from "./accountTypes.js";

type PrivateIdentity = AccountAggregate["account"];

export function IdentityEditor({
  identity,
  onSave,
}: {
  identity: PrivateIdentity;
  onSave(payload: Record<string, unknown>): Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(identity.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl ?? "");
  const [email, setEmail] = useState(identity.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState("");
  const emailChanged = email.trim().toLowerCase() !== identity.email.toLowerCase();

  return (
    <section aria-labelledby="private-identity-title">
      <h2 id="private-identity-title">Private identity</h2>
      <p>Your email and password are never part of a public or campaign profile.</p>
      <form
        className="account-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("Saving…");
          void onSave({
            displayName,
            avatarUrl,
            email,
            ...(emailChanged ? { currentPassword } : {}),
          }).then(() => {
            setCurrentPassword("");
            setStatus("Saved");
          }).catch((cause) => {
            setStatus(cause instanceof Error ? cause.message : "Save failed");
          });
        }}
      >
        <label>
          Display name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label>
          Avatar URL
          <input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {emailChanged ? (
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </label>
        ) : null}
        <div>
          <button type="submit">Save identity</button>
        </div>
      </form>
      <p aria-live="polite">{status}</p>
    </section>
  );
}
