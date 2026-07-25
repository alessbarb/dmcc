import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

function getFiles(dir: string): string[] {
  let results: string[] = [];
  let list;
  try {
    list = readdirSync(dir);
  } catch {
    return [dir]; // It's a file
  }

  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith(".css")) {
      results.push(filePath);
    }
  }
  return results;
}

describe("Typography Contract Verification", () => {
  it("verifies existence of required typographic and line-height tokens in structural-tokens.css", () => {
    const cssPath = resolve(process.cwd(), "src/frontend/shared/styles/foundation/structural-tokens.css");
    const content = readFileSync(cssPath, "utf8");

    const requiredTokens = [
      "--type-micro",
      "--type-caption",
      "--type-control",
      "--type-body",
      "--type-body-comfortable",
      "--type-heading-sm",
      "--type-heading-md",
      "--type-heading-lg",
      "--line-compact",
      "--line-ui",
      "--line-reading",
    ];

    for (const token of requiredTokens) {
      expect(content).toContain(token);
    }
  });

  it("verifies that CSS files do not define font-sizes smaller than 12px or 0.75rem", () => {
    const srcDir = resolve(process.cwd(), "src/frontend");
    const cssFiles = getFiles(srcDir);
    const violations: string[] = [];

    // Allow some documented exceptions if they do not contain visible text (e.g. SRD elements, SVG, reset icons, etc.)
    const exceptions = [
      "src/frontend/shared/styles/landing",
    ];

    // Regex to match font-size declarations (e.g. font-size: 11px, font-size: 0.7rem)
    const fontSizeRegex = /font-size\s*:\s*([^;}]+)/g;

    for (const filePath of cssFiles) {
      if (exceptions.some((ex) => filePath.includes(ex))) continue;

      const content = readFileSync(filePath, "utf8");
      let match;

      while ((match = fontSizeRegex.exec(content)) !== null) {
        const value = match[1].trim();
        // Check for raw px values less than 12
        const pxMatch = value.match(/^(\d+(?:\.\d+)?)\s*px$/);
        if (pxMatch) {
          const pxVal = parseFloat(pxMatch[1]);
          if (pxVal < 12) {
            violations.push(`${filePath}: defines font-size "${value}" (less than 12px)`);
          }
        }

        // Check for raw rem/em values less than 0.75
        const remMatch = value.match(/^(\d+(?:\.\d+)?)\s*rem$/);
        if (remMatch) {
          const remVal = parseFloat(remMatch[1]);
          if (remVal < 0.75) {
            violations.push(`${filePath}: defines font-size "${value}" (less than 0.75rem)`);
          }
        }
        const emMatch = value.match(/^(\d+(?:\.\d+)?)\s*em$/);
        if (emMatch) {
          const emVal = parseFloat(emMatch[1]);
          if (emVal < 0.75) {
            violations.push(`${filePath}: defines font-size "${value}" (less than 0.75rem)`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
