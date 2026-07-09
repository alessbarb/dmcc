import { describe, expect, it } from "vitest";
import { generateShortTableCode, SHORT_TABLE_CODE_ALPHABET } from "../../src/backend/server/web/webPlatformRoutes.js";

describe("web platform table codes", () => {
  it("generates codes in the expected 4-4 format", () => {
    expect(generateShortTableCode()).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("only uses characters from the table code alphabet", () => {
    for (let i = 0; i < 1_000; i += 1) {
      const code = generateShortTableCode();
      for (const char of code.replace("-", "")) {
        expect(SHORT_TABLE_CODE_ALPHABET).toContain(char);
      }
    }
  });
});
