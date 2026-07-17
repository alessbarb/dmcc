import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

describe("global style foundation", () => {
  it("loads one global stylesheet from the React entrypoint", () => {
    const main = read("src/frontend/main.tsx");
    const styleImports = [...main.matchAll(/import\s+["']([^"']+\.css)["']/g)].map((match) => match[1]);
    expect(styleImports).toEqual(["./shared/styles/main.css"]);
  });

  it("separates the approved foundation responsibilities", () => {
    const tokens = read("src/frontend/shared/styles/tokens.css");
    for (const file of [
      "fonts.css",
      "structural-tokens.css",
      "color-scheme.css",
      "reset.css",
      "accessibility.css",
      "motion.css",
    ]) {
      expect(tokens).toContain(`./foundation/${file}`);
    }
  });

  it("removes the global p1 override layer", () => {
    const obsolete = new URL("../../src/frontend/shared/styles/p1.css", import.meta.url);
    expect(existsSync(obsolete)).toBe(false);
    expect(read("src/frontend/player/pages/PlayerCampaignShell.tsx")).toContain(
      'import "./playerCampaignShell.css";',
    );
  });

  it("keeps the global entrypoint explicit", () => {
    expect(read("src/frontend/shared/styles/main.css").trim()).toBe('@import "./index.css";');
  });
});
