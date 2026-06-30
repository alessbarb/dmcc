import { describe, expect, it } from "vitest";
import { resolveActiveCanvasId } from "../../src/frontend/shared/utils/canvasSelection.js";

describe("resolveActiveCanvasId", () => {
  it("returns null when a campaign has no canvas", () => {
    expect(resolveActiveCanvasId({}, "old_canvas")).toBeNull();
  });

  it("keeps the preferred canvas only when it belongs to the current campaign", () => {
    expect(
      resolveActiveCanvasId(
        {
          cvs_a: { id: "cvs_a", title: "A" },
          cvs_b: { id: "cvs_b", title: "B" },
        },
        "cvs_b",
      ),
    ).toBe("cvs_b");
  });

  it("falls back to the first valid canvas when the previous campaign canvas is stale", () => {
    expect(
      resolveActiveCanvasId(
        {
          cvs_current: { id: "cvs_current", title: "Current" },
        },
        "cvs_previous",
      ),
    ).toBe("cvs_current");
  });

  it("ignores archived canvases", () => {
    expect(
      resolveActiveCanvasId(
        {
          cvs_old: { id: "cvs_old", archived: true },
          cvs_live: { id: "cvs_live", archived: false },
        },
        "cvs_old",
      ),
    ).toBe("cvs_live");
  });
});
