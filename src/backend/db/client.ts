import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { resolveDatabaseConnectionString } from "./config.js";
import * as schema from "./schema.js";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const PRODUCTION_ENV = "production";

type DatabaseSslMode = "auto" | "require" | "disable";
type DatabaseSslConfig = pg.PoolConfig["ssl"];

interface DatabaseSslOptions {
  databaseUrl: string;
  env?: NodeJS.ProcessEnv;
}

function parseDatabaseUrl(databaseUrl: string): URL {
  try {
    return new URL(databaseUrl);
  } catch (error) {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.", { cause: error });
  }
}

function normalizeSslMode(rawMode: string | undefined): DatabaseSslMode {
  const mode = rawMode?.trim().toLowerCase();

  if (mode === undefined || mode.length === 0) {
    return "auto";
  }

  if (mode === "auto" || mode === "require" || mode === "disable") {
    return mode;
  }

  throw new Error('DATABASE_SSL_MODE must be one of "auto", "require", or "disable".');
}

function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

function isUnixSocketConnection(parsedUrl: URL): boolean {
  return parsedUrl.searchParams.has("host") || parsedUrl.hostname.startsWith("/") || parsedUrl.pathname.startsWith("/.s.PGSQL.");
}

function isRemoteDatabaseHost(parsedUrl: URL): boolean {
  return !isLoopbackHost(parsedUrl.hostname) && !isUnixSocketConnection(parsedUrl);
}

/**
 * Decides the node-postgres SSL option from DATABASE_URL and DATABASE_SSL_MODE.
 *
 * DATABASE_SSL_MODE values:
 * - `auto` (default): require TLS for remote hosts; disable it only for loopback or Unix sockets.
 * - `require`: always require TLS with normal certificate validation.
 * - `disable`: disable TLS; rejected in production when DATABASE_URL points at a remote host.
 *
 * For private CAs, provide CA material through the platform/runtime (for example
 * `PGSSLROOTCERT`) or a connection-string `sslrootcert` value supported by node-postgres.
 */
export function resolveDatabaseSslConfig({ databaseUrl, env = process.env }: DatabaseSslOptions): DatabaseSslConfig {
  const parsedUrl = parseDatabaseUrl(databaseUrl);
  const sslMode = normalizeSslMode(env.DATABASE_SSL_MODE);
  const isRemoteHost = isRemoteDatabaseHost(parsedUrl);

  if (sslMode === "disable") {
    if (env.NODE_ENV === PRODUCTION_ENV && isRemoteHost) {
      throw new Error("DATABASE_SSL_MODE=disable is not allowed for remote DATABASE_URL hosts when NODE_ENV=production.");
    }

    return undefined;
  }

  if (sslMode === "require" || isRemoteHost) {
    return true;
  }

  return undefined;
}

const connectionString = resolveDatabaseConnectionString();
const ssl = resolveDatabaseSslConfig({ databaseUrl: connectionString });

export const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX ?? (ssl ? "5" : "20")),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl,
});

let poolClosePromise: Promise<void> | undefined;

/** Closes the shared PostgreSQL pool once, even when multiple shutdown signals race. */
export function closeDatabasePool(): Promise<void> {
  poolClosePromise ??= pool.end();
  return poolClosePromise;
}

export const db = drizzle(pool, { schema });
export type DbClient = typeof db;
export type DbTransaction = Parameters<Parameters<DbClient["transaction"]>[0]>[0];
