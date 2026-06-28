import { api } from "./client.js";
import { CMP } from "./config.js";
import * as ids from "./ids.js";

type NodeKind = "entity" | "note" | "group";
type EdgeStyle = "solid" | "dashed" | "secret" | "weak" | "strong";

type Palette = "yellow" | "blue" | "green" | "pink" | "purple";

async function placeNode(canvasId: string, node: Record<string, unknown>) {
  const res = await api("POST", `/api/campaigns/${CMP}/canvases/${canvasId}/nodes`, { actorId: "usr_dm", node });
  if (res.status >= 400) throw new Error(`Node ${node.id}: ${JSON.stringify(res.json)}`);
}

async function placeEdge(canvasId: string, sourceNodeId: string, targetNodeId: string, label: string, style: EdgeStyle = "solid") {
  const res = await api("POST", `/api/campaigns/${CMP}/canvases/${canvasId}/edges`, {
    actorId: "usr_dm",
    edge: { sourceNodeId, targetNodeId, label, status: "draft" as const, style },
  });
  if (res.status >= 400) throw new Error(`Edge ${sourceNodeId}→${targetNodeId}: ${JSON.stringify(res.json)}`);
}

function entity(id: string, entityId: string, x: number, y: number) {
  return { id: `node_${id}`, kind: "entity" as NodeKind, entityId, x, y };
}

function group(id: string, title: string, x: number, y: number, w: number, h: number, color: Palette, groupType?: string) {
  return { id, kind: "group" as NodeKind, title, x, y, width: w, height: h, color, metadata: groupType ? { groupType } : undefined };
}

function note(id: string, title: string, text: string, x: number, y: number, w: number, h: number, color: Palette = "yellow") {
  return { id, kind: "note" as NodeKind, title, text, x, y, width: w, height: h, color };
}

