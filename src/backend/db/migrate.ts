import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: join(__dirname, "migrations"),
  });
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
