import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

type NodeKind = "entity" | "note" | "group";
type EdgeStyle = "solid" | "dashed" | "secret" | "weak" | "strong";

async function placeNode(canvasId: string, node: Record<string, unknown>) {
  const res = await api("POST", `/api/campaigns/${CMP}/canvases/${canvasId}/nodes`, {
    actorId: "usr_dm",
    node,
  });
  if (res.status >= 400) {
    throw new Error(`Node ${node.id}: ${JSON.stringify(res.json)}`);
  }
}

async function placeEdge(
  canvasId: string,
  sourceNodeId: string,
  targetNodeId: string,
  label: string,
  style: EdgeStyle = "solid",
) {
  const res = await api("POST", `/api/campaigns/${CMP}/canvases/${canvasId}/edges`, {
    actorId: "usr_dm",
    edge: { sourceNodeId, targetNodeId, label, status: "draft" as const, style },
  });
  if (res.status >= 400) {
    throw new Error(`Edge ${sourceNodeId}→${targetNodeId}: ${JSON.stringify(res.json)}`);
  }
}

function entity(id: string, entityId: string, x: number, y: number) {
  return { id: `node_${id}`, kind: "entity" as NodeKind, entityId, x, y };
}

function group(
  id: string, title: string, x: number, y: number, w: number, h: number,
  color: "yellow" | "blue" | "green" | "pink" | "purple",
  groupType?: "location" | "faction" | "arc" | "session" | "mystery" | "characters" | "custom",
) {
  return { id, kind: "group" as NodeKind, title, x, y, width: w, height: h, color, metadata: groupType ? { groupType } : undefined };
}

function note(
  id: string, title: string, text: string, x: number, y: number, w: number, h: number,
  color: "yellow" | "blue" | "green" | "pink" | "purple" = "yellow",
) {
  return { id, kind: "note" as NodeKind, title, text, x, y, width: w, height: h, color };
}

