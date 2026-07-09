import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
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

describe("web platform campaigns endpoint errors", () => {
  it("returns a consistent JSON error when listing campaigns without authentication", async () => {
    const originalSessionSecret = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "web-platform-randomness-test-secret";
    const server = createServer({ storageMode: "postgres" });

    try {
      const response = await server.inject({
        method: "GET",
        url: "/api/campaigns",
      });

      expect(response.statusCode).toBe(401);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.json()).toEqual({ error: "Authentication required" });
    } finally {
      await server.close();
      if (originalSessionSecret === undefined) {
        delete process.env.SESSION_SECRET;
      } else {
        process.env.SESSION_SECRET = originalSessionSecret;
      }
    }
  });
});
