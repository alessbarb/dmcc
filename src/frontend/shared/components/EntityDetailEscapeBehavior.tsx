import { useEffect } from "react";

const ENTITY_DIALOG_SELECTOR =
  ".modal-overlay:has(> .modal-content > div:first-child > img)";

export function EntityDetailEscapeBehavior() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;

      const overlays = Array.from(
        document.querySelectorAll<HTMLElement>(".modal-overlay"),
      );
      const topmostOverlay = overlays.at(-1);

      if (!topmostOverlay?.matches(ENTITY_DIALOG_SELECTOR)) return;

      const closeButton = topmostOverlay.querySelector<HTMLButtonElement>(
        ":scope > .modal-content > .modal-header > button:last-child",
      );
      if (!closeButton) return;

      event.preventDefault();
      closeButton.click();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
