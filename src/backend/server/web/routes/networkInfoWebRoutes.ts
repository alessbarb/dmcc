import type { FastifyInstance } from "fastify";
import { networkInterfaces } from "os";
import { resolveWebUser } from "../webSession.js";

function firstLanIPv4(): string | null {
  const interfaces = networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }
  return null;
}

export async function registerNetworkInfoWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/network-info", async (request, reply) => {
    const user = await resolveWebUser(request);
    if (!user) {
      reply.code(401);
      return { error: "Unauthorized" };
    }

    const lanExposed = Boolean((server as unknown as { lanExposed?: boolean }).lanExposed);
    if (!lanExposed) {
      reply.code(404);
      return { error: "LAN mode is not enabled" };
    }

    const address = firstLanIPv4();
    if (!address) {
      reply.code(404);
      return { error: "No LAN address available" };
    }

    const port = request.socket.localPort ?? Number(process.env.DMCC_PORT ?? 4877);
    return { url: `http://${address}:${port}` };
  });
}
