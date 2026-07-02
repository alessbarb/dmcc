import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";

export function makeRepositoryFactory(dataDir: string) {
  return function getRepository(vaultId = "default"): CampaignRepository {
    return new CampaignRepository(
      new EventStore(dataDir, vaultId),
      new SnapshotStore(dataDir, vaultId)
    );
  };
}
