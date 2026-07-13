import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { registerAuthWebRoutes } from "../../src/backend/server/web/routes/authWebRoutes.js";

async function createAuthServer() {
  const server = Fastify();
  registerAuthWebRoutes(server);
  await server.ready();
  return server;
}

describe("authentication hardening", () => {
  it("registers authentication routes before the server becomes ready", async () => {
    const server = await createAuthServer();

    expect(server.hasRoute({ method: "POST", url: "/api/auth/login" })).toBe(true);
    expect(server.hasRoute({ method: "POST", url: "/api/auth/register" })).toBe(true);

    await server.close();
  });

  it("tracks failed attempts for accounts that do not exist", async () => {
    const server = await createAuthServer();
    const request = {
      method: "POST" as const,
      url: "/api/auth/login",
      payload: { email: "missing@example.test", password: "wrong-password" },
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await server.inject(request);
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "Invalid email or password" });
    }

    const lockedResponse = await server.inject(request);
    expect(lockedResponse.statusCode).toBe(401);
    expect(Number(lockedResponse.headers["retry-after"])).toBeGreaterThan(0);

    await server.close();
  });
});
