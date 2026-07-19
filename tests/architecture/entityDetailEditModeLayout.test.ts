import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Regression guard for two real bugs found in this workspace:
//
// 1. entityDetailDialog.css / entityDetailImageContinuation.css / entityDetailHeroActions.css
//    used to detect "is this entity being edited" by sniffing a literal inline
//    style substring (`[style*="border-top"]`) via :has(). When ResumenTab.tsx's
//    edit panel moved that border-top into a CSS class, the sniff could never
//    match again, silently breaking the entire edit-mode workspace layout with
//    no visible error. The fix wires isEditingEntity directly onto
//    .entity-detail-dialog--editing instead of sniffing the DOM -- see
//    EntityDetailModal.tsx and entityDetailDialog.css's own header comment.
//
// 2. The edit-mode grid used to place the image field with `grid-row: 2 / span 2`
//    alongside the Título/Subtítulo and Resumen fields in the *same* 12-column
//    grid, sharing row-tracks. A grid item spanning multiple auto-sized row
//    tracks forces every spanned track to grow to fit it, so the image's ~330px
//    natural height inflated the short Título/Resumen rows to match, leaving a
//    large empty gap between the title inputs and "Resumen". The fix splits the
//    form into two independent flex columns (entity-summary__edit-main /
//    entity-summary__edit-side) placed side by side in a single grid row, so
//    columns no longer share row-tracks and each keeps its own natural height.

const dialogCss = resolve("src/frontend/dm/entities/entityDetailDialog.css");
const imageContinuationCss = resolve("src/frontend/dm/entities/entityDetailImageContinuation.css");
const heroActionsCss = resolve("src/frontend/dm/entities/entityDetailHeroActions.css");
const entityDetailModalTsx = resolve("src/frontend/dm/entities/EntityDetailModal.tsx");
const resumenTabTsx = resolve("src/frontend/dm/entities/ResumenTab.tsx");

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function readCssFamily(entryPath: string): string {
  const css = readFileSync(entryPath, "utf-8");
  const imports = [...css.matchAll(/@import\s+["']([^"']+)["']/g)].map((match) => match[1]);
  return [
    css,
    ...imports
      .map((relativePath) => resolve(entryPath, "..", relativePath))
      .filter((path) => existsSync(path))
      .map((path) => readCssFamily(path)),
  ].join("\n");
}

describe("Architecture Test — entity detail dialog edit-mode layout", () => {
  it("never reintroduces :has()-based DOM sniffing in the entity detail dialog CSS family", () => {
    for (const path of [dialogCss, imageContinuationCss, heroActionsCss]) {
      const css = stripCssComments(readCssFamily(path));
      expect(css.includes(":has(")).toBe(false);
    }
  });

  it("never reintroduces an inline-style-attribute sniff for edit-mode detection", () => {
    for (const path of [dialogCss, imageContinuationCss]) {
      const css = stripCssComments(readCssFamily(path));
      expect(css.includes('[style*="border-top"]')).toBe(false);
    }
  });

  it("drives edit-mode CSS from an explicit class, not DOM structure", () => {
    const tsx = readFileSync(entityDetailModalTsx, "utf-8");
    expect(tsx).toContain("entity-detail-dialog--editing");
    // Both the overlay and the content need the class: CSS on either side must
    // not need to reach across via :has() to find "is editing" state.
    expect(tsx).toMatch(/modal-overlay entity-detail-dialog\$\{isEditingEntity/);
    expect(tsx).toMatch(/modal-content entity-detail-dialog\$\{isRelationsExpanded/);
  });

  it("keeps the edit-form image field out of the row-spanning grid design", () => {
    const css = stripCssComments(readCssFamily(dialogCss));
    // The old bug's signature: an explicit multi-row span on the image field
    // sharing tracks with single-row sibling fields.
    expect(css).not.toMatch(/entity-summary__edit-image\s*\{[^}]*grid-row/);
    // The fix's signature: two independent flex columns instead.
    expect(css).toMatch(/entity-summary__edit-main\s*\{[^}]*display:\s*flex/);
    expect(css).toMatch(/entity-summary__edit-side\s*\{[^}]*display:\s*flex/);
  });

  it("nests the edit-form fields under the two independent flex columns in ResumenTab.tsx", () => {
    const tsx = readFileSync(resumenTabTsx, "utf-8");
    const mainStart = tsx.indexOf('className="entity-summary__edit-main"');
    const sideStart = tsx.indexOf('className="entity-summary__edit-side"');
    const metadataStart = tsx.indexOf('className="entity-summary__edit-metadata"');
    expect(mainStart).toBeGreaterThan(-1);
    expect(sideStart).toBeGreaterThan(mainStart);
    expect(metadataStart).toBeGreaterThan(sideStart);

    const mainSection = tsx.slice(mainStart, sideStart);
    expect(mainSection).toContain("entity-summary__edit-titles");
    expect(mainSection).toContain("entity-summary__edit-summary");
    expect(mainSection).toContain("entity-summary__edit-notes");

    const sideSection = tsx.slice(sideStart, metadataStart);
    expect(sideSection).toContain("entity-summary__edit-image");
    expect(sideSection).toContain("entity-summary__edit-status");
  });
});
