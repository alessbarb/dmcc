import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("app shell style contract", () => {
  it("defines artwork CSS variables and stacking isolation in app-shell.css", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/frontend/shared/styles/layout/app-shell.css",
    );
    const content = readFileSync(cssPath, "utf8");

    expect(content).toContain("isolation: isolate");
    expect(content).toContain("position: fixed");
    expect(content).toContain("pointer-events: none");

    expect(content).toContain("--theme-artwork-app-background-image");
    expect(content).toContain("--theme-artwork-app-background-position");
    expect(content).toContain("--theme-artwork-app-background-position-compact");
    expect(content).toContain("--theme-artwork-app-background-size");
    expect(content).toContain("--theme-artwork-app-background-size-compact");
    expect(content).toContain("--theme-artwork-app-background-opacity");
    expect(content).toContain("--theme-artwork-app-background-veil");
    expect(content).toContain(".app-container--canvas::before");
  });
});
