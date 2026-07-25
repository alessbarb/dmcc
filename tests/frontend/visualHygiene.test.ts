import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { en } from "../../src/shared/i18n/dictionaries/en.js";

function getFlatKeys(obj: any, prefix = ""): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const subKeys = getFlatKeys(value, fullKey);
      for (const sk of subKeys) {
        keys.add(sk);
      }
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

function getFiles(dir: string): string[] {
  let results: string[] = [];
  let list;
  try {
    list = readdirSync(dir);
  } catch {
    return [dir];
  }
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith(".tsx")) {
      results.push(filePath);
    }
  }
  return results;
}

describe("Visual Hygiene Contract", () => {
  it("verifies that all i18n keys used in t() calls exist in the english dictionary", () => {
    const flatKeys = getFlatKeys(en);
    const srcDir = resolve(process.cwd(), "src/frontend");
    const files = getFiles(srcDir);
    const missingKeys: string[] = [];

    const tRegex = /\bt\(\s*["']([^"']+)["']/g;

    for (const filePath of files) {
      if (filePath.includes("/landing/") || filePath.includes("MainLanding.tsx") || filePath.includes("/shared/api/")) {
        continue;
      }
      const content = readFileSync(filePath, "utf8");
      let match;
      while ((match = tRegex.exec(content)) !== null) {
        const key = match[1];
        if (key.includes("${") || !key.includes(".")) continue;
        
        if (!flatKeys.has(key)) {
          if (
            key.startsWith("systems.") || 
            key.startsWith("importance.") || 
            key.startsWith("status.") || 
            key.startsWith("visibility.") ||
            key.startsWith("activity.")
          ) {
            continue;
          }
          missingKeys.push(`${filePath}: used missing key "${key}"`);
        }
      }
    }

    expect(missingKeys).toEqual([]);
  });

  it("verifies that raw JSX text nodes do not contain technical snake_case, ISO timestamps, or raw keys", () => {
    const srcDir = resolve(process.cwd(), "src/frontend");
    const files = getFiles(srcDir);
    const violations: string[] = [];

    const forbiddenPrefixes = ["landing.", "dashboard.", "campaignShell."];
    const isoTimestampRegex = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

    // Scan only .tsx files that render JSX
    for (const filePath of files) {
      if (
        filePath.includes("/landing/") || 
        filePath.includes("MainLanding.tsx") || 
        filePath.includes("/shared/api/")
      ) {
        continue;
      }
      
      const content = readFileSync(filePath, "utf8");
      
      // Strip comments
      const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*/g, "");

      // Match text nodes strictly between tags, excluding braces (code) and tags
      const jsxTextRegex = />([^<>{}\n]+)</g;
      let match;

      while ((match = jsxTextRegex.exec(cleanContent)) !== null) {
        const text = match[1].trim();
        if (!text) continue;

        // Skip common JS logical expressions that might look like tag boundary
        if (
          text.includes("&&") || 
          text.includes("||") || 
          text.includes("==") || 
          text.includes("=>") || 
          text.startsWith("const ") ||
          text.startsWith("let ") ||
          text.startsWith("var ")
        ) {
          continue;
        }

        // Check for raw keys
        for (const prefix of forbiddenPrefixes) {
          if (text.includes(prefix)) {
            violations.push(`${filePath}: contains raw key prefix "${prefix}" in text node: "${text}"`);
          }
        }

        // Check for ISO timestamps
        if (isoTimestampRegex.test(text)) {
          violations.push(`${filePath}: contains raw ISO timestamp in text node: "${text}"`);
        }

        // Check for technical snake_case
        const words = text.split(/\s+/);
        for (const word of words) {
          const cleanWord = word.replace(/[^a-zA-Z0-9_]/g, "");
          if (cleanWord.includes("_") && !cleanWord.startsWith("var") && cleanWord.length > 3) {
            // Exclude common punctuation or edge cases
            violations.push(`${filePath}: contains raw snake_case word "${cleanWord}" in text node: "${text}"`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
