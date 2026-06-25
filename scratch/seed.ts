import { EventStore } from "../src/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../src/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../src/persistence/repositories/campaignRepository.js";
import * as fs from "fs/promises";
import { join } from "path";

async function seedPhandalin(dataDir: string, vaultId: string) {
  const campaignId = "cmp_seed_phandalin";
  
  // Clean directory first to start completely fresh
  try {
    const campaignDir = join(dataDir, "vaults", vaultId, "campaigns", campaignId);
    await fs.rm(campaignDir, { recursive: true, force: true });
  } catch {}

  const eventStore = new EventStore(dataDir, vaultId);
  const snapshotStore = new SnapshotStore(dataDir, vaultId);
  const repo = new CampaignRepository(eventStore, snapshotStore);

  console.log("Seeding campaign:", campaignId);

  // 1. Create Campaign
  await repo.appendEvent(campaignId, "CampaignCreated", "usr_dm", {
    campaignId,
    title: "Las Sombras sobre Phandalin",
    system: "dnd_srd_5_2_1",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      backupOnClose: true,
      lanModeEnabled: false,
      activeQuestsLimit: 5,
    },
  });

  // 2. Create Players
  const players = [
    { playerId: "ply_alice", displayName: "Alice the Bold", role: "player", color: "#e11d48" },
    { playerId: "ply_bob", displayName: "Bob the Stalwart", role: "player", color: "#2563eb" },
    { playerId: "ply_charlie", displayName: "Charlie the Swift", role: "player", color: "#16a34a" },
  ];

  for (const p of players) {
    await repo.appendEvent(campaignId, "PlayerProfileCreated", "usr_dm", {
      ...p,
      id: p.playerId,
      campaignId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Create Entities (PCs & NPCs)
  const entities = [
    // PC Entities
    {
      entityId: "ent_elara",
      entityType: "player_character",
      title: "Elara Moonbrook",
      subtitle: "Elf Wizard",
      summary: "A young wizard seeking ancient magical artifacts in Phandalin.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
      metadata: { playerAssociated: "ply_alice" },
    },
    {
      entityId: "ent_tordek",
      entityType: "player_character",
      title: "Tordek Ironshield",
      subtitle: "Dwarf Fighter",
      summary: "A shield dwarf noble looking to restore his clan's honor.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
      metadata: { playerAssociated: "ply_bob" },
    },
    {
      entityId: "ent_valerius",
      entityType: "player_character",
      title: "Valerius the Shadow",
      subtitle: "Human Rogue",
      summary: "A rogue trying to outrun a bounty on his head in Waterdeep.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
      metadata: { playerAssociated: "ply_charlie" },
    },
    // NPCs
    {
      entityId: "ent_npc_gundren",
      entityType: "npc",
      title: "Gundren Rockseeker",
      subtitle: "Dwarf Patron & Merchant",
      summary: "One of the three Rockseeker brothers who discovered the Wave Echo Cave.",
      status: "unknown",
      importance: "critical",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_npc_sildar",
      entityType: "npc",
      title: "Sildar Hallwinter",
      subtitle: "Knight of the Lords' Alliance",
      summary: "A retired knight escorting Gundren to Phandalin. Captured by goblins.",
      status: "known",
      importance: "high",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_npc_glasstaff",
      entityType: "npc",
      title: "Iarno 'Glasstaff' Albrek",
      subtitle: "Leader of the Redbrands",
      summary: "A wizard sent by the Lords' Alliance who went rogue.",
      status: "unknown",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Locations
    {
      entityId: "ent_loc_phandalin",
      entityType: "location",
      title: "Phandalin",
      subtitle: "Frontier Settlement",
      summary: "A lawless frontier town built on the ruins of the Phandelver Pact.",
      status: "active",
      importance: "normal",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_loc_cragmaw_hideout",
      entityType: "location",
      title: "Cragmaw Hideout",
      subtitle: "Goblin Cave Network",
      summary: "The cave hideout where Klarg and his goblins ambush travelers.",
      status: "active",
      importance: "normal",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_loc_tresendar",
      entityType: "location",
      title: "Tresendar Manor ruins",
      subtitle: "Redbrand Ruffians Hideout",
      summary: "Ruined castle in Phandalin with cellars used as a criminal hideout.",
      status: "available",
      importance: "normal",
      visibility: { kind: "public" },
    },
    // Quests
    {
      entityId: "ent_qst_rescue_gundren",
      entityType: "quest",
      title: "Rescue Gundren Rockseeker",
      subtitle: "Main Quest",
      summary: "Find Gundren Rockseeker who was captured and taken to Cragmaw Hideout.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_qst_clear_manor",
      entityType: "quest",
      title: "Clear Tresendar Manor",
      subtitle: "Side Quest",
      summary: "Defeat the Redbrand Ruffians harassing Phandalin.",
      status: "available",
      importance: "normal",
      visibility: { kind: "public" },
    },
    // Clues
    {
      entityId: "ent_clu_goblin_map",
      entityType: "clue",
      title: "Goblin Map",
      subtitle: "Scrawled Parchment",
      summary: "A map found on a goblin rider pointing towards Cragmaw Castle.",
      status: "prepared",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Secrets
    {
      entityId: "ent_sec_glasstaff_identity",
      entityType: "secret",
      title: "Glasstaff is Iarno Albrek",
      subtitle: "Betrayal secret",
      summary: "The wizard Glasstaff is actually the missing mage Iarno Albrek.",
      status: "hidden",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Consequences
    {
      entityId: "ent_csq_redbrand_retaliation",
      entityType: "consequence",
      title: "Redbrand Retaliation",
      subtitle: "Pending threat",
      summary: "If the party sleeps in the town tavern, the Redbrands will raid it.",
      status: "pending",
      importance: "high",
      visibility: { kind: "dm_only" },
    },
  ];

  for (const e of entities) {
    await repo.appendEvent(campaignId, "EntityCreated", "usr_dm", {
      ...e,
      campaignId,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 4. Create Relations
  const relations = [
    { relationId: "rel_1", sourceEntityId: "ent_elara", targetEntityId: "ent_npc_gundren", relationType: "ally_of" },
    { relationId: "rel_2", sourceEntityId: "ent_npc_gundren", targetEntityId: "ent_loc_cragmaw_hideout", relationType: "captive_at" },
    { relationId: "rel_3", sourceEntityId: "ent_npc_glasstaff", targetEntityId: "ent_loc_tresendar", relationType: "leader_of" },
  ];

  for (const r of relations) {
    await repo.appendEvent(campaignId, "RelationCreated", "usr_dm", {
      ...r,
      campaignId,
      status: "active",
      visibility: { kind: "dm_only" },
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 5. Create Facts
  const facts = [
    {
      factId: "fct_1",
      statement: "Phandalin is built on the ruins of a much older settlement.",
      kind: "canon",
      confidence: "confirmed",
      relatedEntityIds: ["ent_loc_phandalin"],
      source: { kind: "manual" },
    },
    {
      factId: "fct_2",
      statement: "The Redbrands are funded by a mysterious wizard called the Black Spider.",
      kind: "rumor",
      confidence: "suspected",
      relatedEntityIds: ["ent_loc_tresendar"],
      source: { kind: "manual" },
    },
    {
      factId: "fct_3",
      statement: "Tordek believes Gundren was betrayed by a doppleganger.",
      kind: "player_theory",
      confidence: "unconfirmed",
      relatedEntityIds: ["ent_npc_gundren", "ent_tordek"],
      source: { kind: "manual" },
    },
  ];

  for (const f of facts) {
    await repo.appendEvent(campaignId, "FactCreated", "usr_dm", {
      ...f,
      campaignId,
      visibility: { kind: "dm_only" },
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 6. Create Sessions
  // Session 1: Road to Phandalin
  await repo.appendEvent(campaignId, "SessionCreated", "usr_dm", {
    sessionId: "ses_1",
    campaignId,
    number: 1,
    title: "El camino a Phandalin",
    status: "planned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionStarted", "usr_dm", {
    id: "ses_1",
    campaignId,
    startedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionClosed", "usr_dm", {
    id: "ses_1",
    campaignId,
    summary: "El grupo comenzó a escoltar el carro de provisiones de Gundren hacia Phandalin. Fueron emboscados por goblins del clan Cragmaw, y tras derrotarlos, descubrieron un rastro que lleva a su guarida. Sildar fue rescatado de la cueva.",
    endedAt: new Date().toISOString(),
  });

  // Session 2: Arriving at Phandalin (Planned and Started)
  await repo.appendEvent(campaignId, "SessionCreated", "usr_dm", {
    sessionId: "ses_2",
    campaignId,
    number: 2,
    title: "Llegada a Phandalin",
    status: "planned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionStarted", "usr_dm", {
    id: "ses_2",
    campaignId,
    startedAt: new Date().toISOString(),
  });
}

async function seedCyberpunk(dataDir: string, vaultId: string) {
  const campaignId = "cmp_seed_cyberpunk";
  
  // Clean directory first to start completely fresh
  try {
    const campaignDir = join(dataDir, "vaults", vaultId, "campaigns", campaignId);
    await fs.rm(campaignDir, { recursive: true, force: true });
  } catch {}

  const eventStore = new EventStore(dataDir, vaultId);
  const snapshotStore = new SnapshotStore(dataDir, vaultId);
  const repo = new CampaignRepository(eventStore, snapshotStore);

  console.log("Seeding campaign:", campaignId);

  // 1. Create Campaign
  await repo.appendEvent(campaignId, "CampaignCreated", "usr_dm", {
    campaignId,
    title: "Lluvia de Neón: Sector 7",
    system: "generic_fantasy_d20", // Default system
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      backupOnClose: true,
      lanModeEnabled: false,
      activeQuestsLimit: 5,
    },
  });

  // 2. Create Players
  const players = [
    { playerId: "ply_alice", displayName: "Alice the Bold", role: "player", color: "#e11d48" },
    { playerId: "ply_bob", displayName: "Bob the Stalwart", role: "player", color: "#2563eb" },
  ];

  for (const p of players) {
    await repo.appendEvent(campaignId, "PlayerProfileCreated", "usr_dm", {
      ...p,
      id: p.playerId,
      campaignId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 3. Create Entities (PCs & NPCs)
  const entities = [
    // PC Entities
    {
      entityId: "ent_vex",
      entityType: "player_character",
      title: "Vex 'Null' Sterling",
      subtitle: "Netrunner",
      summary: "A deck-jockey looking to wipe out Arasaka's main ledger.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
      metadata: { playerAssociated: "ply_alice" },
    },
    {
      entityId: "ent_razor",
      entityType: "player_character",
      title: "Razor Jones",
      subtitle: "Street Samurai",
      summary: "Ex-mil cyber-soldier loaded with chrome and chrome blades.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
      metadata: { playerAssociated: "ply_bob" },
    },
    // NPCs
    {
      entityId: "ent_npc_dexter",
      entityType: "npc",
      title: "Dexter DeShawn",
      subtitle: "Fixer Extraordinaire",
      summary: "One of the most connected fixers in the underworld of Sector 7.",
      status: "known",
      importance: "high",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_npc_vance",
      entityType: "npc",
      title: "Ms. Evelyn Vance",
      subtitle: "Arasaka Regional Director",
      summary: "Cold and calculating corporate director guarding Sector 7 projects.",
      status: "unknown",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Locations
    {
      entityId: "ent_loc_redlight",
      entityType: "location",
      title: "The Red Light Club",
      subtitle: "Underground Safehouse & Bar",
      summary: "Neon-lit bar where fixers meet mercs to coordinate operations.",
      status: "active",
      importance: "normal",
      visibility: { kind: "public" },
    },
    {
      entityId: "ent_loc_arasaka_lab",
      entityType: "location",
      title: "Arasaka R&D Lab 4B",
      subtitle: "Secured Corporation Laboratory",
      summary: "High-security facility where the experimental nanotech is manufactured.",
      status: "available",
      importance: "high",
      visibility: { kind: "dm_only" },
    },
    // Quests
    {
      entityId: "ent_qst_chip_heist",
      entityType: "quest",
      title: "The Relic Prototype Heist",
      subtitle: "Main Quest",
      summary: "Infiltrate Lab 4B and extract the experimental corporate chip.",
      status: "active",
      importance: "high",
      visibility: { kind: "public" },
    },
    // Clues
    {
      entityId: "ent_clu_encryption_key",
      entityType: "clue",
      title: "Encryption Key-Card",
      subtitle: "Decryption Module",
      summary: "A secure key-card found on a corporate agent, capable of unlocking Lab 4B's elevator.",
      status: "prepared",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Secrets
    {
      entityId: "ent_sec_chip_lethal",
      entityType: "secret",
      title: "Lethal Nanotech Feedback",
      subtitle: "Bio-hazard warning",
      summary: "The nanotech in the chip has a feedback loop that destroys any netrunner deck connecting directly to it.",
      status: "hidden",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
    // Consequences
    {
      entityId: "ent_csq_hit_squad",
      entityType: "consequence",
      title: "Arasaka Hit Squad Dispatch",
      subtitle: "Corporate retaliation",
      summary: "If the alarm is raised in Lab 4B, an elite recovery team will hunt the players.",
      status: "pending",
      importance: "high",
      visibility: { kind: "dm_only" },
    },
  ];

  for (const e of entities) {
    await repo.appendEvent(campaignId, "EntityCreated", "usr_dm", {
      ...e,
      campaignId,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 4. Create Relations
  const relations = [
    { relationId: "rel_c1", sourceEntityId: "ent_vex", targetEntityId: "ent_npc_dexter", relationType: "ally_of" },
    { relationId: "rel_c2", sourceEntityId: "ent_npc_dexter", targetEntityId: "ent_loc_redlight", relationType: "frequents" },
  ];

  for (const r of relations) {
    await repo.appendEvent(campaignId, "RelationCreated", "usr_dm", {
      ...r,
      campaignId,
      status: "active",
      visibility: { kind: "dm_only" },
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 5. Create Facts
  const facts = [
    {
      factId: "fct_c1",
      statement: "Sector 7 is controlled under martial law by the Arasaka Corporation.",
      kind: "canon",
      confidence: "confirmed",
      relatedEntityIds: ["ent_loc_arasaka_lab"],
      source: { kind: "manual" },
    },
    {
      factId: "fct_c2",
      statement: "Ms. Vance is secretly planning a coup against the regional CEO.",
      kind: "rumor",
      confidence: "suspected",
      relatedEntityIds: ["ent_npc_vance"],
      source: { kind: "manual" },
    },
  ];

  for (const f of facts) {
    await repo.appendEvent(campaignId, "FactCreated", "usr_dm", {
      ...f,
      campaignId,
      visibility: { kind: "dm_only" },
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 6. Create Sessions
  // Session 1: The Meet
  await repo.appendEvent(campaignId, "SessionCreated", "usr_dm", {
    sessionId: "ses_c1",
    campaignId,
    number: 1,
    title: "El Encuentro en el Club",
    status: "planned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionStarted", "usr_dm", {
    id: "ses_c1",
    campaignId,
    startedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionClosed", "usr_dm", {
    id: "ses_c1",
    campaignId,
    summary: "El equipo se reunió con Dexter DeShawn en el club 'The Red Light'. Dexter les ofreció 50,000 créditos para robar un prototipo de microchip de Arasaka, dándoles los códigos iniciales del perímetro externo.",
    endedAt: new Date().toISOString(),
  });

  // Session 2: Infiltration
  await repo.appendEvent(campaignId, "SessionCreated", "usr_dm", {
    sessionId: "ses_c2",
    campaignId,
    number: 2,
    title: "Infiltración en el Laboratorio 4B",
    status: "planned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await repo.appendEvent(campaignId, "SessionStarted", "usr_dm", {
    id: "ses_c2",
    campaignId,
    startedAt: new Date().toISOString(),
  });
}

async function main() {
  const dataDir = "/home/alessbarb/Documents/DMCampaignCompanion";
  const vaultId = "default";

  await seedPhandalin(dataDir, vaultId);
  await seedCyberpunk(dataDir, vaultId);

  console.log("All seed campaigns successfully created!");
}

main().catch((err) => {
  console.error("SEED FAILED:", err);
  process.exit(1);
});
