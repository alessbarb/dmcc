import pg from "pg";

const TEST_DATABASE_NAME = "dmcc_test";
const LOCAL_DATABASE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
]);

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to prepare the local test database.",
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
  throw new Error(
    "DATABASE_URL must use the postgres or postgresql protocol.",
  );
}

const hostname = parsedDatabaseUrl.hostname.toLowerCase();

if (!LOCAL_DATABASE_HOSTS.has(hostname)) {
  throw new Error(
    `Test database preparation refuses remote host "${hostname}".`,
  );
}

const targetDatabaseName = decodeURIComponent(
  parsedDatabaseUrl.pathname.replace(/^\/+/, ""),
);

if (targetDatabaseName !== TEST_DATABASE_NAME) {
  throw new Error(
    `Test database preparation requires database "${TEST_DATABASE_NAME}", ` +
      `but DATABASE_URL targets "${targetDatabaseName || "(empty)"}".`,
  );
}

const administrationUrl = new URL(parsedDatabaseUrl);
administrationUrl.pathname = "/postgres";

const client = new pg.Client({
  connectionString: administrationUrl.toString(),
  ssl: false,
});

try {
  await client.connect();

  const existingDatabase = await client.query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_database
        WHERE datname = $1
      ) AS "exists"
    `,
    [TEST_DATABASE_NAME],
  );

  if (existingDatabase.rows[0]?.exists) {
    console.log(`Test database "${TEST_DATABASE_NAME}" already exists.`);
  } else {
    // The identifier is a compile-time constant, not user-provided input.
    await client.query(`CREATE DATABASE "${TEST_DATABASE_NAME}"`);
    console.log(`Created test database "${TEST_DATABASE_NAME}".`);
  }
} finally {
  await client.end();
}
