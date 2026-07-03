import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://dmcc:dmcc_password@localhost:5432/dmcc";

const isNeon = connectionString.includes("neon.tech");

export const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX ?? (isNeon ? "5" : "20")),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isNeon ? true : undefined,
});

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
export type DbTransaction = Parameters<Parameters<DbClient["transaction"]>[0]>[0];
