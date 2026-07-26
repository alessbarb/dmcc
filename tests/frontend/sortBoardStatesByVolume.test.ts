import { describe, expect, it } from "vitest";
import { sortBoardStatesByVolume } from "../../src/frontend/dm/library/boards/sortBoardStatesByVolume.js";

describe("sortBoardStatesByVolume", () => {
  it("orders states by descending card count", () => {
    const states = [
      { key: "active" },
      { key: "blocked" },
      { key: "_unknown" },
    ];
    const counts = { active: 1, blocked: 0, _unknown: 12 };

    const result = sortBoardStatesByVolume(states, counts);

    expect(result.map((s) => s.key)).toEqual(["_unknown", "active", "blocked"]);
  });

  it("keeps the original relative order for states with equal counts", () => {
    const states = [{ key: "a" }, { key: "b" }, { key: "c" }];
    const counts = { a: 2, b: 2, c: 2 };

    const result = sortBoardStatesByVolume(states, counts);

    expect(result.map((s) => s.key)).toEqual(["a", "b", "c"]);
  });

  it("treats a missing count as zero", () => {
    const states = [{ key: "a" }, { key: "b" }];
    const counts = { a: 3 };

    const result = sortBoardStatesByVolume(states, counts);

    expect(result.map((s) => s.key)).toEqual(["a", "b"]);
  });
});
