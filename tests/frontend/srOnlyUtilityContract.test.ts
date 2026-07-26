import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("sr-only utility contract", () => {
  it("defines .sr-only using the standard visually-hidden clip technique", () => {
    const cssPath = resolve(
      process.cwd(),
      "src/frontend/shared/styles/foundation/utilities.css",
    );
    const content = readFileSync(cssPath, "utf8");

    // AttentionQueue.tsx renders `<span className="sr-only">Total attention
    // items: {total}</span>` expecting it to be invisible to sighted users.
    // Without this rule the class does nothing and the text renders inline,
    // full-width, visible — which is what actually produced the
    // "Total attention items: 15" line seen live in the DM command center.
    const ruleMatch = content.match(/\.sr-only\s*\{[^}]*\}/);
    expect(ruleMatch).not.toBeNull();
    expect(ruleMatch![0]).toContain("position: absolute");
    expect(ruleMatch![0]).toMatch(/width:\s*1px/);
    expect(ruleMatch![0]).toMatch(/height:\s*1px/);
    expect(ruleMatch![0]).toContain("overflow: hidden");
  });
});
