import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { resolve } from "path";

// Shared map for command execution serialization per campaign absolute path
const campaignCommandQueues = new Map<string, Promise<unknown>>();

export function makeRepositoryFactory(dataDir: string) {
  return function getRepository(vaultId = "default"): CampaignRepository {
    const runQueued = <T>(campaignId: string, fn: () => Promise<T>): Promise<T> => {
      const queueKey = `${resolve(dataDir, "vaults", vaultId)}:${campaignId}`;
      const lastPromise = campaignCommandQueues.get(queueKey) ?? Promise.resolve();
      const currentPromise = lastPromise.then(fn);
      const nextPromise = currentPromise
        .then(() => undefined, () => undefined)
        .finally(() => {
          if (campaignCommandQueues.get(queueKey) === nextPromise) {
            campaignCommandQueues.delete(queueKey);
          }
        });
      campaignCommandQueues.set(queueKey, nextPromise);
      return currentPromise;
    };

    return new CampaignRepository(
      new EventStore(dataDir, vaultId),
      new SnapshotStore(dataDir, vaultId),
      runQueued
    );
  };
}
