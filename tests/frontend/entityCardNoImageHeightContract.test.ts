import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// B2 (UX audit 2026-07-26): entity cards without a real image reserved the
// same hero height as ones with a photo (~140-184px) around a single
// 28px centered icon — most of that area was empty. The fallback icon
// wrapper itself was fine (shaped per entity type); the bug was the outer
// hero container never shrinking when it had no photo to fill.
describe("entity card no-image hero height contract", () => {
  it("gives .entity-card__hero--no-img a smaller height than the default/image hero", () => {
    const foundationCss = readFileSync(
      resolve(process.cwd(), "src/frontend/dm/entities/entity-card/entity-card-foundation.css"),
      "utf8",
    );
    const layoutCss = readFileSync(
      resolve(process.cwd(), "src/frontend/dm/entities/entity-card/entity-card-layout.css"),
      "utf8",
    );

    const baseMatch = foundationCss.match(/\.entity-card__hero\s*\{[^}]*height:\s*(\d+)px/);
    const noImgMatch = layoutCss.match(/\.entity-card__hero--no-img\s*\{[^}]*height:\s*(\d+)px/);
    expect(baseMatch).not.toBeNull();
    expect(noImgMatch).not.toBeNull();

    const baseHeight = Number(baseMatch![1]);
    const noImgHeight = Number(noImgMatch![1]);
    expect(noImgHeight).toBeLessThan(baseHeight);
  });
});
