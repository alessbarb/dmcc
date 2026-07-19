import type { CSSProperties } from "react";
import type { Toast } from "../hooks/useToast.js";

const kindStyles: Record<string, string> = {
  success: "var(--theme-feedback-success-foreground)",
  error: "var(--theme-feedback-danger-foreground)",
  warning: "var(--theme-feedback-warning-foreground)",
  info: "var(--theme-accents-primary-foreground)",
};

interface Props {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          className="toast"
          style={{ "--toast-accent": kindStyles[t.kind] } as CSSProperties}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
