import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
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
    expect(server.hasRoute({ method: "POST", url: "/api/auth/password/change" })).toBe(false);
    expect(server.hasRoute({ method: "POST", url: "/api/auth/recovery-codes/regenerate" })).toBe(false);

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

  it("shares login lockouts across server instances", async () => {
    const firstServer = await createAuthServer();
    const secondServer = await createAuthServer();
    const request = {
      method: "POST" as const,
      url: "/api/auth/login",
      payload: { email: "shared-lockout@example.test", password: "wrong-password" },
    };

    try {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const server = attempt % 2 === 0 ? firstServer : secondServer;
        const response = await server.inject(request);
        expect(response.statusCode).toBe(401);
      }

      const lockedResponse = await secondServer.inject(request);
      expect(lockedResponse.statusCode).toBe(401);
      expect(Number(lockedResponse.headers["retry-after"])).toBeGreaterThan(0);

      const [state] = await db.select().from(schema.authThrottleStates).where(eq(schema.authThrottleStates.purpose, "login_lockout"));
      expect(state?.count).toBeGreaterThanOrEqual(5);
      expect(state?.lockedUntil).toBeInstanceOf(Date);
    } finally {
      await firstServer.close();
      await secondServer.close();
    }
  });
});
