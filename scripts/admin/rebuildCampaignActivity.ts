import { db, pool } from "../../src/backend/db/client.js";
import {
  rebuildAllCampaignsActivity,
  rebuildCampaignActivity,
} from "../../src/backend/server/activity/rebuildCampaignActivity.js";

function getArgumentValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function usage(): string {
  return [
    "Usage:",
    "  npm run admin:rebuild-campaign-activity -- --campaign-id=<campaignId>",
    "  npm run admin:rebuild-campaign-activity -- --all",
  ].join("\n");
}

async function main() {
  const campaignId = getArgumentValue("campaign-id")?.trim();
  const rebuildAll = process.argv.includes("--all");

  if (rebuildAll && campaignId) {
    throw new Error(`Choose either --all or --campaign-id, not both.\n${usage()}`);
  }

  if (!rebuildAll && !campaignId) {
    throw new Error(usage());
  }

  const targetCampaignId = campaignId;

  await db.transaction(async (tx) => {
    if (rebuildAll) {
      await rebuildAllCampaignsActivity(tx);
      console.log("Rebuilt derived campaign activity for all campaigns.");
      return;
    }

    if (!targetCampaignId) {
      throw new Error(usage());
    }

    await rebuildCampaignActivity(tx, targetCampaignId);
    console.log(`Rebuilt derived campaign activity for campaign ${targetCampaignId}.`);
  });
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Campaign activity rebuild failed:", error);
    await pool.end();
    process.exit(1);
  });
