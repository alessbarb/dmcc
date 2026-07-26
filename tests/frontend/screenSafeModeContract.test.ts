import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("screen-safe mode CSS contract", () => {
  it("blurs the real dm_only card classes used in Library and Canvas", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/frontend/shared/styles/foundation/screen-safe-mode.css"),
      "utf8",
    );
    expect(css).toContain('[data-screen-safe-mode="true"]');
    expect(css).toContain(".entity-card--dm-only");
    expect(css).toContain(".entity-compact-row--dm-only");
    expect(css).toContain(".rg-card--dm-only");
    expect(css).toContain("filter: blur(");
  });

  it("is imported from main.css", () => {
    const main = readFileSync(
      resolve(process.cwd(), "src/frontend/shared/styles/main.css"),
      "utf8",
    );
    expect(main).toContain("./foundation/screen-safe-mode.css");
  });

  it("EntityListView marks dm_only cards with entity-card--dm-only / entity-compact-row--dm-only", () => {
    const tsx = readFileSync(
      resolve(process.cwd(), "src/frontend/dm/library/list/EntityListView.tsx"),
      "utf8",
    );
    expect(tsx).toContain("entity-card--dm-only");
    expect(tsx).toContain("entity-compact-row--dm-only");
  });

  it("CanvasEntityNode marks dm_only nodes with rg-card--dm-only", () => {
    const tsx = readFileSync(
      resolve(process.cwd(), "src/frontend/dm/canvas/components/CanvasEntityNode.tsx"),
      "utf8",
    );
    expect(tsx).toContain('isDmOnly ? "rg-card--dm-only"');
  });
});
