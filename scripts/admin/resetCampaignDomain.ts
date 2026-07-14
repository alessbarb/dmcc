import { pool } from "../../src/backend/db/client.js";

const CONFIRMATION = "RESET_CAMPAIGN_DOMAIN";

async function main() {
  if (process.argv.includes(`--confirm=${CONFIRMATION}`) === false) {
    throw new Error(`Pass --confirm=${CONFIRMATION} to perform the destructive reset.`);
  }

  console.log("Destructive reset of Campaign Domain starting...");

  const tablesToReset = [
    "campaign_message_reads",
    "campaign_messages",
    "player_portal_resources",
    "player_portal_states",
    "activity_feed",
    "attachments",
    "campaign_clues",
    "campaign_invitation_acceptances",
    "campaign_invitations",
    "campaign_notes",
    "campaign_objectives",
    "campaign_relations",
    "campaign_scenes",
    "campaign_sessions",
    "campaign_snapshots",
    "campaign_entities",
    "campaign_facts",
    "campaign_memberships",
    "characters",
    "command_index",
    "domain_events",
    "live_tables",
    "player_profiles",
    "player_proposals",
    "visibility_grants",
    "campaigns"
  ];

  await pool.query("BEGIN");
  try {
    for (const table of tablesToReset) {
      await pool.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }
    await pool.query("COMMIT");
    console.log("Destructive reset of Campaign Domain completed successfully!");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Destructive reset failed, rolled back changes:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Reset script failed:", err);
    await pool.end();
    process.exit(1);
  });
