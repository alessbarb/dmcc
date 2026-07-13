import { afterEach, describe, expect, it } from "vitest";
import { sanitizeProductionContentSecurityPolicy } from "../../src/backend/server/web/registerWebRoutes.js";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
});

describe("production content security policy", () => {
  it("removes local development and unrestricted websocket sources in production", () => {
    process.env.NODE_ENV = "production";
    const policy = "default-src 'self'; connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:*; object-src 'none'";

    expect(sanitizeProductionContentSecurityPolicy(policy)).toBe(
      "default-src 'self'; connect-src 'self'; object-src 'none'",
    );
  });

  it("keeps development policy unchanged", () => {
    process.env.NODE_ENV = "test";
    const policy = "connect-src 'self' ws: http://localhost:*";

    expect(sanitizeProductionContentSecurityPolicy(policy)).toBe(policy);
  });
});
