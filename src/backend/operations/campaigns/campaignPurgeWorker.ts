import { enqueueExpiredCampaignPurges } from "./enqueueExpiredCampaignPurges.js";
import { processPendingCampaignPurges } from "./processPendingCampaignPurges.js";

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 25;

export type CampaignPurgeWorker = {
  runNow: () => Promise<void>;
  stop: () => void;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function startCampaignPurgeWorker(
  env: NodeJS.ProcessEnv = process.env,
): CampaignPurgeWorker {
  const intervalMs = positiveInteger(env.DMCC_PURGE_WORKER_INTERVAL_MS, DEFAULT_INTERVAL_MS);
  const batchSize = positiveInteger(env.DMCC_PURGE_WORKER_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  let running = false;
  let stopped = false;

  const runNow = async (): Promise<void> => {
    if (running || stopped) return;
    running = true;

    try {
      const enqueued = await enqueueExpiredCampaignPurges();
      const result = await processPendingCampaignPurges({ limit: batchSize });

      if (enqueued.length > 0 || result.processedCount > 0) {
        console.info("[campaign-purge-worker] cycle completed", {
          enqueuedCount: enqueued.length,
          processedCount: result.processedCount,
          successCount: result.successes.length,
          failureCount: result.failures.length,
        });
      }

      if (result.failures.length > 0) {
        console.error("[campaign-purge-worker] purge jobs failed", {
          failures: result.failures,
        });
      }
    } catch (error) {
      console.error("[campaign-purge-worker] cycle failed", error);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => {
    void runNow();
  }, intervalMs);
  timer.unref();

  void runNow();

  return {
    runNow,
    stop: () => {
      stopped = true;
      clearInterval(timer);
    },
  };
}
