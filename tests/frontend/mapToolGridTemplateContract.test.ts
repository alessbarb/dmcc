import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function getCssFiles(dir: string): string[] {
  let results: string[] = [];
  for (const file of readdirSync(dir)) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getCssFiles(filePath));
    } else if (file.endsWith(".css")) {
      results.push(filePath);
    }
  }
  return results;
}

// M2 (UX audit 2026-07-26): a ~350px dead zone appeared between the "Mapa"
// heading and the graph panel, and the graph itself rendered cramped even
// with few nodes. Root cause: `.campaign-workspace--map-tool` had TWO
// competing `grid-template-rows` definitions (mapWorkspace.css: 3 explicit
// rows for heading/nav/content; network-flow-foundation.css: a stale
// 2-row leftover). Whichever loaded last won outright for that property,
// leaving the content row as an implicit "auto" track (sized to its own
// min-content) instead of the intended `minmax(0, 1fr)` — so it stopped
// filling the viewport, and the nav row absorbed the leftover flexible
// space it was never meant to have. Fixed by deleting the stale duplicate;
// mapWorkspace.css is the single source of truth for this selector.
describe(".campaign-workspace--map-tool grid-template-rows contract", () => {
  it("is declared in exactly one stylesheet", () => {
    const cssRoot = resolve(process.cwd(), "src/frontend");
    const files = getCssFiles(cssRoot);
    const declaringFiles = files.filter((file) => {
      const content = readFileSync(file, "utf8");
      return /\.campaign-workspace--map-tool\s*\{[^}]*grid-template-rows/.test(content);
    });

    expect(declaringFiles.map((f) => f.replace(cssRoot, ""))).toEqual([
      "/dm/map/mapWorkspace.css",
    ]);
  });
});
