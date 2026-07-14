type DatabaseIdentity = {
  database: string;
  user: string;
  serverAddress: string | null;
  serverPort: number | null;
  version: string;
};

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Use db:whoami:development, db:whoami:test, " +
      "or provide the deployment environment explicitly.",
  );
}

let parsedDatabaseUrl: URL;

try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch (error) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL URL.", {
    cause: error,
  });
}

if (
  parsedDatabaseUrl.protocol !== "postgres:" &&
  parsedDatabaseUrl.protocol !== "postgresql:"
) {
  throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
}

const { closeDatabasePool, pool } = await import(
  "../../src/backend/db/client.js"
);

try {
  const result = await pool.query<DatabaseIdentity>(`
    SELECT
      current_database() AS "database",
      current_user AS "user",
      inet_server_addr()::text AS "serverAddress",
      inet_server_port() AS "serverPort",
      version() AS "version"
  `);

  const identity = result.rows[0];

  if (!identity) {
    throw new Error("PostgreSQL did not return database identity information.");
  }

  console.log({
    targetHost: parsedDatabaseUrl.hostname,
    targetDatabase: decodeURIComponent(
      parsedDatabaseUrl.pathname.replace(/^\/+/, ""),
    ),
    ...identity,
  });
} finally {
  await closeDatabasePool();
}
