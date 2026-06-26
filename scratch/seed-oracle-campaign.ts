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
  const LOCATIONS = [
    {
      entityId: "ent_loc_valdris", entityType: "location",
      title: "Ciudad de Valdris", summary: "Ciudad portuaria de tamaño medio, gobernada por el Consejo y bendecida (¿o maldita?) por el Oráculo.",
      status: "active", importance: "critical",
      metadata: { locationType: "settlement", publicDescription: "Ciudad comercial en la costa, famosa por su Oráculo profético." },
    },
    {
      entityId: "ent_loc_sala_oraculo", entityType: "location",
      title: "Sala del Oráculo", summary: "Templo interior donde Veradis entrega sus profecías. Acceso restringido.",
      status: "active", importance: "critical",
      metadata: { locationType: "building", publicDescription: "Sanctum sagrado del Oráculo. Solo los convocados entran.", privateDescription: "Cámara de ilusión arcana. La 'voz divina' es una construcción mágica." },
    },
    {
      entityId: "ent_loc_ruinas", entityType: "location",
      title: "Ruinas del Templo Antiguo", summary: "Lo que queda del templo original de la Verdad, destruido hace 20 años.",
      status: "active", importance: "high",
      metadata: { locationType: "dungeon", atmosphere: "Húmedo, opresivo. Ecos de algo que fue sagrado.", dangers: ["trampas antiguas", "guardianes no-muertos menores"] },
    },
    {
      entityId: "ent_loc_boveda", entityType: "location",
      title: "Bóveda Subterránea", summary: "Cámara secreta bajo las ruinas donde el Oráculo oculta las pruebas.",
      status: "active", importance: "critical",
      metadata: { locationType: "dungeon", privateDescription: "Contiene los registros de 20 años de profecías falsificadas.", dangers: ["Guardianes de élite del culto", "cerradura arcana"] },
    },
    {
      entityId: "ent_loc_taberna_cuervo", entityType: "location",
      title: "Taberna del Cuervo", summary: "Base de operaciones de facto del grupo. Torben el tabernero los protege discretamente.",
      status: "active", importance: "normal",
      metadata: { locationType: "building", publicDescription: "Taberna ruidosa del barrio portuario. Buena cerveza, mejor información.", atmosphere: "Humo de pipa, música folk, secretos susurrados." },
    },
    {
      entityId: "ent_loc_puerto", entityType: "location",
      title: "Puerto de Valdris", summary: "Entrada y salida de la ciudad. Centro de contrabando y espionaje.",
      status: "active", importance: "normal",
      metadata: { locationType: "landmark", publicDescription: "Puerto activo, comercio marítimo." },
    },
    {
      entityId: "ent_loc_barrio_noble", entityType: "location",
      title: "Barrio Noble", summary: "Residencias de la élite de Valdris, incluyendo Lord Vantis.",
      status: "active", importance: "normal",
      metadata: { locationType: "region" },
    },
    {
      entityId: "ent_loc_archivo", entityType: "location",
      title: "Archivo de la Ciudad", summary: "Repositorio de registros históricos. Mira la Archivista es su guardiana.",
      status: "active", importance: "high",
      metadata: { locationType: "building", publicDescription: "Colección de registros desde la fundación de Valdris." },
    },
    {
      entityId: "ent_loc_campamento_gremio", entityType: "location",
      title: "Campamento del Gremio", summary: "Guarida oculta del Gremio de Ladrones bajo el puerto.",
      status: "active", importance: "normal",
      metadata: { locationType: "dungeon", privateDescription: "Kael Nightblade opera desde aquí.", dangers: ["centinelas entrenados"] },
    },
    {
      entityId: "ent_loc_santuario_bosque", entityType: "location",
      title: "Santuario del Bosque", summary: "Templo exterior de la Verdad, a medio día de viaje de Valdris.",
      status: "active", importance: "normal",
      metadata: { locationType: "landmark", publicDescription: "Lugar de peregrinaje alternativo, ignorado por el Oráculo.", atmosphere: "Paz perturbada por una creciente sensación de urgencia." },
    },
    {
      entityId: "ent_loc_sala_consejo", entityType: "location",
      title: "Sala del Consejo", summary: "Cámara donde Magister Aldric y los consejeros toman decisiones para Valdris.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: "ent_loc_cuartel_guardia", entityType: "location",
      title: "Cuartel de la Guardia", summary: "Base de operaciones de Lyra Stonehaven y la guardia de la ciudad.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: "ent_loc_mansion_vantis", entityType: "location",
      title: "Mansión Vantis", summary: "Residencia de Lord Vantis en el barrio noble. Reuniones privadas con el culto.",
      status: "active", importance: "high",
      metadata: { locationType: "building", privateDescription: "Hay una sala de reuniones en el sótano donde Vantis se reúne con el inner circle del culto." },
    },
    {
      entityId: "ent_loc_templo_verdad_ciudad", entityType: "location",
      title: "Templo de la Verdad (Ciudad)", summary: "Templo en Valdris, opacado por el Oráculo. Sera Moonwhisper oficia aquí.",
      status: "active", importance: "normal",
      metadata: { locationType: "building" },
    },
    {
      entityId: "ent_loc_muelles", entityType: "location",
      title: "Muelles del Puerto", summary: "Zona de carga. Lugar de encuentros discretos y tratos con el Consorcio.",
      status: "active", importance: "low",
      metadata: { locationType: "landmark" },
    },
  ];

  for (const loc of LOCATIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...loc, actorId: "usr_dm" });
  }
  console.log(`✓ ${LOCATIONS.length} locations created`);
}

