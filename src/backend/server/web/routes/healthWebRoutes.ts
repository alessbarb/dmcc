import type { FastifyInstance } from "fastify";

export async function registerHealthWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/health", async () => ({ ok: true }));
}
