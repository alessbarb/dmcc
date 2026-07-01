import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";
import { EventStore } from "../src/core/persistence/eventStore/eventStore.js";

describe("EventStore benchmark", () => {
  it("records append and full-verification latency", async () => {
    const sizes = [100, 1_000, 10_000];
    const results: Array<Record<string, number>> = [];

    for (const size of sizes) {
      const dataDir = await mkdtemp(join(tmpdir(), `dmcc-event-benchmark-${size}-`));
      try {
        const store = new EventStore(dataDir);
        const campaignId = `cmp_benchmark_${size}`;
        const startedAt = performance.now();
        for (let index = 0; index < size; index += 1) {
          await store.appendEvent(campaignId, "VaultCreated", "usr_benchmark", { name: `event-${index}` });
        }
        const appendMs = performance.now() - startedAt;
        const verifyStartedAt = performance.now();
        const verified = await store.verifyAndRebuildIndex(campaignId);
        const verifyMs = performance.now() - verifyStartedAt;
        results.push({
          events: size,
          appendMs: Math.round(appendMs),
          appendMillisecondsPerEvent: Number((appendMs / size).toFixed(3)),
          fullVerifyMs: Math.round(verifyMs),
          verifiedSequence: verified.sequence,
        });
        expect(verified.sequence).toBe(size);
      } finally {
        await rm(dataDir, { recursive: true, force: true });
      }
    }

    console.table(results);
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  }, 120_000);
});
