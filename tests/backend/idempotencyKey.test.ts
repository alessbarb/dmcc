import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { requireIdempotencyKey } from "../../src/backend/server/web/idempotencyKey.js";

function requestWithHeader(value: unknown) {
  return { headers: { "idempotency-key": value } } as never;
}

describe("idempotency key boundary", () => {
  it("requires a real Idempotency-Key header", () => {
    expect(requireIdempotencyKey(requestWithHeader(" op_123 "))).toBe("op_123");

    expect(() => requireIdempotencyKey(requestWithHeader(undefined))).toThrow("Idempotency-Key header is required");
    expect(() => requireIdempotencyKey(requestWithHeader(["op_123"]))).toThrow("Idempotency-Key header is required");
    expect(() => requireIdempotencyKey(requestWithHeader("   "))).toThrow("Idempotency-Key header is required");
  });

  it("does not let command routes silently generate fallback command ids", () => {
    const files = [
      "src/backend/server/web/routes/campaignWebRoutes.ts",
      "src/backend/server/web/routes/canvasWebRoutes.ts",
      "src/backend/server/web/routes/storyWebRoutes.ts",
      "src/backend/server/web/routes/notebooksWebRoutes.ts",
      "src/backend/server/web/routes/campaignTemplateWebRoutes.ts",
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain('?? createId("cmd")');
      expect(source, file).not.toContain('headers["command-id"]');
    }
  });
});
