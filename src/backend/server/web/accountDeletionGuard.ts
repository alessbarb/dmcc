import type { FastifyInstance, FastifyRequest } from "fastify";

function isAccountDeletion(request: FastifyRequest): boolean {
  const pathname = request.raw.url?.split("?", 1)[0];
  return request.method === "DELETE" && pathname === "/api/account";
}

export function registerAccountDeletionGuard(server: FastifyInstance): void {
  server.addHook("preValidation", async (request, reply) => {
    if (!isAccountDeletion(request)) return;

    const email = request.webUser?.email;
    const confirmation = (request.body as { confirmation?: unknown } | undefined)?.confirmation;

    if (!email) return;
    if (typeof confirmation === "string" && confirmation.trim().toLowerCase() === email.toLowerCase()) {
      return;
    }

    reply.code(400);
    return reply.send({
      error: "Account deletion confirmation must match the signed-in email address",
      field: "confirmation",
    });
  });
}
