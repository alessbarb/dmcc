import { pool } from "../../src/backend/db/client.js";

async function main() {
  const result = await pool.query(
    'SELECT user_id, email_normalized, display_name, disabled_at FROM users WHERE is_platform_admin = true ORDER BY email_normalized ASC'
  );

  console.log("\n=== Platform Administrators ===");
  if (result.rows.length === 0) {
    console.log("No platform administrators found.");
    return;
  }

  console.table(
    result.rows.map((row) => ({
      "ID": row.user_id,
      "Email": row.email_normalized,
      "Name": row.display_name ?? "(None)",
      "Status": row.disabled_at ? `Disabled since ${row.disabled_at.toISOString()}` : "Active",
    }))
  );
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Script failed:", err);
    await pool.end();
    process.exit(1);
  });
