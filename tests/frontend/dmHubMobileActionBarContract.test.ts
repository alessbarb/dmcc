import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("DM hub mobile action bar contract", () => {
  it("gives the quick-actions bar its own backing surface, like the mosaic tiles have", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-mobile-dashboard.css",
    );
    const content = readFileSync(cssPath, "utf8");

    const barRuleMatch = content.match(/\.dm-hub-mobile-dashboard__bar\s*\{[^}]*\}/);
    expect(barRuleMatch).not.toBeNull();

    // Without a background, the bar sits directly over the ambient
    // decorative SVG (.rpg-portal-background) and its icon/label legibility
    // depends entirely on how busy that background happens to be.
    expect(barRuleMatch![0]).toContain("background:");
  });
});
