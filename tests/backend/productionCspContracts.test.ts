import { describe, expect, it } from "vitest";
import { buildHelmetConfig } from "../../src/backend/server/createServer.js";

function connectSources(nodeEnv: string): string[] {
  const config = buildHelmetConfig(nodeEnv);
  const directives = config?.contentSecurityPolicy && typeof config.contentSecurityPolicy === "object"
    ? config.contentSecurityPolicy.directives
    : undefined;
  return (directives?.["connect-src"] ?? []) as string[];
}

describe("content security policy", () => {
  it("allows only same-origin connections in production", () => {
    expect(connectSources("production")).toEqual(["'self'"]);
  });

  it("allows local development connections outside production", () => {
    expect(connectSources("test")).toEqual([
      "'self'",
      "ws:",
      "wss:",
      "http://localhost:*",
      "http://127.0.0.1:*",
    ]);
  });
});
