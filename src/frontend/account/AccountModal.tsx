import { useCallback, useEffect } from "react";
import { AccountPage } from "./AccountPage.js";

type AccountModalProps = {
  open: boolean;
  onClose(): void;
};

export function AccountModal({ open, onClose }: AccountModalProps) {
  const requestClose = useCallback(() => {
    if (Boolean((window as any).__accountCenterDirty)) {
      const discard = window.confirm("There are unsaved changes in your account. Close anyway?");
      if (!discard) return;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <div className="account-modal-backdrop" role="presentation" onMouseDown={requestClose}>
      <section
        className="account-modal-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Account management"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AccountPage surface="modal" onRequestClose={requestClose} />
      </section>
    </div>
  );
}
