import { useState, useCallback } from "react";

export type ToastKind = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = `toast_${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
