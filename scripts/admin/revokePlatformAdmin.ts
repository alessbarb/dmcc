import { pool } from "../../src/backend/db/client.js";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: tsx scripts/admin/revokePlatformAdmin.ts <email>");
    process.exit(1);
  }

  const userRes = await pool.query(
    'SELECT user_id, email_normalized, is_platform_admin FROM users WHERE email_normalized = $1',
    [email]
  );

  const user = userRes.rows[0];
  if (!user) {
    console.error(`Error: User with email "${email}" not found.`);
    process.exit(1);
  }

  if (!user.is_platform_admin) {
    console.log(`User "${email}" is not a platform administrator.`);
    return;
  }

  // Ensure this doesn't leave 0 active administrators
  const countRes = await pool.query(
    'SELECT COUNT(*) as active_count FROM users WHERE is_platform_admin = true AND disabled_at IS NULL'
  );
  const activeCount = Number(countRes.rows[0].active_count);

  if (activeCount <= 1) {
    console.error("Error: Cannot revoke privileges. At least one active platform administrator must remain in the system.");
    process.exit(1);
  }

  await pool.query(
    'UPDATE users SET is_platform_admin = false WHERE user_id = $1',
    [user.user_id]
  );

  console.log(`Successfully revoked platform administrator privileges from "${email}".`);
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
