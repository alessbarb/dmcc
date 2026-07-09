import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const filesToAudit = [
  "src/frontend/dm/canvas/components/CanvasEntityNode.tsx",
  "src/frontend/dm/canvas/pages/CanvasPage.tsx",
  "src/frontend/dm/canvas/components/CanvasPalette.tsx",
];

const findAddEdgeCalls = (source: string): string[] => {
  const calls: string[] = [];
  const token = "addEdgeToCanvas(";
  let searchFrom = 0;

  while (true) {
    const start = source.indexOf(token, searchFrom);
    if (start === -1) return calls;

    let depth = 0;
    let end = start;
    for (; end < source.length; end += 1) {
      const char = source[end];
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
      if (depth === 0 && end > start) break;
    }

    calls.push(source.slice(start, end + 1));
    searchFrom = end + 1;
  }
};

describe("canvas domain edge creation", () => {
  it("does not call addEdgeToCanvas directly with domain status unless a relationshipId is supplied", () => {
    const violations = filesToAudit.flatMap((filePath) => {
      const source = readFileSync(join(repoRoot, filePath), "utf8");

      return findAddEdgeCalls(source)
        .filter((call) => /status:\s*["']domain["']/.test(call))
        .filter((call) => !/relationshipId\s*:/.test(call))
        .map((call) => `${filePath}:${source.slice(0, source.indexOf(call)).split("\n").length}`);
    });

    expect(violations).toEqual([]);
  });
});
