import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

describe("theme artwork asset", () => {
  it("validates that app-background.webp exists, is a WebP image, has minimum 1600x900 dimensions and satisfies performance budget across all themes", async () => {
    const themeIds = ["default", "fantasy", "sci-fi"];

    for (const themeId of themeIds) {
      const assetPath = resolve(
        process.cwd(),
        `public/assets/themes/${themeId}/app-background.webp`,
      );

      expect(assetPath.endsWith(".webp")).toBe(true);

      const stats = statSync(assetPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(10_000);
      expect(stats.size).toBeLessThan(700_000);

      const buffer = readFileSync(assetPath);
      const headerRiff = buffer.toString("ascii", 0, 4);
      const headerWebp = buffer.toString("ascii", 8, 12);
      expect(headerRiff).toBe("RIFF");
      expect(headerWebp).toBe("WEBP");

      const metadata = await sharp(assetPath).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBeGreaterThanOrEqual(1600);
      expect(metadata.height).toBeGreaterThanOrEqual(900);
    }
  });
});
