import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// M4 (UX audit 2026-07-26): React warns "Each child in a list should have a
// unique key prop... Check the render method of `DmHubPreparationPanel`".
// Root cause: `countLabel()` returns a bare `<span>` with no `key`, and its
// results are collected into the `metrics` array rendered directly as
// `{metrics}` in DmHubPreparationPanel — a JSX array child needs each
// element keyed, not the array itself.
describe("DmHubPreparationPanel key contract", () => {
  it("countLabel() returns a keyed element", () => {
    const filePath = resolve(
      process.cwd(),
      "src/frontend/dm/hub/DmHubCampaignSignals.tsx",
    );
    const content = readFileSync(filePath, "utf8");

    const countLabelMatch = content.match(/function countLabel\([^)]*\)\s*\{[\s\S]*?\n\}/);
    expect(countLabelMatch).not.toBeNull();
    expect(countLabelMatch![0]).toMatch(/<span key=/);
  });
});
