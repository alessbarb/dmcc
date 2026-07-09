export const LOCAL_DEV_DATABASE_URL = "postgresql://dmcc:dmcc_password@localhost:5432/dmcc";

const PRODUCTION_ENV = "production";

/**
 * Resolves the Postgres connection string while ensuring development defaults
 * cannot be used accidentally in production deployments.
 */
export function resolveDatabaseConnectionString(env: NodeJS.ProcessEnv = process.env): string {
  const explicitDatabaseUrl = env.DATABASE_URL;

  if (explicitDatabaseUrl && explicitDatabaseUrl.trim().length > 0) {
    return explicitDatabaseUrl;
  }

  if (env.NODE_ENV === PRODUCTION_ENV) {
    throw new Error("DATABASE_URL must be set when NODE_ENV=production; development database credentials are not allowed in production.");
  }

  return LOCAL_DEV_DATABASE_URL;
}