async function seedFactions() {
  const FACTIONS = [
    {
      entityId: "ent_fac_culto", entityType: "faction",
      title: "Culto del Oráculo", summary: "Organización jerárquica que sostiene el poder de Veradis.",
      status: "active", importance: "critical",
      metadata: { role: "antagonista principal", goal: "Mantener el poder del Oráculo y el flujo de riqueza de los creyentes.", secret: "Saben que las profecías son falsas. Son cómplices voluntarios." },
    },
    {
      entityId: "ent_fac_consejo", entityType: "faction",
      title: "Consejo de la Ciudad", summary: "Gobierno de Valdris. Tres facciones internas en pugna.",
      status: "active", importance: "high",
      metadata: { role: "neutro / potencialmente aliado", goal: "Gobernar Valdris y mantener el orden público.", secret: "Algunos consejeros saben de la corrupción y miran hacia otro lado." },
    },
    {
      entityId: "ent_fac_gremio", entityType: "faction",
      title: "Gremio de Ladrones", summary: "Red criminal organizada bajo Kael Nightblade. Tienen pruebas del fraude del Oráculo.",
      status: "active", importance: "high",
      metadata: { role: "ambiguo — potencial aliado o amenaza", goal: "Poder e influencia en Valdris. El Oráculo les pisa el terreno.", secret: "Kael tiene registros contables que prueban que Vantis paga al culto. Los guarda como seguro de vida." },
    },
    {
      entityId: "ent_fac_templo_verdad", entityType: "faction",
      title: "Templo de la Verdad", summary: "Orden religiosa que predica contra la ilusión oracular. Marginados en Valdris.",
      status: "active", importance: "normal",
      metadata: { role: "aliado potencial", goal: "Exponer al Oráculo como fraude. Restaurar el culto a la Verdad real.", secret: "Poseen textos antiguos que describen exactamente cómo funciona la ilusión arcana del Oráculo." },
    },
    {
      entityId: "ent_fac_consorcio", entityType: "faction",
      title: "Consorcio de Mercaderes", summary: "Gremio de comerciantes poderosos. Se mueven por interés económico puro.",
      status: "active", importance: "normal",
      metadata: { role: "oportunista — puede ser aliado o obstáculo", goal: "Proteger sus rutas comerciales y contratos.", secret: "Dorian Vex espía para el Consorcio dentro del propio Consejo." },
    },
  ];

  for (const fac of FACTIONS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...fac, actorId: "usr_dm" });
  }
  console.log(`✓ ${FACTIONS.length} factions created`);
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
