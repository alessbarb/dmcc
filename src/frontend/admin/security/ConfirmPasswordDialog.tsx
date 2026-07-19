import React, { useState } from "react";
import { Lock, X } from "lucide-react";

interface ConfirmPasswordDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: (currentPassword: string) => void;
  onCancel: () => void;
}

/**
 * Modal gate for critical, irreversible admin actions (manual purge, granting or
 * revoking platform admin, disabling an admin, revoking sessions). The password is
 * sent only in the body of the critical request itself and is never persisted here.
 */
export function ConfirmPasswordDialog({
  title,
  description,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmPasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="confirm-password-overlay"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="confirm-password-dialog"
      >
        <div className="confirm-password-header">
          <div className="confirm-password-title-row">
            <Lock className="confirm-password-lock" size={18} />
            <h3 className="confirm-password-title">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="confirm-password-close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="confirm-password-description">{description}</p>

        <label className="confirm-password-label">
          Current password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="confirm-password-input"
          />
        </label>

        <div className="confirm-password-actions">
          <button
            type="button"
            onClick={onCancel}
            className="confirm-password-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || busy}
            className="confirm-password-submit"
          >
            {busy ? "Confirming..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
