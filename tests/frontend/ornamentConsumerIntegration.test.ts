import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("ornament consumer integration & stacking", () => {
  it("renders ornament frame on an unclipped outer wrapper in EntityDetailModal", () => {
    const modalSource = read("src/frontend/dm/entities/EntityDetailModal.tsx");

    expect(modalSource).toContain("entity-detail-dialog-frame ornamented-frame");
    expect(modalSource).not.toMatch(/modal-content[^"]*ornamented-frame/);
  });

  it("elevates empty state children above the ambient mark watermark in ornament.css", () => {
    const ornamentStyles = read("src/frontend/shared/styles/primitives/ornament.css");

    expect(ornamentStyles).toContain(".empty-state--ornamented::before");
    expect(ornamentStyles).toContain("z-index: 0");
    expect(ornamentStyles).toContain(".empty-state--ornamented > *");
    expect(ornamentStyles).toContain("z-index: 1");
  });

  it("integrates NarrativeDivider into real session narrative views", () => {
    const sessionDetailSource = read("src/frontend/dm/sessions/SessionDetailPage.tsx");
    const overviewSource = read("src/frontend/dm/overview/OverviewPage.tsx");

    expect(sessionDetailSource).toContain("<NarrativeDivider />");
    expect(overviewSource).toContain("<NarrativeDivider />");
  });
});
