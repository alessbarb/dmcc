import { describe, expect, it } from "vitest";
import { findNetworkPath } from "../../../../../src/frontend/dm/map/network/findNetworkPath.js";

describe("findNetworkPath", () => {
  it("finds the shortest undirected path", () => {
    const nodeIds = ["A", "B", "C", "D"];
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "D" },
      { source: "A", target: "D" },
    ];

    expect(findNetworkPath(nodeIds, edges, "A", "C")).toEqual(["A", "B", "C"]);
    expect(findNetworkPath(nodeIds, edges, "A", "D")).toEqual(["A", "D"]);
  });

  it("returns a single-element path when start equals target", () => {
    expect(findNetworkPath(["A"], [], "A", "A")).toEqual(["A"]);
  });

  it("returns null when no path exists", () => {
    const nodeIds = ["A", "B", "C"];
    const edges = [{ source: "A", target: "B" }];
    expect(findNetworkPath(nodeIds, edges, "A", "C")).toBeNull();
  });
});
