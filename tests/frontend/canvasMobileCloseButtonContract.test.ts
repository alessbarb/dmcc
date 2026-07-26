import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// A5 (UX audit 2026-07-26): CanvasNavigatorPanel and CanvasPalette both
// render their "close" affordance (`.canvas-mobile-sheet-close` /
// `.canvas-mobile-sheet-header`) whenever the parent passes an
// `onMobileClose` callback — which CanvasPage.tsx does unconditionally,
// not gated on viewport. Those classes are only ever *styled* inside the
// `@media (max-width: 768px)` sheet layout, so on desktop they render as
// unstyled default buttons that sit in the panel header and do nothing
// useful when clicked (there is no mobile sheet to close). Root cause:
// missing desktop-scope rule to hide them outside that breakpoint.
describe("canvas mobile-only close button contract", () => {
  it("hides the mobile sheet close affordances outside the mobile breakpoint", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/frontend/shared/styles/features/campaign-canvas/canvas-layout.css",
    );
    const content = readFileSync(cssPath, "utf8");

    const desktopBlockMatch = content.match(/@media \(min-width: 769px\) \{([\s\S]*?)\n\}\n/);
    expect(desktopBlockMatch).not.toBeNull();
    const desktopBlock = desktopBlockMatch![1];

    expect(desktopBlock).toMatch(
      /\.canvas-navigator-panel__header\s+\.canvas-mobile-sheet-close\s*\{[^}]*display:\s*none/,
    );
    expect(desktopBlock).toMatch(
      /\.canvas-palette\s+>\s*\.canvas-mobile-sheet-header\s*\{[^}]*display:\s*none/,
    );
  });
});
