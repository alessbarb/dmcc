import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// M3 (UX audit 2026-07-26): the "N entities/relations not on any board"
// warning toast rendered twice, stacked, with identical text. Root cause:
// React.StrictMode (main.tsx) double-invokes effects on mount in dev, and
// this effect's `addToast(...)` call had no guard against firing twice for
// the same activeCampaignId — so the synthetic double-mount produced two
// toasts. Fixed with a ref that remembers which campaignId it already
// warned for.
describe("canvas orphan-entities toast contract", () => {
  it("guards the orphan-entities warning toast against firing twice for the same campaign", () => {
    const filePath = resolve(
      process.cwd(),
      "src/frontend/dm/canvas/pages/CanvasPage.tsx",
    );
    const content = readFileSync(filePath, "utf8");

    const effectMatch = content.match(
      /\/\/ Alert anchors or orphans\s*\n\s*useEffect\(\(\) => \{([\s\S]*?)\n {2}\}, \[[^\]]*\]\);/,
    );
    expect(effectMatch).not.toBeNull();
    const effectBody = effectMatch![1];

    expect(effectBody).toMatch(/orphanWarningShownForRef\.current/);
    expect(effectBody.indexOf("orphanWarningShownForRef.current")).toBeLessThan(
      effectBody.indexOf("addToast("),
    );
  });
});
