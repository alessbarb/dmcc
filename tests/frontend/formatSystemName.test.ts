import { describe, expect, it } from "vitest";
import { formatSystemName } from "../../src/frontend/shared/presentation/formatSystemName.js";

describe("formatSystemName", () => {
  it("returns empty string for missing input", () => {
    expect(formatSystemName(null)).toBe("");
    expect(formatSystemName(undefined)).toBe("");
    expect(formatSystemName("")).toBe("");
  });

  it("maps known systems to their canonical display name regardless of casing", () => {
    expect(formatSystemName("dnd_5e")).toBe("D&D 5e");
    expect(formatSystemName("DND5E")).toBe("D&D 5e");
    expect(formatSystemName("pathfinder_2e")).toBe("Pathfinder 2e");
    expect(formatSystemName("shadowdark")).toBe("Shadowdark");
  });

  it("falls back to a capitalized, underscore-stripped label for unknown systems", () => {
    expect(formatSystemName("call_of_cthulhu")).toBe("Call Of Cthulhu");
  });
});
