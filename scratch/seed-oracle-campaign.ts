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
  const QUESTS = [
    {
      entityId: "ent_q_profecia_rota", entityType: "quest",
      title: "La Profecía Rota", summary: "Arco principal. La profecía que trajo al grupo a Valdris resulta ser falsa. ¿Quién la falsificó y por qué?",
      status: "active", importance: "critical",
      metadata: { priority: "main", publicObjective: "Investigar la profecía que los trajo a Valdris.", hiddenObjective: "Exponer al Oráculo como fraude y desmantelar el culto.", failureConsequence: "El culto consolida su poder. Vantis elimina testigos." },
    },
    {
      entityId: "ent_q_precio_silencio", entityType: "quest",
      title: "El Precio del Silencio", summary: "Side quest. Torben les pide ayuda: alguien está presionando a los comerciantes del puerto para que no hablen.",
      status: "active", importance: "normal",
      metadata: { priority: "side", publicObjective: "Averiguar quién amenaza a los comerciantes del puerto.", hiddenObjective: "Es el Gremio, por orden de Kael, protegiendo sus rutas de contrabando." },
    },
    {
      entityId: "ent_q_archivista", entityType: "quest",
      title: "La Archivista y sus Secretos", summary: "Side quest. Mira tiene información crucial pero solo la compartirá si el grupo la ayuda primero.",
      status: "active", importance: "high",
      metadata: { priority: "side", publicObjective: "Conseguir la confianza de Mira la Archivista.", hiddenObjective: "Mira guarda registros del incendio del archivo hace 20 años — provocado por el culto para destruir evidencia." },
    },
    {
      entityId: "ent_q_sangre_puerto", entityType: "quest",
      title: "Sangre en el Puerto", summary: "Side quest. Cuerpos aparecen en el puerto con marcas del culto. Lyra investiga paralelamente.",
      status: "active", importance: "normal",
      metadata: { priority: "side", publicObjective: "Averiguar quién está matando en el puerto.", hiddenObjective: "El culto elimina testigos del contrabando de componentes mágicos para la ilusión del Oráculo." },
    },
    {
      entityId: "ent_q_traidor_interior", entityType: "quest",
      title: "El Traidor Interior", summary: "Side quest. Alguien en el grupo de confianza del partido está filtrando información al culto.",
      status: "pending", importance: "high",
      visibility: { kind: "dm_only" as const },
      metadata: { priority: "side", publicObjective: "Identificar al espía.", hiddenObjective: "Es Dorian Vex, quien vende información a quien más paga." },
    },
    {
      entityId: "ent_q_epilogo", entityType: "quest",
      title: "Epílogo: Los Hilos Sueltos", summary: "Sesión 9 opcional. Las consecuencias de las decisiones del grupo se despliegan.",
      status: "pending", importance: "normal",
      metadata: { priority: "background", publicObjective: "Gestionar las consecuencias de la caída del Oráculo." },
    },
  ];

  for (const q of QUESTS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...q, actorId: "usr_dm" });
  }
  console.log(`✓ ${QUESTS.length} quests created`);
}

