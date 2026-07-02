import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL ?? "postgresql://dmcc:dmcc_password@localhost:5432/dmcc";

export const pool = new pg.Pool({
  connectionString,
  max: 20, // adjust pool size if needed
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
export type DbTransaction = Parameters<Parameters<DbClient["transaction"]>[0]>[0];
