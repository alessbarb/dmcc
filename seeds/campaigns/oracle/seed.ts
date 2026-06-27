/**
 * Seed script: La Sombra del Oráculo
 *
 * Creates the full campaign in a running DMCC instance.
 * Sessions are intentionally not seeded: the DM opens/closes sessions in the app.
 *
 * Prerequisites: server running on DMCC_BASE_URL, default http://localhost:4877
 *
 * Usage:
 *   npm run seed:oracle
 *   npm run seed:oracle:dry
 *   npm run seed:oracle:replace
 *
 * Modes:
 *   create  - default; fail if the target campaign already exists
 *   replace - delete the target campaign first; requires DMCC_SEED_CONFIRM to match the title
 *   dry-run - authenticate/preflight only; performs no writes
 */

import { init, preflight } from "./client.js";
import { CMP } from "./config.js";
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
  // Sessions intentionally omitted: the DM opens/closes sessions in the app.
  await seedRelations();
  await seedFacts();
  await seedCanvas();
  await rebuildAndVerify();

  console.log(`✓ Campaign successfully seeded: ${CMP}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
