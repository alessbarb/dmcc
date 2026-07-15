import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { SUPPORTED_LOCALE_CODES } from "../../src/shared/i18n/locales.js";
import { t } from "../../src/shared/i18n/translate.js";

describe("Notebooks i18n structural tests", () => {
  const filePath = path.resolve(__dirname, "../../src/frontend/dm/library/notebooks/NotebooksView.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  it("extracts translation keys and confirms they exist in all six languages", () => {
    // Matches all t("key") or t('key') calls
    const keyRegex = /t\(\s*["']([^"']+)["']/g;
    const keys = Array.from(content.matchAll(keyRegex)).map((match) => match[1]);

    // Ensure we actually found some notebooks keys
    const notebooksKeys = keys.filter((key) => key.startsWith("notebooks."));
    expect(notebooksKeys.length).toBeGreaterThan(0);

    // Check each key in all supported locales
    for (const key of notebooksKeys) {
      for (const locale of SUPPORTED_LOCALE_CODES) {
        const translation = t(key, {}, locale);
        // If translation equals the key, it means translation is missing or fallback returned the key
        expect(translation).not.toBe(key);
      }
    }
  });

  it("forbids raw inline fallback patterns like t('...') || '...'", () => {
    // Regex to detect: t("...") || "..." or t('...') || '...'
    const fallbackRegex = /t\(\s*["'][^"']+["']\s*\)\s*\|\|/g;
    const matches = content.match(fallbackRegex);
    expect(matches).toBeNull();
  });
});
