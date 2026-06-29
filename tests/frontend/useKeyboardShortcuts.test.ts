import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKeyHandler, type ShortcutMap } from "../../src/frontend/shared/hooks/useKeyboardShortcuts.js";

/**
 * Build a shortcutsRef-like object (mirrors the useRef pattern in the hook)
 * so we can call createKeyHandler without needing React or a DOM.
 */
function makeRef(shortcuts: ShortcutMap) {
  return { current: shortcuts };
}

/**
 * Create a minimal KeyboardEvent-like object that satisfies what
 * handleKeyDown expects.  We use a plain object cast to KeyboardEvent
 * to avoid needing jsdom.
 */
function fakeEvent(
  key: string,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    tagName?: string;
    isContentEditable?: boolean;
  } = {}
): KeyboardEvent {
  let defaultPrevented = false;
  return {
    key,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    altKey: options.altKey ?? false,
    target: {
      tagName: options.tagName ?? "BODY",
      isContentEditable: options.isContentEditable ?? false,
    },
    preventDefault() {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
  } as unknown as KeyboardEvent;
}

describe("createKeyHandler", () => {
  it("calls single-key handler", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("calls chord handler g+d", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ "g d": handler }));
    handleKeyDown(fakeEvent("g"));
    handleKeyDown(fakeEvent("d"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not call handler when key is not in shortcuts", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("x"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores keys typed in an input", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { tagName: "INPUT" }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores keys typed in a textarea", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { tagName: "TEXTAREA" }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores ctrl+key combos", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { ctrlKey: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores meta+key combos", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { metaKey: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores alt+key combos", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { altKey: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores keys typed in contenteditable elements", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    handleKeyDown(fakeEvent("n", { isContentEditable: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("chord g+s fires correctly", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ "g s": handler }));
    handleKeyDown(fakeEvent("g"));
    handleKeyDown(fakeEvent("s"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("unknown chord second key does not fire any handler", () => {
    const dashHandler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ "g d": dashHandler }));
    handleKeyDown(fakeEvent("g"));
    handleKeyDown(fakeEvent("x")); // not a registered chord
    expect(dashHandler).not.toHaveBeenCalled();
  });

  it("prevents default on single-key match", () => {
    const handler = vi.fn();
    const { handleKeyDown } = createKeyHandler(makeRef({ n: handler }));
    const event = fakeEvent("n");
    handleKeyDown(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
