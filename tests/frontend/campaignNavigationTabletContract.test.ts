import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("campaign navigation tablet collapse contract", () => {
  it("hides back-button and sidebar-footer-action labels in the 769-1200px icon-only sidebar range", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css",
    );
    const content = readFileSync(cssPath, "utf8");

    const tabletBlockMatch = content.match(
      /@media \(min-width: 769px\) and \(max-width: 1200px\) \{([\s\S]*?)\n\}/,
    );
    expect(tabletBlockMatch).not.toBeNull();
    const tabletBlock = tabletBlockMatch![1];

    // .nav-item span is already hidden here; the back button and footer
    // actions render their label the same way (icon + <span>text</span>)
    // and must collapse the same way, or their full label wraps
    // character-by-character inside the 52px icon-only sidebar.
    expect(tabletBlock).toContain(".campaign-shell__back-button span");
    expect(tabletBlock).toContain(".sidebar-footer__action span");
  });
});
