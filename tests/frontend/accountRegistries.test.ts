import { describe, expect, it } from "vitest";
import { readDeviceOverrides } from "../../src/frontend/account/deviceOverrides.js";
import { getTheme } from "../../src/frontend/account/themeRegistry.js";
import { getTypographySet } from "../../src/frontend/account/typographyRegistry.js";

describe("account appearance registries", () => {
  it("registers independent light and dark variants", () => {
    expect(getTheme("default").variants.dark).toBeDefined();
    expect(getTheme("default").variants.light).toBeDefined();
  });

  it("registers the existing Cinzel and Outfit font pairing", () => {
    expect(getTypographySet("cinzel-outfit").bodyFamily).toContain("Outfit");
  });

  it("allows only presentation fields in device overrides", () => {
    const storage = {
      getItem: () => JSON.stringify({
        themeId: "default",
        colorMode: "dark",
        email: "private@example.com",
      }),
    };
    expect(readDeviceOverrides(storage)).toEqual({ themeId: "default", colorMode: "dark" });
    expect(readDeviceOverrides(storage)).not.toHaveProperty("email");
  });
});
