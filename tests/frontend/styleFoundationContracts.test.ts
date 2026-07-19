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
    const entrypoint = read("src/frontend/shared/styles/main.css");
    for (const file of [
      "fonts.css",
      "structural-tokens.css",
      "color-scheme.css",
      "reset.css",
      "accessibility.css",
      "motion.css",
    ]) {
      expect(entrypoint).toContain(`./foundation/${file}`);
    }
  });

  it("removes the global p1 override layer", () => {
    const obsolete = new URL("../../src/frontend/shared/styles/p1.css", import.meta.url);
    expect(existsSync(obsolete)).toBe(false);
    expect(read("src/frontend/player/pages/PlayerCampaignShell.tsx")).toContain(
      'import "./playerCampaignShell.css";',
    );
  });

  it("keeps the global entrypoint explicit without the monolithic stylesheet", () => {
    const entrypoint = read("src/frontend/shared/styles/main.css");
    expect(entrypoint).toContain('@import "./foundation/reset.css";');
    expect(entrypoint).not.toContain('@import "./index.css";');
  });

  it("routes extracted shell and primitive responsibilities through shared styles", () => {
    const entrypoint = read("src/frontend/shared/styles/main.css");
    for (const file of [
      "./layout/app-shell.css",
      "./layout/navigation.css",
      "./layout/grid.css",
      "./layout/campaign-shell.css",
      "./layout/footer.css",
      "./layout/responsive.css",
      "./features/graph-search.css",
      "./features/timeline.css",
      "./features/landing-archive.css",
      "./features/kanban.css",
      "./features/campaign-canvas.css",
      "./features/player-portal.css",
      "./features/campaign-template.css",
      "./features/dm-dashboard.css",
      "./features/application-domains.css",
      "./layout/campaign-navigation.css",
      "./features/quick-capture.css",
      "./primitives/dialog.css",
      "./primitives/overlay.css",
      "./primitives/tabs.css",
      "./primitives/toolbar.css",
      "./primitives/empty-state.css",
      "./primitives/status.css",
    ]) {
      expect(entrypoint).toContain(`@import \"${file}\";`);
    }
  });
});
