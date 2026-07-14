import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATION_LOCK_NAMESPACE = "dmcc";
const MIGRATION_LOCK_NAME = "schema-migrations";

export async function runMigrations() {
  const lockClient = await pool.connect();
  let lockAcquired = false;

  try {
    console.log("Waiting for database migration lock...");

    await lockClient.query(
      "SELECT pg_advisory_lock(hashtext($1), hashtext($2))",
      [MIGRATION_LOCK_NAMESPACE, MIGRATION_LOCK_NAME],
    );

    lockAcquired = true;

    console.log("Running migrations...");

    await migrate(db, {
      migrationsFolder: join(__dirname, "migrations"),
    });

    console.log("Migrations ran successfully!");
  } finally {
    try {
      if (lockAcquired) {
        await lockClient.query(
          "SELECT pg_advisory_unlock(hashtext($1), hashtext($2))",
          [MIGRATION_LOCK_NAMESPACE, MIGRATION_LOCK_NAME],
        );
      }
    } finally {
      lockClient.release();
    }
  }
}

// Run if direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Migrations failed:", err);
      await pool.end();
      process.exit(1);
    });
}
