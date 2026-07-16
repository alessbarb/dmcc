import { describe, expect, it, vi } from "vitest";
import { startCampaignPurgeWorker } from "../../src/backend/operations/campaigns/campaignPurgeWorker.js";

describe("campaign purge worker", () => {
  it("enqueues expired campaigns and processes pending purge jobs with the configured batch size", async () => {
    const enqueueExpiredCampaignPurges = vi.fn(async () => ["cmp_expired"]);
    const processPendingCampaignPurges = vi.fn(async () => ({
      processedCount: 1,
      successes: ["job_1"],
      failures: [],
    }));
    const timer = setInterval(() => undefined, 1_000_000);
    const unrefSpy = vi.spyOn(timer, "unref");
    const setIntervalMock = vi.fn(() => timer);
    const clearIntervalMock = vi.fn((timer: ReturnType<typeof setInterval>) => clearInterval(timer));
    const logger = { info: vi.fn(), error: vi.fn() };

    const worker = startCampaignPurgeWorker(
      { DMCC_PURGE_WORKER_BATCH_SIZE: "7", DMCC_PURGE_WORKER_INTERVAL_MS: "5000" },
      {
        enqueueExpiredCampaignPurges,
        processPendingCampaignPurges,
        setInterval: setIntervalMock,
        clearInterval: clearIntervalMock,
        logger,
        autoStart: false,
      },
    );

    await worker.runNow();
    worker.stop();

    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 5000);
    expect(unrefSpy).toHaveBeenCalledOnce();
    expect(enqueueExpiredCampaignPurges).toHaveBeenCalledOnce();
    expect(processPendingCampaignPurges).toHaveBeenCalledWith({ limit: 7 });
    expect(logger.info).toHaveBeenCalledWith("[campaign-purge-worker] cycle completed", {
      enqueuedCount: 1,
      processedCount: 1,
      successCount: 1,
      failureCount: 0,
    });
    expect(logger.error).not.toHaveBeenCalled();
    expect(clearIntervalMock).toHaveBeenCalledWith(timer);
  });

  it("does not run overlapping cycles", async () => {
    let releaseEnqueue: (() => void) | undefined;
    const enqueueExpiredCampaignPurges = vi.fn(
      () => new Promise<string[]>((resolve) => {
        releaseEnqueue = () => resolve([]);
      }),
    );
    const processPendingCampaignPurges = vi.fn(async () => ({
      processedCount: 0,
      successes: [],
      failures: [],
    }));
    const worker = startCampaignPurgeWorker(
      {},
      {
        enqueueExpiredCampaignPurges,
        processPendingCampaignPurges,
        setInterval: vi.fn(() => setInterval(() => undefined, 1_000_000)),
        clearInterval: vi.fn((timer: ReturnType<typeof setInterval>) => clearInterval(timer)),
        logger: { info: vi.fn(), error: vi.fn() },
        autoStart: false,
      },
    );

    const firstRun = worker.runNow();
    await worker.runNow();
    releaseEnqueue?.();
    await firstRun;
    worker.stop();

    expect(enqueueExpiredCampaignPurges).toHaveBeenCalledOnce();
    expect(processPendingCampaignPurges).toHaveBeenCalledOnce();
  });
});
