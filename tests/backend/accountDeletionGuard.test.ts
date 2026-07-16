import Fastify, { type FastifyInstance } from "fastify";
import { describe, expect, it } from "vitest";
import { registerAccountDeletionGuard } from "../../src/backend/server/web/accountDeletionGuard.js";

async function createServer(registerExtraRoutes?: (server: FastifyInstance) => void) {
  const server = Fastify();
  server.decorateRequest("webUser", null);
  server.addHook("onRequest", async (request) => {
    request.webUser = {
      userId: "usr_test",
      email: "owner@example.test",
      displayName: "Owner",
      roles: ["dm"],
    };
  });
  registerAccountDeletionGuard(server);
  server.delete("/api/account", async () => ({ deleted: true }));
  registerExtraRoutes?.(server);
  await server.ready();
  return server;
}

describe("account deletion confirmation", () => {
  it("rejects a missing or mismatched confirmation", async () => {
    const server = await createServer();

    for (const confirmation of [undefined, "another@example.test"]) {
      const response = await server.inject({
        method: "DELETE",
        url: "/api/account",
        payload: { confirmation },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: "Account deletion confirmation must match the signed-in email address",
        field: "confirmation",
      });
    }

    await server.close();
  });

  it("accepts the signed-in email without case sensitivity", async () => {
    const server = await createServer();
    const response = await server.inject({
      method: "DELETE",
      url: "/api/account",
      payload: { confirmation: " OWNER@EXAMPLE.TEST " },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ deleted: true });

    await server.close();
  });

  it("does not affect other endpoints", async () => {
    const server = await createServer((app) => {
      app.delete("/api/account/sessions", async () => ({ revoked: true }));
    });

    const response = await server.inject({
      method: "DELETE",
      url: "/api/account/sessions",
      payload: {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ revoked: true });

    await server.close();
  });
});
