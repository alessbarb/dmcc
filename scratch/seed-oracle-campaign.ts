/**
 * Seed script: La Sombra del Oráculo
 *
 * Creates the full campaign in a running DMCC instance.
 * Sessions are intentionally not seeded: the DM opens/closes sessions in the app.
 *
 * Prerequisites: server running on DMCC_BASE_URL, default http://localhost:4877
 *
 * Usage:
 *   npx tsx scratch/seed-oracle-campaign.ts
 *   DMCC_SEED_MODE=replace DMCC_SEED_CONFIRM="La Sombra del Oráculo" npx tsx scratch/seed-oracle-campaign.ts
 *
 * Modes:
 *   create  - default; fail if the target campaign already exists
 *   replace - delete the target campaign first; requires DMCC_SEED_CONFIRM to match the title
 *   dry-run - authenticate/preflight only; performs no writes
 */

import { init, preflight } from "./oracle-seed/client.ts";
import { CMP } from "./oracle-seed/config.ts";
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
} from "./oracle-seed/content.ts";

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

  console.log(`\n✅ Campaign seed complete: ${CMP}`);
  console.log("   Open the DMCC app and select 'La Sombra del Oráculo'");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
