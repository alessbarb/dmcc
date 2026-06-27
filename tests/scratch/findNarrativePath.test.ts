import { describe, it, expect } from "vitest";
import { findNarrativeAnchor, findUndirectedShortestPath } from "../../src/frontend/dm/graph/findNarrativePath.js";

describe("findNarrativePath BFS utility", () => {
  it("finds narrative anchor based on graphAnchor", () => {
    const nodes = [
      { id: "node-1", entityType: "secret", entityData: { metadata: { truth: "..." } } },
      { id: "node-2", entityType: "secret", entityData: { metadata: { graphAnchor: "main_secret", truth: "..." } } },
    ];
    const anchor = findNarrativeAnchor(nodes);
    expect(anchor).toBe("node-2");
  });

  it("finds narrative anchor fallback to first critical active dm_only secret", () => {
    const nodes = [
      { id: "node-1", entityType: "secret", entityData: { importance: "normal", visibility: { kind: "dm_only" }, status: "active", metadata: { truth: "..." } } },
      { id: "node-2", entityType: "secret", entityData: { importance: "critical", visibility: { kind: "dm_only" }, status: "active", metadata: { truth: "..." } } },
    ];
    const anchor = findNarrativeAnchor(nodes);
    expect(anchor).toBe("node-2");
  });

  it("returns null if no anchor found", () => {
    const nodes = [
      { id: "node-1", entityType: "clue", entityData: {} },
    ];
    const anchor = findNarrativeAnchor(nodes);
    expect(anchor).toBeNull();
  });

  it("finds shortest undirected path", () => {
    const nodes = [
      { id: "A", entityType: "clue" },
      { id: "B", entityType: "clue" },
      { id: "C", entityType: "clue" },
      { id: "D", entityType: "clue" },
    ];
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "D" },
      { source: "A", target: "D" },
    ];

    const path1 = findUndirectedShortestPath(nodes, edges, "A", "C");
    expect(path1).toEqual(["A", "B", "C"]);

    const path2 = findUndirectedShortestPath(nodes, edges, "A", "D");
    expect(path2).toEqual(["A", "D"]);
  });

  it("finds shortest undirected path when edge source/target are objects", () => {
    const nodes = [
      { id: "A", entityType: "clue" },
      { id: "B", entityType: "clue" },
      { id: "C", entityType: "clue" },
    ];
    const edges = [
      { source: { id: "A" }, target: { id: "B" } },
      { source: { id: "B" }, target: { id: "C" } },
    ];
    const path = findUndirectedShortestPath(nodes, edges, "A", "C");
    expect(path).toEqual(["A", "B", "C"]);
  });

  it("returns null if path does not exist", () => {
    const nodes = [
      { id: "A", entityType: "clue" },
      { id: "B", entityType: "clue" },
      { id: "C", entityType: "clue" },
    ];
    const edges = [
      { source: "A", target: "B" },
    ];
    const path = findUndirectedShortestPath(nodes, edges, "A", "C");
    expect(path).toBeNull();
  });
});
