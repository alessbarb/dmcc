import { describe, expect, it } from "vitest";
import { computeNetworkFitZoomCap } from "../../src/frontend/dm/map/network/computeNetworkFitZoomCap.js";

describe("computeNetworkFitZoomCap", () => {
  it("allows a much higher zoom cap for small graphs", () => {
    expect(computeNetworkFitZoomCap(18, "standard")).toBeGreaterThan(1);
  });

  it("keeps the original low cap for dense graphs (>80 nodes)", () => {
    expect(computeNetworkFitZoomCap(120, "standard")).toBe(0.55);
    expect(computeNetworkFitZoomCap(120, "focus")).toBe(0.9);
  });

  it("scales down progressively as node count grows", () => {
    const small = computeNetworkFitZoomCap(10, "standard");
    const medium = computeNetworkFitZoomCap(50, "standard");
    const large = computeNetworkFitZoomCap(200, "standard");
    expect(small).toBeGreaterThan(medium);
    expect(medium).toBeGreaterThan(large);
  });

  it("gives focus mode a higher cap than standard mode at the same node count", () => {
    expect(computeNetworkFitZoomCap(18, "focus")).toBeGreaterThan(
      computeNetworkFitZoomCap(18, "standard"),
    );
  });
});
