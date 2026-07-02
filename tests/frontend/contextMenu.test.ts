import { describe, expect, it } from "vitest";
import { nextMenuIndex } from "../../src/frontend/shared/components/ContextMenu.js";

describe("nextMenuIndex", () => {
  it("wraps arrow navigation through enabled menu items", () => {
    const enabled = [true, false, true];
    expect(nextMenuIndex(0, 1, enabled)).toBe(2);
    expect(nextMenuIndex(2, 1, enabled)).toBe(0);
    expect(nextMenuIndex(0, -1, enabled)).toBe(2);
  });
});
