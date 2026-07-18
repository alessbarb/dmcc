import { useEffect, useRef } from "react";

export type ShortcutHandler = () => void;
export type ShortcutMap = Record<string, ShortcutHandler>;

/**
 * Creates a stateful keydown handler for the given shortcuts map.
 * Exported for unit-testing purposes (tests can call the returned handler
 * directly with fake KeyboardEvents without needing a DOM / renderHook).
 */
interface ElementLike extends EventTarget {
  tagName: string;
  isContentEditable: boolean;
}

function isElementLike(value: EventTarget | null): value is ElementLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "tagName" in value &&
    typeof value.tagName === "string"
  );
}

export function createKeyHandler(shortcutsRef: { current: ShortcutMap }) {
  let pendingKey: string | null = null;
  let pendingTimer: ReturnType<typeof setTimeout> | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = isElementLike(e.target) ? e.target : null;
    // Ignore when typing in an input, textarea, select, or contenteditable
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    )
      return;
    // Ignore modifier combos
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.toLowerCase();

    if (!pendingKey) {
      // Single-key shortcut
      if (shortcutsRef.current[key]) {
        e.preventDefault();
        shortcutsRef.current[key]();
        return;
      }
      // Start of a chord (only "g" for now)
      if (key === "g") {
        pendingKey = "g";
        pendingTimer = setTimeout(() => {
          pendingKey = null;
        }, 1000);
        return;
      }
    } else if (pendingKey === "g") {
      if (pendingTimer) clearTimeout(pendingTimer);
      pendingKey = null;
      const chord = `g ${key}`;
      if (shortcutsRef.current[chord]) {
        e.preventDefault();
        shortcutsRef.current[chord]();
      }
      return;
    }
  };

  const cleanup = () => {
    if (pendingTimer) clearTimeout(pendingTimer);
  };

  return { handleKeyDown, cleanup };
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled: boolean): void {
  // Stable ref to shortcuts so the effect doesn't re-subscribe on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const { handleKeyDown, cleanup } = createKeyHandler(shortcutsRef);

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      cleanup();
    };
  }, [enabled]);
}
