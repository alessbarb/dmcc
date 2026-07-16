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
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "var(--theme-surfaces-base)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Lock size={18} style={{ color: "var(--red)" }} />
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--theme-text-secondary)", padding: "4px" }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--theme-text-secondary)" }}>{description}</p>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "var(--theme-text-secondary)" }}>
          Current password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(0,0,0,0.2)",
              border: "1px solid var(--border)",
              color: "inherit",
              fontSize: "0.85rem",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              color: "inherit",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || busy}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--red)",
              color: "#fff",
              border: "none",
              cursor: password && !busy ? "pointer" : "not-allowed",
              opacity: password && !busy ? 1 : 0.6,
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {busy ? "Confirming..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
