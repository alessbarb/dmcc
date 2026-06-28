/**
 * Seed script: Las Sombras sobre Phandalin
 *
 * Creates a compact, spoiler-aware starter campaign in a running DMCC instance.
 * The data is loaded through the same HTTP API flow as the Oracle seed.
 */

import { init, preflight } from "./client.js";
import { CAMPAIGN_TITLE, CMP } from "./config.js";
import {
  rebuildAndVerify,
  seedCampaign,
  seedClues,
  seedFacts,
  seedFactions,
  seedLocations,
  seedNpcs,
  seedPreMadeCharacters,
  seedQuests,
  seedRelations,
  seedSecrets,
  seedSessions,
  seedCanvas,
} from "./content.js";

async function main() {
  await init();
  const { shouldContinue } = await preflight();
  if (!shouldContinue) return;

  await seedCampaign();
  await seedPreMadeCharacters();
  await seedLocations();
  await seedFactions();
  await seedNpcs();
  await seedQuests();
  await seedClues();
  await seedSecrets();
  await seedRelations();
  await seedFacts();
  await seedSessions();
  await seedCanvas();
  await rebuildAndVerify();

  console.log(`✓ Campaign successfully seeded: ${CAMPAIGN_TITLE} (${CMP})`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
