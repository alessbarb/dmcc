import { pool } from "../../src/backend/db/client.js";
import { enqueueExpiredCampaignPurges } from "../../src/backend/operations/campaigns/enqueueExpiredCampaignPurges.js";
import { processPendingCampaignPurges } from "../../src/backend/operations/campaigns/processPendingCampaignPurges.js";

async function main() {
  console.log("Starting platform purge runner...");

  // 1. Enqueue campaigns in trash whose retention period has expired
  const enqueuedCampaigns = await enqueueExpiredCampaignPurges();
  console.log(`Enqueued ${enqueuedCampaigns.length} expired campaign(s) for physical purge.`);
  if (enqueuedCampaigns.length > 0) {
    console.log("Enqueued campaigns:", enqueuedCampaigns);
  }

  // 2. Process all pending and failed purge jobs in batches
  const batchResult = await processPendingCampaignPurges({ limit: 50 });
  console.log(`Batch processing finished:`);
  console.log(`- Total jobs processed: ${batchResult.processedCount}`);
  console.log(`- Successes (${batchResult.successes.length}):`, batchResult.successes);
  console.log(`- Failures (${batchResult.failures.length}):`, batchResult.failures);
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Purge runner script failed:", err);
    await pool.end();
    process.exit(1);
  });
