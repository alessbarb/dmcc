import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function gone(_request: FastifyRequest, reply: FastifyReply) {
  reply.code(410);
  return { error: "Legacy vault/LAN/token API removed in PostgreSQL web mode" };
}

export async function registerPlatformCompatibilityRoutes(server: FastifyInstance): Promise<void> {
  server.all("/api/vaults/*", gone);
  server.all("/api/join/:campaignId", gone);
  server.all("/api/campaigns/:campaignId/rejoin", gone);
  server.all("/api/campaigns/:campaignId/register", gone);
  server.all("/api/auth/local-token", gone);
}
