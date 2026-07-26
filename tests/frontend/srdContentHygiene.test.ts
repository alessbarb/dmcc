import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// M6 (UX audit 2026-07-26): SRD rules content rendered literal line-break
// hyphenation artifacts ("typ-ically", "de-fined"...). Root cause: 7 soft
// hyphen characters (U+00AD) left over from the original PDF's justified
// text extraction, sitting mid-word right where the source PDF used to
// wrap a line (e.g. "extra­dimensional", "Short­sword"). This is a
// trivial, self-contained data cleanup — no content pipeline changes
// needed, unlike previously assumed.
describe("SRD rules content hygiene", () => {
  it("contains no leftover soft-hyphen characters (U+00AD)", () => {
    const jsonPath = resolve(
      process.cwd(),
      "src/core/domain/rules/data/srd_rules.json",
    );
    const content = readFileSync(jsonPath, "utf8");
    expect(content).not.toContain("­");
  });
});
