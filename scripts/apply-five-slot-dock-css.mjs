import { readFileSync, writeFileSync, rmSync } from "node:fs";

const cssPath = "src/frontend/shared/styles/index.css";
let css = readFileSync(cssPath, "utf8");

if (!css.includes(".app-container--campaign-shell .mobile-dock")) {
  throw new Error("Expected DM-scoped mobile dock selector was not found");
}
if (!css.includes(".app-container--campaign-shell .mobile-dock-overlay")) {
  throw new Error("Expected DM-scoped dock overlay selector was not found");
}

css = css.replace(".app-container--campaign-shell .mobile-dock {", ".mobile-dock {");
css = css.replace(".app-container--campaign-shell .mobile-dock-overlay {", ".mobile-dock-overlay {");

const appLayoutMarker = "/* App layout */\n";
if (!css.includes(appLayoutMarker)) throw new Error("App layout marker not found");
css = css.replace(
  appLayoutMarker,
  `${appLayoutMarker}.mobile-dock,\n.mobile-dock-overlay {\n  display: none;\n}\n\n`,
);

const legacyBlocks = [
  /\n\.player-portal-bottom-nav \{\n  display: none;\n\}\n/,
  /\n  \.player-portal-bottom-nav \{[\s\S]*?\n  \}\n\n  \.player-portal-bottom-nav button \{[\s\S]*?\n  \}\n\n  \.player-portal-bottom-nav button\.active \{[\s\S]*?\n  \}\n/,
];
for (const pattern of legacyBlocks) css = css.replace(pattern, "\n");

if (css.includes("player-portal-bottom-nav")) {
  throw new Error("Legacy player portal bottom nav CSS remains after migration");
}
if (css.includes(".app-container--campaign-shell .mobile-dock")) {
  throw new Error("Shared dock still depends on the DM campaign shell");
}

writeFileSync(cssPath, css);

const dockTestPath = "tests/frontend/sharedMobileDockContracts.test.ts";
let dockTest = readFileSync(dockTestPath, "utf8");
dockTest = dockTest
  .replace('expect(dockSource).toContain("items.slice(0, 3)");', 'expect(dockSource).toContain("items.slice(0, 4)");')
  .replace('expect(dockSource).toContain("items.slice(3)");', 'expect(dockSource).toContain("items.slice(4)");')
  .replace('it("always exposes exactly three direct destinations plus More"', 'it("always exposes exactly four direct destinations plus More"');

const sharedCssAssertion = `    expect(sharedStyles).not.toContain("campaign-mobile-bottom-nav");`;
if (!dockTest.includes(sharedCssAssertion)) throw new Error("Shared dock CSS assertion anchor not found");
dockTest = dockTest.replace(
  sharedCssAssertion,
  `${sharedCssAssertion}\n    expect(sharedStyles).not.toContain("player-portal-bottom-nav");\n    expect(sharedStyles).not.toContain(".app-container--campaign-shell .mobile-dock");\n    expect(sharedStyles).toContain(".mobile-dock {\n    position: fixed;");`,
);
writeFileSync(dockTestPath, dockTest);

rmSync("scripts/apply-five-slot-dock-css.mjs");
rmSync(".github/workflows/apply-five-slot-dock-css.yml");
