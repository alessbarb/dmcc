import Fastify from "fastify";
import helmet from "@fastify/helmet";
import { describe, expect, it } from "vitest";
import { buildHelmetConfig } from "../../src/backend/server/createServer.js";

async function contentSecurityPolicy(nodeEnv: string): Promise<string> {
  const server = Fastify();
  await server.register(helmet, buildHelmetConfig(nodeEnv));
  server.get("/", async () => ({ ok: true }));

  const response = await server.inject({ method: "GET", url: "/" });
  await server.close();

  return response.headers["content-security-policy"] ?? "";
}

describe("content security policy", () => {
  it("allows only same-origin connections in production", async () => {
    const policy = await contentSecurityPolicy("production");

    expect(policy).toContain("connect-src 'self'");
    expect(policy).not.toContain("ws:");
    expect(policy).not.toContain("wss:");
    expect(policy).not.toContain("localhost");
    expect(policy).not.toContain("127.0.0.1");
  });

  it("allows local development connections outside production", async () => {
    const policy = await contentSecurityPolicy("test");

    expect(policy).toContain("connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:*");
  });
});
