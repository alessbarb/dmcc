/**
 * Seed script: La Sombra del Oráculo
 *
 * Creates the full campaign in a running DMCC instance.
 * Prerequisites: `npm run dev` must be running on http://localhost:4877
 *
 * Usage:
 *   npx tsx scratch/seed-oracle-campaign.ts
 */

const BASE = "http://localhost:4877";
let DM_TOKEN = "";

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

async function init() {
  const res = await fetch(`${BASE}/api/auth/local-token`);
  const json = (await res.json()) as { token?: string };
  DM_TOKEN = json.token ?? "";
  if (!DM_TOKEN) throw new Error("Could not get DM token — is the server running?");
  console.log("✓ Auth token obtained");
}

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-dm-token": DM_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

const CMP = "cmp_oracle";

async function seedCampaign() {
  // Idempotent: skip if already exists
  const existing = await api("GET", `/api/campaigns/${CMP}`);
  if (existing.status === 200) {
    console.log("✓ Campaign already exists, skipping creation");
    return;
  }

  await api("POST", "/api/campaigns", {
    campaignId: CMP,
    actorId: "usr_dm",
    title: "La Sombra del Oráculo",
    summary:
      "Una conspiración oracular sacude la ciudad de Valdris. Las profecías están rotas. La verdad, enterrada. Niveles 1-6, 9 sesiones.",
    system: "D&D 5.2.1 SRD (CC-BY-4.0)",
  });
  console.log("✓ Campaign created: cmp_oracle");
}

// ---------------------------------------------------------------------------
// Players & Player Characters
// ---------------------------------------------------------------------------

const PLAYERS = [
  { playerId: "ply_elowyn", displayName: "Alejandro", color: "#6366f1" },
  { playerId: "ply_camus",  displayName: "María",     color: "#10b981" },
  { playerId: "ply_ragna",  displayName: "Carlos",    color: "#f59e0b" },
  { playerId: "ply_silas",  displayName: "Laura",     color: "#ef4444" },
];

const PCS = [
  {
    entityId: "ent_pc_elowyn",
    entityType: "player_character",
    title: "Elowyn Darkwater",
    summary: "Elfa pícara, maestra del engaño y la sombra.",
    status: "active",
    importance: "critical",
    metadata: {
      playerId: "ply_elowyn",
      className: "Pícaro",
      level: 3,
      species: "Elfo",
      background: "Forajida",
      armorClass: 14,
      hitPointsCurrent: 22,
      hitPointsMax: 22,
    },
  },
  {
    entityId: "ent_pc_camus",
    entityType: "player_character",
    title: "Hermano Camus",
    summary: "Clérigo humano del Templo de la Verdad, en busca de redención.",
    status: "active",
    importance: "critical",
    metadata: {
      playerId: "ply_camus",
      className: "Clérigo",
      level: 3,
      species: "Humano",
      background: "Acólito",
      armorClass: 16,
      hitPointsCurrent: 27,
      hitPointsMax: 27,
    },
  },
  {
    entityId: "ent_pc_ragna",
    entityType: "player_character",
    title: "Ragna Ironsong",
    summary: "Guerrera enana, veterana de la guardia de Valdris.",
    status: "active",
    importance: "critical",
    metadata: {
      playerId: "ply_ragna",
      className: "Guerrero",
      level: 3,
      species: "Enano",
      background: "Soldado",
      armorClass: 18,
      hitPointsCurrent: 34,
      hitPointsMax: 34,
    },
  },
  {
    entityId: "ent_pc_silas",
    entityType: "player_character",
    title: "Silas el Errante",
    summary: "Bardo mediano, informante y coleccionista de secretos.",
    status: "active",
    importance: "critical",
    metadata: {
      playerId: "ply_silas",
      className: "Bardo",
      level: 3,
      species: "Mediano",
      background: "Embaucador",
      armorClass: 13,
      hitPointsCurrent: 21,
      hitPointsMax: 21,
    },
  },
];

async function seedPlayers() {
  for (const p of PLAYERS) {
    await api("POST", `/api/campaigns/${CMP}/players`, {
      ...p,
      actorId: "usr_dm",
    });
  }
  console.log("✓ 4 player profiles created");

  for (const pc of PCS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, {
      ...pc,
      actorId: "usr_dm",
    });
  }
  console.log("✓ 4 player characters created");
}

// ---------------------------------------------------------------------------
// Stubs (implemented in later tasks)
// ---------------------------------------------------------------------------

async function seedLocations() {
  console.log("TODO: seedLocations");
}

async function seedFactions() {
  console.log("TODO: seedFactions");
}

async function seedNpcs() {
  console.log("TODO: seedNpcs");
}

async function seedQuests() {
  console.log("TODO: seedQuests");
}

async function seedClues() {
  console.log("TODO: seedClues");
}

async function seedSecrets() {
  console.log("TODO: seedSecrets");
}

async function seedSessions() {
  console.log("TODO: seedSessions");
}

async function seedRelations() {
  console.log("TODO: seedRelations");
}

async function seedFacts() {
  console.log("TODO: seedFacts");
}

async function rebuildAndVerify() {
  console.log("TODO: rebuildAndVerify");
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  await init();
  await seedCampaign();
  await seedPlayers();
  await seedLocations();
  await seedFactions();
  await seedNpcs();
  await seedQuests();
  await seedClues();
  await seedSecrets();
  await seedSessions();
  await seedRelations();
  await seedFacts();
  await rebuildAndVerify();
  console.log("\n✅ Campaign seed complete: cmp_oracle");
  console.log("   Open http://localhost:4877 and select 'La Sombra del Oráculo'");
}

main().catch((e: Error) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
