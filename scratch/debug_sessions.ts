import { EventStore } from "../src/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../src/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../src/persistence/repositories/campaignRepository.js";

async function main() {
  const dataDir = "/home/alessbarb/Documents/DMCampaignCompanion";
  const vaultId = "default";
  const campaignId = "cmp_seed_phandalin";

  const eventStore = new EventStore(dataDir, vaultId);
  const snapshotStore = new SnapshotStore(dataDir, vaultId);
  const repo = new CampaignRepository(eventStore, snapshotStore);

  const events = await eventStore.loadEvents(campaignId);
  console.log("EVENTS IN LOG:");
  for (const event of events) {
    console.log(`- Sequence ${event.sequence}: type=${event.type}, payload=${JSON.stringify(event.payload)}`);
  }

  const state = await repo.getCampaignState(campaignId);
  console.log("\nSESSIONS IN PROJECTION:");
  for (const [id, session] of state.sessions.entries()) {
    console.log(`- ${id}: status=${session.status}, title=${session.title}, number=${session.number}`);
  }
}

main().catch(console.error);
