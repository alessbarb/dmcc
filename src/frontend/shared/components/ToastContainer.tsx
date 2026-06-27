import React from "react";
import type { Toast } from "../hooks/useToast.js";

const kindStyles: Record<string, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "var(--primary)",
};

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: 9999,
      maxWidth: "360px",
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          style={{
            background: "var(--bg-card)",
            border: `1px solid ${kindStyles[t.kind]}`,
            borderLeft: `4px solid ${kindStyles[t.kind]}`,
            borderRadius: "var(--radius-sm)",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "0.875rem",
            color: "var(--text-main)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
