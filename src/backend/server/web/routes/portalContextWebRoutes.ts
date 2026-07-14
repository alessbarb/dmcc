import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { getRequiredWebUser } from "../webSession.js";

export type PlatformRole = "dm" | "player" | "admin";
export type PortalKind = "dm" | "player" | "admin";

function sqlRows<T>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.rows) ? value.rows : [];
}

function isPlatformRole(value: unknown): value is PlatformRole {
  return value === "dm" || value === "player" || value === "admin";
}

export function registerPortalContextWebRoutes(server: FastifyInstance): void {
  server.get("/api/account/context", async (request) => {
    const user = getRequiredWebUser(request);
    const result = await db.execute(sql`
      SELECT role
      FROM user_roles
      WHERE user_id = ${user.userId}
      ORDER BY role
    `);
    const roles = sqlRows<{ role: unknown }>(result)
      .map((row) => row.role)
      .filter(isPlatformRole);

    const portals: PortalKind[] = roles.filter((role): role is PortalKind =>
      role === "dm" || role === "player" || role === "admin",
    );

    return {
      user,
      roles,
      portals,
    };
  });
}