async function seedOverviewCanvas(canvasId: string) {
  const groups = [
    group("grp_pcs", "Personajes y tono", 40, 40, 620, 430, "blue", "characters"),
    group("grp_town", "Phandalin visible", 700, 40, 760, 430, "green", "location"),
    group("grp_open", "Frentes abiertos", 1500, 40, 860, 430, "yellow", "arc"),
    group("grp_threats", "Red oculta DM", 40, 540, 2320, 620, "pink", "mystery"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const nodes = [
    entity(ids.ENT_PC_ARIC, ids.ENT_PC_ARIC, 80, 120),
    entity(ids.ENT_PC_MIRA, ids.ENT_PC_MIRA, 80, 250),
    entity(ids.ENT_PC_BROM, ids.ENT_PC_BROM, 360, 120),
    entity(ids.ENT_PC_NIM, ids.ENT_PC_NIM, 360, 250),

    entity(ids.ENT_LOC_PHANDALIN, ids.ENT_LOC_PHANDALIN, 740, 120),
    entity(ids.ENT_LOC_STONEHILL, ids.ENT_LOC_STONEHILL, 740, 250),
    entity(ids.ENT_NPC_SILDAR, ids.ENT_NPC_SILDAR, 1060, 120),
    entity(ids.ENT_NPC_HALIA, ids.ENT_NPC_HALIA, 1060, 250),
    entity(ids.ENT_NPC_HARBIN, ids.ENT_NPC_HARBIN, 1260, 185),

    entity(ids.ENT_Q_RESCUE_GUNDREN, ids.ENT_Q_RESCUE_GUNDREN, 1540, 120),
    entity(ids.ENT_Q_REDBRANDS, ids.ENT_Q_REDBRANDS, 1540, 250),
    entity(ids.ENT_Q_FIND_CASTLE, ids.ENT_Q_FIND_CASTLE, 1860, 120),
    entity(ids.ENT_Q_WAVE_ECHO, ids.ENT_Q_WAVE_ECHO, 1860, 250),
    entity(ids.ENT_Q_FUTURE_PHANDALIN, ids.ENT_Q_FUTURE_PHANDALIN, 2140, 185),

    entity(ids.ENT_FAC_REDBRANDS, ids.ENT_FAC_REDBRANDS, 80, 650),
    entity(ids.ENT_NPC_IARNO, ids.ENT_NPC_IARNO, 80, 820),
    entity(ids.ENT_NPC_NOTHIC, ids.ENT_NPC_NOTHIC, 80, 990),
    entity(ids.ENT_FAC_CRAGMAW, ids.ENT_FAC_CRAGMAW, 440, 650),
    entity(ids.ENT_NPC_GROL, ids.ENT_NPC_GROL, 440, 820),
    entity(ids.ENT_NPC_VYERITH, ids.ENT_NPC_VYERITH, 440, 990),
    entity(ids.ENT_NPC_NEZZNAR, ids.ENT_NPC_NEZZNAR, 800, 735),
    entity(ids.ENT_SEC_NEZZNAR, ids.ENT_SEC_NEZZNAR, 1160, 650),
    entity(ids.ENT_SEC_IARNO_GLASSTAFF, ids.ENT_SEC_IARNO_GLASSTAFF, 1160, 820),
    entity(ids.ENT_SEC_VYERITH_DOPPELGANGER, ids.ENT_SEC_VYERITH_DOPPELGANGER, 1160, 990),
    entity(ids.ENT_LOC_WAVE_ECHO, ids.ENT_LOC_WAVE_ECHO, 1520, 735),
    entity(ids.ENT_LOC_FORGE_OF_SPELLS, ids.ENT_LOC_FORGE_OF_SPELLS, 1880, 735),
    entity(ids.ENT_SEC_PHANDALIN_POWER_VACUUM, ids.ENT_SEC_PHANDALIN_POWER_VACUUM, 1880, 940),
  ];
  for (const n of nodes) await placeNode(canvasId, n);

  await placeNode(canvasId, note(
    "note_dm_opening",
    "Apertura cómoda",
    "Abre la próxima sesión con una pregunta simple: ¿salváis primero a las personas bajo Tresendar, perseguís a Gundren o buscáis aliados? Eso da agencia sin perder foco.",
    700, 395, 760, 95, "yellow",
  ));

  const edges: [string, string, string, EdgeStyle][] = [
    [`node_${ids.ENT_Q_RESCUE_GUNDREN}`, `node_${ids.ENT_Q_FIND_CASTLE}`, "lleva a", "strong"],
    [`node_${ids.ENT_Q_FIND_CASTLE}`, `node_${ids.ENT_Q_WAVE_ECHO}`, "desbloquea", "strong"],
    [`node_${ids.ENT_Q_REDBRANDS}`, `node_${ids.ENT_Q_FUTURE_PHANDALIN}`, "consecuencia", "dashed"],
    [`node_${ids.ENT_Q_WAVE_ECHO}`, `node_${ids.ENT_Q_FUTURE_PHANDALIN}`, "decide futuro", "strong"],
    [`node_${ids.ENT_FAC_REDBRANDS}`, `node_${ids.ENT_NPC_IARNO}`, "liderados por", "secret"],
    [`node_${ids.ENT_NPC_IARNO}`, `node_${ids.ENT_NPC_NEZZNAR}`, "responde ante", "secret"],
    [`node_${ids.ENT_FAC_CRAGMAW}`, `node_${ids.ENT_NPC_GROL}`, "obedecen a", "solid"],
    [`node_${ids.ENT_NPC_VYERITH}`, `node_${ids.ENT_NPC_NEZZNAR}`, "sirve a", "secret"],
    [`node_${ids.ENT_NPC_NEZZNAR}`, `node_${ids.ENT_LOC_WAVE_ECHO}`, "quiere", "secret"],
    [`node_${ids.ENT_LOC_WAVE_ECHO}`, `node_${ids.ENT_LOC_FORGE_OF_SPELLS}`, "contiene", "secret"],
  ];
  for (const [src, tgt, label, style] of edges) await placeEdge(canvasId, src, tgt, label, style);

  console.log("✓ Phandalin overview canvas populated");
}

async function seedInvestigationCanvas(canvasId: string) {
  const groups = [
    group("grp_i_seen", "Pistas ya visibles", 40, 40, 760, 500, "green", "mystery"),
    group("grp_i_ready", "Pistas preparadas", 860, 40, 930, 850, "yellow", "mystery"),
    group("grp_i_secrets", "Secretos conectados", 1850, 40, 1000, 850, "pink", "mystery"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const nodes = [
    entity(ids.ENT_CLUE_DEAD_HORSES, ids.ENT_CLUE_DEAD_HORSES, 80, 120),
    entity(ids.ENT_CLUE_GOBLIN_TRAIL, ids.ENT_CLUE_GOBLIN_TRAIL, 80, 250),
    entity(ids.ENT_CLUE_SILDAR_WARNING, ids.ENT_CLUE_SILDAR_WARNING, 420, 120),
    entity(ids.ENT_CLUE_REDBRAND_THREATS, ids.ENT_CLUE_REDBRAND_THREATS, 420, 250),
    entity(ids.ENT_CLUE_TOWN_FEARS, ids.ENT_CLUE_TOWN_FEARS, 250, 390),

    entity(ids.ENT_CLUE_CARP_TUNNEL, ids.ENT_CLUE_CARP_TUNNEL, 900, 120),
    entity(ids.ENT_CLUE_GLASSTAFF_LETTER, ids.ENT_CLUE_GLASSTAFF_LETTER, 900, 250),
    entity(ids.ENT_CLUE_NOTHIC_WHISPERS, ids.ENT_CLUE_NOTHIC_WHISPERS, 900, 380),
    entity(ids.ENT_CLUE_RED_BRAND_LEDGER, ids.ENT_CLUE_RED_BRAND_LEDGER, 900, 510),
    entity(ids.ENT_CLUE_CASTLE_MARKS, ids.ENT_CLUE_CASTLE_MARKS, 1220, 120),
    entity(ids.ENT_CLUE_CRAGMAW_RANSOM, ids.ENT_CLUE_CRAGMAW_RANSOM, 1220, 250),
    entity(ids.ENT_CLUE_VYERITH_DISGUISE, ids.ENT_CLUE_VYERITH_DISGUISE, 1220, 380),
    entity(ids.ENT_CLUE_MINE_MAP, ids.ENT_CLUE_MINE_MAP, 1220, 510),
    entity(ids.ENT_CLUE_FORGE_ECHO, ids.ENT_CLUE_FORGE_ECHO, 1540, 120),
    entity(ids.ENT_CLUE_NUNDRO_TESTIMONY, ids.ENT_CLUE_NUNDRO_TESTIMONY, 1540, 250),
    entity(ids.ENT_CLUE_THARDEN_BODY, ids.ENT_CLUE_THARDEN_BODY, 1540, 380),
    entity(ids.ENT_CLUE_PHANDALIN_POWER_VACUUM, ids.ENT_CLUE_PHANDALIN_POWER_VACUUM, 1540, 510),
    entity(ids.ENT_CLUE_DRAGON_SIGNS, ids.ENT_CLUE_DRAGON_SIGNS, 1220, 640),
    entity(ids.ENT_CLUE_AGATHA_MEMORY, ids.ENT_CLUE_AGATHA_MEMORY, 1540, 640),

    entity(ids.ENT_SEC_IARNO_GLASSTAFF, ids.ENT_SEC_IARNO_GLASSTAFF, 1890, 120),
    entity(ids.ENT_SEC_NOTHIC_HUNGER, ids.ENT_SEC_NOTHIC_HUNGER, 1890, 250),
    entity(ids.ENT_SEC_DENDRARS_ALIVE, ids.ENT_SEC_DENDRARS_ALIVE, 1890, 380),
    entity(ids.ENT_SEC_CASTLE_LOCATION, ids.ENT_SEC_CASTLE_LOCATION, 1890, 510),
    entity(ids.ENT_SEC_GUNDREN_MAP, ids.ENT_SEC_GUNDREN_MAP, 1890, 640),
    entity(ids.ENT_SEC_NEZZNAR, ids.ENT_SEC_NEZZNAR, 2240, 120),
    entity(ids.ENT_SEC_VYERITH_DOPPELGANGER, ids.ENT_SEC_VYERITH_DOPPELGANGER, 2240, 250),
    entity(ids.ENT_SEC_FORGE_REAL, ids.ENT_SEC_FORGE_REAL, 2240, 380),
    entity(ids.ENT_SEC_THARDEN_DEAD, ids.ENT_SEC_THARDEN_DEAD, 2240, 510),
    entity(ids.ENT_SEC_PHANDALIN_POWER_VACUUM, ids.ENT_SEC_PHANDALIN_POWER_VACUUM, 2240, 640),
    entity(ids.ENT_SEC_VENOMFANG_MANIPULATES, ids.ENT_SEC_VENOMFANG_MANIPULATES, 2590, 380),
    entity(ids.ENT_SEC_AGATHA_KNOWS, ids.ENT_SEC_AGATHA_KNOWS, 2590, 640),
  ];
  for (const n of nodes) await placeNode(canvasId, n);

  const edges: [string, string, string, EdgeStyle][] = [
    [`node_${ids.ENT_CLUE_GLASSTAFF_LETTER}`, `node_${ids.ENT_SEC_IARNO_GLASSTAFF}`, "confirma", "secret"],
    [`node_${ids.ENT_CLUE_NOTHIC_WHISPERS}`, `node_${ids.ENT_SEC_NOTHIC_HUNGER}`, "confirma", "secret"],
    [`node_${ids.ENT_CLUE_RED_BRAND_LEDGER}`, `node_${ids.ENT_SEC_DENDRARS_ALIVE}`, "apunta", "secret"],
    [`node_${ids.ENT_CLUE_CASTLE_MARKS}`, `node_${ids.ENT_SEC_CASTLE_LOCATION}`, "desbloquea", "secret"],
    [`node_${ids.ENT_CLUE_MINE_MAP}`, `node_${ids.ENT_SEC_GUNDREN_MAP}`, "confirma", "secret"],
    [`node_${ids.ENT_CLUE_NUNDRO_TESTIMONY}`, `node_${ids.ENT_SEC_NEZZNAR}`, "confirma", "secret"],
    [`node_${ids.ENT_CLUE_VYERITH_DISGUISE}`, `node_${ids.ENT_SEC_VYERITH_DOPPELGANGER}`, "delata", "secret"],
    [`node_${ids.ENT_CLUE_FORGE_ECHO}`, `node_${ids.ENT_SEC_FORGE_REAL}`, "confirma", "secret"],
    [`node_${ids.ENT_CLUE_THARDEN_BODY}`, `node_${ids.ENT_SEC_THARDEN_DEAD}`, "golpe emocional", "secret"],
    [`node_${ids.ENT_CLUE_PHANDALIN_POWER_VACUUM}`, `node_${ids.ENT_SEC_PHANDALIN_POWER_VACUUM}`, "prepara", "secret"],
    [`node_${ids.ENT_CLUE_DRAGON_SIGNS}`, `node_${ids.ENT_SEC_VENOMFANG_MANIPULATES}`, "advierte", "secret"],
    [`node_${ids.ENT_CLUE_AGATHA_MEMORY}`, `node_${ids.ENT_SEC_AGATHA_KNOWS}`, "abre pregunta", "secret"],
  ];
  for (const [src, tgt, label, style] of edges) await placeEdge(canvasId, src, tgt, label, style);

  console.log("✓ Phandalin investigation canvas populated");
}

async function seedLocationCanvas(canvasId: string) {
  const groups = [
    group("grp_l_town", "Pueblo", 40, 40, 1140, 690, "green", "location"),
    group("grp_l_wild", "Rutas y guaridas", 1240, 40, 1180, 690, "yellow", "location"),
    group("grp_l_final", "Final oculto", 2480, 40, 760, 690, "pink", "location"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const nodes = [
    entity(ids.ENT_LOC_PHANDALIN, ids.ENT_LOC_PHANDALIN, 80, 120),
    entity(ids.ENT_LOC_STONEHILL, ids.ENT_LOC_STONEHILL, 80, 260),
    entity(ids.ENT_LOC_BARTHEN, ids.ENT_LOC_BARTHEN, 80, 400),
    entity(ids.ENT_LOC_LIONSHIELD, ids.ENT_LOC_LIONSHIELD, 360, 120),
    entity(ids.ENT_LOC_TRESENDAR, ids.ENT_LOC_TRESENDAR, 360, 260),
    entity(ids.ENT_LOC_SLEEPING_GIANT, ids.ENT_LOC_SLEEPING_GIANT, 360, 400),
    entity(ids.ENT_LOC_TOWNMASTER, ids.ENT_LOC_TOWNMASTER, 640, 120),
    entity(ids.ENT_LOC_SHRINE, ids.ENT_LOC_SHRINE, 640, 260),
    entity(ids.ENT_LOC_ALDERLEAF, ids.ENT_LOC_ALDERLEAF, 640, 400),
    entity(ids.ENT_LOC_MINERS_EXCHANGE, ids.ENT_LOC_MINERS_EXCHANGE, 920, 260),

    entity(ids.ENT_LOC_TRIBOAR_TRAIL, ids.ENT_LOC_TRIBOAR_TRAIL, 1280, 120),
    entity(ids.ENT_LOC_CRAGMAW_HIDEOUT, ids.ENT_LOC_CRAGMAW_HIDEOUT, 1280, 300),
    entity(ids.ENT_LOC_CRAGMAW_CASTLE, ids.ENT_LOC_CRAGMAW_CASTLE, 1620, 120),
    entity(ids.ENT_LOC_CONYBERRY, ids.ENT_LOC_CONYBERRY, 1620, 300),
    entity(ids.ENT_LOC_AGATHA_LAIR, ids.ENT_LOC_AGATHA_LAIR, 1620, 480),
    entity(ids.ENT_LOC_OLD_OWL_WELL, ids.ENT_LOC_OLD_OWL_WELL, 1960, 120),
    entity(ids.ENT_LOC_WYVERN_TOR, ids.ENT_LOC_WYVERN_TOR, 1960, 300),
    entity(ids.ENT_LOC_THUNDERTREE, ids.ENT_LOC_THUNDERTREE, 1960, 480),

    entity(ids.ENT_LOC_WAVE_ECHO, ids.ENT_LOC_WAVE_ECHO, 2520, 180),
    entity(ids.ENT_LOC_FORGE_OF_SPELLS, ids.ENT_LOC_FORGE_OF_SPELLS, 2860, 180),
    entity(ids.ENT_NPC_NEZZNAR, ids.ENT_NPC_NEZZNAR, 2520, 400),
    entity(ids.ENT_NPC_NUNDRO, ids.ENT_NPC_NUNDRO, 2860, 400),
  ];
  for (const n of nodes) await placeNode(canvasId, n);

  await placeNode(canvasId, note(
    "note_location_use",
    "Uso de mesa",
    "Cada localización debe responder a una pregunta: ¿qué puedo revelar aquí?, ¿quién cambia de postura?, ¿qué decisión abre? Si no responde a nada, úsala solo como textura.",
    80, 800, 2200, 95, "yellow",
  ));

  const edges: [string, string, string, EdgeStyle][] = [
    [`node_${ids.ENT_LOC_TRIBOAR_TRAIL}`, `node_${ids.ENT_LOC_CRAGMAW_HIDEOUT}`, "rastro", "strong"],
    [`node_${ids.ENT_LOC_CRAGMAW_HIDEOUT}`, `node_${ids.ENT_LOC_PHANDALIN}`, "regreso", "solid"],
    [`node_${ids.ENT_LOC_PHANDALIN}`, `node_${ids.ENT_LOC_TRESENDAR}`, "amenaza urbana", "strong"],
    [`node_${ids.ENT_LOC_ALDERLEAF}`, `node_${ids.ENT_LOC_TRESENDAR}`, "entrada secreta", "dashed"],
    [`node_${ids.ENT_LOC_CRAGMAW_HIDEOUT}`, `node_${ids.ENT_LOC_CRAGMAW_CASTLE}`, "rumores", "dashed"],
    [`node_${ids.ENT_LOC_CRAGMAW_CASTLE}`, `node_${ids.ENT_LOC_WAVE_ECHO}`, "mapa", "secret"],
    [`node_${ids.ENT_LOC_WAVE_ECHO}`, `node_${ids.ENT_LOC_FORGE_OF_SPELLS}`, "corazón", "secret"],
    [`node_${ids.ENT_LOC_CONYBERRY}`, `node_${ids.ENT_LOC_AGATHA_LAIR}`, "sendero", "dashed"],
    [`node_${ids.ENT_LOC_THUNDERTREE}`, `node_${ids.ENT_NPC_NEZZNAR}`, "posible información", "weak"],
    [`node_${ids.ENT_NPC_NEZZNAR}`, `node_${ids.ENT_LOC_WAVE_ECHO}`, "objetivo", "secret"],
  ];
  for (const [src, tgt, label, style] of edges) await placeEdge(canvasId, src, tgt, label, style);

  console.log("✓ Phandalin locations canvas populated");
}

async function seedSessionPlanCanvas(canvasId: string) {
  const groups = [
    group("grp_s_played", "Jugado", 40, 40, 560, 620, "green", "session"),
    group("grp_s_next", "Próximas sesiones", 660, 40, 900, 620, "yellow", "session"),
    group("grp_s_end", "Final y legado", 1620, 40, 860, 620, "purple", "session"),
  ];
  for (const g of groups) await placeNode(canvasId, g);

  const notes = [
    note("note_s1", "S1 — Camino de Triboar", "Ya jugada. Pistas reveladas: caballos, rastro goblin, advertencia de Sildar.", 80, 120, 470, 110, "green"),
    note("note_s2", "S2 — Pueblo con miedo", "Ya jugada. Phandalin queda como comunidad intimidada. Los Redbrands ya son prioridad moral.", 80, 280, 470, 120, "green"),
    note("note_s3", "S3 — Tresendar", "Preparada. Resolver Redbrands, Mirna, nothic, Glasstaff y primera carta de la Araña Negra.", 700, 120, 370, 135, "yellow"),
    note("note_s4", "S4 — Castillo Cragmaw", "Preparada. Ruta, negociación con Grol, rescate de Gundren y posible giro de Vyerith.", 1120, 120, 370, 135, "yellow"),
    note("note_side", "Opcional — Frentes", "Agatha, Viejo Pozo, Tor del Guiverno o Thundertree según ritmo de mesa.", 700, 330, 370, 115, "yellow"),
    note("note_s5", "S5 — Entrada a Wave Echo", "Preparada. Coste Rockseeker, Nundro, Tharden y presión de la Araña Negra.", 1120, 330, 370, 115, "yellow"),
    note("note_s6", "S6 — Forja y Araña Negra", "Preparada. Clímax con Nezznar y decisión sobre la Forja de Conjuros.", 1660, 140, 370, 135, "purple"),
    note("note_epi", "Epílogo — Futuro de Phandalin", "Cierre social. ¿Quién protege el pueblo cuando los héroes se marchan?", 2080, 140, 360, 135, "purple"),
  ];
  for (const n of notes) await placeNode(canvasId, n);

  const entities = [
    entity(ids.ENT_Q_REDBRANDS, ids.ENT_Q_REDBRANDS, 700, 500),
    entity(ids.ENT_Q_FIND_CASTLE, ids.ENT_Q_FIND_CASTLE, 1120, 500),
    entity(ids.ENT_Q_WAVE_ECHO, ids.ENT_Q_WAVE_ECHO, 1660, 370),
    entity(ids.ENT_Q_FUTURE_PHANDALIN, ids.ENT_Q_FUTURE_PHANDALIN, 2080, 370),
  ];
  for (const n of entities) await placeNode(canvasId, n);

  const edges: [string, string, string, EdgeStyle][] = [
    ["note_s1", "note_s2", "recap", "solid"],
    ["note_s2", "note_s3", "siguiente", "strong"],
    ["note_s3", "note_s4", "si persiguen Gundren", "dashed"],
    ["note_s3", "note_side", "si buscan aire", "dashed"],
    ["note_s4", "note_s5", "mapa", "strong"],
    ["note_s5", "note_s6", "clímax", "strong"],
    ["note_s6", "note_epi", "consecuencia", "strong"],
    ["note_s3", `node_${ids.ENT_Q_REDBRANDS}`, "resuelve", "solid"],
    ["note_s4", `node_${ids.ENT_Q_FIND_CASTLE}`, "resuelve", "solid"],
    ["note_s5", `node_${ids.ENT_Q_WAVE_ECHO}`, "abre", "solid"],
    ["note_epi", `node_${ids.ENT_Q_FUTURE_PHANDALIN}`, "cierra", "solid"],
  ];
  for (const [src, tgt, label, style] of edges) await placeEdge(canvasId, src, tgt, label, style);

  console.log("✓ Phandalin session plan canvas populated");
}

export async function seedCanvas() {
  console.log("\nSeeding Phandalin canvases...");

  const canvasesRes = await api("GET", `/api/campaigns/${CMP}/canvases`);
  const canvases = Array.isArray(canvasesRes.json) ? canvasesRes.json : [];
  const defaultCanvas = canvases.find((c: any) => c.title === "Campaña" || c.kind === "world") || canvases[0];
  if (!defaultCanvas) {
    console.warn("⚠ No default canvas found.");
    return;
  }

  await seedOverviewCanvas(defaultCanvas.id);

  const mysteryId = "cvs_seed_phandalin_mystery";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: mysteryId,
    title: "Cadena de Investigación — Phandalin",
    kind: "mystery",
    description: "Pistas visibles, pistas preparadas y secretos DM conectados por revelación progresiva.",
  });
  await seedInvestigationCanvas(mysteryId);

  const locationsId = "cvs_seed_phandalin_locations";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: locationsId,
    title: "Mapa de Phandalin y alrededores",
    kind: "location",
    description: "Localizaciones útiles para dirigir sin abrir el módulo ni perder el hilo.",
  });
  await seedLocationCanvas(locationsId);

  const sessionsId = "cvs_seed_phandalin_sessions";
  await api("POST", `/api/campaigns/${CMP}/canvases`, {
    actorId: "usr_dm",
    canvasId: sessionsId,
    title: "Plan de sesiones — Phandalin",
    kind: "session",
    description: "Secuencia de sesiones preparadas con bifurcaciones y cierre de campaña.",
  });
  await seedSessionPlanCanvas(sessionsId);

  console.log("✓ Phandalin canvases seeded successfully (4 boards)");
}
