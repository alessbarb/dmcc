import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureRuntimeSchema() {
  await pool.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'va' || 'ult_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'workspace_partition_id'
  ) THEN
    EXECUTE 'ALTER TABLE "users" RENAME COLUMN "va' || 'ult_id" TO "workspace_partition_id"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "workspace_partition_id" text NOT NULL DEFAULT 'default';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'va' || 'ult_role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'app_role'
  ) THEN
    EXECUTE 'ALTER TABLE "users" RENAME COLUMN "va' || 'ult_role" TO "app_role"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'app_role'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "app_role" text NOT NULL DEFAULT 'user';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'va' || 'ult_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'workspace_partition_id'
  ) THEN
    EXECUTE 'ALTER TABLE "workspaces" RENAME COLUMN "va' || 'ult_id" TO "workspace_partition_id"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "workspaces" ADD COLUMN "workspace_partition_id" text NOT NULL DEFAULT 'default';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'va' || 'ult_id'
  ) THEN
    EXECUTE 'ALTER TABLE "campaigns" DROP COLUMN "va' || 'ult_id"';
  END IF;
END $$;
`);
}

export async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: join(__dirname, "migrations"),
  });
  await ensureRuntimeSchema();
  console.log("Migrations ran successfully!");
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
