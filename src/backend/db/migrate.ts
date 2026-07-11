import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Temporary post-legacy compatibility for pre-0.7 databases after the web-first schema rename.
 *
 * This helper is intentionally isolated from normal app startup: it only runs as
 * part of db:migrate, where it can safely finish the one-time workspace/app-role
 * rename for databases that were deployed between migration cuts.
 *
 * TODO(post-legacy): remove this helper after every deployed database has run the
 * migration that renamed vault_id/vault_role to workspace_partition_id/app_role.
 */
async function ensurePostLegacySchemaCompatibility() {
  await pool.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'vault_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "vault_id" TO "workspace_partition_id";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "workspace_partition_id" text NOT NULL DEFAULT 'default';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'vault_role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'app_role'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "vault_role" TO "app_role";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'app_role'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "app_role" text NOT NULL DEFAULT 'user';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'vault_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "workspaces" RENAME COLUMN "vault_id" TO "workspace_partition_id";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'workspace_partition_id'
  ) THEN
    ALTER TABLE "workspaces" ADD COLUMN "workspace_partition_id" text NOT NULL DEFAULT 'default';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'vault_id'
  ) THEN
    ALTER TABLE "campaigns" DROP COLUMN "vault_id";
  END IF;
END $$;
`);
}

export async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: join(__dirname, "migrations"),
  });
  await ensurePostLegacySchemaCompatibility();
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
