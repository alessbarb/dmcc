import type { FastifyInstance } from "fastify";
import { getRequiredWebUser } from "../webSession.js";

export function registerPortalContextWebRoutes(server: FastifyInstance): void {
  server.get("/api/account/context", async (request) => {
    const user = getRequiredWebUser(request);
    return {
      user,
      roles: user.roles,
      portals: [...user.roles],
    };
  });
}
