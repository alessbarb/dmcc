import { describe, expect, it } from "vitest";
import { viewportContainsCanvasNode } from "../../src/frontend/dm/canvas/services/canvasViewport.js";

const node = (x: number, y: number) => ({
  position: { x, y },
});

describe("viewportContainsCanvasNode", () => {
  it("detects when a node is visible in the current viewport", () => {
    expect(viewportContainsCanvasNode([node(100, 120)], { x: 0, y: 0, zoom: 1 }, { width: 800, height: 600 })).toBe(true);
  });

  it("detects stale saved viewports that are panned away from all nodes", () => {
    expect(viewportContainsCanvasNode([node(100, 120)], { x: -5000, y: -5000, zoom: 1 }, { width: 800, height: 600 })).toBe(false);
  });
});