async function seedClues() {
  const CLUES = [
    // Sesiones 1-2
    { entityId: "ent_clue_prophecy_text", entityType: "clue", title: "Texto de la profecía original", summary: "El texto escrito de la profecía que trajo al grupo tiene inconsistencias gramaticales con otras profecías del Oráculo.", status: "hidden", importance: "high", metadata: { content: "El texto usa una conjugación arcaica que no corresponde al estilo del Oráculo actual. Inconsistencia de 3 años.", clueType: "document" } },
    { entityId: "ent_clue_petitioner_fear", entityType: "clue", title: "Miedo de los peticionarios", summary: "Varios peticionarios mencionan que quienes recibieron profecías 'negativas' desaparecen o callan.", status: "hidden", importance: "normal", metadata: { content: "Al menos 4 personas en los últimos 2 meses han recibido profecías devastadoras y luego dejaron de frecuentar el templo. Sus vecinos no saben dónde están.", clueType: "verbal" } },
    { entityId: "ent_clue_merchant_payment", entityType: "clue", title: "Pago anónimo al culto", summary: "Registro de pagos anónimos al culto desde hace 3 años, cifra creciente.", status: "hidden", importance: "high", metadata: { content: "Una serie de pagos en moneda de alta denominación, sin nombre de donante. El patrón coincide con el calendario de negocios de Lord Vantis.", clueType: "document" } },
    { entityId: "ent_clue_arcane_component", entityType: "clue", title: "Componentes arcanos en el templo", summary: "En la sala de preparación del templo, hay componentes mágicos para ilusiones de gran alcance.", status: "hidden", importance: "critical", metadata: { content: "Polvo de esmeralda, espejos convexos, y cristales de resonancia. Todos componentes para sostener una ilusión auditiva de 200 pies de radio durante semanas.", clueType: "physical" } },
    { entityId: "ent_clue_torben_tip", entityType: "clue", title: "Información de Torben", summary: "Torben menciona que hace 20 años 'algo ocurrió' en el antiguo templo. El incendio 'no fue accidental'.", status: "hidden", importance: "normal", metadata: { content: "Torben era joven cuando el archivo ardió. Vio sombras con capuchas en el callejón trasero esa noche.", clueType: "verbal" } },
    // Sesiones 3-4
    { entityId: "ent_clue_archive_records", entityType: "clue", title: "Registros del archivo: el incendio", summary: "Los registros supervivientes del archivo documentan que el incendio eliminó exactamente los archivos de los '20 verdaderos videntes'.", status: "hidden", importance: "critical", metadata: { content: "Mira encontró una lista parcial que sobrevivió en un armario de metal. Los 20 videntes reconocidos desaparecieron en el mismo período que Veradis 'emergió' con sus poderes.", clueType: "document" } },
    { entityId: "ent_clue_guild_ledger", entityType: "clue", title: "Extracto del libro del Gremio", summary: "Cira del Gremio, si se la gana, puede mostrar un extracto que vincula pagos de Lord Vantis con el culto.", status: "hidden", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { content: "Cinco años de pagos mensuales a 'V.O.' — iniciales de Veradis el Oráculo — desde la cuenta de Lord Vantis.", clueType: "document" } },
    { entityId: "ent_clue_port_bodies", entityType: "clue", title: "Marcas en los cuerpos del puerto", summary: "Las víctimas del puerto tienen una marca quemada en la palma: el símbolo del inner circle del culto.", status: "hidden", importance: "high", metadata: { content: "No es el símbolo público del culto. Es un símbolo privado que solo usa el inner circle para marcar 'assets' a eliminar.", clueType: "physical" } },
    { entityId: "ent_clue_sera_texts", entityType: "clue", title: "Las Crónicas del Verdadero Vidente", summary: "Sera Moonwhisper posee un texto que describe exactamente cómo funciona una ilusión vocal de largo alcance.", status: "hidden", importance: "critical", metadata: { content: "Texto en idioma antiguo, 200 páginas. El capítulo 7 describe la 'Proyección del Falso Profeta', un ritual de ilusión auditiva que puede mantenerse indefinidamente con los componentes correctos.", clueType: "document" } },
    { entityId: "ent_clue_lyra_investigation", entityType: "clue", title: "Notas de investigación de Lyra", summary: "Lyra comparte sus notas si el grupo gana su confianza. Tres meses de anomalías documentadas.", status: "hidden", importance: "high", metadata: { content: "7 desapariciones. 4 negocios quemados sin explicación. Todos tenían en común: peticiones al Oráculo rechazadas la semana anterior.", clueType: "document" } },
    { entityId: "ent_clue_inner_circle_meeting", entityType: "clue", title: "Reunión en la mansión Vantis", summary: "Elowyn puede interceptar información de una reunión secreta en la mansión Vantis.", status: "hidden", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { content: "El inner circle del culto se reúne los martes en el sótano de la mansión. Se habla de 'reforzar la proyección' y 'eliminar el problema del archivo'.", clueType: "verbal" } },
    // Sesiones 5-6
    { entityId: "ent_clue_false_prophecy_audio", entityType: "clue", title: "Grabación de la voz del Oráculo", summary: "Silas el Bardo consigue grabar (con magia barda) la 'voz divina'. Bajo análisis, tiene ecos de ilusión.", status: "hidden", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { content: "La grabación tiene el inconfundible 'fantasma de resonancia' que dejan los cristales de resonancia ilusoria. No es sobrenatural. Es arcana.", clueType: "magical" } },
    { entityId: "ent_clue_senra_doubts", entityType: "clue", title: "Dudas de la Maga Senra", summary: "La Maga Senra, técnica de la ilusión, tiene dudas morales. Si se la presiona con cuidado, puede defeccionar.", status: "hidden", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { content: "Senra lleva 5 años manteniendo la ilusión. Empezó como experimento académico. Ahora es cómplice de desapariciones. Está atrapada por miedo.", clueType: "behavioral" } },
    { entityId: "ent_clue_vault_entrance", entityType: "clue", title: "Entrada a la bóveda", summary: "Un mapa parcial de las ruinas muestra una sala subterránea que no aparece en los planos oficiales.", status: "hidden", importance: "critical", metadata: { content: "Bajo la sala de oración de las ruinas, hay una trampilla disimulada. Requiere una contraseña arcana (que Senra conoce).", clueType: "physical" } },
    { entityId: "ent_clue_vault_records", entityType: "clue", title: "Registros en la bóveda", summary: "La bóveda contiene 20 años de profecías falsificadas, con anotaciones de a quién beneficiaban y cuánto pagaron.", status: "hidden", importance: "critical", metadata: { content: "Cajas de registros meticulosos. Cada profecía tiene: fecha, peticionario, profecía entregada, profecía 'real', y beneficiario financiero. 847 profecías falsificadas.", clueType: "document" } },
    // Sesiones 7-8
    { entityId: "ent_clue_veradis_escape_plan", entityType: "clue", title: "Plan de huida de Veradis", summary: "En la sala del Oráculo, hay pistas de un barco preparado en el puerto norte.", status: "hidden", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { content: "Una nota cifrada en el escritorio de Veradis, debajo de documentos oficiales. El barco 'Viento Oscuro' en el muelle 7N. Zarpa el viernes si hay señal de alarma.", clueType: "document" } },
    { entityId: "ent_clue_vantis_confession", entityType: "clue", title: "Confesión de Vantis", summary: "Bajo presión suficiente, Vantis puede revelar cuánto lleva pagando y a cambio de qué profecías específicas.", status: "hidden", importance: "high", metadata: { content: "Confirmación directa del acuerdo. Lleva 7 años pagando. Ha recibido profecías que lo avisaron de 3 quiebras y una guerra comercial. Ganó una fortuna.", clueType: "verbal" } },
    { entityId: "ent_clue_culto_disbands", entityType: "clue", title: "Miembros del culto que pueden testificar", summary: "Tras la caída del inner circle, varios iniciados están dispuestos a testificar a cambio de clemencia.", status: "hidden", importance: "normal", metadata: { content: "Al menos 12 iniciados tenían dudas. Sin el liderazgo del culto, están dispuestos a hablar.", clueType: "verbal" } },
    { entityId: "ent_clue_eldertome", entityType: "clue", title: "Tomo de los Antiguos Videntes", summary: "En la bóveda, entre los registros, hay un tomo robado del archivo hace 20 años: la lista completa de los 20 videntes.", status: "hidden", importance: "high", metadata: { content: "Prueba irrefutable de quiénes eran los verdaderos profetas y qué ocurrió con ellos. Algunos están vivos, en exilio o escondidos.", clueType: "document" } },
    { entityId: "ent_clue_final_truth", entityType: "clue", title: "La verdad del primer Veradis", summary: "El 'Oráculo' actual no es el primero. Hubo uno antes, un vidente real, que fue asesinado hace 22 años.", status: "hidden", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { content: "En las notas de la bóveda, hay un nombre: Veradis Thorn. El hombre que adoptó su nombre y su rol sabía exactamente a quién reemplazaba.", clueType: "document" } },
    { entityId: "ent_clue_prophecy_forgery_tool", entityType: "clue", title: "Herramienta de falsificación", summary: "El cristal de control de la ilusión. Quien lo destruye, termina con la proyección del Oráculo para siempre.", status: "hidden", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { content: "Un cristal de 30 cm de diámetro, negro con venas violetas. Destruirlo o sellarlo termina con la ilusión. Custodiado por la Maga Senra.", clueType: "physical" } },
  ];

  for (const clue of CLUES) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...clue, actorId: "usr_dm" });
  }
  console.log(`✓ ${CLUES.length} clues created`);
}

