import { pool } from "../../src/backend/db/client.js";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: tsx scripts/admin/grantPlatformAdmin.ts <email>");
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

  if (user.is_platform_admin) {
    console.log(`User "${email}" is already a platform administrator.`);
    return;
  }

  await pool.query(
    'UPDATE users SET is_platform_admin = true WHERE user_id = $1',
    [user.user_id]
  );

  console.log(`Successfully granted platform administrator privileges to "${email}".`);
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