// ---------------------------------------------------------------------------
// Canvas 1: Vista General (default "Campaña" canvas)
// Layout: 2850 × 1600
// ---------------------------------------------------------------------------
async function seedOverviewCanvas(canvasId: string) {
  // ── Groups ──────────────────────────────────────────────────────────────
  const groups = [
    group("grp_quests",       "Misiones Activas",              50,   50, 760, 450, "blue"),
    group("grp_antagonists",  "El Oráculo y sus Cómplices",   860,   50, 660, 450, "pink"),
    group("grp_council",      "Consejo y Orden Pública",      1570,  50, 620, 450, "purple"),
    group("grp_allies",       "Aliados y Contactos",          2240,  50, 560, 450, "green"),
    group("grp_locations",    "Localizaciones de Valdris",      50, 560, 2750, 340, "yellow"),
    group("grp_dm_secrets",   "Secretos DM — No Revelados",    50, 960, 2750, 580, "pink"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  // ── Quests ──────────────────────────────────────────────────────────────
  const questNodes = [
    entity(ids.ENT_Q_PROFECIA_ROTA,    ids.ENT_Q_PROFECIA_ROTA,     80,  130),
    entity(ids.ENT_Q_PRECIO_SILENCIO,  ids.ENT_Q_PRECIO_SILENCIO,   80,  260),
    entity(ids.ENT_Q_ARCHIVISTA,       ids.ENT_Q_ARCHIVISTA,        80,  390),
    entity(ids.ENT_Q_SANGRE_PUERTO,    ids.ENT_Q_SANGRE_PUERTO,    440,  130),
    entity(ids.ENT_Q_TRAIDOR_INTERIOR, ids.ENT_Q_TRAIDOR_INTERIOR, 440,  260),
    entity(ids.ENT_Q_EPILOGO,          ids.ENT_Q_EPILOGO,          440,  390),
  ].map(n => ({ ...n, groupId: "grp_quests" }));
  for (const n of questNodes) await placeNode(canvasId, n);

  // ── Antagonists ──────────────────────────────────────────────────────────
  const antagonistNodes = [
    entity(ids.ENT_FAC_CULTO,        ids.ENT_FAC_CULTO,        890,  130),
    entity(ids.ENT_NPC_VERADIS,      ids.ENT_NPC_VERADIS,      890,  260),
    entity(ids.ENT_NPC_VANTIS,       ids.ENT_NPC_VANTIS,       890,  390),
    entity(ids.ENT_NPC_GUARDIAN_JEFE,ids.ENT_NPC_GUARDIAN_JEFE,1230, 130),
    entity(ids.ENT_NPC_SENRA,        ids.ENT_NPC_SENRA,        1230, 260),
  ].map(n => ({ ...n, groupId: "grp_antagonists" }));
  for (const n of antagonistNodes) await placeNode(canvasId, n);

  // ── Council ──────────────────────────────────────────────────────────────
  const councilNodes = [
    entity(ids.ENT_FAC_CONSEJO,         ids.ENT_FAC_CONSEJO,          1600,  130),
    entity(ids.ENT_NPC_ALDRIC,          ids.ENT_NPC_ALDRIC,           1600,  260),
    entity(ids.ENT_NPC_CONSEJERA_LENA,  ids.ENT_NPC_CONSEJERA_LENA,   1600,  390),
    entity(ids.ENT_NPC_CONSEJERO_BRANN, ids.ENT_NPC_CONSEJERO_BRANN,  1940,  130),
    entity(ids.ENT_NPC_LYRA,            ids.ENT_NPC_LYRA,             1940,  260),
  ].map(n => ({ ...n, groupId: "grp_council" }));
  for (const n of councilNodes) await placeNode(canvasId, n);

  // ── Allies ───────────────────────────────────────────────────────────────
  const allyNodes = [
    entity(ids.ENT_FAC_GREMIO,        ids.ENT_FAC_GREMIO,        2270,  130),
    entity(ids.ENT_NPC_KAEL,          ids.ENT_NPC_KAEL,          2270,  260),
    entity(ids.ENT_NPC_MIRA,          ids.ENT_NPC_MIRA,          2270,  390),
    entity(ids.ENT_FAC_TEMPLO_VERDAD, ids.ENT_FAC_TEMPLO_VERDAD, 2580,  130),
    entity(ids.ENT_NPC_SERA,          ids.ENT_NPC_SERA,          2580,  260),
    entity(ids.ENT_NPC_ABAD_SANTUARIO,ids.ENT_NPC_ABAD_SANTUARIO,2580,  390),
  ].map(n => ({ ...n, groupId: "grp_allies" }));
  for (const n of allyNodes) await placeNode(canvasId, n);

  // ── Locations row 1 ──────────────────────────────────────────────────────
  const locNodes = [
    entity(ids.ENT_LOC_VALDRIS,           ids.ENT_LOC_VALDRIS,            80,  640),
    entity(ids.ENT_LOC_SALA_ORACULO,      ids.ENT_LOC_SALA_ORACULO,      270,  640),
    entity(ids.ENT_LOC_SALA_CONSEJO,      ids.ENT_LOC_SALA_CONSEJO,      460,  640),
    entity(ids.ENT_LOC_RUINAS,            ids.ENT_LOC_RUINAS,            650,  640),
    entity(ids.ENT_LOC_BOVEDA,            ids.ENT_LOC_BOVEDA,            840,  640),
    entity(ids.ENT_LOC_TABERNA_CUERVO,    ids.ENT_LOC_TABERNA_CUERVO,   1030,  640),
    entity(ids.ENT_LOC_TEMPLO_VERDAD,     ids.ENT_LOC_TEMPLO_VERDAD,    1220,  640),
    entity(ids.ENT_LOC_ARCHIVO,           ids.ENT_LOC_ARCHIVO,          1410,  640),
    // row 2
    entity(ids.ENT_LOC_PUERTO,            ids.ENT_LOC_PUERTO,             80,  780),
    entity(ids.ENT_LOC_BARRIO_NOBLE,      ids.ENT_LOC_BARRIO_NOBLE,      270,  780),
    entity(ids.ENT_LOC_MANSION_VANTIS,    ids.ENT_LOC_MANSION_VANTIS,    460,  780),
    entity(ids.ENT_LOC_CAMPAMENTO_GREMIO, ids.ENT_LOC_CAMPAMENTO_GREMIO, 650,  780),
    entity(ids.ENT_LOC_SANTUARIO_BOSQUE,  ids.ENT_LOC_SANTUARIO_BOSQUE,  840,  780),
    entity(ids.ENT_LOC_CUARTEL_GUARDIA,   ids.ENT_LOC_CUARTEL_GUARDIA,  1030,  780),
    entity(ids.ENT_LOC_MUELLES,           ids.ENT_LOC_MUELLES,          1220,  780),
  ].map(n => ({ ...n, groupId: "grp_locations" }));
  for (const n of locNodes) await placeNode(canvasId, n);

  // ── DM Secrets grid (3 rows × 5 cols) ────────────────────────────────────
  const secretNodes = [
    entity(ids.ENT_SEC_ORACLE_FRAUD,       ids.ENT_SEC_ORACLE_FRAUD,         80, 1040),
    entity(ids.ENT_SEC_VANTIS_FUNDING,     ids.ENT_SEC_VANTIS_FUNDING,      620, 1040),
    entity(ids.ENT_SEC_DIVINE_VOICE,       ids.ENT_SEC_DIVINE_VOICE,       1160, 1040),
    entity(ids.ENT_SEC_LYRA_SUSPECTS,      ids.ENT_SEC_LYRA_SUSPECTS,      1700, 1040),
    entity(ids.ENT_SEC_KAEL_EVIDENCE,      ids.ENT_SEC_KAEL_EVIDENCE,      2240, 1040),
    entity(ids.ENT_SEC_ARCHIVE_FIRE,       ids.ENT_SEC_ARCHIVE_FIRE,         80, 1180),
    entity(ids.ENT_SEC_SENRA_DEFECT,       ids.ENT_SEC_SENRA_DEFECT,        620, 1180),
    entity(ids.ENT_SEC_DORIAN_SPY,         ids.ENT_SEC_DORIAN_SPY,         1160, 1180),
    entity(ids.ENT_SEC_ORIGINAL_ORACLE,    ids.ENT_SEC_ORIGINAL_ORACLE,    1700, 1180),
    entity(ids.ENT_SEC_VAULT_LOCATION,     ids.ENT_SEC_VAULT_LOCATION,     2240, 1180),
    entity(ids.ENT_SEC_PROPHECY_COUNT,     ids.ENT_SEC_PROPHECY_COUNT,       80, 1320),
    entity(ids.ENT_SEC_CONSEJO_CORRUPTION, ids.ENT_SEC_CONSEJO_CORRUPTION,  620, 1320),
    entity(ids.ENT_SEC_CAPTAIN_ESCAPE,     ids.ENT_SEC_CAPTAIN_ESCAPE,     1160, 1320),
    entity(ids.ENT_SEC_SENRA_EXIT_CODE,    ids.ENT_SEC_SENRA_EXIT_CODE,    1700, 1320),
    entity(ids.ENT_SEC_WIDOW_SON,          ids.ENT_SEC_WIDOW_SON,          2240, 1320),
  ].map(n => ({ ...n, groupId: "grp_dm_secrets" }));
  for (const n of secretNodes) await placeNode(canvasId, n);

  // ── Note ─────────────────────────────────────────────────────────────────
  await placeNode(canvasId, note(
    "note_overview",
    "La Sombra del Oráculo — Vista General",
    "Veradis lleva 20 años falsificando profecías divinas. Los aventureros llegan a Valdris siguiendo una profecía rota y deben desenmascarar la conspiración antes de que el culto los silencie. Usa este tablero como panel de control: misiones arriba, posibles aliados y enemigos en el centro, el mapa geográfico y los secretos DM abajo.",
    50, 1600, 2750, 130, "yellow",
  ));

  // ── Edges ────────────────────────────────────────────────────────────────
  const edges: [string, string, string, EdgeStyle][] = [
    // Plot connections
    [`node_${ids.ENT_NPC_VERADIS}`,       `node_${ids.ENT_Q_PROFECIA_ROTA}`,    "antagonista",          "strong"],
    [`node_${ids.ENT_NPC_VANTIS}`,        `node_${ids.ENT_FAC_CULTO}`,          "financia",             "solid"],
    [`node_${ids.ENT_NPC_ALDRIC}`,        `node_${ids.ENT_Q_PROFECIA_ROTA}`,    "apoya (engañado)",     "dashed"],
    [`node_${ids.ENT_NPC_LYRA}`,          `node_${ids.ENT_Q_SANGRE_PUERTO}`,    "investiga",            "solid"],
    [`node_${ids.ENT_NPC_KAEL}`,          `node_${ids.ENT_Q_TRAIDOR_INTERIOR}`, "tiene información",    "weak"],
    [`node_${ids.ENT_NPC_MIRA}`,          `node_${ids.ENT_Q_ARCHIVISTA}`,       "custodia secretos",    "dashed"],
    // Location anchors
    [`node_${ids.ENT_NPC_VERADIS}`,       `node_${ids.ENT_LOC_SALA_ORACULO}`,   "base de operaciones",  "dashed"],
    [`node_${ids.ENT_NPC_VANTIS}`,        `node_${ids.ENT_LOC_MANSION_VANTIS}`, "reside en",            "dashed"],
    [`node_${ids.ENT_NPC_ALDRIC}`,        `node_${ids.ENT_LOC_SALA_CONSEJO}`,   "gobierna en",          "dashed"],
    // Secret links (DM layer)
    [`node_${ids.ENT_Q_PROFECIA_ROTA}`,   `node_${ids.ENT_SEC_ORACLE_FRAUD}`,   "oculta la verdad",     "secret"],
    [`node_${ids.ENT_NPC_VERADIS}`,       `node_${ids.ENT_SEC_ORACLE_FRAUD}`,   "es el fraude",         "secret"],
    [`node_${ids.ENT_NPC_VANTIS}`,        `node_${ids.ENT_SEC_VANTIS_FUNDING}`, "financia en secreto",  "secret"],
    [`node_${ids.ENT_SEC_ORACLE_FRAUD}`,  `node_${ids.ENT_SEC_VAULT_LOCATION}`, "oculta en la bóveda",  "secret"],
  ];
  for (const [src, tgt, label, style] of edges) {
    await placeEdge(canvasId, src, tgt, label, style);
  }

  console.log("✓ Vista General canvas populated (quests, factions, NPCs, locations, DM secrets, edges)");
}

// ---------------------------------------------------------------------------
// Canvas 2: Facciones y Personajes (kind: characters)
// Layout: 3050 × 1050
// ---------------------------------------------------------------------------
async function seedCharactersCanvas(canvasId: string) {
  const groups = [
    group("grp_c_culto",     "Culto del Oráculo",      50,   50, 370, 930, "pink"),
    group("grp_c_consejo",   "Consejo de Valdris",     470,  50, 370, 760, "purple"),
    group("grp_c_gremio",    "Gremio de Ladrones",     890,  50, 370, 630, "green"),
    group("grp_c_templo",    "Templo de la Verdad",   1310,  50, 370, 500, "blue"),
    group("grp_c_consorcio", "Consorcio Mercantil",   1730,  50, 370, 370, "yellow"),
    group("grp_c_indep",     "Independientes / Aliados",2150, 50, 370, 800, "green"),
    group("grp_c_pcs",       "Personajes Jugadores",  2570,  50, 370, 500, "blue"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const nodes = [
    // Culto
    entity(ids.ENT_FAC_CULTO,          ids.ENT_FAC_CULTO,          80,  130),
    entity(ids.ENT_NPC_VERADIS,         ids.ENT_NPC_VERADIS,        80,  260),
    entity(ids.ENT_NPC_VANTIS,          ids.ENT_NPC_VANTIS,         80,  390),
    entity(ids.ENT_NPC_GUARDIAN_JEFE,   ids.ENT_NPC_GUARDIAN_JEFE,  80,  520),
    entity(ids.ENT_NPC_SENRA,           ids.ENT_NPC_SENRA,          80,  650),
    entity(ids.ENT_NPC_INICIADO_CULTO,  ids.ENT_NPC_INICIADO_CULTO, 80,  780),
    entity(ids.ENT_NPC_HERALDO,         ids.ENT_NPC_HERALDO,        80,  910),
    // Consejo
    entity(ids.ENT_FAC_CONSEJO,         ids.ENT_FAC_CONSEJO,        500, 130),
    entity(ids.ENT_NPC_ALDRIC,          ids.ENT_NPC_ALDRIC,         500, 260),
    entity(ids.ENT_NPC_CONSEJERA_LENA,  ids.ENT_NPC_CONSEJERA_LENA, 500, 390),
    entity(ids.ENT_NPC_CONSEJERO_BRANN, ids.ENT_NPC_CONSEJERO_BRANN,500, 520),
    entity(ids.ENT_NPC_ESCRIBA_CONSEJO, ids.ENT_NPC_ESCRIBA_CONSEJO,500, 650),
    entity(ids.ENT_NPC_GUARDIA_RIKU,    ids.ENT_NPC_GUARDIA_RIKU,   500, 780),
    // Gremio
    entity(ids.ENT_FAC_GREMIO,          ids.ENT_FAC_GREMIO,         920, 130),
    entity(ids.ENT_NPC_KAEL,            ids.ENT_NPC_KAEL,           920, 260),
    entity(ids.ENT_NPC_CIRA,            ids.ENT_NPC_CIRA,           920, 390),
    entity(ids.ENT_NPC_TORBEN,          ids.ENT_NPC_TORBEN,         920, 520),
    entity(ids.ENT_NPC_CAPITAN_BARCO,   ids.ENT_NPC_CAPITAN_BARCO,  920, 650),
    // Templo
    entity(ids.ENT_FAC_TEMPLO_VERDAD,   ids.ENT_FAC_TEMPLO_VERDAD,  1340, 130),
    entity(ids.ENT_NPC_SERA,            ids.ENT_NPC_SERA,           1340, 260),
    entity(ids.ENT_NPC_ABAD_SANTUARIO,  ids.ENT_NPC_ABAD_SANTUARIO, 1340, 390),
    entity(ids.ENT_NPC_CURANDERO,       ids.ENT_NPC_CURANDERO,      1340, 520),
    // Consorcio
    entity(ids.ENT_FAC_CONSORCIO,       ids.ENT_FAC_CONSORCIO,      1760, 130),
    entity(ids.ENT_NPC_MERCADER_JEFE,   ids.ENT_NPC_MERCADER_JEFE,  1760, 260),
    entity(ids.ENT_NPC_PETICIONARIO,    ids.ENT_NPC_PETICIONARIO,   1760, 390),
    // Independientes
    entity(ids.ENT_NPC_LYRA,            ids.ENT_NPC_LYRA,           2180, 130),
    entity(ids.ENT_NPC_MIRA,            ids.ENT_NPC_MIRA,           2180, 260),
    entity(ids.ENT_NPC_DORIAN,          ids.ENT_NPC_DORIAN,         2180, 390),
    entity(ids.ENT_NPC_RUMORISTA,       ids.ENT_NPC_RUMORISTA,      2180, 520),
    entity(ids.ENT_NPC_VETERANO_GUARDIA,ids.ENT_NPC_VETERANO_GUARDIA,2180,650),
    // PCs
    entity(ids.ENT_PC_ELOWYN,           ids.ENT_PC_ELOWYN,          2600, 130),
    entity(ids.ENT_PC_CAMUS,            ids.ENT_PC_CAMUS,           2600, 260),
    entity(ids.ENT_PC_RAGNA,            ids.ENT_PC_RAGNA,           2600, 390),
    entity(ids.ENT_PC_SILAS,            ids.ENT_PC_SILAS,           2600, 520),
  ];
  for (const n of nodes) {
    await placeNode(canvasId, n);
  }

  await placeNode(canvasId, note(
    "note_chars",
    "Guía de facciones",
    "El Culto controla la ciudad mediante profecías falsas. El Consejo las cree reales. El Gremio las teme pero puede ser un aliado. El Templo de la Verdad es el único que investiga. Senra (Culto) puede desertar si los aventureros la ganan.",
    50, 1040, 2890, 100, "yellow",
  ));

  const edges: [string, string, string, EdgeStyle][] = [
    [`node_${ids.ENT_NPC_VERADIS}`,       `node_${ids.ENT_FAC_CULTO}`,          "lidera",               "strong"],
    [`node_${ids.ENT_NPC_GUARDIAN_JEFE}`, `node_${ids.ENT_FAC_CULTO}`,          "ejecutor",             "solid"],
    [`node_${ids.ENT_NPC_VANTIS}`,        `node_${ids.ENT_FAC_CULTO}`,          "financia",             "weak"],
    [`node_${ids.ENT_NPC_SENRA}`,         `node_${ids.ENT_FAC_CULTO}`,          "iniciada (dubitativa)","dashed"],
    [`node_${ids.ENT_NPC_HERALDO}`,       `node_${ids.ENT_FAC_CULTO}`,          "vocero",               "dashed"],
    [`node_${ids.ENT_NPC_INICIADO_CULTO}`,`node_${ids.ENT_FAC_CULTO}`,          "miembro",              "weak"],
    [`node_${ids.ENT_NPC_ALDRIC}`,        `node_${ids.ENT_FAC_CONSEJO}`,        "dirige",               "strong"],
    [`node_${ids.ENT_NPC_CONSEJERA_LENA}`,`node_${ids.ENT_FAC_CONSEJO}`,        "consejera",            "solid"],
    [`node_${ids.ENT_NPC_CONSEJERO_BRANN}`,`node_${ids.ENT_FAC_CONSEJO}`,       "consejero",            "solid"],
    [`node_${ids.ENT_NPC_KAEL}`,          `node_${ids.ENT_FAC_GREMIO}`,         "agente",               "solid"],
    [`node_${ids.ENT_NPC_CIRA}`,          `node_${ids.ENT_FAC_GREMIO}`,         "miembro",              "solid"],
    [`node_${ids.ENT_NPC_TORBEN}`,        `node_${ids.ENT_FAC_GREMIO}`,         "informante",           "weak"],
    [`node_${ids.ENT_NPC_SERA}`,          `node_${ids.ENT_FAC_TEMPLO_VERDAD}`,  "guardiana",            "solid"],
    [`node_${ids.ENT_NPC_ABAD_SANTUARIO}`,`node_${ids.ENT_FAC_TEMPLO_VERDAD}`,  "abad",                 "solid"],
    [`node_${ids.ENT_NPC_MERCADER_JEFE}`, `node_${ids.ENT_FAC_CONSORCIO}`,      "lider",                "solid"],
    // Cross-faction secrets
    [`node_${ids.ENT_NPC_DORIAN}`,        `node_${ids.ENT_FAC_CULTO}`,          "espía infiltrado",     "secret"],
    [`node_${ids.ENT_NPC_VERADIS}`,       `node_${ids.ENT_NPC_VANTIS}`,         "socios en el fraude",  "secret"],
    [`node_${ids.ENT_NPC_LYRA}`,          `node_${ids.ENT_FAC_CONSEJO}`,        "trabaja para",         "dashed"],
    [`node_${ids.ENT_NPC_CAPITAN_BARCO}`, `node_${ids.ENT_NPC_VERADIS}`,        "contratado para huir", "secret"],
  ];
  for (const [src, tgt, label, style] of edges) {
    await placeEdge(canvasId, src, tgt, label, style);
  }

  console.log("✓ Facciones y Personajes canvas populated");
}

// ---------------------------------------------------------------------------
// Canvas 3: Cadena de Investigación (kind: mystery)
// Layout: 2700 × 1650
// Phases: 4 horizontal phases with clues, then secrets below
// ---------------------------------------------------------------------------
async function seedMysteryCanvas(canvasId: string) {
  // Phase notes
  await placeNode(canvasId, note(
    "note_phase1", "Fase 1 — Primeros Indicios",
    "Los aventureros llegan a Valdris. Detectan anomalías: la profecía tiene errores de estilo, los fieles tienen miedo, hay pagos sospechosos. Torben en la taberna puede soltar la primera pista.",
    50, 50, 580, 110, "yellow",
  ));
  await placeNode(canvasId, note(
    "note_phase2", "Fase 2 — La Investigación",
    "El Archivo y el Gremio abren nuevos hilos. Los cadáveres del puerto apuntan a complicidad militar. La investigadora Lyra tiene sus propias sospechas. El rastro llega hasta el Consejo.",
    680, 50, 580, 110, "blue",
  ));
  await placeNode(canvasId, note(
    "note_phase3", "Fase 3 — El Círculo Interior",
    "El culto tiene una reunión secreta. Senra duda y puede ser ganada. Una grabación arcana del oráculo falso ya existe. La bóveda está escondida bajo las ruinas y Veradis tiene un plan de huida.",
    1310, 50, 580, 110, "pink",
  ));
  await placeNode(canvasId, note(
    "note_phase4", "Fase 4 — El Desenlace",
    "La bóveda guarda los instrumentos del fraude y los registros reales. Vantis puede ser quebrado. El culto se desintegra si Veradis cae. El Pergamino Antiguo y la Verdad Final dan la prueba definitiva.",
    1940, 50, 580, 110, "green",
  ));

  // Phase groups
  const groups = [
    group("grp_phase1", "Pistas — Fase 1",  50,  210, 580, 480, "yellow"),
    group("grp_phase2", "Pistas — Fase 2",  680, 210, 580, 480, "blue"),
    group("grp_phase3", "Pistas — Fase 3", 1310, 210, 580, 480, "pink"),
    group("grp_phase4", "Pistas — Fase 4", 1940, 210, 580, 480, "green"),
    group("grp_secrets","Secretos DM — La Verdad Completa", 50, 750, 2470, 830, "pink"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  // Clue nodes per phase
  const clueNodes = [
    // Phase 1
    entity(ids.ENT_CLUE_PROPHECY_TEXT,      ids.ENT_CLUE_PROPHECY_TEXT,       80,  290),
    entity(ids.ENT_CLUE_PETITIONER_FEAR,     ids.ENT_CLUE_PETITIONER_FEAR,    80,  420),
    entity(ids.ENT_CLUE_MERCHANT_PAYMENT,    ids.ENT_CLUE_MERCHANT_PAYMENT,   80,  550),
    entity(ids.ENT_CLUE_ARCANE_COMPONENT,    ids.ENT_CLUE_ARCANE_COMPONENT,  380,  290),
    entity(ids.ENT_CLUE_TORBEN_TIP,          ids.ENT_CLUE_TORBEN_TIP,        380,  420),
    // Phase 2
    entity(ids.ENT_CLUE_ARCHIVE_RECORDS,     ids.ENT_CLUE_ARCHIVE_RECORDS,   710,  290),
    entity(ids.ENT_CLUE_GUILD_LEDGER,        ids.ENT_CLUE_GUILD_LEDGER,      710,  420),
    entity(ids.ENT_CLUE_PORT_BODIES,         ids.ENT_CLUE_PORT_BODIES,       710,  550),
    entity(ids.ENT_CLUE_SERA_TEXTS,          ids.ENT_CLUE_SERA_TEXTS,       1010,  290),
    entity(ids.ENT_CLUE_LYRA_INVESTIGATION,  ids.ENT_CLUE_LYRA_INVESTIGATION,1010, 420),
    entity(ids.ENT_CLUE_EASTERN_FRONT_LETTER,ids.ENT_CLUE_EASTERN_FRONT_LETTER,1010,550),
    // Phase 3
    entity(ids.ENT_CLUE_INNER_CIRCLE_MTG,    ids.ENT_CLUE_INNER_CIRCLE_MTG, 1340,  290),
    entity(ids.ENT_CLUE_FALSE_PROPHECY_AUDIO,ids.ENT_CLUE_FALSE_PROPHECY_AUDIO,1340,420),
    entity(ids.ENT_CLUE_SENRA_DOUBTS,        ids.ENT_CLUE_SENRA_DOUBTS,     1340,  550),
    entity(ids.ENT_CLUE_VAULT_ENTRANCE,      ids.ENT_CLUE_VAULT_ENTRANCE,   1640,  290),
    entity(ids.ENT_CLUE_VAULT_RECORDS,       ids.ENT_CLUE_VAULT_RECORDS,    1640,  420),
    // Phase 4
    entity(ids.ENT_CLUE_VERADIS_ESCAPE,      ids.ENT_CLUE_VERADIS_ESCAPE,   1970,  290),
    entity(ids.ENT_CLUE_VANTIS_CONFESSION,   ids.ENT_CLUE_VANTIS_CONFESSION,1970,  420),
    entity(ids.ENT_CLUE_CULTO_DISBANDS,      ids.ENT_CLUE_CULTO_DISBANDS,   1970,  550),
    entity(ids.ENT_CLUE_ELDERTOME,           ids.ENT_CLUE_ELDERTOME,        2270,  290),
    entity(ids.ENT_CLUE_FINAL_TRUTH,         ids.ENT_CLUE_FINAL_TRUTH,      2270,  420),
    entity(ids.ENT_CLUE_FORGERY_TOOL,        ids.ENT_CLUE_FORGERY_TOOL,     2270,  550),
  ];
  for (const n of clueNodes) await placeNode(canvasId, n);

  // Secret nodes (3 rows × 5 cols inside grp_secrets)
  const secretNodes = [
    entity(ids.ENT_SEC_ORACLE_FRAUD,       ids.ENT_SEC_ORACLE_FRAUD,         80,  830),
    entity(ids.ENT_SEC_VANTIS_FUNDING,     ids.ENT_SEC_VANTIS_FUNDING,      570,  830),
    entity(ids.ENT_SEC_DIVINE_VOICE,       ids.ENT_SEC_DIVINE_VOICE,       1060,  830),
    entity(ids.ENT_SEC_LYRA_SUSPECTS,      ids.ENT_SEC_LYRA_SUSPECTS,      1550,  830),
    entity(ids.ENT_SEC_KAEL_EVIDENCE,      ids.ENT_SEC_KAEL_EVIDENCE,      2040,  830),
    entity(ids.ENT_SEC_ARCHIVE_FIRE,       ids.ENT_SEC_ARCHIVE_FIRE,         80,  990),
    entity(ids.ENT_SEC_SENRA_DEFECT,       ids.ENT_SEC_SENRA_DEFECT,        570,  990),
    entity(ids.ENT_SEC_DORIAN_SPY,         ids.ENT_SEC_DORIAN_SPY,         1060,  990),
    entity(ids.ENT_SEC_ORIGINAL_ORACLE,    ids.ENT_SEC_ORIGINAL_ORACLE,    1550,  990),
    entity(ids.ENT_SEC_VAULT_LOCATION,     ids.ENT_SEC_VAULT_LOCATION,     2040,  990),
    entity(ids.ENT_SEC_PROPHECY_COUNT,     ids.ENT_SEC_PROPHECY_COUNT,       80, 1150),
    entity(ids.ENT_SEC_CONSEJO_CORRUPTION, ids.ENT_SEC_CONSEJO_CORRUPTION,  570, 1150),
    entity(ids.ENT_SEC_CAPTAIN_ESCAPE,     ids.ENT_SEC_CAPTAIN_ESCAPE,     1060, 1150),
    entity(ids.ENT_SEC_SENRA_EXIT_CODE,    ids.ENT_SEC_SENRA_EXIT_CODE,    1550, 1150),
    entity(ids.ENT_SEC_WIDOW_SON,          ids.ENT_SEC_WIDOW_SON,          2040, 1150),
  ];
  for (const n of secretNodes) await placeNode(canvasId, n);

  await placeNode(canvasId, note(
    "note_mystery_dm",
    "Nota DM — Cuándo revelar cada secreto",
    "Oracle Fraud: se confirma con las pistas de Fase 3+4. Vantis Funding: Fase 2 (libro contable). Divine Voice: Fase 3 (componente arcano). Archive Fire: Fase 2 (registros destruidos). Senra Defect: Fase 3 (sus dudas, si los jugadores la presionan con cuidado). Vault Location: Fase 3 (entrada a las ruinas). Captain Escape: Fase 4 (barco contratado).",
    50, 1370, 2470, 140, "pink",
  ));

  // Clue → Secret edges (the investigation chain)
  const edges: [string, string, string, EdgeStyle][] = [
    // Phase 1 leads to secrets
    [`node_${ids.ENT_CLUE_PROPHECY_TEXT}`,       `node_${ids.ENT_SEC_ORACLE_FRAUD}`,      "evidencia textual",    "secret"],
    [`node_${ids.ENT_CLUE_PROPHECY_TEXT}`,       `node_${ids.ENT_SEC_PROPHECY_COUNT}`,    "patrón de falsedades", "secret"],
    [`node_${ids.ENT_CLUE_MERCHANT_PAYMENT}`,    `node_${ids.ENT_SEC_VANTIS_FUNDING}`,    "confirma financiación","secret"],
    [`node_${ids.ENT_CLUE_ARCANE_COMPONENT}`,    `node_${ids.ENT_SEC_DIVINE_VOICE}`,      "origen del cristal",   "secret"],
    [`node_${ids.ENT_CLUE_PETITIONER_FEAR}`,     `node_${ids.ENT_SEC_PROPHECY_COUNT}`,    "víctimas conocidas",   "dashed"],
    // Phase 2 leads to secrets
    [`node_${ids.ENT_CLUE_ARCHIVE_RECORDS}`,     `node_${ids.ENT_SEC_ARCHIVE_FIRE}`,      "documenta el incendio","secret"],
    [`node_${ids.ENT_CLUE_ARCHIVE_RECORDS}`,     `node_${ids.ENT_SEC_ORIGINAL_ORACLE}`,   "registros auténticos", "secret"],
    [`node_${ids.ENT_CLUE_GUILD_LEDGER}`,        `node_${ids.ENT_SEC_VANTIS_FUNDING}`,    "libro de cuentas",     "strong"],
    [`node_${ids.ENT_CLUE_PORT_BODIES}`,         `node_${ids.ENT_SEC_CAPTAIN_ESCAPE}`,    "barco implicado",      "secret"],
    [`node_${ids.ENT_CLUE_SERA_TEXTS}`,          `node_${ids.ENT_SEC_ORIGINAL_ORACLE}`,   "textos auténticos",    "secret"],
    [`node_${ids.ENT_CLUE_LYRA_INVESTIGATION}`,  `node_${ids.ENT_SEC_LYRA_SUSPECTS}`,     "lista de sospechosos", "dashed"],
    // Phase 3 leads to secrets
    [`node_${ids.ENT_CLUE_INNER_CIRCLE_MTG}`,    `node_${ids.ENT_SEC_DORIAN_SPY}`,        "presencia del espía",  "secret"],
    [`node_${ids.ENT_CLUE_INNER_CIRCLE_MTG}`,    `node_${ids.ENT_SEC_CONSEJO_CORRUPTION}`, "corrupción expuesta", "secret"],
    [`node_${ids.ENT_CLUE_FALSE_PROPHECY_AUDIO}`,`node_${ids.ENT_SEC_ORACLE_FRAUD}`,      "prueba de audio",      "strong"],
    [`node_${ids.ENT_CLUE_SENRA_DOUBTS}`,        `node_${ids.ENT_SEC_SENRA_DEFECT}`,      "quiebre de lealtad",   "dashed"],
    [`node_${ids.ENT_CLUE_SENRA_DOUBTS}`,        `node_${ids.ENT_SEC_SENRA_EXIT_CODE}`,   "conoce el código",     "secret"],
    [`node_${ids.ENT_CLUE_VAULT_ENTRANCE}`,      `node_${ids.ENT_SEC_VAULT_LOCATION}`,    "localización",         "secret"],
    // Phase 4 leads to secrets
    [`node_${ids.ENT_CLUE_VAULT_RECORDS}`,       `node_${ids.ENT_SEC_ORACLE_FRAUD}`,      "prueba definitiva",    "strong"],
    [`node_${ids.ENT_CLUE_VAULT_RECORDS}`,       `node_${ids.ENT_SEC_VANTIS_FUNDING}`,    "contabilidad real",    "strong"],
    [`node_${ids.ENT_CLUE_FORGERY_TOOL}`,        `node_${ids.ENT_SEC_DIVINE_VOICE}`,      "instrumento del fraude","strong"],
    [`node_${ids.ENT_CLUE_FORGERY_TOOL}`,        `node_${ids.ENT_SEC_ORACLE_FRAUD}`,      "prueba material",      "strong"],
    [`node_${ids.ENT_CLUE_VERADIS_ESCAPE}`,      `node_${ids.ENT_SEC_CAPTAIN_ESCAPE}`,    "plan de huida",        "secret"],
    [`node_${ids.ENT_CLUE_VANTIS_CONFESSION}`,   `node_${ids.ENT_SEC_WIDOW_SON}`,         "deuda moral",          "weak"],
    [`node_${ids.ENT_CLUE_EASTERN_FRONT_LETTER}`,`node_${ids.ENT_SEC_WIDOW_SON}`,         "carta militar",        "strong"],
    [`node_${ids.ENT_CLUE_FINAL_TRUTH}`,         `node_${ids.ENT_SEC_ORACLE_FRAUD}`,      "verdad total",         "strong"],
    [`node_${ids.ENT_CLUE_FINAL_TRUTH}`,         `node_${ids.ENT_SEC_ORIGINAL_ORACLE}`,   "identidad real",       "strong"],
    // Phase chain (horizontal flow)
    [`node_${ids.ENT_CLUE_TORBEN_TIP}`,          `node_${ids.ENT_CLUE_ARCHIVE_RECORDS}`,  "lleva al archivo",     "dashed"],
    [`node_${ids.ENT_CLUE_TORBEN_TIP}`,          `node_${ids.ENT_CLUE_GUILD_LEDGER}`,     "contacto gremio",      "dashed"],
    [`node_${ids.ENT_CLUE_LYRA_INVESTIGATION}`,  `node_${ids.ENT_CLUE_INNER_CIRCLE_MTG}`, "infiltración",         "dashed"],
    [`node_${ids.ENT_CLUE_VAULT_ENTRANCE}`,      `node_${ids.ENT_CLUE_VAULT_RECORDS}`,    "dentro de la bóveda",  "solid"],
    [`node_${ids.ENT_CLUE_SENRA_DOUBTS}`,        `node_${ids.ENT_CLUE_CULTO_DISBANDS}`,   "posible defección",    "weak"],
  ];
  for (const [src, tgt, label, style] of edges) {
    await placeEdge(canvasId, src, tgt, label, style);
  }

  console.log("✓ Cadena de Investigación canvas populated");
}


// ---------------------------------------------------------------------------
// Canvas 4: Mapa de Valdris (kind: location)
// Layout: 2100 × 1420
// Purpose: make locations narratively useful to Lore Lint and booklet export.
// ---------------------------------------------------------------------------
async function seedValdrisLocationsCanvas(canvasId: string) {
  const groups = [
    group("grp_l_valdris",      "Ciudad de Valdris",          50,   50, 470, 360, "yellow", "location"),
    group("grp_l_ruinas",       "Ruinas del Templo Antiguo", 560,   50, 470, 360, "pink", "location"),
    group("grp_l_boveda",       "Bóveda Subterránea",       1070,  50, 470, 360, "purple", "location"),
    group("grp_l_taberna",      "Taberna del Cuervo",       1580,  50, 470, 360, "green", "location"),
    group("grp_l_templo",       "Templo de la Verdad",        50,  460, 470, 360, "blue", "location"),
    group("grp_l_archivo",      "Archivo de la Ciudad",      560, 460, 470, 360, "yellow", "location"),
    group("grp_l_puerto",       "Puerto de Valdris",        1070, 460, 470, 360, "green", "location"),
    group("grp_l_barrio",       "Barrio Noble",             1580, 460, 470, 360, "purple", "location"),
    group("grp_l_gremio",       "Guarida del Gremio",         50,  870, 470, 360, "green", "location"),
    group("grp_l_santuario",    "Santuario del Bosque",      560, 870, 470, 360, "blue", "location"),
    group("grp_l_cuartel",      "Cuartel de la Guardia",    1070, 870, 470, 360, "purple", "location"),
    group("grp_l_muelles",      "Muelles del Puerto",       1580, 870, 470, 360, "yellow", "location"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const nodes = [
    // Ciudad
    entity("l_valdris", ids.ENT_LOC_VALDRIS, 80, 130),
    entity("l_valdris_veradis", ids.ENT_NPC_VERADIS, 250, 130),
    entity("l_valdris_aldrich", ids.ENT_NPC_ALDRIC, 250, 250),
    entity("l_valdris_profecia", ids.ENT_CLUE_PROPHECY_TEXT, 80, 250),

    // Ruinas
    entity("l_ruinas", ids.ENT_LOC_RUINAS, 590, 130),
    entity("l_ruinas_abad", ids.ENT_NPC_ABAD_SANTUARIO, 760, 130),
    entity("l_ruinas_entrada", ids.ENT_CLUE_VAULT_ENTRANCE, 760, 250),
    entity("l_ruinas_tomo", ids.ENT_CLUE_ELDERTOME, 590, 250),

    // Bóveda
    entity("l_boveda", ids.ENT_LOC_BOVEDA, 1100, 130),
    entity("l_boveda_records", ids.ENT_CLUE_VAULT_RECORDS, 1270, 130),
    entity("l_boveda_truth", ids.ENT_CLUE_FINAL_TRUTH, 1270, 250),
    entity("l_boveda_count", ids.ENT_SEC_PROPHECY_COUNT, 1100, 250),

    // Taberna
    entity("l_taberna", ids.ENT_LOC_TABERNA_CUERVO, 1610, 130),
    entity("l_taberna_torben", ids.ENT_NPC_TORBEN, 1780, 130),
    entity("l_taberna_silas", ids.ENT_PC_SILAS, 1780, 250),
    entity("l_taberna_tip", ids.ENT_CLUE_TORBEN_TIP, 1610, 250),

    // Templo de la Verdad
    entity("l_templo", ids.ENT_LOC_TEMPLO_VERDAD, 80, 540),
    entity("l_templo_sera", ids.ENT_NPC_SERA, 250, 540),
    entity("l_templo_camus", ids.ENT_PC_CAMUS, 250, 660),
    entity("l_templo_cronicas", ids.ENT_CLUE_SERA_TEXTS, 80, 660),

    // Archivo
    entity("l_archivo", ids.ENT_LOC_ARCHIVO, 590, 540),
    entity("l_archivo_mira", ids.ENT_NPC_MIRA, 760, 540),
    entity("l_archivo_records", ids.ENT_CLUE_ARCHIVE_RECORDS, 760, 660),
    entity("l_archivo_lyra_diary", ids.ENT_CLUE_LYRA_INVESTIGATION, 590, 660),

    // Puerto
    entity("l_puerto", ids.ENT_LOC_PUERTO, 1100, 540),
    entity("l_puerto_ilva", ids.ENT_NPC_CURANDERO, 1270, 540),
    entity("l_puerto_pica", ids.ENT_NPC_RUMORISTA, 1270, 660),
    entity("l_puerto_bodies", ids.ENT_CLUE_PORT_BODIES, 1100, 660),

    // Barrio Noble
    entity("l_barrio", ids.ENT_LOC_BARRIO_NOBLE, 1610, 540),
    entity("l_barrio_vantis", ids.ENT_NPC_VANTIS, 1780, 540),
    entity("l_barrio_brann", ids.ENT_NPC_CONSEJERO_BRANN, 1780, 660),
    entity("l_barrio_payments", ids.ENT_CLUE_MERCHANT_PAYMENT, 1610, 660),

    // Guarida del Gremio
    entity("l_gremio", ids.ENT_LOC_CAMPAMENTO_GREMIO, 80, 950),
    entity("l_gremio_kael", ids.ENT_NPC_KAEL, 250, 950),
    entity("l_gremio_cira", ids.ENT_NPC_CIRA, 250, 1070),
    entity("l_gremio_ledger", ids.ENT_CLUE_GUILD_LEDGER, 80, 1070),

    // Santuario
    entity("l_santuario", ids.ENT_LOC_SANTUARIO_BOSQUE, 590, 950),
    entity("l_santuario_abad", ids.ENT_NPC_ABAD_SANTUARIO, 760, 950),
    entity("l_santuario_tome", ids.ENT_CLUE_ELDERTOME, 760, 1070),
    entity("l_santuario_truth", ids.ENT_CLUE_FINAL_TRUTH, 590, 1070),

    // Cuartel
    entity("l_cuartel", ids.ENT_LOC_CUARTEL_GUARDIA, 1100, 950),
    entity("l_cuartel_lyra", ids.ENT_NPC_LYRA, 1270, 950),
    entity("l_cuartel_riku", ids.ENT_NPC_GUARDIA_RIKU, 1270, 1070),
    entity("l_cuartel_diary", ids.ENT_CLUE_LYRA_INVESTIGATION, 1100, 1070),

    // Muelles
    entity("l_muelles", ids.ENT_LOC_MUELLES, 1610, 950),
    entity("l_muelles_drez", ids.ENT_NPC_CAPITAN_BARCO, 1780, 950),
    entity("l_muelles_riku", ids.ENT_NPC_GUARDIA_RIKU, 1780, 1070),
    entity("l_muelles_bodies", ids.ENT_CLUE_PORT_BODIES, 1610, 1070),
    entity("l_muelles_escape", ids.ENT_CLUE_VERADIS_ESCAPE, 1610, 1190),
  ];
  for (const n of nodes) await placeNode(canvasId, n);

  await placeNode(canvasId, note(
    "note_locations",
    "Uso del mapa de Valdris",
    "Cada grupo es una localización jugable con PNJs y pistas colocadas dentro. Este tablero reduce falsos positivos de lugares vacíos y ayuda a preparar escenas desde zonas concretas del mapa.",
    50, 1270, 2000, 110, "yellow",
  ));

  const contents: [string, string, string, EdgeStyle][] = [
    ["l_valdris", "l_valdris_veradis", "autoridad pública", "dashed"],
    ["l_valdris", "l_valdris_aldrich", "gobierno local", "dashed"],
    ["l_valdris", "l_valdris_profecia", "incidente inicial", "strong"],

    ["l_ruinas", "l_ruinas_abad", "guardián", "dashed"],
    ["l_ruinas", "l_ruinas_entrada", "acceso oculto", "strong"],
    ["l_ruinas", "l_ruinas_tomo", "memoria antigua", "dashed"],

    ["l_boveda", "l_boveda_records", "prueba definitiva", "strong"],
    ["l_boveda", "l_boveda_truth", "verdad final", "strong"],
    ["l_boveda", "l_boveda_count", "escala del fraude", "secret"],

    ["l_taberna", "l_taberna_torben", "informador", "solid"],
    ["l_taberna", "l_taberna_silas", "rumorista jugador", "weak"],
    ["l_taberna", "l_taberna_tip", "primer testimonio", "solid"],

    ["l_templo", "l_templo_sera", "guardiana", "solid"],
    ["l_templo", "l_templo_camus", "vínculo espiritual", "weak"],
    ["l_templo", "l_templo_cronicas", "texto protegido", "strong"],

    ["l_archivo", "l_archivo_mira", "custodia", "solid"],
    ["l_archivo", "l_archivo_records", "registros quemados", "strong"],
    ["l_archivo", "l_archivo_lyra_diary", "investigación paralela", "dashed"],

    ["l_puerto", "l_puerto_ilva", "testigo médico", "solid"],
    ["l_puerto", "l_puerto_pica", "rumores del mercado", "weak"],
    ["l_puerto", "l_puerto_bodies", "cadáveres marcados", "strong"],

    ["l_barrio", "l_barrio_vantis", "residencia noble", "solid"],
    ["l_barrio", "l_barrio_brann", "corrupción política", "secret"],
    ["l_barrio", "l_barrio_payments", "rastro financiero", "strong"],

    ["l_gremio", "l_gremio_kael", "líder", "solid"],
    ["l_gremio", "l_gremio_cira", "operativa", "solid"],
    ["l_gremio", "l_gremio_ledger", "seguro de vida", "strong"],

    ["l_santuario", "l_santuario_abad", "guardián", "solid"],
    ["l_santuario", "l_santuario_tome", "tomo antiguo", "strong"],
    ["l_santuario", "l_santuario_truth", "identidad real", "secret"],

    ["l_cuartel", "l_cuartel_lyra", "capitana", "solid"],
    ["l_cuartel", "l_cuartel_riku", "testigo nervioso", "solid"],
    ["l_cuartel", "l_cuartel_diary", "diario secreto", "strong"],

    ["l_muelles", "l_muelles_drez", "barco de huida", "secret"],
    ["l_muelles", "l_muelles_riku", "testigo ocular", "dashed"],
    ["l_muelles", "l_muelles_bodies", "víctimas", "strong"],
    ["l_muelles", "l_muelles_escape", "ruta de escape", "secret"],
  ];

  for (const [src, tgt, label, style] of contents) {
    await placeEdge(canvasId, `node_${src}`, `node_${tgt}`, label, style);
  }

  console.log("✓ Mapa de Valdris canvas populated (locations, witnesses, clues, secrets)");
}


// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export async function seedCanvas() {
  console.log("\nSeeding Campaign Canvases...");

  // 1. Get or use the default canvas
  const canvasesRes = await api("GET", `/api/campaigns/${CMP}/canvases`);
  const canvases = Array.isArray(canvasesRes.json) ? canvasesRes.json : [];
  const defaultCanvas = canvases.find((c: any) => c.title === "Campaña" || c.kind === "world") || canvases[0];

  if (!defaultCanvas) {
    console.warn("⚠ No default canvas found.");
    return;
  }
  console.log(`✓ Default canvas: ${defaultCanvas.title} (ID: ${defaultCanvas.id})`);
  await seedOverviewCanvas(defaultCanvas.id);

  // 2. Create Facciones y Personajes canvas
  const cvs2Id = "cvs_seed_characters";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: cvs2Id,
    title: "Facciones y Personajes",
    kind: "characters",
    description: "Todas las facciones con sus NPCs miembros y los personajes jugadores disponibles.",
  });
  console.log("✓ Created canvas: Facciones y Personajes");
  await seedCharactersCanvas(cvs2Id);

  // 3. Create Cadena de Investigación canvas
  const cvs3Id = "cvs_seed_mystery";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: cvs3Id,
    title: "Cadena de Investigación",
    kind: "mystery",
    description: "Las 22 pistas organizadas en 4 fases narrativas con sus conexiones a los 15 secretos DM.",
  });
  console.log("✓ Created canvas: Cadena de Investigación");
  await seedMysteryCanvas(cvs3Id);

  // 4. Create Mapa de Valdris canvas
  const cvs4Id = "cvs_seed_locations";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: cvs4Id,
    title: "Mapa de Valdris",
    kind: "location",
    description: "Localizaciones jugables con PNJs, pistas y secretos colocados visualmente para preparar escenas y evitar lugares vacíos.",
  });
  console.log("✓ Created canvas: Mapa de Valdris");
  await seedValdrisLocationsCanvas(cvs4Id);

  console.log("\n✓ All canvases seeded successfully (4 boards, full campaign coverage)");
}
