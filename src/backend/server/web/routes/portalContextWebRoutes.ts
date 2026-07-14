import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { userRoles } from "../../../db/authSchema.js";
import { getRequiredWebUser } from "../webSession.js";

export type PlatformRole = "dm" | "player" | "admin";
export type PortalKind = PlatformRole;

function isPlatformRole(value: unknown): value is PlatformRole {
  return value === "dm" || value === "player" || value === "admin";
}

export function registerPortalContextWebRoutes(server: FastifyInstance): void {
  server.get("/api/account/context", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.userId));
    const roles = rows.map((row) => row.role).filter(isPlatformRole).sort();

    return {
      user,
      roles,
      portals: [...roles],
    };
  });
}
