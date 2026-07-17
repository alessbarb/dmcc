import { describe, expect, it } from "vitest";
import {
  oppositeRelationshipHandleSide,
  pickRelationshipHandleSide,
} from "../../../../../src/frontend/dm/entities/relations/pickRelationshipHandleSide.js";

describe("pickRelationshipHandleSide", () => {
  it("picks right when the other node is mostly to the right", () => {
    expect(pickRelationshipHandleSide(100, 10)).toBe("right");
  });

  it("picks left when the other node is mostly to the left", () => {
    expect(pickRelationshipHandleSide(-100, 10)).toBe("left");
  });

  it("picks bottom when the other node is mostly below", () => {
    expect(pickRelationshipHandleSide(10, 100)).toBe("bottom");
  });

  it("picks top when the other node is mostly above", () => {
    expect(pickRelationshipHandleSide(10, -100)).toBe("top");
  });

  it("falls back to bottom for coincident nodes", () => {
    expect(pickRelationshipHandleSide(0, 0)).toBe("bottom");
  });

  it("breaks an exact diagonal tie toward the vertical axis", () => {
    expect(pickRelationshipHandleSide(50, 50)).toBe("bottom");
  });
});

describe("oppositeRelationshipHandleSide", () => {
  it("returns the opposite side for every side", () => {
    expect(oppositeRelationshipHandleSide("top")).toBe("bottom");
    expect(oppositeRelationshipHandleSide("bottom")).toBe("top");
    expect(oppositeRelationshipHandleSide("left")).toBe("right");
    expect(oppositeRelationshipHandleSide("right")).toBe("left");
  });
});
