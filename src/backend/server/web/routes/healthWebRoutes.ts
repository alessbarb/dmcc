import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "../../../db/client.js";

export type ReadinessResult =
  | { ready: true }
  | { ready: false; reason: "database_unavailable" };

export async function checkDatabaseReadiness(
  execute: () => Promise<unknown> = () => db.execute(sql`select 1`),
): Promise<ReadinessResult> {
  try {
    await execute();
    return { ready: true };
  } catch {
    return { ready: false, reason: "database_unavailable" };
  }
}

export async function registerHealthWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/health", async () => ({ ok: true }));

  server.get("/api/ready", async (_request, reply) => {
    const result = await checkDatabaseReadiness();
    if (!result.ready) reply.code(503);
    return result;
  });
}
