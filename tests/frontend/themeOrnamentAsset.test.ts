import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("theme ornament assets", () => {
  it("validates that all 15 ornament SVG files exist, use viewBox, avoid inline styles/scripts/colors, and stay within the 40 KB budget", () => {
    const themes = ["default", "fantasy", "sci-fi"];
    const filenames = [
      "panel-corner-primary.svg",
      "panel-corner-secondary.svg",
      "panel-edge-accent.svg",
      "narrative-divider.svg",
      "ambient-mark.svg",
    ];

    for (const themeId of themes) {
      for (const filename of filenames) {
        const assetPath = resolve(
          process.cwd(),
          `public/assets/themes/${themeId}/ornaments/${filename}`,
        );

        expect(assetPath.endsWith(".svg")).toBe(true);

        const stats = statSync(assetPath);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(50);
        expect(stats.size).toBeLessThan(40_000); // Max 40 KB budget

        const content = readFileSync(assetPath, "utf8");
        expect(content).toContain("viewBox");
        expect(content).not.toContain("<script");
        expect(content).not.toContain("<style");

        // Most ornament assets are white silhouettes recolored via CSS mask + theme
        // gradient, so hex literals would silently override the theme. Fantasy's panel
        // corners are the one deliberate exception: true-color baked art consumed via
        // background-image (see ThemeOrnaments.panelCorner*Image), not mask-recolored.
        const isFantasyTrueColorCorner =
          themeId === "fantasy" &&
          (filename === "panel-corner-primary.svg" || filename === "panel-corner-secondary.svg");
        if (!isFantasyTrueColorCorner) {
          expect(content).not.toMatch(/#([0-9a-fA-F]{3}){1,2}/); // No hex color literals
        }
      }
    }
  });
});
