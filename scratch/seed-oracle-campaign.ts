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
  const NPCS = [
    // === ANTAGONISTAS ===
    {
      entityId: "ent_npc_veradis", entityType: "npc",
      title: "Veradis el Oráculo", summary: "El Oráculo de Valdris. Lleva 20 años falsificando profecías con ilusión arcana.",
      status: "active", importance: "critical",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Antagonista principal", attitudeToParty: "deceptive", goal: "Mantener su poder y riqueza acumulados durante 20 años.", fear: "Ser expuesto. Tiene un plan de huida preparado.", secret: "No tiene poderes proféticos reales. Es un ilusionista de nivel 9 (SRD: equivalente a Mago).", factionId: "ent_fac_culto", currentLocationId: "ent_loc_sala_oraculo", voice: "Grave, deliberado, nunca improvisa. Cada palabra calculada." },
    },
    {
      entityId: "ent_npc_vantis", entityType: "npc",
      title: "Lord Vantis", summary: "Noble financiador del culto. A cambio recibe profecías favorables que enriquecen sus negocios.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Cómplice del antagonista", attitudeToParty: "hostile", goal: "Proteger su inversión en el Oráculo y su posición social.", fear: "Que los libros de cuentas del Gremio lleguen a manos del Consejo.", factionId: "ent_fac_culto", currentLocationId: "ent_loc_mansion_vantis" },
    },
    {
      entityId: "ent_npc_guardian_jefe", entityType: "npc",
      title: "Inquisidor Mors", summary: "Jefe de los Guardianes del Culto. Fanático leal a Veradis.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Antagonista secundario", attitudeToParty: "hostile", goal: "Proteger al Oráculo con su vida.", factionId: "ent_fac_culto" },
    },
    // === CONSEJO ===
    {
      entityId: "ent_npc_aldric", entityType: "npc",
      title: "Magister Aldric", summary: "Líder del Consejo de Valdris. Usa el Oráculo como legitimador político pero no sabe que es un fraude.",
      status: "active", importance: "high",
      metadata: { role: "Autoridad neutral", attitudeToParty: "neutral", goal: "Gobernar Valdris con orden. Necesita al Oráculo para mantener la fe pública.", fear: "El caos social si el Oráculo cae.", factionId: "ent_fac_consejo", currentLocationId: "ent_loc_sala_consejo" },
    },
    {
      entityId: "ent_npc_consejera_lena", entityType: "npc",
      title: "Consejera Lena Marsh", summary: "Reformista en el Consejo. Sospecha del Oráculo pero necesita pruebas.",
      status: "active", importance: "normal",
      metadata: { role: "Aliada potencial en el Consejo", attitudeToParty: "friendly", goal: "Reformar el gobierno de Valdris. Exponer la corrupción.", factionId: "ent_fac_consejo" },
    },
    {
      entityId: "ent_npc_consejero_brann", entityType: "npc",
      title: "Consejero Brann", summary: "Conservador. Conoce parte de la verdad y mira hacia otro lado a cambio de estabilidad.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Obstáculo político", attitudeToParty: "suspicious", goal: "Mantener el statu quo.", secret: "Ha visto a Vantis reunirse con representantes del culto. Lo ignora.", factionId: "ent_fac_consejo" },
    },
    // === GUARDIA ===
    {
      entityId: "ent_npc_lyra", entityType: "npc",
      title: "Lyra Stonehaven", summary: "Capitana de la Guardia de Valdris. Leal, metódica, investiga anomalías en silencio.",
      status: "active", importance: "high",
      metadata: { role: "Aliada potencial o complicación", attitudeToParty: "neutral", goal: "Proteger a los ciudadanos de Valdris y mantener el orden.", fear: "Iniciar una crisis institucional sin pruebas suficientes.", currentLocationId: "ent_loc_cuartel_guardia" },
    },
    {
      entityId: "ent_npc_guardia_riku", entityType: "npc",
      title: "Riku", summary: "Guardia de rango bajo. Honesto, nervioso. Tiene información que no sabe cómo usar.",
      status: "active", importance: "low",
      metadata: { role: "Informante involuntario", attitudeToParty: "friendly" },
    },
    // === TABERNA / CONTACTOS ===
    {
      entityId: "ent_npc_torben", entityType: "npc",
      title: "Torben el Tabernero", summary: "Dueño de la Taberna del Cuervo. Informador discreto del Gremio. Protege a los aventureros.",
      status: "active", importance: "normal",
      metadata: { role: "Aliado logístico", attitudeToParty: "friendly", goal: "Mantener su negocio y sus contactos.", factionId: "ent_fac_gremio", currentLocationId: "ent_loc_taberna_cuervo" },
    },
    // === GREMIO ===
    {
      entityId: "ent_npc_kael", entityType: "npc",
      title: "Kael Nightblade", summary: "Jefe del Gremio de Ladrones. Pragmático, leal a nadie. Tiene pruebas del fraude del Oráculo.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Aliado ambiguo / factor inesperado", attitudeToParty: "suspicious", goal: "Usar las pruebas como moneda de cambio, no como acto de justicia.", secret: "Tiene los libros de cuentas que vinculan a Vantis con el culto.", factionId: "ent_fac_gremio", currentLocationId: "ent_loc_campamento_gremio" },
    },
    {
      entityId: "ent_npc_cira", entityType: "npc",
      title: "Cira la Sombra", summary: "Operativa del Gremio. Contacto inicial de los aventureros con la organización.",
      status: "active", importance: "normal",
      metadata: { role: "Contacto del Gremio", attitudeToParty: "neutral", factionId: "ent_fac_gremio" },
    },
    // === TEMPLO DE LA VERDAD ===
    {
      entityId: "ent_npc_sera", entityType: "npc",
      title: "Sera Moonwhisper", summary: "Sacerdotisa del Templo de la Verdad en Valdris. Sabe que el Oráculo es un fraude; tiene los textos que lo prueban.",
      status: "active", importance: "high",
      metadata: { role: "Aliada clave", attitudeToParty: "friendly", goal: "Exponer al Oráculo. Restaurar la verdadera fe.", fear: "El peligro físico. No es guerrera.", secret: "Posee 'Las Crónicas del Verdadero Vidente', texto que describe la ilusión arcana usada por el Oráculo.", factionId: "ent_fac_templo_verdad", currentLocationId: "ent_loc_templo_verdad_ciudad" },
    },
    {
      entityId: "ent_npc_abad_santuario", entityType: "npc",
      title: "Abad Fenwick", summary: "Líder del Santuario del Bosque. Anciano. Tiene piezas de la verdad histórica.",
      status: "active", importance: "normal",
      metadata: { role: "Fuente de lore histórico", attitudeToParty: "friendly", factionId: "ent_fac_templo_verdad", currentLocationId: "ent_loc_santuario_bosque" },
    },
    // === CONSORCIO ===
    {
      entityId: "ent_npc_dorian", entityType: "npc",
      title: "Dorian Vex", summary: "Espía del Consorcio de Mercaderes en el Consejo. Vende información al mejor postor.",
      status: "active", importance: "normal",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Comodín / posible complicación", attitudeToParty: "deceptive", goal: "Información valiosa = riqueza. Venderá lo que sepa al que más pague.", factionId: "ent_fac_consorcio" },
    },
    {
      entityId: "ent_npc_mercader_jefe", entityType: "npc",
      title: "Maestra Ola Brightstone", summary: "Líder del Consorcio de Mercaderes de Valdris.",
      status: "active", importance: "normal",
      metadata: { role: "Figura de poder económico", attitudeToParty: "neutral", goal: "Proteger las rutas comerciales sin importar quién gobierne.", factionId: "ent_fac_consorcio" },
    },
    // === ARCHIVO ===
    {
      entityId: "ent_npc_mira", entityType: "npc",
      title: "Mira la Archivista", summary: "Archivista anciana. Lleva 40 años en el archivo. Sabe más de lo que dice.",
      status: "active", importance: "high",
      metadata: { role: "Fuente de información crítica", attitudeToParty: "neutral", goal: "Proteger los registros históricos. Tiene miedo.", fear: "Que alguien queme el archivo (ya ocurrió una vez, hace 20 años).", currentLocationId: "ent_loc_archivo" },
    },
    // === NPCs SECUNDARIOS ===
    {
      entityId: "ent_npc_iniciado_culto", entityType: "npc",
      title: "Iniciado del Culto (genérico)", summary: "Creyentes de rango bajo. Genuinamente convencidos.",
      status: "active", importance: "low",
      metadata: { role: "Obstáculo menor", attitudeToParty: "hostile", factionId: "ent_fac_culto" },
    },
    {
      entityId: "ent_npc_heraldo", entityType: "npc",
      title: "Heraldo Vorn", summary: "Vocero público del Oráculo. Gestiona las colas de peticionarios.",
      status: "active", importance: "low",
      metadata: { role: "Portero del Oráculo", attitudeToParty: "suspicious", factionId: "ent_fac_culto", currentLocationId: "ent_loc_sala_oraculo" },
    },
    {
      entityId: "ent_npc_peticionario", entityType: "npc",
      title: "Widow Asha", summary: "Peticionaria desesperada. Su hijo está en el ejército. Busca una profecía.",
      status: "active", importance: "low",
      metadata: { role: "Ancla emocional / testigo del impacto", attitudeToParty: "friendly" },
    },
    {
      entityId: "ent_npc_capitan_barco", entityType: "npc",
      title: "Capitán Drez", summary: "Capitán mercante. Contrabandea para el Gremio. Puede sacar al grupo de la ciudad.",
      status: "active", importance: "low",
      metadata: { role: "Recurso de escape / transporte", attitudeToParty: "neutral", factionId: "ent_fac_gremio", currentLocationId: "ent_loc_puerto" },
    },
    {
      entityId: "ent_npc_escriba_consejo", entityType: "npc",
      title: "Escriba Pell", summary: "Escriba del Consejo. Ordenado, servicial. Acceso a muchos documentos.",
      status: "active", importance: "low",
      metadata: { role: "Fuente administrativa", attitudeToParty: "friendly" },
    },
    {
      entityId: "ent_npc_curandero", entityType: "npc",
      title: "Maestra Ilva", summary: "Curandera del barrio portuario. Discreta. Ha tratado heridas sospechosas.",
      status: "active", importance: "low",
      metadata: { role: "Aliada de soporte", attitudeToParty: "friendly" },
    },
    {
      entityId: "ent_npc_rumorista", entityType: "npc",
      title: "Pica", summary: "Vendedora de información en el mercado. Vende rumores, algunos reales.",
      status: "active", importance: "low",
      metadata: { role: "Fuente de rumores (algunos plantados por el Oráculo)", attitudeToParty: "neutral" },
    },
    {
      entityId: "ent_npc_veterano_guardia", entityType: "npc",
      title: "Sargento Bren", summary: "Veterano de la guardia. Cínico pero honesto. Amigo de Lyra.",
      status: "active", importance: "low",
      metadata: { role: "Apoyo de información de la guardia", attitudeToParty: "neutral" },
    },
    {
      entityId: "ent_npc_lider_inner_circle", entityType: "npc",
      title: "Maga Senra", summary: "Ilusionista del inner circle del culto. Construye y mantiene la proyección del Oráculo.",
      status: "active", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: { role: "Antagonista secundario técnico", attitudeToParty: "hostile", secret: "Sin ella, la ilusión se derrumba. Puede ser convencida de defeccionar si se le garantiza clemencia.", factionId: "ent_fac_culto" },
    },
  ];

  for (const npc of NPCS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...npc, actorId: "usr_dm" });
  }
  console.log(`✓ ${NPCS.length} NPCs created`);
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
