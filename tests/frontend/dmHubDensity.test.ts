import { describe, expect, it } from "vitest";
import { pageSizeByDensity, resolveDmHubDensity } from "../../src/frontend/dm/hub/useDmHubDensity.js";

describe("resolveDmHubDensity", () => {
  it("prioritizes low density when both height queries match", () => {
    expect(resolveDmHubDensity(true, true)).toBe("low");
  });

  it("returns compact density for the medium height query", () => {
    expect(resolveDmHubDensity(false, true)).toBe("compact");
  });

  it("returns comfortable density when neither query matches", () => {
    expect(resolveDmHubDensity(false, false)).toBe("comfortable");
  });

  it("exposes the density page sizes", () => {
    expect(pageSizeByDensity).toEqual({ low: 3, compact: 4, comfortable: 6 });
  });
});
