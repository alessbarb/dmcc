import { describe, expect, it } from "vitest";
import { relationshipLayoutToFlowPositions } from "../../../../../src/frontend/dm/entities/relations/relationshipLayoutToFlowPositions.js";

describe("relationshipLayoutToFlowPositions", () => {
  it("converts a geometric center to a React Flow top-left position", () => {
    const points = new Map([["ent_a", { centerX: 100, centerY: 50 }]]);
    const positions = relationshipLayoutToFlowPositions(points, { width: 176, height: 104 });

    expect(positions.get("ent_a")).toEqual({ x: 100 - 88, y: 50 - 52 });
  });

  it("centers the origin node so its box straddles (0, 0)", () => {
    const points = new Map([["ent_center", { centerX: 0, centerY: 0 }]]);
    const positions = relationshipLayoutToFlowPositions(points, { width: 200, height: 100 });

    expect(positions.get("ent_center")).toEqual({ x: -100, y: -50 });
  });

  it("preserves every entry from the input map", () => {
    const points = new Map([
      ["ent_a", { centerX: 10, centerY: 10 }],
      ["ent_b", { centerX: -10, centerY: -10 }],
    ]);
    const positions = relationshipLayoutToFlowPositions(points, { width: 100, height: 100 });

    expect([...positions.keys()]).toEqual(["ent_a", "ent_b"]);
  });
});
