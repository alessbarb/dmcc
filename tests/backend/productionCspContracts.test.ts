import { describe, expect, it } from "vitest";
import { sanitizeProductionContentSecurityPolicy } from "../../src/backend/server/web/registerWebRoutes.js";

describe("production content security policy", () => {
  it("removes local development and unrestricted websocket sources in production", () => {
    const policy = "default-src 'self'; connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:*; object-src 'none'";

    expect(sanitizeProductionContentSecurityPolicy(policy, "production")).toBe(
      "default-src 'self'; connect-src 'self'; object-src 'none'",
    );
  });

  it("keeps development policy unchanged", () => {
    const policy = "connect-src 'self' ws: http://localhost:*";

    expect(sanitizeProductionContentSecurityPolicy(policy, "test")).toBe(policy);
  });
});