async function seedSecrets() {
  const SECRETS = [
    { entityId: "ent_sec_oracle_fraud", entityType: "secret", title: "El Oráculo es un fraude", summary: "Veradis lleva 20 años falsificando profecías.", status: "active", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { truth: "Veradis no tiene poderes proféticos. Es un ilusionista de nivel equivalente a mago de nivel 9 (SRD). Usa un cristal arcano y componentes de ilusión para crear una 'voz divina' convincente. Ha falsificado 847 profecías.", impact: "La credibilidad de todo el sistema de gobierno de Valdris se basa en el Oráculo. Su caída puede provocar caos o liberación, dependiendo de cómo se gestione." } },
    { entityId: "ent_sec_vantis_funding", entityType: "secret", title: "Lord Vantis financia el culto", summary: "Vantis paga al Oráculo a cambio de profecías económicamente favorables.", status: "active", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { truth: "Lord Vantis lleva 7 años pagando una renta mensual al culto. A cambio recibe profecías personalizadas que le avisan de oportunidades de negocio y le permiten eliminar competencia. Se ha enriquecido 10 veces desde el acuerdo.", impact: "Si sale a la luz, Vantis pierde todo: riqueza, posición y libertad. Intentará silenciar al grupo." } },
    { entityId: "ent_sec_divine_voice_illusion", entityType: "secret", title: "La voz divina es una ilusión arcana", summary: "Lo que los peticionarios oyen como 'la voz de los dioses' es una proyección ilusoria mantenida por la Maga Senra.", status: "active", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { truth: "La 'sala sagrada' del Oráculo tiene cristales de resonancia ilusoria ocultos en las paredes. La Maga Senra opera desde una cámara adyacente, usando los cristales para proyectar la voz de Veradis amplificada y modificada. El efecto es indistinguible de lo sobrenatural para un observador sin formación arcana.", revealConditions: ["Detectar magia en la sala del Oráculo", "Capturar a la Maga Senra", "Encontrar los componentes arcanos", "Destruir el cristal de control"] } },
    { entityId: "ent_sec_lyra_suspects", entityType: "secret", title: "Lyra sospecha pero tiene miedo", summary: "La capitana de la guardia lleva meses investigando pero no tiene pruebas suficientes.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "Lyra ha documentado 7 desapariciones vinculadas a peticiones rechazadas del Oráculo. Sabe que algo está mal. Pero sin pruebas concretas, ir contra el Oráculo significaría ir contra el Consejo, y eso es suicidio político.", revealConditions: ["Ganar la confianza de Lyra (DC 15 Persuasión o roleplay)", "Mostrarle evidencia concreta"] } },
    { entityId: "ent_sec_kael_has_evidence", entityType: "secret", title: "Kael tiene las pruebas del Gremio", summary: "Los libros del Gremio vinculan a Vantis con el culto. Kael los guarda como seguro de vida.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "El Gremio lleva años vigilando al Oráculo por razones de territorio. Kael capturó registros financieros hace 3 años y los usa como garantía: 'Si me pasa algo, los libros llegan al Consejo'. Considerará compartirlos si el grupo le ofrece algo a cambio.", revealConditions: ["Llegar a un trato con Kael", "Robar los libros del Gremio"] } },
    { entityId: "ent_sec_archive_fire_cult", entityType: "secret", title: "El culto quemó el archivo hace 20 años", summary: "El incendio del archivo fue provocado por el culto para destruir registros de los videntes reales.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "Hace 22 años, cuando el primer Veradis (el vidente real) fue asesinado, el impostor quemó el archivo para eliminar cualquier registro de cómo eran las profecías auténticas. El incendio mató a 3 archivistas. Mira sobrevivió.", revealConditions: ["Hablar con Mira la Archivista tras ganar su confianza", "Encontrar los registros parciales supervivientes"] } },
    { entityId: "ent_sec_senra_can_defect", entityType: "secret", title: "La Maga Senra puede defeccionar", summary: "Senra mantiene la ilusión por miedo, no por lealtad. Es rescatable.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "Senra fue reclutada hace 5 años como 'proyecto académico'. Cuando entendió para qué servía realmente, era demasiado tarde para salir. Tiene información sobre el cristal de control y la sala de operaciones. Si se le garantiza protección y clemencia, lo revelará todo.", revealConditions: ["Contacto privado con Senra", "DC 20 Persuasión o situación de vulnerabilidad del culto"] } },
    { entityId: "ent_sec_dorian_spy", entityType: "secret", title: "Dorian Vex es un espía", summary: "El representante del Consorcio en el Consejo vende información a quien pague más.", status: "active", importance: "normal", visibility: { kind: "dm_only" as const }, metadata: { truth: "Dorian tiene acceso a las deliberaciones del Consejo y ha estado filtrando información al Oráculo (a cambio de profecías favorables para el Consorcio) y al Gremio (a cambio de dinero). Es el 'traidor interior' de la quest.", revealConditions: ["Vigilancia de 2+ sesiones", "Interrogatorio de miembros del culto"] } },
    { entityId: "ent_sec_original_oracle", entityType: "secret", title: "El primer Veradis era real", summary: "Hubo un vidente auténtico llamado Veradis Thorn. El impostor asumió su nombre e identidad tras asesinarlo.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "Veradis Thorn fue un vidente auténtico. Hace 22 años fue asesinado por un mago ilusionista sin escrúpulos que quería su influencia. El impostor adoptó su nombre, aprendió sus maneras, y fabricó las 'profecías' con ilusión arcana. Los que le conocieron de joven han muerto o están en exilio.", revealConditions: ["Encontrar el Tomo de los Antiguos Videntes en la bóveda"] } },
    { entityId: "ent_sec_vault_location", entityType: "secret", title: "Ubicación de la bóveda de pruebas", summary: "Bajo las ruinas del Templo Antiguo hay una bóveda con 20 años de registros de profecías falsificadas.", status: "active", importance: "critical", visibility: { kind: "dm_only" as const }, metadata: { truth: "La bóveda solo es accesible con la contraseña arcana 'Umbra Veritatis' (que Senra conoce) o rompiendo la trampilla (CD 22). Contiene registros de 847 profecías falsificadas, todos los pagos recibidos, y el Tomo de los Antiguos Videntes robado del archivo.", revealConditions: ["Información de Senra", "Mapa de las ruinas + detección mágica", "Información de la Maga Senra"] } },
    { entityId: "ent_sec_prophecy_count", entityType: "secret", title: "847 profecías falsificadas", summary: "El número exacto de personas que recibieron profecías falsas en 20 años.", status: "active", importance: "normal", visibility: { kind: "dm_only" as const }, metadata: { truth: "847 profecías. Algunas inofensivas. Algunas que arruinaron familias. Algunas que causaron guerras menores. Algunas que mataron indirectamente a personas. El impacto real es inconmensurable.", impact: "Este dato, expuesto al público, garantiza que el culto no pueda recuperarse." } },
    { entityId: "ent_sec_consejo_corruption", entityType: "secret", title: "Consejero Brann sabía", summary: "El Consejero Brann conocía parte de la corrupción y la ignoró.", status: "active", importance: "normal", visibility: { kind: "dm_only" as const }, metadata: { truth: "Brann vio a Vantis reunirse con representantes del culto hace 4 años. Lo reportó... a nadie. Decidió que la estabilidad era más importante que la verdad. Lleva 4 años con eso en la conciencia.", revealConditions: ["Interrogatorio de Brann", "Documentos del Archivo"] } },
    { entityId: "ent_sec_captain_escape", entityType: "secret", title: "Veradis tiene un barco preparado", summary: "Si las cosas se ponen mal, Veradis tiene un plan de huida completo.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "El barco 'Viento Oscuro' en el muelle 7N, siempre listo. Una nota cifrada en su escritorio detalla el plan. Zarpa si recibe una señal de alarma del heraldo.", revealConditions: ["Acceder al escritorio de Veradis en la sala del Oráculo"] } },
    { entityId: "ent_sec_senra_exit_code", entityType: "secret", title: "Contraseña de la bóveda", summary: "La contraseña arcana para abrir la trampilla de la bóveda.", status: "active", importance: "high", visibility: { kind: "dm_only" as const }, metadata: { truth: "'Umbra Veritatis' — La Sombra de la Verdad. Solo Senra y Veradis la conocen.", revealConditions: ["Obtener información de Senra"] } },
    { entityId: "ent_sec_widow_son", entityType: "secret", title: "El hijo de la viuda está muerto", summary: "La profecía que Widow Asha busca sobre su hijo será falsa. El muchacho murió en combate hace 3 meses.", status: "active", importance: "low", visibility: { kind: "dm_only" as const }, metadata: { truth: "El Oráculo le dará una profecía vaga pero esperanzadora a cambio de su último dinero. El hijo está muerto. Es un ejemplo concreto del daño humano del fraude.", impact: "Ancla emocional para motivar al grupo más allá de la política." } },
  ];

  for (const sec of SECRETS) {
    await api("POST", `/api/campaigns/${CMP}/entities`, { ...sec, actorId: "usr_dm" });
  }
  console.log(`✓ ${SECRETS.length} secrets created`);
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
