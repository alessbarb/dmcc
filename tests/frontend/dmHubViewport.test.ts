import { describe, expect, it } from "vitest";
import { resolveDmHubViewport } from "../../src/frontend/dm/hub/useDmHubViewport.js";

describe("resolveDmHubViewport", () => {
  it("returns desktop for the desktop media query", () => {
    expect(resolveDmHubViewport(true)).toBe("desktop");
  });

  it("returns mobile when the desktop media query does not match", () => {
    expect(resolveDmHubViewport(false)).toBe("mobile");
  });
});
