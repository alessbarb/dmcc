import { enqueueExpiredCampaignPurges } from "./enqueueExpiredCampaignPurges.js";
import { processPendingCampaignPurges } from "./processPendingCampaignPurges.js";

const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_BATCH_SIZE = 25;

export type CampaignPurgeWorker = {
  runNow: () => Promise<void>;
  stop: () => void;
};

type CampaignPurgeWorkerTimer = ReturnType<typeof setInterval>;

export type CampaignPurgeWorkerDependencies = {
  enqueueExpiredCampaignPurges?: typeof enqueueExpiredCampaignPurges;
  processPendingCampaignPurges?: typeof processPendingCampaignPurges;
  setInterval?: (callback: () => void, intervalMs: number) => CampaignPurgeWorkerTimer;
  clearInterval?: (timer: CampaignPurgeWorkerTimer) => void;
  logger?: Pick<Console, "info" | "error">;
  autoStart?: boolean;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function startCampaignPurgeWorker(
  env: NodeJS.ProcessEnv = process.env,
  dependencies: CampaignPurgeWorkerDependencies = {},
): CampaignPurgeWorker {
  const intervalMs = positiveInteger(env.DMCC_PURGE_WORKER_INTERVAL_MS, DEFAULT_INTERVAL_MS);
  const batchSize = positiveInteger(env.DMCC_PURGE_WORKER_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  const enqueueExpired = dependencies.enqueueExpiredCampaignPurges ?? enqueueExpiredCampaignPurges;
  const processPending = dependencies.processPendingCampaignPurges ?? processPendingCampaignPurges;
  const scheduleInterval = dependencies.setInterval ?? ((callback, interval) => setInterval(callback, interval));
  const unscheduleInterval = dependencies.clearInterval ?? ((timer) => clearInterval(timer));
  const logger = dependencies.logger ?? console;
  let running = false;
  let stopped = false;

  const runNow = async (): Promise<void> => {
    if (running || stopped) return;
    running = true;

    try {
      const enqueued = await enqueueExpired();
      const result = await processPending({ limit: batchSize });

      if (enqueued.length > 0 || result.processedCount > 0) {
        logger.info("[campaign-purge-worker] cycle completed", {
          enqueuedCount: enqueued.length,
          processedCount: result.processedCount,
          successCount: result.successes.length,
          failureCount: result.failures.length,
        });
      }

      if (result.failures.length > 0) {
        logger.error("[campaign-purge-worker] purge jobs failed", {
          failures: result.failures,
        });
      }
    } catch (error) {
      logger.error("[campaign-purge-worker] cycle failed", error);
    } finally {
      running = false;
    }
  };

  const timer = scheduleInterval(() => {
    void runNow();
  }, intervalMs);
  timer.unref?.();

  if (dependencies.autoStart !== false) {
    void runNow();
  }

  return {
    runNow,
    stop: () => {
      stopped = true;
      unscheduleInterval(timer);
    },
  };
}
